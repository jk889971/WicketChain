"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Store, Shield, Check, X, MapPin, User, Mail, Phone,
  Copy, CheckCheck, Package, Calendar, ChevronDown,
  Pause, Play, Percent, Calculator, RefreshCw,
} from "lucide-react";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { supabase } from "@/lib/supabase";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import { CONTRACTS } from "@/config/contracts";
import { stadiumShopAbi, wicketChainVaultAbi } from "@/lib/contracts/generated";

// ── Types ──────────────────────────────────────────────────────────────────

interface LiveShopBalance {
  totalEarnings: bigint;
  pendingEarnings: bigint;
  confirmedEarnings: bigint;
  shopFeeDeducted: bigint;
  withdrawnAmount: bigint;
}

interface AdminShop {
  id: string;
  shopIdOnchain: number;
  ownerAddress: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isApproved: boolean;
  isActive: boolean;
  rejectionReason: string | null;
  createdAt: string;
  venues: Array<{ name: string; city: string; locationInVenue: string | null }>;
  productCount: number;
  ownerProfile: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

type TabFilter = "pending" | "approved" | "rejected" | "earnings";

// ── Helpers ────────────────────────────────────────────────────────────────


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

// ── Earnings Helpers ───────────────────────────────────────────────────────

function safeBigInt(value: string | number | null | undefined): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  const str = String(value).trim().split(".")[0];
  if (!str || str === "-") return 0n;
  try { return BigInt(str); } catch { return 0n; }
}

function BalanceItem({ label, value, variant = "default", blurred = false }: {
  label: string; value: string; variant?: "default" | "negative" | "green" | "amber"; blurred?: boolean;
}) {
  const colorClass =
    variant === "negative" ? "text-red-400/70" :
    variant === "green" ? "text-[#a5fcad]" :
    variant === "amber" ? "text-amber-400" :
    "text-white/80";
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

function ShopEarningsRow({
  shop,
  live,
  isFetching,
  onCalculate,
}: {
  shop: Pick<AdminShop, "id" | "shopIdOnchain" | "name" | "ownerAddress">;
  live: LiveShopBalance | null;
  isFetching: boolean;
  onCalculate: (id: number) => void;
}) {
  const blurred = !live;
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Store size={16} className="text-[#56a963] shrink-0" />
            <h3 className="font-bold text-white truncate">{shop.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40 font-mono">
            <User size={10} />
            {shop.ownerAddress.slice(0, 6)}…{shop.ownerAddress.slice(-4)}
          </div>
        </div>
        <div className="shrink-0 ml-4">
          <button
            onClick={() => onCalculate(shop.shopIdOnchain)}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/5"
          >
            {isFetching ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Calculator size={14} />
            )}
            {live ? "Recalculate" : "Calculate"}
          </button>
        </div>
      </div>
      {(() => {
        const total     = live?.totalEarnings     ?? 0n;
        const pending   = live?.pendingEarnings   ?? 0n;
        const confirmed = live?.confirmedEarnings ?? 0n;
        const withdrawn = live?.withdrawnAmount   ?? 0n;
        const fee       = live?.shopFeeDeducted   ?? 0n;
        const available = confirmed > withdrawn ? confirmed - withdrawn : 0n;
        const cancelled = total > (pending + confirmed + fee)
          ? total - pending - confirmed - fee
          : 0n;
        const netTotal  = total - cancelled;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <BalanceItem label="Total Earnings" value={netTotal.toString()} blurred={blurred} />
            <BalanceItem label="Pending"        value={pending.toString()} variant="amber" blurred={blurred} />
            <BalanceItem label="Available"      value={available.toString()} variant="green" blurred={blurred} />
            <BalanceItem label="Fee Deducted"   value={fee.toString()} variant="negative" blurred={blurred} />
            <BalanceItem label="Withdrawn"      value={withdrawn.toString()} blurred={blurred} />
          </div>
        );
      })()}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function AdminShopsPage() {
  const { address, isConnected } = useAccount();
  const { hasAdminAccess } = useUserRole();
  const publicClient = usePublicClient();

  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("pending");

  // Earnings tab state
  const [onChainShopBalances, setOnChainShopBalances] = useState<Record<number, LiveShopBalance>>({});
  const [fetchingShopBalances, setFetchingShopBalances] = useState<Record<number, boolean>>({});

  // Reject inline state: shopId → reason text
  const [rejectOpen, setRejectOpen] = useState<Record<string, boolean>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  // Approve tx
  const [showTxModal, setShowTxModal] = useState(false);
  const pendingApproveShopRef = useRef<{ id: string; shopIdOnchain: number } | null>(null);

  // Reject tx
  const [showRejectTxModal, setShowRejectTxModal] = useState(false);
  const pendingRejectShopRef = useRef<{ id: string; shopIdOnchain: number; reason: string } | null>(null);

  // Per-shop toggle tx
  const [showToggleTxModal, setShowToggleTxModal] = useState(false);
  const pendingToggleShopRef = useRef<{ id: string; shopIdOnchain: number; active: boolean } | null>(null);

  // Pause state
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [showPauseTxModal, setShowPauseTxModal] = useState(false);
  const lastPauseActionRef = useRef<"pause" | "unpause" | null>(null);

  // Fee state
  const [feeInput, setFeeInput] = useState("");
  const [showFeeTxModal, setShowFeeTxModal] = useState(false);

  // ── On-chain reads ──────────────────────────────────────────
  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    address: CONTRACTS.stadiumShop,
    abi: stadiumShopAbi,
    functionName: "paused",
    query: { enabled: hasAdminAccess },
  });

  const { data: shopFeeBps, refetch: refetchFee } = useReadContract({
    address: CONTRACTS.vault,
    abi: wicketChainVaultAbi,
    functionName: "shopFeeBps",
    query: { enabled: hasAdminAccess },
  });

  const approveContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingApproveShopRef.current;
      if (!pending) return;

      await supabase
        .from("shops")
        .update({ is_approved: true })
        .eq("id", pending.id);

      setShops((prev) =>
        prev.map((s) =>
          s.id === pending.id ? { ...s, isApproved: true } : s
        )
      );
      toast.success("Shop approved successfully!");
    },
  });

  const rejectContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingRejectShopRef.current;
      if (!pending) return;
      await supabase
        .from("shops")
        .update({ rejection_reason: pending.reason })
        .eq("id", pending.id);
      setShops((prev) =>
        prev.map((s) => s.id === pending.id ? { ...s, rejectionReason: pending.reason } : s)
      );
      setRejectOpen((p) => ({ ...p, [pending.id]: false }));
      toast.success("Shop rejected.");
    },
  });

  const adminToggleShopContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingToggleShopRef.current;
      if (!pending) return;
      await supabase
        .from("shops")
        .update({ is_active: pending.active })
        .eq("id", pending.id);
      setShops((prev) =>
        prev.map((s) => s.id === pending.id ? { ...s, isActive: pending.active } : s)
      );
      toast.success(pending.active ? "Shop resumed." : "Shop paused.");
    },
  });

  const pauseContract = useContractWrite({
    onSuccess: async () => {
      const action = lastPauseActionRef.current;
      // Sync is_active on all approved shops in the DB to match on-chain pause state
      await supabase
        .from("shops")
        .update({ is_active: action !== "pause" })
        .eq("is_approved", true);
      setShops((prev) =>
        prev.map((s) => s.isApproved ? { ...s, isActive: action !== "pause" } : s)
      );
      await refetchPaused();
      setPauseOpen(false);
      setPauseReason("");
      toast.success(action === "pause" ? "Marketplace paused! All shops deactivated." : "Marketplace unpaused! All shops reactivated.");
    },
  });

  const feeContract = useContractWrite({
    onSuccess: async () => {
      await refetchFee();
      setFeeInput("");
      toast.success("Shop fee updated!");
    },
  });

  // ── Pause / Unpause ────────────────────────────────────────

  const handlePause = async () => {
    lastPauseActionRef.current = "pause";
    setShowPauseTxModal(true);
    try {
      await pauseContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "pause",
        args: [pauseReason.trim() || "Emergency pause by admin."],
      });
    } catch {}
  };

  const handleUnpause = async () => {
    lastPauseActionRef.current = "unpause";
    setShowPauseTxModal(true);
    try {
      await pauseContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "unpause",
        args: [],
      });
    } catch {}
  };

  // ── Update Fee ─────────────────────────────────────────────

  const handleUpdateFee = async () => {
    const bps = parseInt(feeInput);
    if (isNaN(bps) || bps < 0 || bps > 10000) {
      toast.error("Fee must be between 0 and 10000 BPS (0–100%).");
      return;
    }
    setShowFeeTxModal(true);
    try {
      await feeContract.execute({
        address: CONTRACTS.vault,
        abi: wicketChainVaultAbi,
        functionName: "setShopFeeBps",
        args: [BigInt(bps)],
      });
    } catch {}
  };

  // ── Fetch ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasAdminAccess) return;
    fetchShops();
  }, [hasAdminAccess]);

  async function fetchShops() {
    setLoading(true);

    // Fetch shops with venues
    const { data: shopRows, error } = await supabase
      .from("shops")
      .select(
        "id, shop_id_onchain, owner_address, name, description, image_url, is_approved, is_active, rejection_reason, created_at, shop_venues(venue_id, location_in_venue, venues(id, name, city))"
      )
      .order("created_at", { ascending: false });

    if (error || !shopRows) {
      setLoading(false);
      return;
    }

    // Collect owner addresses for profile lookup
    const ownerAddresses = [...new Set((shopRows as any[]).map((s) => s.owner_address as string))];

    // Fetch profiles
    const { data: profileRows } = await supabase
      .from("user_profiles")
      .select("wallet_address, full_name, email, phone_number")
      .in("wallet_address", ownerAddresses);

    const profileMap: Record<string, { fullName: string | null; email: string | null; phone: string | null }> = {};
    ((profileRows as any[]) || []).forEach((p) => {
      profileMap[p.wallet_address] = {
        fullName: p.full_name,
        email: p.email,
        phone: p.phone_number,
      };
    });

    // Fetch product counts
    const shopIds = (shopRows as any[]).map((s) => s.id as string);
    const { data: productRows } = await supabase
      .from("shop_products")
      .select("shop_id")
      .in("shop_id", shopIds);

    const productCountMap: Record<string, number> = {};
    ((productRows as any[]) || []).forEach((p) => {
      productCountMap[p.shop_id] = (productCountMap[p.shop_id] ?? 0) + 1;
    });

    const mapped: AdminShop[] = (shopRows as any[]).map((s) => {
      const rawVenues = (s.shop_venues || []) as Array<{
        location_in_venue: string | null;
        venues: { name: string; city: string } | null;
      }>;
      return {
        id: s.id,
        shopIdOnchain: s.shop_id_onchain,
        ownerAddress: s.owner_address,
        name: s.name,
        description: s.description,
        imageUrl: s.image_url,
        isApproved: s.is_approved,
        isActive: s.is_active,
        rejectionReason: s.rejection_reason,
        createdAt: s.created_at,
        venues: rawVenues
          .filter((sv) => sv.venues)
          .map((sv) => ({
            name: sv.venues!.name,
            city: sv.venues!.city,
            locationInVenue: sv.location_in_venue,
          })),
        productCount: productCountMap[s.id] ?? 0,
        ownerProfile: profileMap[s.owner_address] ?? null,
      };
    });

    setShops(mapped);
    setLoading(false);
  }

  // ── Approve ────────────────────────────────────────────────────────────

  const handleApprove = async (shop: AdminShop) => {
    pendingApproveShopRef.current = { id: shop.id, shopIdOnchain: shop.shopIdOnchain };
    setShowTxModal(true);
    try {
      await approveContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "approveShop",
        args: [BigInt(shop.shopIdOnchain)],
      });
    } catch {
      // error in approveContract.errorMessage
    }
  };

  // ── Reject (on-chain) ──────────────────────────────────────────────────

  const handleReject = async (shop: AdminShop) => {
    const reason = (rejectReasons[shop.id] ?? "").trim() || "Rejected by admin.";
    pendingRejectShopRef.current = { id: shop.id, shopIdOnchain: shop.shopIdOnchain, reason };
    setShowRejectTxModal(true);
    try {
      await rejectContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "rejectShop",
        args: [BigInt(shop.shopIdOnchain), reason],
      });
    } catch {}
  };

  // ── Per-shop toggle (on-chain) ─────────────────────────────────────────

  const handleToggleShopActive = async (shop: AdminShop) => {
    const newActive = !shop.isActive;
    pendingToggleShopRef.current = { id: shop.id, shopIdOnchain: shop.shopIdOnchain, active: newActive };
    setShowToggleTxModal(true);
    try {
      await adminToggleShopContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "adminToggleShop",
        args: [BigInt(shop.shopIdOnchain), newActive],
      });
    } catch {}
  };

  // ── Shop earnings balance fetch ────────────────────────────────────────

  const handleCalculateShopBalance = async (shopIdOnchain: number) => {
    setFetchingShopBalances(prev => ({ ...prev, [shopIdOnchain]: true }));
    try {
      const data = await publicClient!.readContract({
        address: CONTRACTS.vault,
        abi: wicketChainVaultAbi,
        functionName: "getShopBalance",
        args: [BigInt(shopIdOnchain)],
      });
      setOnChainShopBalances(prev => ({ ...prev, [shopIdOnchain]: data as LiveShopBalance }));
    } catch {
      toast.error("Failed to fetch on-chain shop balance.");
    } finally {
      setFetchingShopBalances(prev => ({ ...prev, [shopIdOnchain]: false }));
    }
  };

  // ── Filtered shops ─────────────────────────────────────────────────────

  const pending  = shops.filter((s) => !s.isApproved && !s.rejectionReason);
  const approved = shops.filter((s) => s.isApproved);
  const rejected = shops.filter((s) => !!s.rejectionReason);

  const tabShops =
    tab === "pending" ? pending :
    tab === "approved" ? approved :
    tab === "rejected" ? rejected : [];

  // ── Guard ──────────────────────────────────────────────────────────────

  if (!isConnected || !hasAdminAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto">
          <Shield size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Admin access required</h2>
        <p className="text-sm text-white/40">Connect an admin wallet to view shop applications.</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center">
          <Store size={20} className="text-[#56a963]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Shop Management</h1>
          <p className="text-sm text-white/40">Manage vendor shops, approvals, and marketplace settings</p>
        </div>
      </div>

      {/* Marketplace Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Pause / Unpause */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPaused ? "bg-red-500/10" : "bg-[#56a963]/10"}`}>
              {isPaused
                ? <Pause size={15} className="text-red-400" />
                : <Play size={15} className="text-[#56a963]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Marketplace Status</p>
              <p className="text-xs text-white/40">
                {isPaused ? "All shop purchases & cancellations are suspended" : "All shops are operational"}
              </p>
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${isPaused ? "bg-red-500/10 text-red-400" : "bg-[#56a963]/15 text-[#a5fcad]"}`}>
              {isPaused === undefined ? "..." : isPaused ? "PAUSED" : "ACTIVE"}
            </span>
          </div>

          {!isPaused ? (
            pauseOpen ? (
              <div className="space-y-3">
                <textarea
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="Pause reason (e.g. Scheduled maintenance)"
                  rows={2}
                  className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500/40 placeholder:text-white/15 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPauseOpen(false); setPauseReason(""); }}
                    className="flex-1 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 border border-white/8 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePause}
                    disabled={pauseContract.isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    <Pause size={12} />
                    {pauseContract.isLoading ? "Pausing…" : "Confirm Pause"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setPauseOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
              >
                <Pause size={14} />
                Pause All Shops
              </button>
            )
          ) : (
            <button
              onClick={handleUnpause}
              disabled={pauseContract.isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            >
              <Play size={14} />
              {pauseContract.isLoading ? "Unpausing…" : "Unpause All Shops"}
            </button>
          )}
        </div>

        {/* Shop Platform Fee */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Percent size={15} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Shop Platform Fee</p>
              <p className="text-xs text-white/40">
                Current:{" "}
                <span className="text-white/70 font-mono">
                  {shopFeeBps != null
                    ? `${(Number(shopFeeBps) / 100).toFixed(2)}% (${shopFeeBps.toString()} BPS)`
                    : "..."}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                min="0"
                max="10000"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                placeholder={shopFeeBps != null ? `${shopFeeBps.toString()} BPS` : "BPS value"}
                className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 pr-16 focus:outline-none focus:border-amber-500/40 placeholder:text-white/20"
              />
              {feeInput && !isNaN(parseInt(feeInput)) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono pointer-events-none">
                  {(parseInt(feeInput) / 100).toFixed(2)}%
                </span>
              )}
            </div>
            <button
              onClick={handleUpdateFee}
              disabled={!feeInput || feeContract.isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            >
              {feeContract.isLoading ? "Saving…" : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["pending", "approved", "rejected", "earnings"] as TabFilter[]).map((t) => {
          const count =
            t === "pending" ? pending.length :
            t === "approved" ? approved.length :
            t === "rejected" ? rejected.length :
            approved.length;
          const label = t.charAt(0).toUpperCase() + t.slice(1);
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 max-[525px]:px-[10px] max-[525px]:py-[6px] max-[525px]:gap-[6px] max-[400px]:px-2 max-[400px]:py-1 max-[400px]:gap-1 rounded-xl text-sm max-[525px]:text-[11px] max-[400px]:text-[9px] font-semibold transition-all ${
                tab === t
                  ? "bg-[#56a963] text-[#002a0c]"
                  : "bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/70"
              }`}
            >
              {label}
              {!loading && (
                <span className={`text-[10px] max-[525px]:text-[8px] max-[400px]:text-[6px] font-bold px-1.5 max-[525px]:px-[5px] max-[400px]:px-1 py-0.5 rounded-full ${
                  tab === t ? "bg-[#002a0c]/30 text-[#002a0c]" : "bg-white/10 text-white/40"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && tabShops.length === 0 && tab !== "earnings" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
          <Store size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">
            {tab === "pending" ? "No pending shop applications." : tab === "approved" ? "No approved shops yet." : "No rejected shops."}
          </p>
        </div>
      )}

      {/* Shop cards */}
      {!loading && tab !== "earnings" && (
        <div className="space-y-4">
          {tabShops.map((shop) => {
            const isRejectOpen = rejectOpen[shop.id] ?? false;

            return (
              <div key={shop.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                {/* Main row */}
                <div className="p-5 flex gap-4 max-[600px]:flex-col max-[600px]:items-center">
                  {/* Shop image */}
                  <div className="shrink-0">
                    {shop.imageUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                        <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                        <Store size={24} className="text-white/15" />
                      </div>
                    )}
                  </div>

                  {/* Shop info */}
                  <div className="flex-1 min-w-0 max-[600px]:w-full max-[600px]:text-center">
                    <div className="flex items-start justify-between gap-4 flex-wrap max-[600px]:flex-col max-[600px]:items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap max-[600px]:justify-center">
                          <h3 className="text-base font-bold text-white">{shop.name}</h3>
                          {/* Status badge */}
                          {shop.isApproved && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#56a963]/15 text-[#a5fcad]">
                              Approved
                            </span>
                          )}
                          {shop.isApproved && !shop.isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                              Paused
                            </span>
                          )}
                          {shop.rejectionReason && !shop.isApproved && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                              Rejected
                            </span>
                          )}
                          {!shop.isApproved && !shop.rejectionReason && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta + Actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0 max-[600px]:items-center max-[600px]:w-full">
                        <div className="flex items-center gap-3 text-[11px] text-white/30 max-[600px]:flex-col max-[600px]:items-center max-[600px]:gap-1">
                          <span className="flex items-center gap-1">
                            <Package size={11} />
                            {shop.productCount} product{shop.productCount !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(shop.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Approve/Reject buttons (pending only) */}
                        {tab === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(shop)}
                              disabled={approveContract.isLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#002a0c] disabled:opacity-50 transition-opacity hover:opacity-90"
                              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                            >
                              <Check size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                setRejectOpen((p) => ({ ...p, [shop.id]: !p[shop.id] }))
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
                            >
                              <X size={13} />
                              Reject
                              <ChevronDown
                                size={11}
                                className={`transition-transform ${isRejectOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                        )}

                        {/* Per-shop pause/resume (approved only) */}
                        {tab === "approved" && (
                          <button
                            onClick={() => handleToggleShopActive(shop)}
                            disabled={adminToggleShopContract.isLoading}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                              shop.isActive
                                ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
                                : "bg-[#56a963]/10 text-[#a5fcad] border-[#56a963]/20 hover:bg-[#56a963]/15"
                            }`}
                          >
                            {shop.isActive ? <Pause size={12} /> : <Play size={12} />}
                            {shop.isActive ? "Pause Shop" : "Resume Shop"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description + Venues below the header row */}
                    {shop.description && (
                      <p className="text-xs text-white/40 mt-2">{shop.description}</p>
                    )}
                    {shop.venues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-[600px]:justify-center">
                        {shop.venues.map((v, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-full px-2 py-0.5"
                          >
                            <MapPin size={8} className="text-[#56a963]" />
                            {v.name}, {v.city}
                            {v.locationInVenue && (
                              <span className="text-white/25"> · {v.locationInVenue}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Owner section */}
                    <div className="mt-3 pt-3 border-t border-white/[0.05] flex flex-wrap gap-x-5 gap-y-1.5 max-[600px]:flex-col max-[600px]:items-center">
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <User size={11} className="text-white/20" />
                        <span className="font-mono">{truncateAddress(shop.ownerAddress)}</span>
                        <CopyButton text={shop.ownerAddress} />
                      </div>
                      {shop.ownerProfile?.fullName && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <User size={11} className="text-white/20" />
                          <span>{shop.ownerProfile.fullName}</span>
                        </div>
                      )}
                      {shop.ownerProfile?.email && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Mail size={11} className="text-white/20" />
                          <span>{shop.ownerProfile.email}</span>
                        </div>
                      )}
                      {shop.ownerProfile?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Phone size={11} className="text-white/20" />
                          <span>{shop.ownerProfile.phone}</span>
                        </div>
                      )}
                      {!shop.ownerProfile && (
                        <span className="text-xs text-white/20 italic">No profile set</span>
                      )}
                    </div>

                    {/* Rejection reason display (rejected tab) */}
                    {shop.rejectionReason && (
                      <div className="mt-3 pt-3 border-t border-white/[0.05]">
                        <p className="text-xs text-red-400/80">
                          <span className="font-semibold text-red-400">Reason: </span>
                          {shop.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline reject form */}
                {isRejectOpen && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-[#141414] border border-red-500/15 rounded-xl p-4 space-y-3">
                      <p className="text-xs text-white/50 font-medium">
                        Provide a reason for rejection (optional):
                      </p>
                      <textarea
                        value={rejectReasons[shop.id] ?? ""}
                        onChange={(e) =>
                          setRejectReasons((p) => ({ ...p, [shop.id]: e.target.value }))
                        }
                        placeholder="e.g. Incomplete information provided, please resubmit with full details."
                        rows={2}
                        className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500/40 placeholder:text-white/15 resize-none"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() =>
                            setRejectOpen((p) => ({ ...p, [shop.id]: false }))
                          }
                          className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(shop)}
                          disabled={rejectContract.isLoading}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <X size={12} />
                          {rejectContract.isLoading ? "Rejecting…" : "Confirm Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Earnings tab */}
      {!loading && tab === "earnings" && (
        approved.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <p className="text-white/30">No approved shops found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approved.map((shop) => (
              <ShopEarningsRow
                key={shop.id}
                shop={shop}
                live={onChainShopBalances[shop.shopIdOnchain] ?? null}
                isFetching={fetchingShopBalances[shop.shopIdOnchain] ?? false}
                onCalculate={handleCalculateShopBalance}
              />
            ))}
          </div>
        )
      )}

      {/* Approve transaction modal */}
      <TransactionProgressModal
        open={showTxModal}
        onClose={() => {
          setShowTxModal(false);
          approveContract.reset();
        }}
        step={approveContract.step}
        txHash={approveContract.txHash}
        errorMessage={approveContract.errorMessage}
        successTitle="Shop Approved!"
        successDescription="The shop is now live and visible to fans."
      />

      {/* Reject transaction modal */}
      <TransactionProgressModal
        open={showRejectTxModal}
        onClose={() => {
          setShowRejectTxModal(false);
          rejectContract.reset();
        }}
        step={rejectContract.step}
        txHash={rejectContract.txHash}
        errorMessage={rejectContract.errorMessage}
        successTitle="Shop Rejected"
        successDescription="The shop owner's wallet has been banned from re-registering."
      />

      {/* Per-shop toggle transaction modal */}
      <TransactionProgressModal
        open={showToggleTxModal}
        onClose={() => {
          setShowToggleTxModal(false);
          adminToggleShopContract.reset();
        }}
        step={adminToggleShopContract.step}
        txHash={adminToggleShopContract.txHash}
        errorMessage={adminToggleShopContract.errorMessage}
        successTitle={pendingToggleShopRef.current?.active ? "Shop Resumed" : "Shop Paused"}
        successDescription={
          pendingToggleShopRef.current?.active
            ? "The shop is now active and accepting orders."
            : "The shop has been paused. No new orders can be placed."
        }
      />

      {/* Pause / Unpause transaction modal */}
      <TransactionProgressModal
        open={showPauseTxModal}
        onClose={() => {
          setShowPauseTxModal(false);
          pauseContract.reset();
        }}
        step={pauseContract.step}
        txHash={pauseContract.txHash}
        errorMessage={pauseContract.errorMessage}
        successTitle={lastPauseActionRef.current === "pause" ? "Marketplace Paused!" : "Marketplace Unpaused!"}
        successDescription={
          lastPauseActionRef.current === "pause"
            ? "All shop purchases and cancellations are suspended."
            : "All shop operations are now live."
        }
      />

      {/* Fee update transaction modal */}
      <TransactionProgressModal
        open={showFeeTxModal}
        onClose={() => {
          setShowFeeTxModal(false);
          feeContract.reset();
        }}
        step={feeContract.step}
        txHash={feeContract.txHash}
        errorMessage={feeContract.errorMessage}
        successTitle="Fee Updated!"
        successDescription="The new platform fee is now active for all future confirmations."
      />
    </div>
  );
}
