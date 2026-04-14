"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Ticket, Wallet, Coins, ArrowDownToLine } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { TicketCard, TicketCardSkeleton } from "@/components/tickets/TicketCard";
import { ReturnTicketModal, type ReturnTicketInfo } from "@/components/tickets/ReturnTicketModal";
import { ManageDelegateModal, type ManageDelegateTicketInfo } from "@/components/tickets/ManageDelegateModal";
import { QRModal, type QRModalTicket } from "@/components/tickets/QRModal";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { useTicketReturn, useDelegate, useRefundClaim } from "@/hooks/domain";
import { formatWire } from "@/lib/utils/formatWire";
import { format } from "date-fns";

// 3 hours — matches WicketChainBase.REFUND_WINDOW
const REFUND_WINDOW_SECONDS = 3 * 3600;

// 80% — matches WicketChainBase.REFUND_BPS / BPS_DENOMINATOR
const REFUND_BPS = 8000n;
const BPS_DENOMINATOR = 10000n;


// Safely parse a postgres NUMERIC value (returned as number or string) to bigint
function parsePriceWei(s: string | number | null | undefined): bigint {
  if (s === null || s === undefined || s === "" || s === 0) return 0n;
  try { return BigInt(String(s).split(".")[0]); } catch { return 0n; }
}

// Estimate the ticket refund amount based on how the ticket was returned:
// - Admin cancelEvent loop or claimCancellationRefund → 100% (isForceRefunded === true)
// - Admin forceRefundEnclosure → 100% (isForceRefunded === true)
// - User voluntary returnTicket → 80% (REFUND_BPS), even if event later got cancelled
function estimateTicketRefundWei(purchasePriceWei: string, _eventStatus: string, isForceRefunded: boolean): bigint {
  const price = parsePriceWei(purchasePriceWei);
  if (price === 0n) return 0n;
  if (isForceRefunded) return price;
  return (price * REFUND_BPS) / BPS_DENOMINATOR;
}

// Ticket refund only — shop item refunds are tracked separately on /my-orders
function estimateTotalRefundWei(t: { purchasePriceWei: string; eventStatus: string; isForceRefunded: boolean }): bigint {
  return estimateTicketRefundWei(t.purchasePriceWei, t.eventStatus, t.isForceRefunded);
}

/* ─── Types ─── */
interface RawTicket {
  token_id: number;
  event_id: string;
  row_label: string;
  seat_number: number;
  is_returned: boolean;
  refund_claimed: boolean;
  is_force_refunded: boolean;
  is_entered: boolean;
  delegate_address: string | null;
  owner_address: string;
  purchase_price_wei: string | number;
  events: {
    match_title: string;
    start_time: string;
    status: string;
    venues: { name: string; city: string } | null;
  } | null;
  enclosures: { name: string } | null;
}

interface TicketRow {
  tokenId: number;
  eventId: string;
  matchTitle: string;
  venueName: string;
  venueCity: string;
  startTime: string;
  enclosureName: string;
  rowLabel: string;
  seatNumber: number;
  isReturned: boolean;
  refundClaimed: boolean;
  isForceRefunded: boolean;
  isEntered: boolean;
  delegateAddress: string | null;
  ownerAddress: string;
  eventStatus: string;
  purchasePriceWei: string;
  linkedItems: { name: string; quantity: number; totalPaidWei: string }[];
}

/* ─── Tab config ─── */
const EXPIRED_EVENT_STATUSES = ["COMPLETED", "CANCELLED"];
type Tab = "active" | "expired" | "refunds";
const TABS: { key: Tab; label: string }[] = [
  { key: "active",  label: "Active"  },
  { key: "expired", label: "Expired" },
  { key: "refunds", label: "Refunds" },
];

/* ─── Page ─── */
export default function TicketsPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal }     = useConnectModal();

  const [tickets, setTickets]     = useState<TicketRow[]>([]);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("active");

  /* ── QR modal ── */
  const [qrInitialTicket, setQrInitialTicket] = useState<QRModalTicket | null>(null);

  /* ── Return confirm modal ── */
  const [returnTicketInfo, setReturnTicketInfo] = useState<ReturnTicketInfo | null>(null);

  /* ── Return tx modal ── */
  const [showReturnTxModal, setShowReturnTxModal] = useState(false);

  /* ── Claim refund tx modal ── */
  const [showClaimTxModal, setShowClaimTxModal] = useState(false);

  /* ── Delegate modal ── */
  const [delegateTicketInfo, setDelegateTicketInfo] = useState<ManageDelegateTicketInfo | null>(null);

  /* ── Delegate tx modal ── */
  const [showDelegateTxModal, setShowDelegateTxModal] = useState(false);
  const [delegateTxAction, setDelegateTxAction]       = useState<"set" | "remove">("set");

  const returnPendingTokenId   = useRef<number>(0);
  const returnLinkedOrdersRef  = useRef<{ product_id: string; quantity: number }[]>([]);
  const delegatePendingRef     = useRef<{ tokenId: number; newAddress: string | null }>({
    tokenId: 0, newAddress: null,
  });

  /* ── On-chain: claimable refund balance (domain hook) ── */
  const {
    claimableWei,
    refetchClaimable,
    isBalanceLoading: claimableLoading,
    claimRefunds: execClaimRefunds,
    step: claimStep,
    txHash: claimTxHash,
    errorMessage: claimErrorMessage,
    reset: claimReset,
  } = useRefundClaim(
    isConnected ? address : undefined,
    {
      onSuccess: async () => {
        if (!address) return;
        const addr = address.toLowerCase();
        // Mark all unclaimed refunds as claimed via SECURITY DEFINER RPC
        // (bypasses PostgREST schema cache so shop_orders.refund_claimed is always found)
        await supabase.rpc("fn_mark_refunds_claimed", { p_buyer_address: addr });
        setTickets((prev) =>
          prev.map((t) => t.isReturned && !t.refundClaimed ? { ...t, refundClaimed: true } : t),
        );
        refetchClaimable();
      },
    },
  );

  /* ── Refund stats ── */
  const returnedTickets = useMemo(() => tickets.filter((t) => t.isReturned), [tickets]);

  // On-chain vault balance — the real withdrawable amount
  const availableWei = claimableWei ?? 0n;

  // Estimated total refund: tickets (80%/100%) + linked shop items (100%)
  const totalEstimatedWei = useMemo(
    () => returnedTickets.reduce((s, t) => s + estimateTotalRefundWei(t), 0n),
    [returnedTickets],
  );

  // Withdrawn = sum of estimated refunds for tickets already claimed.
  // Based on refund_claimed flag, not vault balance, so shop order refunds
  // landing in the vault don't corrupt this number.
  const withdrawnWei = useMemo(
    () => returnedTickets
      .filter((t) => t.refundClaimed)
      .reduce((s, t) => s + estimateTotalRefundWei(t), 0n),
    [returnedTickets],
  );

  /* ── Contract: setDelegate (domain hook) ── */
  const setDelegateContract = useDelegate({
    onSuccess: async () => {
      const { tokenId, newAddress } = delegatePendingRef.current;
      if (!tokenId) return;
      await supabase.from("tickets").update({ delegate_address: newAddress }).eq("token_id", tokenId);
      setTickets((prev) =>
        prev.map((t) => t.tokenId === tokenId ? { ...t, delegateAddress: newAddress } : t),
      );
    },
  });

  /* ── Contract: removeDelegate (domain hook) ── */
  const removeDelegateContract = useDelegate({
    onSuccess: async () => {
      const { tokenId } = delegatePendingRef.current;
      if (!tokenId) return;
      await supabase.from("tickets").update({ delegate_address: null }).eq("token_id", tokenId);
      setTickets((prev) =>
        prev.map((t) => t.tokenId === tokenId ? { ...t, delegateAddress: null } : t),
      );
    },
  });

  /* ── Contract: returnTicket (domain hook) ── */
  const returnContract = useTicketReturn({
    onSuccess: async () => {
      const tokenId      = returnPendingTokenId.current;
      const linkedOrders = returnLinkedOrdersRef.current;
      if (!tokenId) return;

      await supabase.from("tickets")
        .update({ is_returned: true, delegate_address: null })
        .eq("token_id", tokenId);

      if (linkedOrders.length > 0) {
        await supabase.from("shop_orders")
          .update({ status: "REFUNDED" })
          .eq("ticket_token_id", tokenId)
          .eq("status", "ACTIVE");
        for (const o of linkedOrders) {
          await supabase.rpc("decrement_product_units", {
            p_product_id: o.product_id, p_qty: -o.quantity,
          });
        }
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.tokenId === tokenId
            ? { ...t, isReturned: true, refundClaimed: false, delegateAddress: null }
            : t,
        ),
      );
      refetchClaimable();
    },
  });

  /* ── Fetch tickets ── */
  const fetchTickets = useCallback(async (walletAddress: string) => {
    setLoading(true);
    const addr = walletAddress.toLowerCase();

    // Fetch tickets and refunded shop orders in parallel
    const [ticketRes, shopRes] = await Promise.all([
      supabase
        .from("tickets")
        .select(`
          token_id,
          event_id,
          row_label,
          seat_number,
          is_returned,
          refund_claimed,
          is_force_refunded,
          is_entered,
          delegate_address,
          owner_address,
          purchase_price_wei,
          events (
            match_title,
            start_time,
            status,
            venues ( name, city )
          ),
          enclosures ( name )
        `)
        .or(`owner_address.ilike.${addr},delegate_address.ilike.${addr}`)
        .order("token_id", { ascending: false }),
      supabase
        .from("shop_orders")
        .select("ticket_token_id, quantity, total_paid_wei, shop_products ( name )")
        .eq("buyer_address", addr)
        .eq("status", "REFUNDED"),
    ]);

    setLoading(false);

    if (ticketRes.error) {
      console.error("Error fetching tickets:", ticketRes.error);
      toast.error("Failed to load tickets");
      return;
    }

    // Build a map of token_id → refunded shop items
    const shopMap = new Map<number, { name: string; quantity: number; totalPaidWei: string }[]>();
    for (const o of (shopRes.data ?? []) as { ticket_token_id: number; quantity: number; total_paid_wei: string | number; shop_products: { name: string } | { name: string }[] | null }[]) {
      const tokenId = o.ticket_token_id;
      const prodName = (Array.isArray(o.shop_products) ? o.shop_products[0] : o.shop_products)?.name ?? "Item";
      if (!shopMap.has(tokenId)) shopMap.set(tokenId, []);
      shopMap.get(tokenId)!.push({ name: prodName, quantity: o.quantity, totalPaidWei: String(o.total_paid_wei ?? 0) });
    }

    const rows: TicketRow[] = ((ticketRes.data ?? []) as unknown as RawTicket[]).map((t) => {
      const ev    = Array.isArray(t.events)     ? t.events[0]     : t.events;
      const enc   = Array.isArray(t.enclosures) ? t.enclosures[0] : t.enclosures;
      const venue = ev ? (Array.isArray(ev.venues) ? ev.venues[0] : ev.venues) : null;

      return {
        tokenId:         t.token_id,
        eventId:         t.event_id,
        matchTitle:      ev?.match_title  ?? "Unknown Match",
        venueName:       venue?.name      ?? "Unknown Venue",
        venueCity:       venue?.city      ?? "",
        startTime:       ev?.start_time   ?? new Date().toISOString(),
        enclosureName:   enc?.name        ?? "General",
        rowLabel:        t.row_label,
        seatNumber:      t.seat_number,
        isReturned:      t.is_returned,
        refundClaimed:   t.refund_claimed ?? false,
        isForceRefunded: t.is_force_refunded ?? false,
        isEntered:       t.is_entered,
        delegateAddress: t.delegate_address,
        ownerAddress:    t.owner_address,
        eventStatus:     ev?.status       ?? "CREATED",
        purchasePriceWei: String(t.purchase_price_wei ?? 0),
        linkedItems: shopMap.get(t.token_id) ?? [],
      };
    });

    setTickets(rows);
  }, []);

  useEffect(() => {
    if (!isConnected || !address) { setTickets([]); return; }
    fetchTickets(address);
  }, [isConnected, address, fetchTickets]);

  /* ── Return window check ── */
  const isReturnWindowClosed = useCallback((t: TicketRow): boolean => {
    if (["REFUNDS_CLOSED", "GATES_OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(t.eventStatus)) {
      return true;
    }
    return Date.now() > new Date(t.startTime).getTime() - REFUND_WINDOW_SECONDS * 1000;
  }, []);

  /* ── All QR-eligible tickets ── */
  const allQrTickets = useMemo<QRModalTicket[]>(
    () =>
      tickets
        .filter((t) => !t.isReturned && !t.isEntered && !EXPIRED_EVENT_STATUSES.includes(t.eventStatus))
        .map((t) => {
          const isOwner = t.ownerAddress.toLowerCase() === (address ?? "").toLowerCase();
          const hasActiveDelegate =
            !!t.delegateAddress &&
            t.delegateAddress.toLowerCase() !== "0x0000000000000000000000000000000000000000" &&
            t.delegateAddress.toLowerCase() !== t.ownerAddress.toLowerCase();
          return {
            tokenId:       t.tokenId,
            eventId:       t.eventId,
            rowLabel:      t.rowLabel,
            seatNumber:    t.seatNumber,
            enclosureName: t.enclosureName,
            isDelegate:    !isOwner,
            isDelegated:   isOwner && hasActiveDelegate,
          };
        }),
    [tickets, address],
  );

  /* ── Tab filtering ── */
  const activeTickets  = useMemo(
    () => tickets.filter((t) => !t.isReturned && !EXPIRED_EVENT_STATUSES.includes(t.eventStatus)),
    [tickets],
  );
  const expiredTickets = useMemo(
    () => tickets.filter((t) => t.isReturned || EXPIRED_EVENT_STATUSES.includes(t.eventStatus)),
    [tickets],
  );

  const tabCounts: Record<Tab, number> = {
    active:  activeTickets.length,
    expired: expiredTickets.length,
    refunds: returnedTickets.length,
  };

  const displayed = activeTab === "active" ? activeTickets : expiredTickets;

  /* ── Handlers ── */
  const handleShowQR = (tokenId: number) => {
    const t = tickets.find((t) => t.tokenId === tokenId);
    if (!t) return;
    const isOwner = t.ownerAddress.toLowerCase() === address?.toLowerCase();
    const hasActiveDelegate =
      !!t.delegateAddress &&
      t.delegateAddress.toLowerCase() !== "0x0000000000000000000000000000000000000000" &&
      t.delegateAddress.toLowerCase() !== t.ownerAddress.toLowerCase();
    setQrInitialTicket({
      tokenId:       t.tokenId,
      eventId:       t.eventId,
      rowLabel:      t.rowLabel,
      seatNumber:    t.seatNumber,
      enclosureName: t.enclosureName,
      isDelegate:    !isOwner,
      isDelegated:   isOwner && hasActiveDelegate,
    });
  };

  const handleManageDelegate = (tokenId: number) => {
    const t = tickets.find((t) => t.tokenId === tokenId);
    if (!t) return;
    setDelegateTicketInfo({ tokenId: t.tokenId, isEntered: t.isEntered, ownerAddress: t.ownerAddress });
  };

  const handleSetDelegate = async (tokenId: number, delegateAddress: string) => {
    delegatePendingRef.current = { tokenId, newAddress: delegateAddress };
    setDelegateTicketInfo(null);
    setDelegateTxAction("set");
    setShowDelegateTxModal(true);
    // Optimistic: show new delegate immediately; revert if tx fails
    const snapshot = tickets;
    setTickets((prev) =>
      prev.map((t) => t.tokenId === tokenId ? { ...t, delegateAddress } : t),
    );
    try {
      await setDelegateContract.setDelegate(BigInt(tokenId), delegateAddress as `0x${string}`);
    } catch {
      setTickets(snapshot); // revert on failure
    }
  };

  const handleRemoveDelegate = async (tokenId: number) => {
    delegatePendingRef.current = { tokenId, newAddress: null };
    setDelegateTicketInfo(null);
    setDelegateTxAction("remove");
    setShowDelegateTxModal(true);
    // Optimistic: clear delegate immediately; revert if tx fails
    const snapshot = tickets;
    setTickets((prev) =>
      prev.map((t) => t.tokenId === tokenId ? { ...t, delegateAddress: null } : t),
    );
    try {
      await removeDelegateContract.removeDelegate(BigInt(tokenId));
    } catch {
      setTickets(snapshot); // revert on failure
    }
  };

  const handleDelegateTxClose = () => {
    setShowDelegateTxModal(false);
    setDelegateContract.reset();
    removeDelegateContract.reset();
  };

  const handleReturnTicket = (tokenId: number) => {
    const t = tickets.find((t) => t.tokenId === tokenId);
    if (!t) return;
    setReturnTicketInfo({
      tokenId:       t.tokenId,
      matchTitle:    t.matchTitle,
      enclosureName: t.enclosureName,
      rowLabel:      t.rowLabel,
      seatNumber:    t.seatNumber,
    });
  };

  const handleConfirmReturn = async () => {
    if (!returnTicketInfo) return;
    const snapshot = returnTicketInfo;
    returnPendingTokenId.current = snapshot.tokenId;

    const { data: linkedOrders } = await supabase
      .from("shop_orders")
      .select("product_id, quantity")
      .eq("ticket_token_id", snapshot.tokenId)
      .eq("status", "ACTIVE");
    returnLinkedOrdersRef.current = (linkedOrders as { product_id: string; quantity: number }[]) || [];

    setReturnTicketInfo(null);
    setShowReturnTxModal(true);
    try {
      await returnContract.returnTicket(BigInt(snapshot.tokenId));
    } catch { /* stored in errorMessage */ }
  };

  const handleClaimRefund = useCallback(async () => {
    setShowClaimTxModal(true);
    try {
      await execClaimRefunds();
    } catch { /* stored in errorMessage */ }
  }, [execClaimRefunds]);

  const handleReturnTxClose = () => { setShowReturnTxModal(false); returnContract.reset(); };
  const handleClaimTxClose  = () => { setShowClaimTxModal(false);  claimReset();  };

  /* ── Wallet not connected ── */
  if (!isConnected) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <PageHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Wallet size={28} className="text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white/70 mb-2">Wallet not connected</h2>
          <p className="text-sm text-white/40 mb-6">Connect your wallet to view your NFT tickets</p>
          <button
            onClick={openConnectModal}
            className="px-6 py-2.5 rounded-xl bg-[#56a963] text-white text-sm font-bold hover:bg-[#56a963]/90 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <PageHeader />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 w-fit mb-8">
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          const count    = tabCounts[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center gap-1.5 min-[380px]:gap-2 px-2.5 min-[380px]:px-5 py-1 min-[380px]:py-2 rounded-lg text-[0.6rem] min-[380px]:text-sm font-medium transition-all duration-150
                ${isActive ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"}
              `}
            >
              {label}
              {!loading && count > 0 && (
                <span className={`
                  inline-flex items-center justify-center min-w-[16px] min-[380px]:min-w-[20px] h-4 min-[380px]:h-5 px-1 min-[380px]:px-1.5 rounded-full text-[8px] min-[380px]:text-[10px] font-bold
                  ${isActive ? "bg-[#56a963] text-white" : "bg-white/10 text-white/50"}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Refunds tab ── */}
      {activeTab === "refunds" && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left column: summary card */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-5">
                Refund Summary
              </p>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">In Vault</p>
                    <p className="text-base font-bold text-[#a5fcad] leading-none font-mono">
                      {claimableLoading ? "…" : formatWire(availableWei)}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/20 font-semibold">WIRE</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Withdrawn</p>
                    <p className="text-base font-bold text-white/50 leading-none font-mono">
                      ~{formatWire(withdrawnWei)}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/20 font-semibold">WIRE</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Total Refunds</p>
                    <p className="text-base font-bold text-white/50 leading-none font-mono">
                      ~{formatWire(totalEstimatedWei)}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/20 font-semibold">WIRE</span>
                </div>
              </div>

              {/* Withdraw button */}
              <button
                onClick={handleClaimRefund}
                disabled={availableWei === 0n || claimableLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={
                  availableWei > 0n
                    ? { backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)", color: "#002a0c" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                <ArrowDownToLine size={15} />
                {availableWei > 0n ? `Withdraw ${formatWire(availableWei)}` : "Nothing to Withdraw"}
              </button>

              {returnedTickets.length > 0 && (
                <p className="text-[10px] text-white/15 text-center mt-3 leading-relaxed">
                  ~ Estimates: ticket (80% for returns, 100% for cancellations) + shop items (100%)
                </p>
              )}
            </div>
          </div>

          {/* Right column: scrollable history */}
          <div className="flex-1 min-w-0 w-full">
            {returnedTickets.length > 0 ? (
              <>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 text-center lg:text-left">
                  Refund History — {returnedTickets.length} ticket{returnedTickets.length !== 1 ? "s" : ""}
                </p>
                <div className="overflow-y-auto max-h-[min(600px,calc(100vh-220px))] space-y-2 pr-1">
                  {returnedTickets.map((t) => {
                    const ticketRefund = estimateTicketRefundWei(t.purchasePriceWei, t.eventStatus, t.isForceRefunded);
                    const totalRefund = ticketRefund;
                    const isCancelled     = t.eventStatus === "CANCELLED";
                    const isForceRefunded = t.isForceRefunded;
                    return (
                      <div
                        key={t.tokenId}
                        className="bg-white/[0.02] border border-white/5 rounded-xl px-2.5 min-[500px]:px-4 py-2 min-[500px]:py-3"
                      >
                        <div className="flex items-start justify-between gap-2 min-[500px]:gap-3">
                          {/* Left: ticket info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.6rem] min-[500px]:text-sm font-semibold text-white/80 truncate">{t.matchTitle}</p>
                            <p className="text-[8px] min-[500px]:text-[11px] text-white/35 mt-0.5 flex flex-wrap gap-x-1 min-[500px]:gap-x-2">
                              <span>{t.venueName}, {t.venueCity}</span>
                              <span className="text-white/15">·</span>
                              <span>{format(new Date(t.startTime), "MMM dd, yyyy · hh:mm a")}</span>
                            </p>
                            <p className="text-[8px] min-[500px]:text-[11px] text-white/25 mt-0.5">
                              {t.enclosureName} · Row {t.rowLabel} · Seat {t.seatNumber}
                            </p>
                            {t.linkedItems.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {t.linkedItems.map((item, i) => (
                                  <span
                                    key={i}
                                    className="text-[7px] min-[500px]:text-[10px] bg-white/[0.04] border border-white/[0.06] text-white/30 px-1 min-[500px]:px-1.5 py-0.5 rounded"
                                  >
                                    {item.quantity}× {item.name} · ~{formatWire(parsePriceWei(item.totalPaidWei))}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right: amount + refund type */}
                          <div className="shrink-0 text-right">
                            <p className="text-[8px] min-[500px]:text-xs font-mono text-white/40 mb-1">
                              ~{formatWire(totalRefund)}
                            </p>
                            <p className="text-[7px] min-[500px]:text-[10px] text-white/20 mb-1.5">WIRE</p>
                            <span className={`text-[7px] min-[500px]:text-[10px] font-semibold px-1.5 min-[500px]:px-2 py-0.5 rounded-full ${
                              isForceRefunded
                                ? isCancelled ? "text-red-400/70 bg-red-500/10" : "text-blue-400/70 bg-blue-500/10"
                                : "text-amber-400/70 bg-amber-500/10"
                            }`}>
                              {isForceRefunded ? (isCancelled ? "Cancelled · 100%" : "Force Refunded · 100%") : "Returned · 80%"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Coins size={28} className="text-white/20" />
                </div>
                <h2 className="text-lg font-semibold text-white/70 mb-1">No refunds yet</h2>
                <p className="text-sm text-white/40">Returned or refunded tickets will appear here.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Active / Expired tabs ── */}
      {activeTab !== "refunds" && (
        <>
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <TicketCardSkeleton key={i} />)}
            </div>
          )}

          {/* Grid */}
          {!loading && displayed.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map((t) => (
                <TicketCard
                  key={t.tokenId}
                  tokenId={t.tokenId}
                  matchTitle={t.matchTitle}
                  venueName={t.venueName}
                  venueCity={t.venueCity}
                  startTime={t.startTime}
                  enclosureName={t.enclosureName}
                  rowLabel={t.rowLabel}
                  seatNumber={t.seatNumber}
                  isReturned={t.isReturned}
                  isForceRefunded={t.isForceRefunded}
                  isEntered={t.isEntered}
                  delegateAddress={t.delegateAddress}
                  ownerAddress={t.ownerAddress}
                  walletAddress={address!}
                  eventStatus={t.eventStatus}
                  returnDisabled={isReturnWindowClosed(t)}
                  onShowQR={() => handleShowQR(t.tokenId)}
                  onManageDelegate={() => handleManageDelegate(t.tokenId)}
                  onReturnTicket={() => handleReturnTicket(t.tokenId)}
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Ticket size={28} className="text-white/20" />
              </div>
              <h2 className="text-lg font-semibold text-white/70 mb-1">
                {activeTab === "active" ? "No active tickets" : "No expired tickets"}
              </h2>
              <p className="text-sm text-white/40">
                {activeTab === "active"
                  ? "Purchase tickets from an upcoming match to see them here."
                  : "Returned or past-event tickets will appear here."}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <QRModal
        open={!!qrInitialTicket}
        onClose={() => setQrInitialTicket(null)}
        initialTicket={qrInitialTicket}
        allTickets={allQrTickets}
      />

      <ReturnTicketModal
        open={!!returnTicketInfo}
        onClose={() => setReturnTicketInfo(null)}
        ticket={returnTicketInfo}
        onConfirm={handleConfirmReturn}
        isLoading={returnContract.isLoading}
      />

      <TransactionProgressModal
        open={showReturnTxModal}
        onClose={handleReturnTxClose}
        step={returnContract.step}
        txHash={returnContract.txHash}
        errorMessage={returnContract.errorMessage}
        successTitle="Ticket Returned"
        successDescription="Your refund is pending. Go to the Refunds tab to withdraw your WIRE."
      />

      <TransactionProgressModal
        open={showClaimTxModal}
        onClose={handleClaimTxClose}
        step={claimStep}
        txHash={claimTxHash}
        errorMessage={claimErrorMessage}
        successTitle="Refund Withdrawn!"
        successDescription="Your WIRE refund has been transferred to your wallet."
      />

      <ManageDelegateModal
        open={!!delegateTicketInfo}
        onClose={() => setDelegateTicketInfo(null)}
        ticket={delegateTicketInfo}
        onSetDelegate={handleSetDelegate}
        onRemoveDelegate={handleRemoveDelegate}
        isLoading={setDelegateContract.isLoading || removeDelegateContract.isLoading}
      />

      <TransactionProgressModal
        open={showDelegateTxModal}
        onClose={handleDelegateTxClose}
        step={delegateTxAction === "set" ? setDelegateContract.step : removeDelegateContract.step}
        txHash={delegateTxAction === "set" ? setDelegateContract.txHash : removeDelegateContract.txHash}
        errorMessage={delegateTxAction === "set" ? setDelegateContract.errorMessage : removeDelegateContract.errorMessage}
        successTitle={delegateTxAction === "set" ? "Delegate Set!" : "Delegate Removed"}
        successDescription={
          delegateTxAction === "set"
            ? "Your delegate can now generate QR codes and enter the stadium on your behalf."
            : "Delegate access has been revoked. You can assign a new delegate at any time."
        }
      />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center">
        <Ticket size={20} className="text-[#56a963]" />
      </div>
      <div>
        <h1 className="text-2xl font-bold font-heading">My Tickets</h1>
        <p className="text-sm text-white/40">Your soulbound NFT tickets</p>
      </div>
    </div>
  );
}
