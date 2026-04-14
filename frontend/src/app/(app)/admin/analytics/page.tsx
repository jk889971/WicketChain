"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart3, Shield, Ticket, Store, DollarSign,
  TrendingUp, Users, ShoppingBag,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/lib/supabase";

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeBigInt(value: string | number | null | undefined): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  const str = String(value).trim().split(".")[0];
  if (!str || str === "-") return 0n;
  try { return BigInt(str); } catch { return 0n; }
}

function weiToNumber(wei: bigint): number {
  return parseFloat(formatEther(wei));
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(6)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(6)}K`;
  return n.toFixed(6);
}

const PIE_COLORS = ["#56a963", "#a5fcad", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

type TimeFilter = "today" | "week" | "month" | "year" | "all";

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Last Week" },
  { key: "month", label: "Last Month" },
  { key: "year", label: "Last Year" },
  { key: "all", label: "All Time" },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalMatches: number;
  totalTicketsSold: number;
  totalTicketsReturned: number;
  totalShops: number;
  totalOrders: number;
  totalTicketRevenueWei: bigint;
  totalShopRevenueWei: bigint;
  totalRefundsWei: bigint;
  matchesByStatus: { name: string; value: number }[];
  ordersByStatus: { name: string; value: number }[];
  revenueByMatch: { name: string; tickets: number; shop: number }[];
  ticketsOverTime: { date: string; count: number }[];
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color = "text-[#a5fcad]", valueClassName = "",
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string; valueClassName?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#56a963]/10 flex items-center justify-center">
          <Icon size={16} className="text-[#56a963]" />
        </div>
        <p className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-2xl font-bold font-mono ${color} ${valueClassName}`}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

// ── Wrapped X-Axis Tick ──────────────────────────────────────────────────────

function WrappedXTick({ x, y, payload }: any) {
  const words: string[] = (payload.value ?? "").split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 14 && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return (
    <g transform={`translate(${x},${y + 4})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontSize={9}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl max-w-xs">
      <p className="text-xs text-white/50 mb-1 break-words">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-mono" style={{ color: entry.color }}>
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? Number.isInteger(entry.value)
              ? entry.value.toLocaleString()
              : entry.value.toFixed(6)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { isConnected } = useAccount();
  const { hasAdminAccess } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    const [eventsRes, ticketsRes, shopsRes, ordersRes, vaultEventsRes] = await Promise.all([
      supabase.from("events").select("id, match_title, status"),
      supabase.from("tickets").select("id, event_id, is_returned, created_at"),
      supabase.from("shops").select("id, is_approved"),
      supabase.from("shop_orders").select("id, status, total_paid_wei"),
      supabase.from("events").select(`
        match_title,
        vault_event_balances(
          ticket_revenue_wei, ticket_refunds_wei,
          shop_revenue_wei, shop_refunds_wei, shop_fees_wei
        )
      `),
    ]);

    const events = (eventsRes.data as any[]) || [];
    const tickets = (ticketsRes.data as any[]) || [];
    const shops = (shopsRes.data as any[]) || [];
    const orders = (ordersRes.data as any[]) || [];
    const vaultEvents = (vaultEventsRes.data as any[]) || [];

    // Match status breakdown
    const statusCounts: Record<string, number> = {};
    for (const e of events) {
      statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;
    }
    const matchesByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Order status breakdown
    const orderStatusCounts: Record<string, number> = {};
    for (const o of orders) {
      const key = o.status === "CANCELLED" ? "REFUNDED" : o.status;
      orderStatusCounts[key] = (orderStatusCounts[key] ?? 0) + 1;
    }
    const ordersByStatus = Object.entries(orderStatusCounts).map(([name, value]) => ({ name, value }));

    // Revenue by match (top 10) — full title, no truncation
    const revenueByMatch = vaultEvents
      .map((e: any) => {
        const v = e.vault_event_balances?.[0] ?? e.vault_event_balances;
        if (!v) return null;
        return {
          name: e.match_title ?? "Unknown",
          tickets: weiToNumber(safeBigInt(v.ticket_revenue_wei)),
          shop: weiToNumber(safeBigInt(v.shop_revenue_wei)),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (b.tickets + b.shop) - (a.tickets + a.shop))
      .slice(0, 10) as { name: string; tickets: number; shop: number }[];

    // Tickets over time (group by day)
    const dayMap: Record<string, number> = {};
    for (const t of tickets) {
      if (!t.created_at) continue;
      const day = t.created_at.slice(0, 10);
      dayMap[day] = (dayMap[day] ?? 0) + 1;
    }
    const ticketsOverTime = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Aggregate totals
    let totalTicketRevenueWei = 0n;
    let totalShopRevenueWei = 0n;
    let totalRefundsWei = 0n;
    for (const e of vaultEvents) {
      const v = e.vault_event_balances?.[0] ?? e.vault_event_balances;
      if (!v) continue;
      totalTicketRevenueWei += safeBigInt(v.ticket_revenue_wei);
      totalShopRevenueWei += safeBigInt(v.shop_revenue_wei);
      totalRefundsWei += safeBigInt(v.ticket_refunds_wei) + safeBigInt(v.shop_refunds_wei);
    }

    setStats({
      totalMatches: events.length,
      totalTicketsSold: tickets.filter((t: any) => !t.is_returned).length,
      totalTicketsReturned: tickets.filter((t: any) => t.is_returned).length,
      totalShops: shops.filter((s: any) => s.is_approved).length,
      totalOrders: orders.length,
      totalTicketRevenueWei,
      totalShopRevenueWei,
      totalRefundsWei,
      matchesByStatus,
      ordersByStatus,
      revenueByMatch,
      ticketsOverTime,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasAdminAccess) fetchAnalytics();
  }, [hasAdminAccess, fetchAnalytics]);

  // ── Time-filtered tickets data ─────────────────────────────────────────
  const filteredTicketsOverTime = useMemo(() => {
    if (!stats) return [];
    if (timeFilter === "all") return stats.ticketsOverTime;
    const now = new Date();
    let cutoff: Date;
    if (timeFilter === "today") {
      cutoff = new Date(now.toISOString().slice(0, 10));
    } else if (timeFilter === "week") {
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (timeFilter === "month") {
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 1);
    } else {
      cutoff = new Date(now);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
    }
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return stats.ticketsOverTime.filter((d) => d.date >= cutoffStr);
  }, [timeFilter, stats]);

  // ── Guard ──────────────────────────────────────────────────────────────
  if (!isConnected || !hasAdminAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto">
          <Shield size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Admin access required</h2>
        <p className="text-sm text-white/40">Connect an admin wallet to view analytics.</p>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-[#56a963]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Analytics</h1>
            <p className="text-sm text-white/40">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const netRevenue = stats.totalTicketRevenueWei + stats.totalShopRevenueWei - stats.totalRefundsWei;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center">
          <BarChart3 size={20} className="text-[#56a963]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Analytics</h1>
          <p className="text-sm text-white/40">Platform performance overview</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Net Revenue"
          value={`${formatCompact(weiToNumber(netRevenue))} WIRE`}
          sub={`Tickets: ${formatCompact(weiToNumber(stats.totalTicketRevenueWei))} + Shop: ${formatCompact(weiToNumber(stats.totalShopRevenueWei))}`}
          valueClassName="max-[500px]:text-[1.2rem]"
        />
        <StatCard
          icon={Ticket}
          label="Tickets Sold"
          value={stats.totalTicketsSold.toLocaleString()}
          sub={`${stats.totalTicketsReturned} returned`}
          color="text-white"
        />
        <StatCard
          icon={ShoppingBag}
          label="Shop Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`${stats.totalShops} approved shops`}
          color="text-white"
        />
        <StatCard
          icon={TrendingUp}
          label="Matches"
          value={stats.totalMatches.toLocaleString()}
          sub={`${stats.matchesByStatus.find((s) => s.name === "COMPLETED")?.value ?? 0} completed`}
          color="text-white"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tickets Over Time */}
        {stats.ticketsOverTime.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#56a963]" />
                <h3 className="text-sm font-semibold text-white">Ticket Sales Over Time</h3>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {TIME_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTimeFilter(f.key)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      timeFilter === f.key
                        ? "bg-[#56a963]/20 text-[#a5fcad]"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredTicketsOverTime.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-white/30">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={filteredTicketsOverTime} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#56a963" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#56a963" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                  <YAxis
                    allowDecimals={false}
                    width={35}
                    tickFormatter={(v) => Math.round(v).toString()}
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name="Tickets" stroke="#56a963" fill="url(#ticketGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Revenue by Match — vertical layout so full titles are visible */}
        {stats.revenueByMatch.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={14} className="text-[#56a963]" />
              <h3 className="text-sm font-semibold text-white">Revenue by Match (WIRE)</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.revenueByMatch} margin={{ top: 5, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={<WrappedXTick />}
                  interval={0}
                  height={36}
                />
                <YAxis
                  width={55}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="tickets" name="Ticket Revenue" fill="#56a963" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shop" name="Shop Revenue" fill="#a5fcad" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Matches by Status */}
        {stats.matchesByStatus.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={14} className="text-[#56a963]" />
              <h3 className="text-sm font-semibold text-white">Matches by Status</h3>
            </div>
            <div className="flex items-center gap-6 max-[400px]:flex-col max-[400px]:items-center max-[400px]:gap-4">
              <div className="w-1/2 max-[400px]:w-full shrink-0">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.matchesByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.matchesByStatus.map((_entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 max-[400px]:w-full max-[400px]:flex-none">
                {stats.matchesByStatus.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs max-[400px]:justify-center">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-white/50 flex-1 max-[400px]:flex-none">{s.name}</span>
                    <span className="text-white/70 font-mono font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders by Status */}
        {stats.ordersByStatus.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Store size={14} className="text-[#56a963]" />
              <h3 className="text-sm font-semibold text-white">Shop Orders by Status</h3>
            </div>
            <div className="flex items-center gap-6 max-[400px]:flex-col max-[400px]:items-center max-[400px]:gap-4">
              <div className="w-1/2 max-[400px]:w-full shrink-0">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.ordersByStatus.map((_entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 max-[400px]:w-full max-[400px]:flex-none">
                {stats.ordersByStatus.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs max-[400px]:justify-center">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-white/50 flex-1 max-[400px]:flex-none">{s.name}</span>
                    <span className="text-white/70 font-mono font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
