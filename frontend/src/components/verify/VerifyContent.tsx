"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useReadContracts } from "wagmi";
import { recoverMessageAddress } from "viem";
import {
  CheckCircle2, XCircle, AlertTriangle, Clock,
  MapPin, Ticket, UserCheck, User, ShieldCheck, ScanLine, ShoppingBag, Footprints,
} from "lucide-react";
import { format } from "date-fns";

import { supabase } from "@/lib/supabase";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";
import { QR_DURATION, SESSION_DURATION } from "@/hooks/useQRSigning";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ZERO = "0x0000000000000000000000000000000000000000";

function bytes1ToChar(b: string): string {
  // viem returns bytes1 as "0x41" → "A"
  return String.fromCharCode(parseInt(b, 16));
}


function secondsAgo(ts: number) {
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ${s % 60}s ago`;
}

// ── Supabase row ──────────────────────────────────────────────────────────────

interface LinkedOrder {
  orderId: number;
  productName: string;
  quantity: number;
  totalPaidWei: string;
  status: string;
}

interface SupabaseTicket {
  token_id: number;
  seat_number: number;
  events: { match_title: string; start_time: string; venues: { name: string; city: string } | null } | null;
  enclosures: { name: string } | null;
}

// ── Per-ticket result ─────────────────────────────────────────────────────────

interface TicketResult {
  tokenId: number;
  // on-chain
  owner: string | null;
  delegate: string | null;
  isEntered: boolean;
  rowLabel: string;
  seatNumber: number;
  // auth
  signerRole: "owner" | "delegate" | "unauthorized" | "error";
  // from supabase
  matchTitle: string;
  startTime: string;
  venueName: string;
  venueCity: string;
  enclosureName: string;
  linkedOrders: LinkedOrder[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function VerifyContent() {
  const searchParams = useSearchParams();

  // Detect walk-in mode
  const isWalkIn = searchParams.get("walkin") === "true";
  const walkInCode = searchParams.get("code") ?? "";
  const walkInTokenId = Number((searchParams.get("ids") ?? "").split(",")[0]) || 0;

  // If walk-in mode, render walk-in verifier
  if (isWalkIn) {
    return <WalkInVerifyContent tokenId={walkInTokenId} code={walkInCode} />;
  }

  return <RegularVerifyContent />;
}

function RegularVerifyContent() {
  const searchParams = useSearchParams();

  // ── Parse URL params ───────────────────────────────────────────────────────
  const raw = useMemo(() => {
    const ids         = (searchParams.get("ids") ?? "")
      .split(",").map(Number).filter((n) => !isNaN(n) && n > 0);
    const sessionStart = Number(searchParams.get("sessionStart") ?? 0);
    const sessionEnd   = Number(searchParams.get("sessionEnd")   ?? 0);
    const ts           = Number(searchParams.get("ts")           ?? 0);
    const sig          = decodeURIComponent(searchParams.get("sig") ?? "");
    return { ids, sessionStart, sessionEnd, ts, sig };
  }, [searchParams]);

  const hasParams = raw.ids.length > 0 && raw.sig.length > 0;

  // ── Time checks (synchronous) ──────────────────────────────────────────────
  const now            = Math.floor(Date.now() / 1000);
  const qrFresh        = hasParams && (now - raw.ts) < QR_DURATION;
  const sessionValid   = hasParams && raw.ts >= raw.sessionStart && raw.sessionEnd > now;
  const isTimingValid  = qrFresh && sessionValid;

  // ── Recover signer address ────────────────────────────────────────────────
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [signerError,   setSignerError]   = useState(false);
  const [signerLoading, setSignerLoading] = useState(false);

  useEffect(() => {
    if (!hasParams || !isTimingValid) return;
    setSignerLoading(true);
    setSignerError(false);
    const { ids, sessionStart, sessionEnd, ts, sig } = raw;
    const idsPart = ids.length > 1
      ? `TokenIDs: ${ids.join(",")}`
      : `TokenID: ${ids[0]}`;
    const message = `WicketChain Session | ${idsPart} | SessionStart: ${sessionStart} | SessionEnd: ${sessionEnd}`;
    recoverMessageAddress({ message, signature: sig as `0x${string}` })
      .then((addr) => { setSignerAddress(addr); setSignerLoading(false); })
      .catch(() => { setSignerError(true); setSignerLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw.sig, raw.sessionStart, raw.sessionEnd, hasParams, isTimingValid]);

  // ── Multicall: 4 reads per ticket ─────────────────────────────────────────
  // ownerOf | getDelegate | isEntered | getTicketData
  const { data: chainData, isLoading: chainLoading } = useReadContracts({
    contracts: raw.ids.flatMap((tokenId) => [
      { address: CONTRACTS.ticketNFT, abi: ticketNftAbi, functionName: "ownerOf"      as const, args: [BigInt(tokenId)] as const },
      { address: CONTRACTS.ticketNFT, abi: ticketNftAbi, functionName: "getDelegate"  as const, args: [BigInt(tokenId)] as const },
      { address: CONTRACTS.ticketNFT, abi: ticketNftAbi, functionName: "isEntered"    as const, args: [BigInt(tokenId)] as const },
      { address: CONTRACTS.ticketNFT, abi: ticketNftAbi, functionName: "getTicketData" as const, args: [BigInt(tokenId)] as const },
    ]),
    query: { enabled: !!signerAddress && raw.ids.length > 0 },
  });

  // ── Supabase: ticket names + linked orders (single RPC, bypasses RLS) ────
  const [dbTickets, setDbTickets] = useState<Record<number, SupabaseTicket>>({});
  const [linkedOrdersMap, setLinkedOrdersMap] = useState<Record<number, LinkedOrder[]>>({});
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    if (!signerAddress || raw.ids.length === 0) return;
    setDbLoading(true);

    supabase
      .rpc("get_verify_ticket_data", { p_token_ids: raw.ids })
      .then(({ data, error }) => {
        if (error) {
          console.error("[VerifyContent] RPC error:", error);
          setDbLoading(false);
          return;
        }

        const ticketMap: Record<number, SupabaseTicket> = {};
        const ordersMap: Record<number, LinkedOrder[]> = {};

        for (const row of (data ?? []) as any[]) {
          ticketMap[row.token_id] = {
            token_id:    row.token_id,
            seat_number: row.seat_number,
            events: {
              match_title: row.match_title ?? "",
              start_time:  row.start_time  ?? "",
              venues: { name: row.venue_name ?? "", city: row.venue_city ?? "" },
            },
            enclosures: { name: row.enclosure_name ?? "" },
          };
          ordersMap[row.token_id] = (row.orders ?? []).map((o: any) => ({
            orderId:      o.orderId,
            productName:  o.productName,
            quantity:     o.quantity,
            totalPaidWei: o.totalPaidWei,
            status:       o.status,
          }));
        }

        setDbTickets(ticketMap);
        setLinkedOrdersMap(ordersMap);
        setDbLoading(false);
      });
  }, [signerAddress, raw.ids]);

  // ── Build per-ticket results ───────────────────────────────────────────────
  const ticketResults: TicketResult[] = useMemo(() => {
    if (!chainData || !signerAddress) return [];

    return raw.ids.map((tokenId, i) => {
      const base = i * 4;
      const ownerRes  = chainData[base + 0];
      const delegRes  = chainData[base + 1];
      const enteredRes = chainData[base + 2];
      const dataRes   = chainData[base + 3];

      const owner    = ownerRes?.status  === "success" ? (ownerRes.result  as string) : null;
      const delegate = delegRes?.status  === "success" ? (delegRes.result  as string) : null;
      const entered  = enteredRes?.status === "success" ? (enteredRes.result as boolean) : false;

      type TData = { rowLabel: string; seatNumber: bigint };
      const tData = dataRes?.status === "success" ? (dataRes.result as TData) : null;

      const signerLower = signerAddress.toLowerCase();
      let signerRole: TicketResult["signerRole"] = "unauthorized";
      if (!owner) {
        signerRole = "error";
      } else if (owner.toLowerCase() === signerLower) {
        signerRole = "owner";
      } else if (delegate && delegate !== ZERO && delegate.toLowerCase() === signerLower) {
        signerRole = "delegate";
      }

      const db = dbTickets[tokenId];
      const ev = db?.events;
      const venue = ev
        ? (Array.isArray(ev.venues) ? ev.venues[0] : ev.venues)
        : null;

      return {
        tokenId,
        owner,
        delegate:    delegate && delegate !== ZERO ? delegate : null,
        isEntered:   entered,
        rowLabel:    tData?.rowLabel ? bytes1ToChar(tData.rowLabel) : "?",
        seatNumber:  db?.seat_number ?? (tData?.seatNumber ? Number(tData.seatNumber) : 0),
        signerRole,
        matchTitle:  ev?.match_title  ?? "Unknown Match",
        startTime:   ev?.start_time   ?? "",
        venueName:   (venue as { name?: string } | null)?.name  ?? "Unknown Venue",
        venueCity:   (venue as { city?: string } | null)?.city  ?? "",
        enclosureName: db?.enclosures?.name ?? "Unknown Enclosure",
        linkedOrders: linkedOrdersMap[tokenId] ?? [],
      };
    });
  }, [chainData, signerAddress, raw.ids, dbTickets, linkedOrdersMap]);

  const isLoading = signerLoading || chainLoading || dbLoading;

  // Overall validity — all tickets must be authorized, none already entered with error
  const allAuthorized = ticketResults.length > 0 &&
    ticketResults.every((t) => t.signerRole === "owner" || t.signerRole === "delegate");
  const anyEntered = ticketResults.some((t) => t.isEntered);

  // ── Render ─────────────────────────────────────────────────────────────────

  // No QR params in URL
  if (!hasParams) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
          <ScanLine size={28} className="text-white/20" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white/60 mb-1">No QR Data</h2>
          <p className="text-sm text-white/30 max-w-xs">
            Open WicketChain, show your ticket QR, and scan it with this device.
          </p>
        </div>
      </div>
    );
  }

  // QR expired
  if (!qrFresh) {
    return (
      <StatusBanner
        type="expired"
        title="QR Expired"
        description={`This QR code expired ${secondsAgo(raw.ts)}. Ask the ticket holder to refresh their QR.`}
      />
    );
  }

  // Session expired
  if (!sessionValid) {
    return (
      <StatusBanner
        type="expired"
        title="Session Expired"
        description="The signing session for this QR has expired. The ticket holder needs to sign a new session."
      />
    );
  }

  // Sig recovery failed
  if (signerError) {
    return (
      <StatusBanner
        type="invalid"
        title="Invalid Signature"
        description="Could not recover a valid signer address from this QR code. The QR may be tampered or malformed."
      />
    );
  }

  // Loading
  if (isLoading || !signerAddress) {
    return (
      <div className="flex flex-col gap-4">
        {raw.ids.map((id) => <TicketSkeleton key={id} />)}
      </div>
    );
  }

  // Results
  return (
    <div className="flex flex-col gap-5">

      {/* ── Overall status banner ── */}
      <StatusBanner
        type={
          !allAuthorized ? "invalid"
          : anyEntered   ? "warning"
          : "valid"
        }
        title={
          !allAuthorized ? "Authorization Failed"
          : anyEntered   ? "Valid — Some Tickets Already Used"
          : `${ticketResults.length === 1 ? "Ticket" : `${ticketResults.length} Tickets`} Verified`
        }
        description={
          !allAuthorized
            ? "One or more tickets are not authorized for this wallet."
          : anyEntered
            ? "These tickets passed verification but some have already been marked as entered."
          : "Signature valid, session active, and all tickets are authorized."
        }
      />

      {/* ── QR meta ── */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-white/[0.05] rounded-xl px-3 min-[350px]:px-5 py-3 min-[350px]:py-4 grid grid-cols-2 gap-3 min-[350px]:gap-4 text-xs">
        <div>
          <p className="text-white/30 uppercase tracking-[1px] text-[10px] mb-1">Generated</p>
          <p className="text-white font-medium">{secondsAgo(raw.ts)}</p>
        </div>
        <div>
          <p className="text-white/30 uppercase tracking-[1px] text-[10px] mb-1">Session Expires</p>
          <p className="text-white font-medium">
            {format(new Date(raw.sessionEnd * 1000), "hh:mm:ss a")}
          </p>
        </div>
        <div>
          <p className="text-white/30 uppercase tracking-[1px] text-[10px] mb-1">Signer</p>
          <p className="text-white font-mono">{truncateAddress(signerAddress)}</p>
        </div>
        <div>
          <p className="text-white/30 uppercase tracking-[1px] text-[10px] mb-1">Session</p>
          <p className="text-white font-medium">{Math.floor(SESSION_DURATION / 60)} min window</p>
        </div>
      </div>

      {/* ── Per-ticket cards ── */}
      {ticketResults.map((t) => (
        <TicketCard key={t.tokenId} ticket={t} />
      ))}

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <ShieldCheck size={12} className="text-white/20" />
        <p className="text-[10px] text-white/20 uppercase tracking-[1px]">
          Verified by WicketChain Obsidian Ledger
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBanner({
  type,
  title,
  description,
}: {
  type: "valid" | "expired" | "invalid" | "warning";
  title: string;
  description: string;
}) {
  const styles = {
    valid:   { bg: "bg-[rgba(86,169,99,0.1)]",  border: "border-[rgba(165,252,173,0.2)]", icon: <CheckCircle2 size={20} className="text-[#56a963]" />,   text: "text-[#a5fcad]" },
    expired: { bg: "bg-[rgba(255,115,81,0.08)]", border: "border-[rgba(255,115,81,0.2)]",  icon: <Clock        size={20} className="text-[#ff7351]" />,    text: "text-[#ff7351]" },
    invalid: { bg: "bg-[rgba(255,115,81,0.08)]", border: "border-[rgba(255,115,81,0.2)]",  icon: <XCircle      size={20} className="text-[#ff7351]" />,    text: "text-[#ff7351]" },
    warning: { bg: "bg-[rgba(245,158,11,0.08)]", border: "border-[rgba(245,158,11,0.2)]",  icon: <AlertTriangle size={20} className="text-amber-400" />, text: "text-amber-400"  },
  }[type];

  return (
    <div className={`flex gap-3 min-[350px]:gap-4 items-start p-3.5 min-[350px]:p-5 rounded-xl border ${styles.bg} ${styles.border}`}>
      <div className="shrink-0 mt-0.5">{styles.icon}</div>
      <div className="min-w-0">
        <p className={`font-bold font-heading text-sm min-[350px]:text-base ${styles.text}`}>{title}</p>
        <p className="text-xs min-[350px]:text-sm text-white/50 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

const ORDER_STATUS_STYLE: Record<string, string> = {
  ACTIVE:    "bg-[rgba(0,109,66,0.3)] text-[#77f5af]",
  CONFIRMED: "bg-amber-500/20 text-amber-400",
  COLLECTED: "bg-blue-500/20 text-blue-400",
};

function TicketCard({ ticket: t }: { ticket: TicketResult }) {
  const authorized = t.signerRole === "owner" || t.signerRole === "delegate";

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        authorized
          ? "border-[rgba(165,252,173,0.1)] bg-[rgba(25,25,25,0.7)]"
          : "border-[rgba(255,115,81,0.15)] bg-[rgba(25,25,25,0.7)]"
      }`}
    >
      {/* Colour bar */}
      <div className={`h-1 w-full ${authorized ? "bg-[#56a963]" : "bg-[#ff7351]"}`} />

      <div className="p-3.5 min-[350px]:p-5 flex flex-col gap-3 min-[350px]:gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[1px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white/50">
              #{String(t.tokenId).padStart(4, "0")}
            </span>
            {t.isEntered && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 uppercase">
                Already Entered
              </span>
            )}
          </div>

          {/* Auth badge */}
          {t.signerRole === "owner" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(86,169,99,0.15)] border border-[rgba(165,252,173,0.2)]">
              <User size={11} className="text-[#a5fcad]" />
              <span className="text-[10px] font-bold text-[#a5fcad] uppercase tracking-[1px]">Owner</span>
              <CheckCircle2 size={11} className="text-[#56a963]" />
            </div>
          )}
          {t.signerRole === "delegate" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(0,210,255,0.1)] border border-[rgba(0,210,255,0.2)]">
              <UserCheck size={11} className="text-[#86ecff]" />
              <span className="text-[10px] font-bold text-[#86ecff] uppercase tracking-[1px]">Delegate</span>
              <CheckCircle2 size={11} className="text-[#86ecff]" />
            </div>
          )}
          {(t.signerRole === "unauthorized" || t.signerRole === "error") && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle size={11} className="text-red-400" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-[1px]">
                {t.signerRole === "error" ? "Not Found" : "Unauthorized"}
              </span>
            </div>
          )}
        </div>

        {/* Match title */}
        <div>
          <p className="text-base font-bold font-heading text-white leading-tight">{t.matchTitle}</p>
          {t.startTime && (
            <p className="text-xs text-white/40 mt-0.5">
              {format(new Date(t.startTime), "MMM dd, yyyy · hh:mm a")}
            </p>
          )}
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-[#ababab]">
          <MapPin size={12} className="shrink-0" />
          <span>{t.venueName}{t.venueCity ? `, ${t.venueCity}` : ""}</span>
        </div>

        {/* Seating */}
        <div className="bg-[#131313] rounded-xl px-3 min-[350px]:px-4 py-3 flex items-center gap-3">
          <Ticket size={14} className={`shrink-0 ${authorized ? "text-[#a5fcad]" : "text-white/20"}`} />
          <div className="min-w-0">
            <p className="text-[10px] text-white/30 uppercase tracking-[1px]">Seating</p>
            <p className={`text-xs min-[350px]:text-sm font-bold break-words ${authorized ? "text-[#a5fcad]" : "text-white/40"}`}>
              Row {t.rowLabel}, Seat {t.seatNumber} — {t.enclosureName}
            </p>
          </div>
        </div>

        {/* Linked shop orders */}
        {t.linkedOrders.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[1px] text-white/30">
              Linked Shop Orders
            </p>
            {t.linkedOrders.map((o) => (
              <div key={o.orderId} className="bg-[#131313] rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ShoppingBag size={12} className="shrink-0 text-white/30" />
                  <div className="min-w-0">
                    <p className="text-xs text-white/70 truncate">{o.productName}</p>
                    <p className="text-[10px] text-white/30">Qty {o.quantity}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ORDER_STATUS_STYLE[o.status] ?? "bg-white/5 text-white/30"}`}>
                  {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Owner / Delegate address info */}
        {t.owner && (
          <div className="grid grid-cols-1 min-[350px]:grid-cols-2 gap-2 min-[350px]:gap-3 text-xs">
            <div>
              <p className="text-white/25 uppercase tracking-[1px] text-[9px] mb-0.5">Owner</p>
              <p className="font-mono text-white/50">{truncateAddress(t.owner)}</p>
            </div>
            {t.delegate && (
              <div>
                <p className="text-white/25 uppercase tracking-[1px] text-[9px] mb-0.5">Delegate</p>
                <p className="font-mono text-white/50">{truncateAddress(t.delegate)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[rgba(25,25,25,0.5)] overflow-hidden">
      <div className="h-1 bg-white/5" />
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="h-6 w-20 rounded-full bg-white/5 animate-pulse" />
          <div className="h-6 w-24 rounded-lg bg-white/5 animate-pulse" />
        </div>
        <div className="h-5 w-2/3 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
        <div className="h-14 w-full rounded-xl bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

// ── Walk-in Verify ────────────────────────────────────────────────────────────

interface WalkInSupabaseTicket {
  token_id: number;
  row_label: string;
  seat_number: number;
  events: { match_title: string; start_time: string; venues: { name: string; city: string } | null } | null;
  enclosures: { name: string } | null;
}

function WalkInVerifyContent({ tokenId, code }: { tokenId: number; code: string }) {
  // On-chain: verifyWalkInCode + getTicketData + isEntered
  const { data: chainData, isLoading: chainLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "verifyWalkInCode" as const,
        args: [BigInt(tokenId || 0), code as `0x${string}`] as const,
      },
      {
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "getTicketData" as const,
        args: [BigInt(tokenId || 0)] as const,
      },
      {
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "isEntered" as const,
        args: [BigInt(tokenId || 0)] as const,
      },
    ],
    query: { enabled: !!tokenId && !!code },
  });

  // Supabase: readable names
  const [dbTicket, setDbTicket] = useState<WalkInSupabaseTicket | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    if (!tokenId) return;
    setDbLoading(true);
    supabase
      .rpc("get_verify_ticket_data", { p_token_ids: [tokenId] })
      .single()
      .then(({ data }) => {
        if (data) {
          const row = data as any;
          setDbTicket({
            token_id:    row.token_id,
            row_label:   row.row_label,
            seat_number: row.seat_number,
            events: {
              match_title: row.match_title ?? "",
              start_time:  row.start_time  ?? "",
              venues: { name: row.venue_name ?? "", city: row.venue_city ?? "" },
            },
            enclosures: { name: row.enclosure_name ?? "" },
          });
        }
        setDbLoading(false);
      });
  }, [tokenId]);

  const isLoading = chainLoading || dbLoading;

  if (!tokenId || !code) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
          <ScanLine size={28} className="text-white/20" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white/60 mb-1">Invalid QR</h2>
          <p className="text-sm text-white/30">Missing token ID or entry code.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <TicketSkeleton />;
  }

  const isValid = chainData?.[0]?.status === "success" ? (chainData[0].result as boolean) : false;
  const isEntered = chainData?.[2]?.status === "success" ? (chainData[2].result as boolean) : false;

  type TData = { rowLabel: string; seatNumber: bigint };
  const tData = chainData?.[1]?.status === "success" ? (chainData[1].result as TData) : null;
  const rowLabel = tData?.rowLabel ? bytes1ToChar(tData.rowLabel) : dbTicket?.row_label ?? "?";
  const seatNumber = dbTicket?.seat_number ?? (tData?.seatNumber ? Number(tData.seatNumber) : 0);

  const ev = dbTicket?.events;
  const venue = ev ? (Array.isArray(ev.venues) ? ev.venues[0] : ev.venues) : null;
  const matchTitle = ev?.match_title ?? "Unknown Match";
  const startTime = ev?.start_time ?? "";
  const venueName = (venue as { name?: string } | null)?.name ?? "Unknown Venue";
  const venueCity = (venue as { city?: string } | null)?.city ?? "";
  const enclosureName = dbTicket?.enclosures?.name ?? "Unknown Enclosure";

  return (
    <div className="flex flex-col gap-5">
      {/* Walk-in badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 w-fit">
        <Footprints size={12} className="text-amber-400" />
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[1px]">Walk-in Ticket</span>
      </div>

      {/* Overall status banner */}
      <StatusBanner
        type={!isValid ? "invalid" : isEntered ? "warning" : "valid"}
        title={!isValid ? "Invalid Entry Code" : isEntered ? "Already Entered" : "Walk-in Verified"}
        description={
          !isValid
            ? "The entry code does not match this ticket. Access denied."
            : isEntered
            ? "This walk-in ticket has already been used for entry."
            : "Entry code verified on-chain. Walk-in access granted."
        }
      />

      {/* Ticket card */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isValid
            ? "border-[rgba(165,252,173,0.1)] bg-[rgba(25,25,25,0.7)]"
            : "border-[rgba(255,115,81,0.15)] bg-[rgba(25,25,25,0.7)]"
        }`}
      >
        <div className={`h-1 w-full ${isValid ? "bg-amber-500" : "bg-[#ff7351]"}`} />
        <div className="p-5 flex flex-col gap-4">
          {/* Token ID + entered badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[1px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-white/50">
              #{String(tokenId).padStart(4, "0")}
            </span>
            {isEntered && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 uppercase">
                Already Entered
              </span>
            )}
            {isValid && !isEntered && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-[rgba(86,169,99,0.15)] text-[#a5fcad] uppercase">
                Valid
              </span>
            )}
          </div>

          {/* Match title */}
          <div>
            <p className="text-base font-bold font-heading text-white leading-tight">{matchTitle}</p>
            {startTime && (
              <p className="text-xs text-white/40 mt-0.5">
                {format(new Date(startTime), "MMM dd, yyyy · hh:mm a")}
              </p>
            )}
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2 text-sm text-[#ababab]">
            <MapPin size={12} className="shrink-0" />
            <span>{venueName}{venueCity ? `, ${venueCity}` : ""}</span>
          </div>

          {/* Seating */}
          <div className="bg-[#131313] rounded-xl px-3 min-[350px]:px-4 py-3 flex items-center gap-3">
            <Ticket size={14} className={`shrink-0 ${isValid ? "text-amber-400" : "text-white/20"}`} />
            <div className="min-w-0">
              <p className="text-[10px] text-white/30 uppercase tracking-[1px]">Seating</p>
              <p className={`text-xs min-[350px]:text-sm font-bold break-words ${isValid ? "text-amber-300" : "text-white/40"}`}>
                Row {rowLabel}, Seat {seatNumber} — {enclosureName}
              </p>
            </div>
          </div>

          {/* No expiry for walk-in */}
          <p className="text-[10px] text-white/25 text-center">
            Walk-in QR codes do not expire · Entry code verified on-chain
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <ShieldCheck size={12} className="text-white/20" />
        <p className="text-[10px] text-white/20 uppercase tracking-[1px]">
          Verified by WicketChain Obsidian Ledger
        </p>
      </div>
    </div>
  );
}
