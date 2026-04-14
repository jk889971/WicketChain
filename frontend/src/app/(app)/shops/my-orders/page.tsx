"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Wallet, Store, ArrowDownToLine } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useRefundClaim, useShopManagement } from "@/hooks/domain";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { OrderCard, OrderCardSkeleton } from "@/components/shops/OrderCard";
import { formatWire } from "@/lib/utils/formatWire";

type OrderStatus = "ACTIVE" | "CONFIRMED" | "COLLECTED" | "CANCELLED" | "REFUNDED";

type Tab = "active" | "confirmed" | "collected" | "refunds";

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "confirmed", label: "Confirmed" },
  { key: "collected", label: "Collected" },
  { key: "refunds", label: "Refunds" },
];


// Safely parse a postgres NUMERIC value (returned as number or string) to bigint
function parsePaidWei(s: string | number | null | undefined): bigint {
  if (s === null || s === undefined || s === "" || s === 0) return 0n;
  try { return BigInt(String(s).split(".")[0]); } catch { return 0n; }
}

interface OrderRow {
  id: string;
  order_id_onchain: number;
  ticket_token_id: number;
  product_id: string;
  shop_id: string;
  venue_id: string;
  quantity: number;
  total_paid_wei: string;
  buyer_address: string;
  status: OrderStatus;
  tx_hash: string | null;
  created_at: string;
  shop_products: {
    name: string;
    image_url: string | null;
  } | null;
  shops: { name: string } | null;
  events: {
    match_title: string;
    venues: { name: string; city: string } | null;
  } | null;
  ticket_label: string;
  match_title: string | null;
  match_time: string | null;
  venue_name: string | null;
}

export default function MyOrdersPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [showCancelTxModal, setShowCancelTxModal] = useState(false);
  const [showClaimTxModal, setShowClaimTxModal] = useState(false);

  const cancelPendingOrderId = useRef<number>(0);

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (walletAddress: string) => {
    setLoading(true);

    // Fetch raw orders with no joins — avoids FK issues entirely
    const { data, error } = await supabase
      .from("shop_orders")
      .select(
        "id, order_id_onchain, ticket_token_id, product_id, shop_id, venue_id, quantity, total_paid_wei, buyer_address, status, refund_claimed, tx_hash, created_at"
      )
      .eq("buyer_address", walletAddress.toLowerCase())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      return;
    }

    const rawRows = (data as any[]) || [];

    if (rawRows.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // Batch-fetch related data in parallel
    const productIds     = [...new Set(rawRows.map((r) => r.product_id).filter(Boolean))];
    const shopIds        = [...new Set(rawRows.map((r) => r.shop_id).filter(Boolean))];
    const venueIds       = [...new Set(rawRows.map((r) => r.venue_id).filter(Boolean))];
    const ticketTokenIds = [...new Set(rawRows.map((r) => r.ticket_token_id).filter(Boolean))];

    const [productsRes, shopsRes, venuesRes, ticketsRes] = await Promise.all([
      productIds.length > 0
        ? supabase.from("shop_products").select("id, name, image_url").in("id", productIds)
        : { data: [] },
      shopIds.length > 0
        ? supabase.from("shops").select("id, name").in("id", shopIds)
        : { data: [] },
      venueIds.length > 0
        ? supabase.from("venues").select("id, name").in("id", venueIds)
        : { data: [] },
      ticketTokenIds.length > 0
        ? supabase.from("tickets").select("token_id, row_label, seat_number, event_id, enclosures(name)").in("token_id", ticketTokenIds)
        : { data: [] },
    ]);

    const productsMap: Record<string, any> = {};
    for (const p of (productsRes.data as any[]) || []) productsMap[p.id] = p;

    const shopsMap: Record<string, any> = {};
    for (const s of (shopsRes.data as any[]) || []) shopsMap[s.id] = s;

    const venuesMap: Record<string, any> = {};
    for (const v of (venuesRes.data as any[]) || []) venuesMap[v.id] = v;

    const ticketsMap: Record<number, any> = {};
    for (const t of (ticketsRes.data as any[]) || []) ticketsMap[t.token_id] = t;

    const eventIds = [...new Set((ticketsRes.data as any[] || []).map((t: any) => t.event_id).filter(Boolean))];
    const eventsRes = eventIds.length > 0
      ? await supabase.from("events").select("id, match_title, start_time").in("id", eventIds)
      : { data: [] };

    const eventsMap: Record<string, any> = {};
    for (const e of (eventsRes.data as any[]) || []) eventsMap[e.id] = e;

    setOrders(
      rawRows.map((row) => {
        const ticket = ticketsMap[row.ticket_token_id];
        const ticketLabel = ticket
          ? `${ticket.enclosures?.name ?? "Enclosure"} · Row ${ticket.row_label} · Seat ${ticket.seat_number}`
          : `Ticket #${String(row.ticket_token_id).padStart(4, "0")}`;

        const event = ticket ? eventsMap[ticket.event_id] : null;
        const matchTitle  = event?.match_title ?? null;
        const matchTime   = event?.start_time ?? null;

        const venue = venuesMap[row.venue_id];
        const venueName = venue ? venue.name : null;

        return {
          ...row,
          shop_products: productsMap[row.product_id] ?? null,
          shops:         shopsMap[row.shop_id] ? { name: shopsMap[row.shop_id].name } : null,
          events:        null,
          ticket_label:  ticketLabel,
          match_title:   matchTitle,
          match_time:    matchTime,
          venue_name:    venueName,
        };
      }) as OrderRow[]
    );

    setLoading(false);
  }, []);

  // ── Claimable refund balance + claim (domain hook) ─────────────────────────
  const {
    claimableWei,
    refetchClaimable,
    claimRefunds: execClaimRefunds,
    step: claimStep,
    txHash: claimTxHash,
    errorMessage: claimErrorMessage,
    reset: claimReset,
  } = useRefundClaim(address, {
    onSuccess: async () => {
      await refetchClaimable();
      if (!address) return;
      const addr = address.toLowerCase();
      // Mark all unclaimed refunds as claimed via SECURITY DEFINER RPC
      // (bypasses PostgREST schema cache so refund_claimed column is always found)
      await supabase.rpc("fn_mark_refunds_claimed", { p_buyer_address: addr });
      // Optimistically update local state so withdrawn reflects immediately
      setOrders((prev) =>
        prev.map((o) =>
          (o.status === "CANCELLED" || o.status === "REFUNDED") && !(o as any).refund_claimed
            ? { ...o, refund_claimed: true }
            : o
        )
      );
    },
  });

  const handleClaimRefund = () => {
    setShowClaimTxModal(true);
    execClaimRefunds().catch(() => {});
  };

  // ── Cancel order (domain hook) ────────────────────────────────────────────
  const cancelContract = useShopManagement({
    onSuccess: async () => {
      const orderIdOnchain = cancelPendingOrderId.current;

      refetchClaimable();

      // Find the cancelled order to restore its stock
      const cancelled = orders.find((o) => o.order_id_onchain === orderIdOnchain);

      await supabase
        .from("shop_orders")
        .update({ status: "CANCELLED" })
        .eq("order_id_onchain", orderIdOnchain);

      if (cancelled) {
        await supabase.rpc("decrement_product_units", {
          p_product_id: cancelled.product_id,
          p_qty: -cancelled.quantity, // negative = increment
        });
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id_onchain === orderIdOnchain
            ? { ...o, status: "CANCELLED" as OrderStatus }
            : o
        )
      );
    },
  });

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!address) {
      setOrders([]);
      return;
    }
    fetchOrders(address);
  }, [address, fetchOrders]);

  // ── Tab filtering ─────────────────────────────────────────────────────────
  const refundedOrders = useMemo(
    () => orders.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED"),
    [orders],
  );

  const tabOrders = useMemo(() => {
    switch (activeTab) {
      case "active":
        return orders.filter((o) => o.status === "ACTIVE");
      case "confirmed":
        return orders.filter((o) => o.status === "CONFIRMED");
      case "collected":
        return orders.filter((o) => o.status === "COLLECTED");
      case "refunds":
        return refundedOrders;
    }
  }, [orders, refundedOrders, activeTab]);

  const counts = useMemo(() => {
    return {
      active: orders.filter((o) => o.status === "ACTIVE").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      collected: orders.filter((o) => o.status === "COLLECTED").length,
      refunds: refundedOrders.length,
    };
  }, [orders, refundedOrders]);

  // ── Refund stats ─────────────────────────────────────────────────────────
  const availableWei = (claimableWei as bigint) ?? 0n;

  const totalRefundedWei = useMemo(
    () => refundedOrders.reduce((s, o) => s + parsePaidWei(o.total_paid_wei), 0n),
    [refundedOrders],
  );

  // Withdrawn = shop order refunds where refund_claimed is true (set when vault is drained)
  const withdrawnWei = useMemo(
    () => refundedOrders
      .filter((o) => (o as any).refund_claimed)
      .reduce((s, o) => s + parsePaidWei(o.total_paid_wei), 0n),
    [refundedOrders],
  );

  // ── Cancel handler ────────────────────────────────────────────────────────
  const handleCancelOrder = async (orderIdOnchain: number) => {
    cancelPendingOrderId.current = orderIdOnchain;
    setShowCancelTxModal(true);
    // Optimistic: immediately mark CANCELLED; revert if tx fails
    const snapshot = orders;
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id_onchain === orderIdOnchain
          ? { ...o, status: "CANCELLED" as OrderStatus }
          : o
      )
    );
    try {
      await cancelContract.cancelOrder(BigInt(orderIdOnchain));
    } catch {
      setOrders(snapshot); // revert on failure
    }
  };

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 mx-auto">
          <Wallet size={28} className="text-white/20" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">
          Connect your wallet to view orders
        </h2>
        <p className="text-sm text-white/40 mb-6">
          Your order history is tied to your wallet address.
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} className="text-[#56a963]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">My Orders</h1>
            <p className="text-sm text-white/40">
              Track your stadium merchandise orders
            </p>
          </div>
        </div>

        <Link
          href="/shops"
          className="flex items-center gap-2 border border-white/10 rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors w-fit"
        >
          <Store size={15} />
          Browse Shops
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 w-fit mb-8 flex-wrap">
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          const count = counts[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                relative flex items-center gap-1 min-[500px]:gap-2 px-2 min-[500px]:px-4 py-1 min-[500px]:py-2 rounded-lg text-[0.5rem] min-[500px]:text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"}
              `}
            >
              {label}
              {!loading && count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[14px] min-[500px]:min-w-[20px] h-3.5 min-[500px]:h-5 px-1 min-[500px]:px-1.5 rounded-full text-[7px] min-[500px]:text-[10px] font-bold
                    ${isActive ? "bg-[#56a963] text-white" : "bg-white/10 text-white/50"}
                  `}
                >
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
          <div className="w-full lg:w-72 shrink-0 lg:shrink-0">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-5">
                Order Refund Summary
              </p>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">In Vault</p>
                    <p className="text-base font-bold text-[#a5fcad] leading-none font-mono">
                      {formatWire(availableWei)}
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
                      ~{formatWire(totalRefundedWei)}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/20 font-semibold">WIRE</span>
                </div>
              </div>

              {/* Withdraw button */}
              <button
                onClick={handleClaimRefund}
                disabled={availableWei === 0n}
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

              {refundedOrders.length > 0 && (
                <p className="text-[10px] text-white/15 text-center mt-3 leading-relaxed">
                  In Vault includes ticket refunds. Withdrawal claims all refunds at once.
                </p>
              )}
            </div>
          </div>

          {/* Right column: scrollable history */}
          <div className="flex-1 min-w-0 w-full">
            {refundedOrders.length > 0 ? (
              <>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 text-center lg:text-left">
                  Refund History — {refundedOrders.length} order{refundedOrders.length !== 1 ? "s" : ""}
                </p>
                <div className="overflow-y-auto max-h-[min(600px,calc(100vh-220px))] space-y-2 pr-1">
                  {refundedOrders.map((o) => {
                    const refundAmt = parsePaidWei(o.total_paid_wei);
                    const isCancelled = o.status === "CANCELLED";
                    const matchDate = o.match_time
                      ? format(new Date(o.match_time), "MMM dd, yyyy · hh:mm a")
                      : null;
                    return (
                      <div
                        key={o.id}
                        className="bg-white/[0.02] border border-white/5 rounded-xl px-2.5 min-[500px]:px-4 py-2 min-[500px]:py-3"
                      >
                        <div className="flex items-start gap-2 min-[500px]:gap-3">
                          {/* Product image */}
                          <div className="w-7 h-7 min-[500px]:w-10 min-[500px]:h-10 rounded-lg overflow-hidden shrink-0 bg-[#1f1f1f] border border-white/5 flex items-center justify-center">
                            {o.shop_products?.image_url ? (
                              <Image
                                src={o.shop_products.image_url}
                                alt={o.shop_products?.name ?? "Product"}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <>
                                <ShoppingBag size={11} className="text-white/20 min-[500px]:hidden" />
                                <ShoppingBag size={16} className="text-white/20 hidden min-[500px]:block" />
                              </>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.6rem] min-[500px]:text-sm font-semibold text-white/80 truncate">
                              {o.shop_products?.name ?? "Product"}
                            </p>
                            <p className="text-[8px] min-[500px]:text-[11px] text-white/35 mt-0.5 flex flex-wrap gap-x-1 min-[500px]:gap-x-2">
                              <span>{o.shops?.name ?? "Shop"}</span>
                              <span className="text-white/15">·</span>
                              <span>Qty {o.quantity}</span>
                            </p>
                            {o.match_title && (
                              <p className="text-[8px] min-[500px]:text-[11px] text-white/25 mt-0.5 truncate">
                                {o.match_title}{matchDate ? ` · ${matchDate}` : ""}
                              </p>
                            )}
                            <p className="text-[8px] min-[500px]:text-[11px] text-white/25 mt-0.5">
                              {o.venue_name ?? "Stadium"} · {o.ticket_label}
                            </p>
                          </div>

                          {/* Right: amount + badge */}
                          <div className="shrink-0 text-right">
                            <p className="text-[8px] min-[500px]:text-xs font-mono text-white/40 mb-1">
                              ~{formatWire(refundAmt)}
                            </p>
                            <p className="text-[7px] min-[500px]:text-[10px] text-white/20 mb-1.5">WIRE</p>
                            <span className={`text-[7px] min-[500px]:text-[10px] font-semibold px-1.5 min-[500px]:px-2 py-0.5 rounded-full ${
                              isCancelled
                                ? "text-amber-400/70 bg-amber-500/10"
                                : "text-red-400/70 bg-red-500/10"
                            }`}>
                              {isCancelled ? "Cancelled" : "Auto-Refunded"}
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
                  <ShoppingBag size={28} className="text-white/20" />
                </div>
                <h2 className="text-lg font-semibold text-white/70 mb-1">No refunds yet</h2>
                <p className="text-sm text-white/40">Cancelled or refunded orders will appear here.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Active / Confirmed / Collected tabs ── */}
      {activeTab !== "refunds" && (
        <>
          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <OrderCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Orders list */}
          {!loading && tabOrders.length > 0 && (
            <div className="flex flex-col gap-4">
              {tabOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  orderId={order.id}
                  orderIdOnchain={order.order_id_onchain}
                  productName={order.shop_products?.name ?? "Product"}
                  productImageUrl={order.shop_products?.image_url ?? null}
                  shopName={order.shops?.name ?? "Shop"}
                  matchTitle={order.match_title ?? ""}
                  matchTime={order.match_time ?? ""}
                  venueName={order.venue_name ?? "Stadium"}
                  ticketLabel={order.ticket_label}
                  quantity={order.quantity}
                  totalPaidWei={order.total_paid_wei}
                  status={order.status}
                  createdAt={order.created_at}
                  canCancel={order.status === "ACTIVE"}
                  onCancel={() => handleCancelOrder(order.order_id_onchain)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && tabOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ShoppingBag size={28} className="text-white/20" />
              </div>
              <h2 className="text-lg font-semibold text-white/70 mb-1">
                {activeTab === "active" && "No active orders"}
                {activeTab === "confirmed" && "No confirmed orders"}
                {activeTab === "collected" && "No collected orders"}
              </h2>
              <p className="text-sm text-white/40">
                {activeTab === "active"
                  ? "Orders you've placed will appear here once confirmed on-chain."
                  : "Nothing to show here."}
              </p>
            </div>
          )}
        </>
      )}

      {/* Cancel transaction modal */}
      <TransactionProgressModal
        open={showCancelTxModal}
        onClose={() => {
          setShowCancelTxModal(false);
          cancelContract.reset();
        }}
        step={cancelContract.step}
        txHash={cancelContract.txHash}
        errorMessage={cancelContract.errorMessage}
        successTitle="Order Cancelled"
        successDescription="Your refund has been credited to the vault. Go to the Refunds tab to withdraw."
        successActions={
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowCancelTxModal(false);
                cancelContract.reset();
                setActiveTab("refunds");
              }}
              className="py-3 rounded-xl font-bold text-sm text-[#002a0c]"
              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            >
              Go to Refunds
            </button>
            <button
              onClick={() => {
                setShowCancelTxModal(false);
                cancelContract.reset();
              }}
              className="py-3 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              Later
            </button>
          </div>
        }
      />

      {/* Claim refund transaction modal */}
      <TransactionProgressModal
        open={showClaimTxModal}
        onClose={() => {
          setShowClaimTxModal(false);
          claimReset();
        }}
        step={claimStep}
        txHash={claimTxHash}
        errorMessage={claimErrorMessage}
        successTitle="Refund Withdrawn!"
        successDescription="Your WIRE refund has been transferred to your wallet."
      />
    </div>
  );
}
