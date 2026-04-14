"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Vault, Shield,
  CheckCircle2, Loader2, X,
  Copy, CheckCheck,
  Calculator, RefreshCw,
} from "lucide-react";
import { useAccount, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { supabase } from "@/lib/supabase";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import { formatWire } from "@/lib/utils/formatWire";
import { CONTRACTS } from "@/config/contracts";
import { wicketChainVaultAbi } from "@/lib/contracts/generated";
import { STATUS_LABEL, STATUS_STYLE, STATUS_STYLE_FALLBACK } from "@/lib/eventStatus";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventWithBalance {
  id: string;
  eventIdOnchain: number;
  matchTitle: string;
  startTime: string;
  status: string;
  eventManagerAddress: string;
  venueName: string;
  venueCity: string;
  ticketRevenueWei: string;
  ticketRefundsWei: string;
  shopRevenueWei: string;
  shopRefundsWei: string;
  shopFeesWei: string;
  isSettled: boolean;
  platformAmountWei: string | null;
  eventManagerAmountWei: string | null;
}

interface LiveEventBalance {
  ticketRevenue: bigint;
  ticketRefunds: bigint;
  shopRevenue: bigint;
  shopRefunds: bigint;
  shopFeesCollected: bigint;
  isSettled: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Supabase NUMERIC(78,0) can come back as a float string ("123.456") or JS number.
// BigInt() rejects decimals, so we truncate to the integer part first.
function safeBigInt(value: string | number | null | undefined): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  const str = String(value).trim().split(".")[0]; // drop any decimal part
  if (!str || str === "-") return 0n;
  try { return BigInt(str); } catch { return 0n; }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="text-white/30 hover:text-white/60 transition-colors ml-1">
      {copied ? <CheckCheck size={12} className="text-[#56a963]" /> : <Copy size={12} />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">
      {children}
    </p>
  );
}

function Modal({
  title, onClose, children, maxWidth = "max-w-md",
}: {
  title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxWidth} bg-[#0e0e0e] border border-white/8 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <h3 className="font-heading font-bold text-white text-base">{title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function BalanceItem({ label, value, variant = "default", blurred = false }: {
  label: string; value: string; variant?: "default" | "negative" | "green" | "amber"; blurred?: boolean;
}) {
  const colorClass =
    variant === "negative" ? "text-red-400/70" :
    variant === "green" ? "text-[#a5fcad]" :
    variant === "amber" ? "text-amber-400" :
    "text-white/80";

  // Use 8 decimals for settlement page
  const fmt8 = (wei: bigint) => parseFloat(formatEther(wei)).toFixed(8);

  return (
    <div className="bg-white/[0.03] rounded-lg px-3 py-2">
      <p className="text-[10px] text-white/30 uppercase">{label}</p>
      <p className={`text-sm font-mono font-semibold transition-all duration-500 ${colorClass} ${blurred ? "blur-[5px] opacity-30 select-none" : "blur-0 opacity-100"}`}>
        {fmt8(safeBigInt(value))}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSettlementPage() {
  const { isConnected } = useAccount();
  const { hasAdminAccess } = useUserRole();
  const publicClient = usePublicClient();

  // Data
  const [events, setEvents] = useState<EventWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  // Settle modal
  const [settleTarget, setSettleTarget] = useState<EventWithBalance | null>(null);
  const [liveBalance, setLiveBalance] = useState<LiveEventBalance | null>(null);
  const [liveBalanceLoading, setLiveBalanceLoading] = useState(false);
  const [platformPercent, setPlatformPercent] = useState("10");

  // On-demand board balances
  const [onChainBalances, setOnChainBalances] = useState<Record<number, LiveEventBalance>>({});
  const [fetchingBalances, setFetchingBalances] = useState<Record<number, boolean>>({});

  // Transaction
  const [showTxModal, setShowTxModal] = useState(false);

  const settleContract = useContractWrite({
    onSuccess: async () => {
      await fetchEvents();
      setSettleTarget(null);
      setLiveBalance(null);
      toast.success("Match settled successfully!");
    },
  });

  // ── Data Fetching ─────────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select(`
        id, event_id_onchain, match_title, start_time, status,
        event_manager_address,
        venues(name, city),
        vault_event_balances(
          ticket_revenue_wei, ticket_refunds_wei,
          shop_revenue_wei, shop_refunds_wei, shop_fees_wei,
          is_settled, platform_amount_wei, event_manager_amount_wei
        )
      `)
      .order("start_time", { ascending: false });

    if (error || !data) return;

    const mapped: EventWithBalance[] = (data as any[]).map((e) => {
      const v = e.vault_event_balances?.[0] ?? e.vault_event_balances;
      const venue = Array.isArray(e.venues) ? e.venues[0] : e.venues;
      return {
        id: e.id,
        eventIdOnchain: e.event_id_onchain,
        matchTitle: e.match_title,
        startTime: e.start_time,
        status: e.status,
        eventManagerAddress: e.event_manager_address ?? "",
        venueName: venue?.name ?? "—",
        venueCity: venue?.city ?? "",
        ticketRevenueWei: v?.ticket_revenue_wei ?? "0",
        ticketRefundsWei: v?.ticket_refunds_wei ?? "0",
        shopRevenueWei: v?.shop_revenue_wei ?? "0",
        shopRefundsWei: v?.shop_refunds_wei ?? "0",
        shopFeesWei: v?.shop_fees_wei ?? "0",
        isSettled: v?.is_settled ?? false,
        platformAmountWei: v?.platform_amount_wei ?? null,
        eventManagerAmountWei: v?.event_manager_amount_wei ?? null,
      };
    });
    setEvents(mapped);
  }, []);

  useEffect(() => {
    if (!hasAdminAccess) return;
    setLoading(true);
    fetchEvents().finally(() => setLoading(false));
  }, [hasAdminAccess, fetchEvents]);

  // ── Settle Modal ──────────────────────────────────────────────────────

  const handleCalculateBalance = async (eventIdOnchain: number) => {
    setFetchingBalances(prev => ({ ...prev, [eventIdOnchain]: true }));
    try {
      const data = await publicClient!.readContract({
        address: CONTRACTS.vault,
        abi: wicketChainVaultAbi,
        functionName: "getEventBalance",
        args: [BigInt(eventIdOnchain)],
      });
      const result = data as LiveEventBalance;
      setOnChainBalances(prev => ({ ...prev, [eventIdOnchain]: result }));
    } catch {
      toast.error("Failed to fetch on-chain balance.");
    } finally {
      setFetchingBalances(prev => ({ ...prev, [eventIdOnchain]: false }));
    }
  };

  const openSettleModal = async (event: EventWithBalance) => {
    setSettleTarget(event);
    setPlatformPercent("10");
    setLiveBalance(null);

    // Reuse already fetched balance if available
    if (onChainBalances[event.eventIdOnchain]) {
      setLiveBalance(onChainBalances[event.eventIdOnchain]);
      return;
    }

    setLiveBalanceLoading(true);
    try {
      const data = await publicClient!.readContract({
        address: CONTRACTS.vault,
        abi: wicketChainVaultAbi,
        functionName: "getEventBalance",
        args: [BigInt(event.eventIdOnchain)],
      });
      const result = data as LiveEventBalance;
      setLiveBalance(result);
      setOnChainBalances(prev => ({ ...prev, [event.eventIdOnchain]: result }));
    } catch {
      toast.error("Failed to fetch on-chain balance.");
    } finally {
      setLiveBalanceLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!settleTarget || !liveBalance) return;
    const pct = parseInt(platformPercent);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Platform percent must be 0–100.");
      return;
    }

    setShowTxModal(true);
    try {
      await settleContract.execute({
        address: CONTRACTS.vault,
        abi: wicketChainVaultAbi,
        functionName: "settleEvent",
        args: [
          BigInt(settleTarget.eventIdOnchain),
          BigInt(pct),
          settleTarget.eventManagerAddress as `0x${string}`,
        ],
      });
    } catch {
      // error captured in settleContract.errorMessage
    }
  };

  // ── Computed ───────────────────────────────────────────────────────────
  const fmt8 = (wei: bigint) => parseFloat(formatEther(wei)).toFixed(8);

  const netRevenue = liveBalance
    ? liveBalance.ticketRevenue - liveBalance.ticketRefunds + liveBalance.shopFeesCollected
    : 0n;

  const pctNum = parseInt(platformPercent) || 0;
  const platformAmount = netRevenue > 0n ? (netRevenue * BigInt(Math.min(Math.max(pctNum, 0), 100))) / 100n : 0n;
  const managerAmount = netRevenue > 0n ? netRevenue - platformAmount : 0n;

  // ── Guard ─────────────────────────────────────────────────────────────

  if (!isConnected || !hasAdminAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto">
          <Shield size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Admin access required</h2>
        <p className="text-sm text-white/40">Connect an admin wallet to manage settlement.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center">
          <Vault size={20} className="text-[#56a963]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vault Settlement</h1>
          <p className="text-sm text-white/40">Settle match revenue and monitor vault balances</p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        /* ── Match Balances ────────────────────────────────── */
        events.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <p className="text-white/30">No matches found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => {
              const live = onChainBalances[ev.eventIdOnchain];
              const isFetching = fetchingBalances[ev.eventIdOnchain];

              // Show live values if fetched, else blurred for ALL matches
              const showLive = !!live;
              const blurred = !live;

              const ticketRevenue = showLive ? live.ticketRevenue.toString() : ev.ticketRevenueWei;
              const ticketRefunds = showLive ? live.ticketRefunds.toString() : ev.ticketRefundsWei;
              const shopRevenue   = showLive ? live.shopRevenue.toString()   : ev.shopRevenueWei;
              const shopRefunds    = showLive ? live.shopRefunds.toString()   : ev.shopRefundsWei;
              const shopFees      = showLive ? live.shopFeesCollected.toString() : ev.shopFeesWei;

              const net = showLive
                ? live.ticketRevenue - live.ticketRefunds + live.shopFeesCollected
                : safeBigInt(ev.ticketRevenueWei) - safeBigInt(ev.ticketRefundsWei) + safeBigInt(ev.shopFeesWei);

              const canSettle = ev.status === "COMPLETED" && !ev.isSettled;

              return (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                >
                  {/* Top row: title + status + settle */}
                  <div className="flex items-start justify-between mb-4 max-[800px]:flex-col max-[800px]:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white truncate max-[400px]:text-[0.8rem]">{ev.matchTitle}</h3>
                        <Badge className={`${STATUS_STYLE[ev.status] ?? STATUS_STYLE_FALLBACK} max-[400px]:text-[9.6px]`}>
                          {STATUS_LABEL[ev.status] ?? ev.status}
                        </Badge>
                        {ev.isSettled && (
                          <Badge className="bg-[#56a963]/10 text-[#56a963] border-[#56a963]/20 max-[400px]:text-[9.6px]">
                            Settled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        {ev.venueName}{ev.venueCity ? `, ${ev.venueCity}` : ""} · {format(new Date(ev.startTime), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 max-[800px]:w-full max-[800px]:flex-wrap">
                      <button
                        onClick={() => handleCalculateBalance(ev.eventIdOnchain)}
                        disabled={isFetching}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/5 max-[800px]:flex-1 max-[800px]:justify-center"
                      >
                        {isFetching ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Calculator size={14} />
                        )}
                        {live ? "Recalculate" : "Calculate"}
                      </button>

                      {canSettle ? (
                        <button
                          onClick={() => openSettleModal(ev)}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity max-[800px]:flex-1 max-[800px]:text-center"
                          style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                        >
                          Settle
                        </button>
                      ) : ev.isSettled ? (
                        <div className="max-[800px]:w-full max-[800px]:bg-white/[0.02] max-[800px]:rounded-xl max-[800px]:px-4 max-[800px]:py-2.5">
                          <p className="text-[10px] text-white/30 uppercase max-[800px]:mb-1">Settled Split</p>
                          <div className="max-[800px]:flex max-[800px]:gap-4 max-[400px]:flex-col max-[400px]:gap-0.5">
                            <p className="text-xs text-white/50 font-mono">
                              Platform: {fmt8(safeBigInt(ev.platformAmountWei))}
                            </p>
                            <p className="text-xs text-[#a5fcad] font-mono">
                              Manager: {fmt8(safeBigInt(ev.eventManagerAmountWei))}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Revenue breakdown grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <BalanceItem label="Ticket Revenue" value={ticketRevenue} blurred={blurred} />
                    <BalanceItem label="Ticket Refunds" value={ticketRefunds} variant="negative" blurred={blurred} />
                    <BalanceItem label="Shop Revenue" value={shopRevenue} blurred={blurred} />
                    <BalanceItem label="Shop Refunds" value={shopRefunds} variant="negative" blurred={blurred} />
                    <BalanceItem label="Shop Fees" value={shopFees} blurred={blurred} />
                    <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                      <p className="text-[10px] text-white/30 uppercase">Net Settleable</p>
                      <p className={`text-sm font-mono font-semibold transition-all duration-500 ${net > 0n ? "text-[#a5fcad]" : net < 0n ? "text-red-400" : "text-white/50"} ${blurred ? "blur-[5px] opacity-30 select-none" : "blur-0 opacity-100"}`}>
                        {fmt8(net)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Settle Modal ─────────────────────────────────────────── */}
      {settleTarget && (
        <Modal title={`Settle: ${settleTarget.matchTitle}`} onClose={() => { setSettleTarget(null); setLiveBalance(null); }} maxWidth="max-w-lg">
          {liveBalanceLoading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto text-white/30" size={24} />
              <p className="text-sm text-white/30 mt-2">Loading on-chain balance…</p>
            </div>
          ) : liveBalance?.isSettled ? (
            <div className="text-center py-8">
              <CheckCircle2 className="text-[#56a963] mx-auto" size={32} />
              <p className="text-sm text-white/50 mt-2">This event is already settled on-chain.</p>
            </div>
          ) : liveBalance ? (
            <>
              {/* Revenue breakdown */}
              <SectionLabel>Revenue Breakdown (On-Chain)</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/30 uppercase">Ticket Revenue</p>
                  <p className="text-sm font-mono font-semibold text-white/80">{fmt8(liveBalance.ticketRevenue)}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/30 uppercase">Ticket Refunds</p>
                  <p className="text-sm font-mono font-semibold text-red-400/70">−{fmt8(liveBalance.ticketRefunds)}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/30 uppercase">Shop Revenue</p>
                  <p className="text-sm font-mono font-semibold text-white/80">{fmt8(liveBalance.shopRevenue)}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/30 uppercase">Shop Refunds</p>
                  <p className="text-sm font-mono font-semibold text-red-400/70">−{fmt8(liveBalance.shopRefunds)}</p>
                </div>
                <div className="col-span-2 bg-white/[0.03] rounded-lg px-3 py-2">
                  <p className="text-[10px] text-white/30 uppercase">Shop Fees</p>
                  <p className="text-sm font-mono font-semibold text-white/80">{fmt8(liveBalance.shopFeesCollected)}</p>
                </div>
              </div>

              {/* Net Revenue */}
              <div className="border-t border-white/5 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/50">Net Settleable</span>
                  <span className={`text-base font-bold font-mono ${netRevenue > 0n ? "text-[#a5fcad]" : "text-red-400"}`}>
                    {fmt8(netRevenue)}
                  </span>
                </div>
              </div>

              {/* Platform Percent */}
              <div>
                <SectionLabel>Platform Share (%)</SectionLabel>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={platformPercent}
                  onChange={(e) => setPlatformPercent(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15"
                  placeholder="e.g. 10"
                />
              </div>

              {/* Split Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-[10px] text-white/30 uppercase mb-1">Platform Treasury</p>
                  <p className="text-sm font-bold font-mono text-white">{fmt8(platformAmount)}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-[10px] text-white/30 uppercase mb-1">Event Manager</p>
                  <p className="text-sm font-bold font-mono text-[#a5fcad]">{fmt8(managerAmount)}</p>
                </div>
              </div>

              {/* Event Manager Address */}
              <div>
                <SectionLabel>Event Manager</SectionLabel>
                <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white/60 font-mono">
                  {truncateAddress(settleTarget.eventManagerAddress)}
                  <CopyButton text={settleTarget.eventManagerAddress} />
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleSettle}
                disabled={settleContract.isLoading || netRevenue <= 0n}
                className="w-full py-3 rounded-xl text-sm font-bold text-[#002a0c] disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
              >
                {settleContract.isLoading ? "Settling…" : "Confirm Settlement"}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-white/30">Failed to load balance. Close and try again.</p>
            </div>
          )}
        </Modal>
      )}

      {/* ── Transaction Progress ────────────────────────────────── */}
      <TransactionProgressModal
        open={showTxModal}
        onClose={() => { setShowTxModal(false); settleContract.reset(); }}
        step={settleContract.step}
        txHash={settleContract.txHash}
        errorMessage={settleContract.errorMessage}
        successTitle="Event Settled!"
        successDescription="Funds have been distributed to the platform treasury and event manager."
      />
    </div>
  );
}
