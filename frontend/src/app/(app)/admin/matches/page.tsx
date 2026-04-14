"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar, Shield, Plus, ChevronDown, ChevronRight,
  X, MapPin, DollarSign, QrCode, AlertTriangle, Layers, Upload, Pencil,
  Printer, Copy, History, CheckCircle2, Loader2, ShoppingCart,
} from "lucide-react";
import { useAccount, usePublicClient } from "wagmi";
import { parseEther, formatEther, parseEventLogs, keccak256 } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { supabase } from "@/lib/supabase";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi, stadiumShopAbi } from "@/lib/contracts/generated";
import { STATUS_LABEL, STATUS_STYLE, STATUS_STYLE_FALLBACK } from "@/lib/eventStatus";
import { formatWire } from "@/lib/utils/formatWire";
import { Badge } from "@/components/ui/badge";
import { SeatMap, SeatStatus } from "@/components/stadium/SeatMap";

// ── Constants ─────────────────────────────────────────────────────────────────

// Must match Solidity EventStatus enum order exactly
const STATUS_TO_UINT8: Record<string, number> = {
  CREATED: 0, LIVE: 1, REFUNDS_CLOSED: 2, GATES_OPEN: 3,
  IN_PROGRESS: 4, COMPLETED: 5, CANCELLED: 6, POSTPONED: 7,
};

const ALL_STATUSES = [
  "CREATED", "LIVE", "REFUNDS_CLOSED", "GATES_OPEN",
  "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED",
] as const;

const TAB_STATUSES: Record<string, string[]> = {
  all:       ["CREATED","LIVE","REFUNDS_CLOSED","GATES_OPEN","IN_PROGRESS","POSTPONED","COMPLETED","CANCELLED"],
  upcoming:  ["CREATED","LIVE","REFUNDS_CLOSED","GATES_OPEN","IN_PROGRESS","POSTPONED"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
};
type Tab = "all" | "upcoming" | "completed" | "cancelled";

// Context-sensitive actions per status
function getStatusActions(status: string) {
  switch (status) {
    case "CREATED":        return { canSetLive: true,  nextManual: null,             canPostpone: true,  canCancel: true  };
    case "LIVE":           return { canSetLive: false, nextManual: "REFUNDS_CLOSED", canPostpone: true,  canCancel: true  };
    case "REFUNDS_CLOSED": return { canSetLive: false, nextManual: "GATES_OPEN",     canPostpone: true,  canCancel: true  };
    case "GATES_OPEN":     return { canSetLive: false, nextManual: "IN_PROGRESS",    canPostpone: false, canCancel: false };
    case "IN_PROGRESS":    return { canSetLive: false, nextManual: "COMPLETED",      canPostpone: false, canCancel: false };
    case "POSTPONED":      return { canSetLive: true,  nextManual: null,             canPostpone: true,  canCancel: true  };
    default:               return { canSetLive: false, nextManual: null,             canPostpone: false, canCancel: false };
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  eventIdOnchain: number;
  venueId: string;
  venueName: string;
  venueCity: string;
  venueIdOnchain: number;
  matchTitle: string;
  startTime: string;
  endTime: string;
  status: string;
  eventManagerAddress: string;
  imageUrl: string | null;
}

interface EnclosureWithPricing {
  id: string;
  enclosureIdOnchain: number;
  name: string;
  totalSeats: number;
  priceWei: string | null;
  priceDisplay: string | null;
  soldSeats: number;
  refundInitiated: boolean;
}

interface VenueOption {
  id: string;
  venueIdOnchain: number;
  name: string;
  city: string;
}

interface WalkInTicketRow {
  tokenId: number;
  rowLabel: string;
  seatNumber: number;
}

// ── Status dot colour (solid, for use inside the custom dropdown) ─────────────
const STATUS_DOT: Record<string, string> = {
  CREATED:        "bg-white/40",
  LIVE:           "bg-[#56a963]",
  REFUNDS_CLOSED: "bg-amber-500",
  GATES_OPEN:     "bg-[#56a963]",
  IN_PROGRESS:    "bg-amber-500",
  COMPLETED:      "bg-white/20",
  CANCELLED:      "bg-red-500",
  POSTPONED:      "bg-amber-500",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDropdown({
  status,
  onChange,
}: {
  status: string;
  onChange: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);

  // Calculate fixed-position coords from the trigger's viewport rect
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen((p) => !p);
  };

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open]);

  return (
    <div className="shrink-0">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-white/8 hover:text-white/90 transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status] ?? "bg-white/20"}`} />
        {STATUS_LABEL[status] ?? status}
        <ChevronDown size={11} className={`text-white/30 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Panel — fixed so it escapes overflow-hidden on the card */}
      {open && (
        <div
          ref={panelRef}
          style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 50 }}
          className="w-44 bg-[#0e0e0e] border border-white/8 rounded-xl shadow-2xl overflow-hidden py-1"
        >
          {ALL_STATUSES.map((s) => {
            const isCurrent = s === status;
            return (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                  isCurrent
                    ? "bg-white/[0.05] text-white"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[s] ?? "bg-white/20"}`} />
                <span className="flex-1">{STATUS_LABEL[s]}</span>
                {isCurrent && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-[#56a963] shrink-0">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1.5">
      {children}
    </p>
  );
}

function FieldInput({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <SectionLabel>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</SectionLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15"
      />
    </div>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminMatchesPage() {
  const { isConnected, address } = useAccount();
  const { hasAnyAdminAccess } = useUserRole();
  const publicClient = usePublicClient();

  // ── Data state ────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [venues, setVenues] = useState<VenueOption[]>([]);

  // Enclosures+pricing per event (keyed by event UUID)
  const [enclosuresByEvent, setEnclosuresByEvent] = useState<Record<string, EnclosureWithPricing[]>>({});
  const [enclosuresLoading, setEnclosuresLoading] = useState<Record<string, boolean>>({});

  // Inline price inputs per enclosure (keyed by enclosure UUID)
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});

  // ── Modal state ───────────────────────────────────────────────────────────
  type ActiveModal = "createMatch" | "editMatch" | "postpone" | "cancelConfirm" | "walkIn" | "forceRefund" | null;
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const targetEventRef = useRef<EventRow | null>(null);
  const pendingRef = useRef<{
    priceWei?: bigint;
    enclosureIdOnchain?: number;
    enclosureId?: string;
    newStartTime?: number;
    newEndTime?: number;
    // create match
    startTs?: number;
    endTs?: number;
    matchTitle?: string;
    venueId?: string;
  }>({});

  // ── Create form state ─────────────────────────────────────────────────────
  const [formVenueId, setFormVenueId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const pendingImageRef = useRef<File | null>(null);

  // ── Edit form state ───────────────────────────────────────────────────────
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImageSaving, setEditImageSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editVenueId, setEditVenueId] = useState("");
  const pendingEditRef = useRef<{ title?: string; venueIdOnchain?: number; venueUUID?: string }>({});

  // ── Postpone form state ───────────────────────────────────────────────────
  const [formNewStart, setFormNewStart] = useState("");
  const [formNewEnd, setFormNewEnd]     = useState("");

  // ── Walk-in form state ────────────────────────────────────────────────────
  const [formWalkInEnclosureId, setFormWalkInEnclosureId] = useState("");

  // ── Walk-in seat picker state ─────────────────────────────────────────────
  const [walkInRows, setWalkInRows] = useState<{ row_label: string; seat_count: number; seat_numbers: number[] | null }[]>([]);
  const [walkInSeatStatuses, setWalkInSeatStatuses] = useState<SeatStatus[]>([]);
  const [walkInSelectedSeats, setWalkInSelectedSeats] = useState<{ row: string; seat: number; contractSeat: number }[]>([]);
  const [walkInSeatLoading, setWalkInSeatLoading] = useState(false);

  // ── Walk-in result / history state ────────────────────────────────────────
  const [walkInPhase, setWalkInPhase] = useState<"form" | "minting" | "success">("form");
  const [walkInResult, setWalkInResult] = useState<{ tokenId: number; entryCode: string } | null>(null);
  const [walkInHistory, setWalkInHistory] = useState<WalkInTicketRow[]>([]);
  const [walkInHistoryLoading, setWalkInHistoryLoading] = useState(false);
  const [showQRFor, setShowQRFor] = useState<{ tokenId: number; code: string } | null>(null);
  const [fetchingQRFor, setFetchingQRFor] = useState<number | null>(null);

  // ── Walk-in batch state ────────────────────────────────────────────────────
  const [walkInProgress, setWalkInProgress] = useState<{ current: number; total: number } | null>(null);
  const [walkInBatchResults, setWalkInBatchResults] = useState<{ tokenId: number; entryCode: string }[]>([]);

  // ── Force refund form state ───────────────────────────────────────────────
  const [formForceEnclosureId, setFormForceEnclosureId] = useState("");
  const [cancellationProgress, setCancellationProgress] = useState<{ processed: number; total: number } | null>(null);
  const [enclosureRefundProgress, setEnclosureRefundProgress] = useState<{ processed: number; total: number } | null>(null);

  // ── Tx modal ──────────────────────────────────────────────────────────────
  const [txModal, setTxModal] = useState<{ open: boolean; successTitle: string; successDesc: string }>({
    open: false, successTitle: "", successDesc: "",
  });

  // ── Contract writers ──────────────────────────────────────────────────────

  const createEventContract = useContractWrite({
    onSuccess: async () => {
      toast.success("Match created on-chain! Syncing…");
      await new Promise((r) => setTimeout(r, 5000));

      // Patch start/end times — EventCreated doesn't emit timestamps so the
      // indexer falls back to NOW. We stored the form values in pendingRef.
      const { startTs, endTs, matchTitle, venueId } = pendingRef.current;
      if (startTs && endTs && matchTitle && venueId) {
        const startIso = new Date(startTs * 1000).toISOString();
        const endIso   = new Date(endTs   * 1000).toISOString();
        const { data: found } = await supabase
          .from("events")
          .select("id")
          .eq("match_title", matchTitle)
          .eq("venue_id", venueId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (found?.id) {
          const updates: Record<string, string> = { start_time: startIso, end_time: endIso };

          // Upload banner image if provided
          const imgFile = pendingImageRef.current;
          if (imgFile) {
            const ext = imgFile.name.split(".").pop() ?? "jpg";
            const path = `events/${found.id}.${ext}`;
            const { error: uploadErr } = await supabase.storage
              .from("match-images")
              .upload(path, imgFile, { upsert: true });
            if (!uploadErr) {
              const { data: urlData } = supabase.storage
                .from("match-images")
                .getPublicUrl(path);
              if (urlData?.publicUrl) updates.image_url = urlData.publicUrl;
            }
            pendingImageRef.current = null;
          }

          await supabase.from("events").update(updates).eq("id", found.id);
        }
      }

      fetchEvents();
    },
  });

  const setLiveContract = useContractWrite({
    onSuccess: async () => {
      const e = targetEventRef.current;
      if (!e) return;
      await supabase.from("events").update({ status: "LIVE" }).eq("id", e.id);
      setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, status: "LIVE" } : x));
      toast.success("Match is now live — tickets open!");
    },
  });

  const updateStatusContract = useContractWrite({
    onSuccess: async () => {
      const e = targetEventRef.current;
      const status = (pendingRef.current as any).status as string;
      if (!e || !status) return;
      await supabase.from("events").update({ status }).eq("id", e.id);
      setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, status } : x));
      toast.success(`Status updated to ${STATUS_LABEL[status] ?? status}`);
    },
  });

  const postponeContract = useContractWrite({
    onSuccess: async () => {
      const e = targetEventRef.current;
      const { newStartTime, newEndTime } = pendingRef.current;
      if (!e || !newStartTime || !newEndTime) return;
      const startIso = new Date(newStartTime * 1000).toISOString();
      const endIso   = new Date(newEndTime   * 1000).toISOString();
      await supabase.from("events").update({
        status: "POSTPONED", start_time: startIso, end_time: endIso,
      }).eq("id", e.id);
      setEvents((prev) => prev.map((x) =>
        x.id === e.id ? { ...x, status: "POSTPONED", startTime: startIso, endTime: endIso } : x
      ));
      toast.success("Match postponed.");
    },
  });

  const cancelContract = useContractWrite({
    onSuccess: async () => {
      const e = targetEventRef.current;
      if (!e) return;
      await supabase.from("events").update({ status: "CANCELLED" }).eq("id", e.id);
      setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, status: "CANCELLED" } : x));
      toast.success("Match cancelled. Refunds are active.");
    },
  });

  const setPricingContract = useContractWrite({
    onSuccess: async () => {
      const e = targetEventRef.current;
      const { priceWei, enclosureIdOnchain, enclosureId } = pendingRef.current;
      if (!e || priceWei === undefined || !enclosureId) return;
      const display = formatWire(priceWei);
      await supabase.from("event_pricing").upsert({
        event_id: e.id,
        enclosure_id: enclosureId,
        price_wei: priceWei.toString(),
        price_display: display,
      }, { onConflict: "event_id,enclosure_id" });

      setEnclosuresByEvent((prev) => ({
        ...prev,
        [e.id]: (prev[e.id] ?? []).map((enc) =>
          enc.id === enclosureId
            ? { ...enc, priceWei: priceWei.toString(), priceDisplay: display }
            : enc
        ),
      }));
      setPriceInputs((p) => ({ ...p, [enclosureId]: "" }));
      toast.success("Pricing set!");
    },
  });

  const walkInContract = useContractWrite();

  const forceRefundContract = useContractWrite({
    onSuccess: async () => {
      toast.success("Enclosure force-refund initiated.");
    },
  });

  const processBatchContract = useContractWrite();
  const processEnclosureBatchContract = useContractWrite();

  const updateEventContract = useContractWrite({
    onSuccess: async () => {
      const e = targetEventRef.current;
      const { title, venueUUID, venueIdOnchain } = pendingEditRef.current;
      if (!e) return;
      const updates: Record<string, unknown> = {};
      if (title) updates.match_title = title;
      if (venueUUID) updates.venue_id = venueUUID;
      if (Object.keys(updates).length > 0) {
        await supabase.from("events").update(updates).eq("id", e.id);
        setEvents((prev) =>
          prev.map((x) => {
            if (x.id !== e.id) return x;
            const newVenue = venueUUID ? venues.find((v) => v.id === venueUUID) : null;
            return {
              ...x,
              matchTitle: title ?? x.matchTitle,
              venueId: venueUUID ?? x.venueId,
              venueIdOnchain: venueIdOnchain ?? x.venueIdOnchain,
              venueName: newVenue?.name ?? x.venueName,
              venueCity: newVenue?.city ?? x.venueCity,
            };
          })
        );
      }
      toast.success("Match details updated.");
    },
  });

  const confirmOrdersContract = useContractWrite({
    onSuccess: async () => {
      toast.success("Shop orders confirmed successfully!");
    },
  });

  // ── Confirm shop orders ────────────────────────────────────────────────────
  const [confirmingOrdersFor, setConfirmingOrdersFor] = useState<string | null>(null);

  const handleConfirmShopOrders = async (event: EventRow) => {
    setConfirmingOrdersFor(event.id);
    try {
      // shop_orders has no event_id — join via tickets (ticket_token_id → token_id)
      const { data: tickets, error: ticketsErr } = await supabase
        .from("tickets")
        .select("token_id")
        .eq("event_id", event.id);

      if (ticketsErr) { toast.error("Failed to fetch tickets."); return; }
      if (!tickets || tickets.length === 0) { toast.info("No tickets found for this match."); return; }

      const tokenIds = tickets.map((t: any) => t.token_id);

      const { data: orders, error } = await supabase
        .from("shop_orders")
        .select("order_id_onchain")
        .in("ticket_token_id", tokenIds)
        .eq("status", "ACTIVE");

      if (error) { toast.error("Failed to fetch orders."); return; }
      if (!orders || orders.length === 0) { toast.info("No active shop orders to confirm."); return; }

      const orderIds = orders.map((o: any) => BigInt(o.order_id_onchain));

      setTxModal({ open: true, successTitle: "Orders Confirmed!", successDesc: `${orders.length} shop order${orders.length === 1 ? "" : "s"} confirmed.` });
      try {
        await confirmOrdersContract.execute({
          address: CONTRACTS.stadiumShop,
          abi: stadiumShopAbi,
          functionName: "confirmOrders",
          args: [orderIds],
        });
      } catch {}
    } finally {
      setConfirmingOrdersFor(null);
    }
  };

  // ── Active tx (for shared TransactionProgressModal) ───────────────────────
  const allContracts = [
    createEventContract, setLiveContract, updateStatusContract,
    postponeContract, cancelContract, setPricingContract,
    walkInContract, forceRefundContract, confirmOrdersContract,
    updateEventContract, processBatchContract, processEnclosureBatchContract,
  ];
  const activeTx = allContracts.find((c) => c.step !== "idle") ?? createEventContract;

  const txModalDesc = cancellationProgress
    ? `Processing refunds… ${cancellationProgress.processed}${
        cancellationProgress.total > 0 ? ` / ${cancellationProgress.total}` : ""
      } tokens processed`
    : enclosureRefundProgress
    ? `Processing enclosure refunds… ${enclosureRefundProgress.processed} / ${enclosureRefundProgress.total} tickets`
    : txModal.successDesc;

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id, event_id_onchain, venue_id, match_title, start_time, end_time, status, event_manager_address, image_url, venues(id, venue_id_onchain, name, city)")
      .order("start_time", { ascending: false });

    if (error) { toast.error(`Failed to load matches: ${error.message}`); setLoading(false); return; }

    setEvents(((data as any[]) || []).map((e) => {
      const v = Array.isArray(e.venues) ? e.venues[0] : e.venues;
      return {
        id: e.id,
        eventIdOnchain: e.event_id_onchain,
        venueId: e.venue_id,
        venueName: v?.name ?? "—",
        venueCity: v?.city ?? "",
        venueIdOnchain: v?.venue_id_onchain ?? 0,
        matchTitle: e.match_title,
        startTime: e.start_time,
        endTime: e.end_time,
        status: e.status,
        eventManagerAddress: e.event_manager_address,
        imageUrl: e.image_url,
      };
    }));
    setLoading(false);
  }, []);

  const fetchVenues = useCallback(async () => {
    const { data } = await supabase
      .from("venues")
      .select("id, venue_id_onchain, name, city")
      .eq("is_active", true)
      .order("name");
    setVenues(((data as any[]) || []).map((v) => ({
      id: v.id, venueIdOnchain: v.venue_id_onchain, name: v.name, city: v.city,
    })));
  }, []);

  const loadEnclosuresForEvent = useCallback(async (event: EventRow) => {
    setEnclosuresLoading((p) => ({ ...p, [event.id]: true }));

    // Fetch enclosures for this venue
    const { data: encData } = await supabase
      .from("enclosures")
      .select("id, enclosure_id_onchain, name, total_seats, is_active")
      .eq("venue_id", event.venueId)
      .eq("is_active", true)
      .order("enclosure_id_onchain");

    // Fetch existing pricing for this event
    const { data: pricingData } = await supabase
      .from("event_pricing")
      .select("enclosure_id, price_wei, price_display")
      .eq("event_id", event.id);

    // Count active (non-returned) tickets per enclosure directly — avoids
    // event_pricing.sold_seats which is never decremented on ticket return.
    const { data: ticketCounts } = await supabase
      .from("tickets")
      .select("enclosure_id")
      .eq("event_id", event.id)
      .eq("is_returned", false);

    const soldMap: Record<string, number> = {};
    ((ticketCounts as any[]) || []).forEach((t) => {
      soldMap[t.enclosure_id] = (soldMap[t.enclosure_id] ?? 0) + 1;
    });

    const pricingMap: Record<string, { priceWei: string; priceDisplay: string | null }> = {};
    ((pricingData as any[]) || []).forEach((p) => {
      pricingMap[p.enclosure_id] = {
        priceWei: p.price_wei,
        priceDisplay: p.price_display,
      };
    });

    const refundInitiatedMap: Record<number, boolean> = {};
    if (publicClient && event.eventIdOnchain) {
      try {
        await Promise.all(
          ((encData as any[]) || []).map(async (enc) => {
            const initiated = await publicClient.readContract({
              address: CONTRACTS.ticketNFT,
              abi: ticketNftAbi,
              functionName: "enclosureRefundInitiated",
              args: [BigInt(event.eventIdOnchain), BigInt(enc.enclosure_id_onchain)],
            });
            refundInitiatedMap[enc.enclosure_id_onchain] = !!initiated;
          })
        );
      } catch (err) {
        console.error("Failed to fetch refund status:", err);
      }
    }

    setEnclosuresByEvent((p) => ({
      ...p,
      [event.id]: ((encData as any[]) || []).map((enc) => ({
        id: enc.id,
        enclosureIdOnchain: enc.enclosure_id_onchain,
        name: enc.name,
        totalSeats: enc.total_seats,
        priceWei: pricingMap[enc.id]?.priceWei ?? null,
        priceDisplay: pricingMap[enc.id]?.priceDisplay ?? null,
        soldSeats: soldMap[enc.id] ?? 0,
        refundInitiated: refundInitiatedMap[enc.enclosure_id_onchain] ?? false,
      })),
    }));
    setEnclosuresLoading((p) => ({ ...p, [event.id]: false }));
  }, []);

  // Load rows + seat statuses for the walk-in seat picker
  const loadWalkInSeatData = useCallback(async (enclosureId: string, eventId: string) => {
    setWalkInSeatLoading(true);
    setWalkInSelectedSeats([]);

    const [{ data: rowsData }, { data: bookedData }, { data: heldData }] = await Promise.all([
      supabase
        .from("enclosure_rows")
        .select("row_label, seat_count, seat_numbers")
        .eq("enclosure_id", enclosureId)
        .order("row_label"),
      supabase
        .from("tickets")
        .select("row_label, seat_number")
        .eq("event_id", eventId)
        .eq("enclosure_id", enclosureId)
        .eq("is_returned", false),
      supabase
        .from("seat_holds")
        .select("row_label, seat_number")
        .eq("event_id", eventId)
        .eq("enclosure_id", enclosureId),
    ]);

    setWalkInRows(
      ((rowsData as any[]) || []).map((r) => ({
        row_label: r.row_label,
        seat_count: r.seat_count,
        seat_numbers: Array.isArray(r.seat_numbers) ? r.seat_numbers : null,
      }))
    );

    const statuses: SeatStatus[] = [
      ...((bookedData as any[]) || []).map((r) => ({
        row: r.row_label, seat: r.seat_number, state: "booked" as const,
      })),
      ...((heldData as any[]) || []).map((r) => ({
        row: r.row_label, seat: r.seat_number, state: "held" as const,
      })),
    ];
    setWalkInSeatStatuses(statuses);
    setWalkInSeatLoading(false);
  }, []);

  // Reload seat data whenever the enclosure selection changes in the walk-in modal
  useEffect(() => {
    if (!formWalkInEnclosureId || !targetEventRef.current) return;
    loadWalkInSeatData(formWalkInEnclosureId, targetEventRef.current.id);
  }, [formWalkInEnclosureId, loadWalkInSeatData]);

  useEffect(() => {
    if (hasAnyAdminAccess) { fetchEvents(); fetchVenues(); }
  }, [hasAnyAdminAccess, fetchEvents, fetchVenues]);

  // ── Expand toggle ─────────────────────────────────────────────────────────

  const toggleExpand = (event: EventRow) => {
    if (expandedId === event.id) { setExpandedId(null); return; }
    setExpandedId(event.id);
    if (!enclosuresByEvent[event.id]) loadEnclosuresForEvent(event);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateMatch = async () => {
    if (!formVenueId || !formTitle.trim() || !formStartTime || !formEndTime) {
      toast.error("Venue, title, start and end time are required."); return;
    }
    const venue = venues.find((v) => v.id === formVenueId);
    if (!venue) return;

    // Parse datetime-local as local time (new Date of "YYYY-MM-DDTHH:mm" is already local)
    const startTs = BigInt(Math.floor(new Date(formStartTime).getTime() / 1000));
    const endTs   = BigInt(Math.floor(new Date(formEndTime).getTime() / 1000));
    if (endTs <= startTs) { toast.error("End time must be after start time."); return; }

    // Store for onSuccess — indexer doesn't receive timestamps from EventCreated event
    pendingRef.current = {
      ...pendingRef.current,
      startTs: Number(startTs),
      endTs:   Number(endTs),
      matchTitle: formTitle.trim(),
      venueId: formVenueId,
    };
    pendingImageRef.current = formImage;

    setActiveModal(null);
    setTxModal({ open: true, successTitle: "Match Created!", successDesc: "Syncing with database…" });
    try {
      await createEventContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "createEvent",
        args: [BigInt(venue.venueIdOnchain), formTitle.trim(), startTs, endTs],
      });
    } catch {}
  };

  const handleSetLive = async (event: EventRow) => {
    targetEventRef.current = event;
    setTxModal({ open: true, successTitle: "Match is Live!", successDesc: "Ticket sales are now open." });
    try {
      await setLiveContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "setEventLive",
        args: [BigInt(event.eventIdOnchain)],
      });
    } catch {}
  };

  const handleUpdateStatus = async (event: EventRow, status: string) => {
    targetEventRef.current = event;
    (pendingRef.current as any).status = status;
    setTxModal({ open: true, successTitle: "Status Updated!", successDesc: `Match status → ${STATUS_LABEL[status] ?? status}` });
    try {
      await updateStatusContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "updateEventStatus",
        args: [BigInt(event.eventIdOnchain), STATUS_TO_UINT8[status]],
      });
    } catch {}
  };

  const handlePostpone = async () => {
    const event = targetEventRef.current;
    if (!event || !formNewStart || !formNewEnd) { toast.error("Both new dates are required."); return; }
    const newStartTs = Math.floor(new Date(formNewStart).getTime() / 1000);
    const newEndTs   = Math.floor(new Date(formNewEnd).getTime() / 1000);
    if (newEndTs <= newStartTs) { toast.error("End time must be after start time."); return; }
    pendingRef.current = { ...pendingRef.current, newStartTime: newStartTs, newEndTime: newEndTs };
    setActiveModal(null);
    setTxModal({ open: true, successTitle: "Match Postponed!", successDesc: "New dates saved on-chain and in database." });
    try {
      await postponeContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "postponeEvent",
        args: [BigInt(event.eventIdOnchain), BigInt(newStartTs), BigInt(newEndTs)],
      });
    } catch {}
  };

  const handleCancel = async () => {
    const event = targetEventRef.current;
    if (!event) return;
    setActiveModal(null);
    setTxModal({ open: true, successTitle: "Match Cancelled!", successDesc: "Processing refunds…" });

    const BATCH_SIZE = 300n;

    try {
      // Step 1: Mark cancelled on-chain (instant)
      await cancelContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "cancelEvent",
        args: [BigInt(event.eventIdOnchain)],
      });

      // Sync DB immediately so UI shows CANCELLED
      await supabase.from("events").update({ status: "CANCELLED" }).eq("id", event.id);
      setEvents((prev) => prev.map((x) => x.id === event.id ? { ...x, status: "CANCELLED" } : x));

      // Step 2: Process refund batches until cursor is exhausted
      let batchNum = 0;
      while (true) {
        batchNum++;
        setCancellationProgress({ processed: batchNum * Number(BATCH_SIZE), total: -1 }); // -1 = unknown total

        const hash = await processBatchContract.execute({
          address: CONTRACTS.ticketNFT,
          abi: ticketNftAbi,
          functionName: "processCancellationRefunds",
          args: [BigInt(event.eventIdOnchain), BATCH_SIZE],
        });

        // Read the CancellationBatchProcessed event to check if cursor === total
        if (hash && publicClient) {
          const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
          const logs = parseEventLogs({
            abi: ticketNftAbi,
            eventName: "CancellationBatchProcessed",
            logs: receipt.logs
          });
          if (logs.length > 0) {
            const { cursor, totalTokens } = (logs[0] as any).args;
            setCancellationProgress({ processed: Number(cursor), total: Number(totalTokens) });
            if (cursor >= totalTokens) break;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      setCancellationProgress(null);
      toast.success("Match cancelled. Refunds credited to all ticket holders.");
    } catch {
      setCancellationProgress(null);
    }
  };

  const handleSetPricing = async (event: EventRow, enc: EnclosureWithPricing) => {
    const raw = priceInputs[enc.id] ?? "";
    if (!raw.trim()) { toast.error("Enter a price."); return; }
    let priceWei: bigint;
    try { priceWei = parseEther(raw); } catch { toast.error("Invalid price — enter a number like 0.5"); return; }
    if (priceWei <= 0n) { toast.error("Price must be greater than 0."); return; }

    targetEventRef.current = event;
    pendingRef.current = { priceWei, enclosureIdOnchain: enc.enclosureIdOnchain, enclosureId: enc.id };
    setTxModal({ open: true, successTitle: "Pricing Set!", successDesc: `${enc.name} → ${formatWire(priceWei)}` });
    try {
      await setPricingContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "setEventPricing",
        args: [BigInt(event.eventIdOnchain), BigInt(enc.enclosureIdOnchain), priceWei],
      });
    } catch {}
  };

  // ── Walk-in print helper ──────────────────────────────────────────────────
  // Opens a new window with all QR codes in a 2-column grid and triggers print.
  const printAllWalkInQRs = (results: { tokenId: number; entryCode: string }[], idPrefix = "walkin-qr-batch") => {
    const cards = results.map((r) => {
      const el = document.getElementById(`${idPrefix}-${r.tokenId}`);
      const svgEl = el?.querySelector("svg");
      const svgData = svgEl ? new XMLSerializer().serializeToString(svgEl) : "";
      return { tokenId: r.tokenId, svgData };
    });
    const win = window.open("", "_blank", "width=700,height=900");
    if (!win) { toast.error("Popup blocked — allow popups and try again."); return; }
    win.document.write(`<!DOCTYPE html><html><head>
  <title>Walk-in Tickets</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#fff; font-family:monospace; padding:24px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
    .card { display:flex; flex-direction:column; align-items:center; gap:8px;
            border:1px solid #ddd; border-radius:12px; padding:16px; }
    .label { font-size:10px; color:#111; text-align:center; }
    @media print { .grid { grid-template-columns:1fr 1fr; } }
  </style>
</head><body><div class="grid">
  ${cards.map((c) => `<div class="card">
    ${c.svgData}
    <p class="label">WicketChain Walk-in · #${String(c.tokenId).padStart(4, "0")}</p>
  </div>`).join("")}
</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const fetchWalkInHistory = useCallback(async (eventUUID: string) => {
    setWalkInHistoryLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("token_id, row_label, seat_number")
      .eq("event_id", eventUUID)
      .eq("is_walk_in", true)
      .order("token_id", { ascending: false });
    setWalkInHistory(
      (data ?? []).map((r: any) => ({
        tokenId: r.token_id,
        rowLabel: r.row_label ?? "?",
        seatNumber: r.seat_number ?? 0,
      }))
    );
    setWalkInHistoryLoading(false);
  }, []);

  const handleShowQRForHistory = async (tokenId: number) => {
    if (!publicClient) return;
    setFetchingQRFor(tokenId);
    setShowQRFor(null);
    try {
      const data = await publicClient.readContract({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "getTicketData",
        args: [BigInt(tokenId)],
      }) as any;
      const entryCode = data.walkInEntryCode as string;
      setShowQRFor({ tokenId, code: entryCode });
    } catch {
      toast.error("Failed to fetch entry code");
    } finally {
      setFetchingQRFor(null);
    }
  };

  const handleWalkIn = async () => {
    const event = targetEventRef.current;
    if (!event || !formWalkInEnclosureId || walkInSelectedSeats.length === 0) {
      toast.error("Select an enclosure and at least one seat."); return;
    }

    // Status guard — walk-ins only allowed during Gates Open or In Progress
    if (event.status !== "GATES_OPEN" && event.status !== "IN_PROGRESS") {
      toast.error(`Walk-in requires Gates Open or In Progress. Current: ${STATUS_LABEL[event.status] ?? event.status}`);
      return;
    }
    // End-time guard — don't mint after match ended
    if (new Date(event.endTime) <= new Date()) {
      toast.error("Cannot mint walk-in tickets: match has ended.");
      return;
    }

    const enclosures = enclosuresByEvent[event.id] ?? [];
    const enc = enclosures.find((e) => e.id === formWalkInEnclosureId);
    if (!enc) return;

    setWalkInPhase("minting");
    const collected: { tokenId: number; entryCode: string }[] = [];

    for (let i = 0; i < walkInSelectedSeats.length; i++) {
      const { row, seat, contractSeat } = walkInSelectedSeats[i];
      setWalkInProgress({ current: i + 1, total: walkInSelectedSeats.length });
      const rowBytes = `0x${row.charCodeAt(0).toString(16).padStart(2, "0")}` as `0x${string}`;
      try {
        // Step 1: Generate a random 32-byte secret nonce and its hash
        const secretNonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")}` as `0x${string}`;
        const secretHash = keccak256(secretNonce);

        const hash = await walkInContract.execute({
          address: CONTRACTS.ticketNFT,
          abi: ticketNftAbi,
          functionName: "purchaseWalkInTicket",
          args: [
            BigInt(event.eventIdOnchain),
            BigInt(enc.enclosureIdOnchain),
            rowBytes,
            BigInt(contractSeat),
            CONTRACTS.walkInWallet,
            secretHash, // C-03 fix: Only submit hash to public mempool
          ],
        });
        if (hash && publicClient) {
          const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
          const logs = parseEventLogs({ abi: ticketNftAbi, eventName: "WalkInTicketMinted", logs: receipt.logs });
          if (logs.length > 0) {
            const tokenId = Number((logs[0].args as any).tokenId);
            const ticketData = await publicClient.readContract({
              address: CONTRACTS.ticketNFT, abi: ticketNftAbi,
              functionName: "getTicketData", args: [BigInt(tokenId)],
            }) as any;
            const entryCode = ticketData.walkInEntryCode as string;
            await supabase.from("tickets").upsert(
              { token_id: tokenId, event_id: event.id, venue_id: event.venueId, enclosure_id: enc.id,
                row_label: row, seat_number: seat,
                owner_address: CONTRACTS.walkInWallet.toLowerCase(),
                purchase_price_wei: "0", is_returned: false, is_walk_in: true, is_entered: false, tx_hash: hash },
              { onConflict: "token_id" }
            );
            await supabase.from("walk_in_tickets").upsert(
              { token_id: tokenId, event_id: event.id, enclosure_id: enc.id,
                row_label: row, seat_number: seat, entry_code_hash: entryCode,
                secret_nonce: secretNonce, // C-03 integration
                is_claimed: false },
              { onConflict: "token_id" }
            );
            collected.push({ tokenId, entryCode });
          }
        }
      } catch {
        toast.error(`Failed to mint Row ${row}, Seat ${seat}`);
        break;
      }
    }

    setWalkInProgress(null);
    if (collected.length > 0) {
      setWalkInBatchResults(collected);
      setWalkInResult(collected[0]);
      setWalkInPhase("success");
      fetchWalkInHistory(event.id);
    } else {
      setWalkInPhase("form");
    }
  };

  const handleInitiateEnclosureRefund = async () => {
    const event = targetEventRef.current;
    if (!event || !formForceEnclosureId) { toast.error("Select an enclosure."); return; }
    const enclosures = enclosuresByEvent[event.id] ?? [];
    const enc = enclosures.find((e) => e.id === formForceEnclosureId);
    if (!enc || enc.refundInitiated) return;

    setTxModal({
      open: true,
      successTitle: "Refund Initiated!",
      successDesc: `Enclosure ${enc.name} is now marked for force-refunds. You can now start processing batches.`,
    });

    try {
      await forceRefundContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "forceRefundEnclosure",
        args: [BigInt(event.eventIdOnchain), BigInt(enc.enclosureIdOnchain)],
      });

      // Update local state so Step 2 becomes visible
      setEnclosuresByEvent((prev) => ({
        ...prev,
        [event.id]: (prev[event.id] ?? []).map((e) =>
          e.id === enc.id ? { ...e, refundInitiated: true } : e
        ),
      }));
    } catch {}
  };

  const handleProcessEnclosureBatches = async () => {
    const event = targetEventRef.current;
    if (!event || !formForceEnclosureId) { toast.error("Select an enclosure."); return; }
    const enclosures = enclosuresByEvent[event.id] ?? [];
    const enc = enclosures.find((e) => e.id === formForceEnclosureId);
    if (!enc || !enc.refundInitiated) { toast.error("Refund not initiated yet."); return; }

    setActiveModal(null);
    setTxModal({ open: true, successTitle: "Batch Processing Started!", successDesc: "Processing enclosure refunds…" });

    const BATCH_SIZE = 300n;

    try {
      let batchNum = 0;
      while (true) {
        batchNum++;
        setEnclosureRefundProgress({ processed: batchNum * Number(BATCH_SIZE), total: enc.soldSeats });

        const hash = await processEnclosureBatchContract.execute({
          address: CONTRACTS.ticketNFT,
          abi: ticketNftAbi,
          functionName: "processEnclosureRefunds",
          args: [BigInt(event.eventIdOnchain), BigInt(enc.enclosureIdOnchain), BATCH_SIZE],
        });

        // Check if enclosure is fully processed
        if (hash && publicClient) {
          const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
          const logs = parseEventLogs({
            abi: ticketNftAbi,
            eventName: "CancellationBatchProcessed",
            logs: receipt.logs
          });
          if (logs.length === 0) break;
          const { cursor, totalTokens } = (logs[0] as any).args;
          setEnclosureRefundProgress({ processed: Number(cursor), total: Number(totalTokens) });
          if (cursor >= totalTokens) break;
        } else {
          break;
        }
      }

      setEnclosureRefundProgress(null);
      toast.success(`All tickets in ${enc.name} refunded.`);
      // Reload event data to update soldSeats etc.
      loadEnclosuresForEvent(event);
    } catch {
      setEnclosureRefundProgress(null);
    }
  };

  const handleSaveEdit = async () => {
    const event = targetEventRef.current;
    if (!event) return;
    if (!editImage) { toast.error("Select an image first."); return; }

    setEditImageSaving(true);
    try {
      const ext  = editImage.name.split(".").pop() ?? "jpg";
      const path = `events/${event.id}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("match-images")
        .upload(path, editImage, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("match-images")
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL");

      const { error: dbErr } = await supabase
        .from("events")
        .update({ image_url: publicUrl })
        .eq("id", event.id);

      if (dbErr) throw dbErr;

      // Reflect in local state so the change is visible without a full refetch
      setEvents((prev) =>
        prev.map((e) => e.id === event.id ? { ...e, imageUrl: publicUrl } : e)
      );

      toast.success("Banner image updated.");
      setActiveModal(null);
      setEditImage(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save image.");
    } finally {
      setEditImageSaving(false);
    }
  };

  const handleSaveMatchDetails = async () => {
    const event = targetEventRef.current;
    if (!event) return;
    const newTitle = editTitle.trim();
    const newVenueUUID = editVenueId;
    if (!newTitle && !newVenueUUID) { toast.error("Change at least one field."); return; }
    const newVenue = newVenueUUID ? venues.find((v) => v.id === newVenueUUID) : null;
    const titleToUse = newTitle || event.matchTitle;
    const venueIdOnchain = newVenue ? newVenue.venueIdOnchain : event.venueIdOnchain;
    pendingEditRef.current = {
      title: newTitle || undefined,
      venueUUID: newVenueUUID || undefined,
      venueIdOnchain: newVenue?.venueIdOnchain,
    };
    setActiveModal(null);
    setTxModal({ open: true, successTitle: "Match Updated!", successDesc: "Title and venue saved on-chain." });
    try {
      await updateEventContract.execute({
        address: CONTRACTS.ticketNFT,
        abi: ticketNftAbi,
        functionName: "updateEvent",
        args: [BigInt(event.eventIdOnchain), titleToUse, BigInt(venueIdOnchain)],
      });
    } catch {}
  };

  const handleStatusChange = (event: EventRow, newStatus: string) => {
    if (newStatus === event.status) return;
    targetEventRef.current = event;
    switch (newStatus) {
      case "LIVE":
        return handleSetLive(event);
      case "CANCELLED":
        return setActiveModal("cancelConfirm");
      case "POSTPONED":
        setFormNewStart(""); setFormNewEnd("");
        return setActiveModal("postpone");
      default:
        return handleUpdateStatus(event, newStatus);
    }
  };

  // ── Filtered events ───────────────────────────────────────────────────────

  const tabEvents = events.filter((e) => TAB_STATUSES[tab].includes(e.status));
  const tabCounts: Record<Tab, number> = { all: 0, upcoming: 0, completed: 0, cancelled: 0 };
  events.forEach((e) => {
    (Object.keys(TAB_STATUSES) as Tab[]).forEach((t) => {
      if (TAB_STATUSES[t].includes(e.status)) tabCounts[t]++;
    });
  });

  // ── Guard ─────────────────────────────────────────────────────────────────

  if (!isConnected || !hasAnyAdminAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto">
          <Shield size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Admin access required</h2>
        <p className="text-sm text-white/40">Connect an admin or event manager wallet to manage matches.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-[#56a963]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Match Management</h1>
            <p className="text-sm text-white/40">Create matches, set pricing, and manage match day operations</p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormVenueId(""); setFormTitle(""); setFormStartTime(""); setFormEndTime(""); setFormImage(null);
            setActiveModal("createMatch");
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity max-[682px]:basis-full max-[682px]:justify-center"
          style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
        >
          <Plus size={15} />
          Create Match
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all","upcoming","completed","cancelled"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 max-[520px]:gap-1.5 px-4 max-[520px]:px-3 py-2 max-[520px]:py-1.5 rounded-xl text-sm max-[520px]:text-xs font-semibold transition-all ${
              tab === t ? "bg-[#56a963] text-[#002a0c]" : "bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/70"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {!loading && (
              <span className={`text-[10px] max-[520px]:text-[7px] font-bold px-1.5 max-[520px]:px-1 py-0.5 rounded-full ${
                tab === t ? "bg-[#002a0c]/30 text-[#002a0c]" : "bg-white/10 text-white/40"
              }`}>
                {tabCounts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && tabEvents.length === 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center">
          <Calendar size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30 mb-4">No matches in this category.</p>
          {tab === "upcoming" && (
            <button
              onClick={() => { setFormVenueId(""); setFormTitle(""); setFormStartTime(""); setFormEndTime(""); setFormImage(null); setActiveModal("createMatch"); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            >
              <Plus size={14} /> Create First Match
            </button>
          )}
        </div>
      )}

      {/* Match list */}
      {!loading && (
        <div className="space-y-3">
          {tabEvents.map((event) => {
            const isExpanded = expandedId === event.id;
            const enclosures = enclosuresByEvent[event.id] ?? [];
            const encLoading = enclosuresLoading[event.id] ?? false;
            const startDate = new Date(event.startTime);

            return (
              <div key={event.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">

                {/* Match header row */}
                <div className="flex items-center gap-3 px-5 py-4 max-[600px]:flex-wrap max-[600px]:justify-center max-[600px]:gap-y-3">
                  {/* Controls (edit + status) — right on desktop, top on mobile */}
                  <div className="flex items-center gap-2 shrink-0 order-last max-[600px]:order-first max-[600px]:basis-full max-[600px]:justify-center">
                    <button
                      onClick={() => {
                        targetEventRef.current = event;
                        setEditImage(null);
                        setEditTitle("");
                        setEditVenueId("");
                        setActiveModal("editMatch");
                      }}
                      className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                      title="Edit match"
                    >
                      <Pencil size={14} />
                    </button>
                    <StatusDropdown
                      status={event.status}
                      onChange={(s) => handleStatusChange(event, s)}
                    />
                  </div>

                  <button
                    onClick={() => toggleExpand(event)}
                    className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-[#56a963]" />
                  </div>

                  <div className="flex-1 min-w-0 max-[600px]:w-full max-[600px]:flex-none max-[600px]:text-center">
                    <div className="flex items-center gap-2 flex-wrap max-[600px]:justify-center">
                      <p className="text-sm font-bold text-white truncate">{event.matchTitle}</p>
                      <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 ${STATUS_STYLE[event.status] ?? STATUS_STYLE_FALLBACK}`}>
                        {event.status === "LIVE" && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse" />
                        )}
                        {STATUS_LABEL[event.status] ?? event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/35 mt-0.5 flex items-center gap-2 flex-wrap max-[600px]:justify-center">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-white/20" />
                        {event.venueName}, {event.venueCity}
                      </span>
                      <span className="text-white/15">·</span>
                      <span>{format(startDate, "MMM dd, yyyy · hh:mm a")}</span>
                      <span className="text-white/15 font-mono">#{event.eventIdOnchain}</span>
                    </p>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-[#0a0a0a] px-5 py-5 space-y-6">

                    {encLoading && (
                      <div className="space-y-2">
                        {[1,2].map((i) => <div key={i} className="h-10 rounded-xl bg-white/[0.02] animate-pulse" />)}
                      </div>
                    )}

                    {!encLoading && (
                      <>
                        {/* Enclosure Pricing */}
                        <div>
                          <SectionLabel>Enclosure Pricing</SectionLabel>
                          {enclosures.length === 0 ? (
                            <p className="text-xs text-white/20 italic">No enclosures found for this venue.</p>
                          ) : (
                            <div className="space-y-2">
                              {enclosures.map((enc) => (
                                <div key={enc.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 max-[500px]:flex-col max-[500px]:items-center max-[500px]:text-center">
                                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Layers size={13} className="text-white/30" />
                                  </div>
                                  <div className="flex-1 min-w-0 max-[500px]:w-full max-[500px]:flex-none">
                                    <p className="text-xs font-semibold text-white/80">{enc.name}</p>
                                    <p className="text-[10px] text-white/30 mt-0.5">
                                      {enc.soldSeats}/{enc.totalSeats} sold
                                      {enc.priceDisplay && (
                                        <span className="text-[#a5fcad] ml-2 font-medium">{enc.priceDisplay}</span>
                                      )}
                                      {!enc.priceDisplay && (
                                        <span className="text-amber-400/70 ml-2">No price set</span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="relative">
                                      <input
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        value={priceInputs[enc.id] ?? ""}
                                        onChange={(e) => setPriceInputs((p) => ({ ...p, [enc.id]: e.target.value }))}
                                        placeholder={enc.priceWei ? formatEther(BigInt(enc.priceWei)) : "0.0"}
                                        className="w-28 bg-[#1a1a1a] border border-white/8 text-white text-xs rounded-lg px-2.5 py-1.5 pr-12 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/20"
                                      />
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/25 pointer-events-none">
                                        WIRE
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleSetPricing(event, enc)}
                                      disabled={!priceInputs[enc.id]}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#002a0c] disabled:opacity-40 hover:opacity-90 transition-opacity"
                                      style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                                    >
                                      <DollarSign size={11} />
                                      {enc.priceWei ? "Update" : "Set"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Operations */}
                        <div>
                          <SectionLabel>Operations</SectionLabel>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                targetEventRef.current = event;
                                setFormWalkInEnclosureId("");
                                setWalkInRows([]); setWalkInSeatStatuses([]); setWalkInSelectedSeats([]);
                                setWalkInPhase("form");
                                setWalkInResult(null);
                                setWalkInBatchResults([]);
                                setWalkInProgress(null);
                                setShowQRFor(null);
                                fetchWalkInHistory(event.id);
                                setActiveModal("walkIn");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/70 transition-colors"
                            >
                              <QrCode size={12} /> Walk-in Ticket
                            </button>
                            <button
                              onClick={() => handleConfirmShopOrders(event)}
                              disabled={confirmingOrdersFor === event.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/70 transition-colors disabled:opacity-40"
                            >
                              {confirmingOrdersFor === event.id
                                ? <Loader2 size={12} className="animate-spin" />
                                : <ShoppingCart size={12} />
                              }
                              Confirm Shop Orders
                            </button>
                            {enclosures.length > 0 && (
                              <button
                                onClick={() => {
                                  targetEventRef.current = event;
                                  setFormForceEnclosureId("");
                                  setActiveModal("forceRefund");
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors"
                              >
                                <AlertTriangle size={12} /> Force Refund Enclosure
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────────── */}

      {/* Edit Match */}
      {activeModal === "editMatch" && (
        <Modal
          title={`Edit — ${targetEventRef.current?.matchTitle}`}
          onClose={() => { setActiveModal(null); setEditImage(null); }}
        >
          {/* Current image preview */}
          {targetEventRef.current?.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/8 h-32 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={targetEventRef.current.imageUrl}
                alt="Current banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Image upload */}
          <div>
            <SectionLabel>
              {targetEventRef.current?.imageUrl ? "Replace Banner Image" : "Add Banner Image"}
            </SectionLabel>
            {editImage ? (
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2.5">
                <Upload size={13} className="text-[#56a963] shrink-0" />
                <span className="text-xs text-white/70 flex-1 truncate">{editImage.name}</span>
                <button
                  onClick={() => setEditImage(null)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-[#1a1a1a] border border-dashed border-white/10 rounded-lg px-3 py-3 cursor-pointer hover:border-white/20 transition-colors group">
                <Upload size={14} className="text-white/25 group-hover:text-white/40 transition-colors" />
                <span className="text-sm text-white/25 group-hover:text-white/40 transition-colors">
                  Click to upload image…
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setEditImage(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {/* Match title (on-chain) */}
          <div>
            <SectionLabel>Match Title</SectionLabel>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={targetEventRef.current?.matchTitle ?? ""}
              className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40 placeholder:text-white/15"
            />
          </div>

          {/* Venue (on-chain) */}
          <div>
            <SectionLabel>Venue</SectionLabel>
            <select
              value={editVenueId}
              onChange={(e) => setEditVenueId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40"
            >
              <option value="">— keep current ({targetEventRef.current?.venueName}) —</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}, {v.city}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveMatchDetails}
            disabled={!editTitle.trim() && !editVenueId}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
          >
            Save Match Details (On-Chain)
          </button>

          <div className="border-t border-white/5 pt-4">
            <SectionLabel>Banner Image</SectionLabel>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => { setActiveModal(null); setEditImage(null); }}
              className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editImage || editImageSaving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            >
              {editImageSaving ? "Saving…" : "Save Image"}
            </button>
          </div>
        </Modal>
      )}

      {/* Create Match */}
      {activeModal === "createMatch" && (
        <Modal title="Create Match" onClose={() => setActiveModal(null)} maxWidth="max-w-lg">
          <div>
            <SectionLabel>Venue <span className="text-red-400">*</span></SectionLabel>
            <select
              value={formVenueId}
              onChange={(e) => setFormVenueId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40"
            >
              <option value="">Select a venue…</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}, {v.city}</option>
              ))}
            </select>
          </div>
          <FieldInput label="Match Title" value={formTitle} onChange={setFormTitle} placeholder="e.g. Pakistan vs India — 1st Test" required />
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <FieldInput label="Start Time" value={formStartTime} onChange={setFormStartTime} type="datetime-local" required />
            <FieldInput label="End Time" value={formEndTime} onChange={setFormEndTime} type="datetime-local" required />
          </div>

          {/* Banner image */}
          <div>
            <SectionLabel>Banner Image <span className="text-white/25">(optional)</span></SectionLabel>
            {formImage ? (
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2.5">
                <Upload size={13} className="text-[#56a963] shrink-0" />
                <span className="text-xs text-white/70 flex-1 truncate">{formImage.name}</span>
                <button
                  onClick={() => setFormImage(null)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-[#1a1a1a] border border-dashed border-white/10 rounded-lg px-3 py-3 cursor-pointer hover:border-white/20 transition-colors group">
                <Upload size={14} className="text-white/25 group-hover:text-white/40 transition-colors" />
                <span className="text-sm text-white/25 group-hover:text-white/40 transition-colors">Click to upload banner image…</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFormImage(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div className="pt-2 flex gap-2 max-[500px]:flex-col-reverse">
            <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreateMatch}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
              style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            >
              Create Match
            </button>
          </div>
        </Modal>
      )}

      {/* Postpone */}
      {activeModal === "postpone" && (
        <Modal title={`Postpone — ${targetEventRef.current?.matchTitle}`} onClose={() => setActiveModal(null)}>
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-400/80">This will set status to <span className="font-semibold text-amber-400">Postponed</span> and update match times on-chain.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <FieldInput label="New Start Time" value={formNewStart} onChange={setFormNewStart} type="datetime-local" required />
            <FieldInput label="New End Time" value={formNewEnd} onChange={setFormNewEnd} type="datetime-local" required />
          </div>
          <div className="pt-2 flex gap-2 max-[500px]:flex-col-reverse">
            <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
              Cancel
            </button>
            <button
              onClick={handlePostpone}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
            >
              Confirm Postpone
            </button>
          </div>
        </Modal>
      )}

      {/* Cancel Confirm */}
      {activeModal === "cancelConfirm" && (
        <Modal title="Cancel Match" onClose={() => setActiveModal(null)}>
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-4 space-y-1">
            <p className="text-sm font-semibold text-red-400">This action cannot be undone.</p>
            <p className="text-xs text-white/50">
              Cancelling <span className="text-white/70 font-medium">{targetEventRef.current?.matchTitle}</span> will trigger on-chain refunds for all ticket holders.
            </p>
          </div>
          <div className="pt-2 flex gap-2">
            <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
              Keep Match
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors"
            >
              Cancel Match
            </button>
          </div>
        </Modal>
      )}

      {/* Walk-in Ticket */}
      {activeModal === "walkIn" && (
        <Modal
          title={walkInPhase === "success" ? "Walk-in Ticket Minted ✓" : walkInPhase === "minting" ? "Minting Walk-in Tickets…" : `Walk-in Ticket — ${targetEventRef.current?.matchTitle}`}
          onClose={() => { setActiveModal(null); setFormWalkInEnclosureId(""); setWalkInRows([]); setWalkInSeatStatuses([]); setWalkInSelectedSeats([]); setWalkInPhase("form"); setWalkInResult(null); setWalkInBatchResults([]); setWalkInProgress(null); setShowQRFor(null); }}
          maxWidth="max-w-3xl"
        >
          {walkInPhase === "minting" && walkInProgress ? (
            /* ── Batch Minting Progress Phase ── */
            <div className="flex flex-col items-center gap-5 py-8">
              <Loader2 size={28} className="animate-spin text-[#56a963]" />
              <p className="text-sm text-white/70">
                Minting ticket {walkInProgress.current} of {walkInProgress.total}…
              </p>
              <p className="text-xs text-white/30">Please sign the transaction in your wallet.</p>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#56a963] transition-all duration-300"
                  style={{ width: `${(walkInProgress.current / walkInProgress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : walkInPhase === "success" && walkInResult ? (
            /* ── Success Phase ── */
            <div className="flex flex-col gap-4 py-2">
              {/* Header */}
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#56a963]" />
                <span className="text-sm text-white/70 font-semibold">
                  {walkInBatchResults.length} Walk-in Ticket{walkInBatchResults.length !== 1 ? "s" : ""} Minted
                </span>
              </div>

              {/* QR Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
                {walkInBatchResults.map((r) => (
                  <div key={r.tokenId} className="flex flex-col items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <div id={`walkin-qr-batch-${r.tokenId}`} className="bg-white rounded-xl p-2 flex flex-col items-center gap-1">
                      <QRCodeSVG
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?ids=${r.tokenId}&walkin=true&code=${r.entryCode}`}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#0a0a0a"
                        level="M"
                      />
                      <p className="text-[#0a0a0a] text-[9px] font-mono">#{String(r.tokenId).padStart(4, "0")}</p>
                    </div>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/verify?ids=${r.tokenId}&walkin=true&code=${r.entryCode}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 border border-white/10 rounded-md px-2 py-0.5 transition-colors"
                    >
                      <Copy size={9} /> Copy Link
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => printAllWalkInQRs(walkInBatchResults)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Printer size={14} />
                  Print All
                </button>
                <button
                  onClick={() => { setWalkInSelectedSeats([]); setWalkInPhase("form"); setWalkInResult(null); setWalkInBatchResults([]); setShowQRFor(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors"
                >
                  Mint Another
                </button>
                <button
                  onClick={() => { setActiveModal(null); setFormWalkInEnclosureId(""); setWalkInRows([]); setWalkInSeatStatuses([]); setWalkInSelectedSeats([]); setWalkInPhase("form"); setWalkInResult(null); setWalkInBatchResults([]); setShowQRFor(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ── Form Phase ── */
            <>
              <div>
                <SectionLabel>Enclosure <span className="text-red-400">*</span></SectionLabel>
                <select
                  value={formWalkInEnclosureId}
                  onChange={(e) => setFormWalkInEnclosureId(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40"
                >
                  <option value="">Select enclosure…</option>
                  {(enclosuresByEvent[targetEventRef.current?.id ?? ""] ?? []).map((enc) => (
                    <option key={enc.id} value={enc.id}>{enc.name}</option>
                  ))}
                </select>
              </div>

              {/* Seat map */}
              {formWalkInEnclosureId && (
                walkInSeatLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-white/30">
                    <Loader2 size={16} className="animate-spin" />
                    Loading seats…
                  </div>
                ) : walkInRows.length > 0 ? (
                  <SeatMap
                    enclosureName={(enclosuresByEvent[targetEventRef.current?.id ?? ""] ?? []).find((e) => e.id === formWalkInEnclosureId)?.name ?? ""}
                    rows={walkInRows}
                    seatStatuses={walkInSeatStatuses}
                    selectedSeats={walkInSelectedSeats}
                    onToggleSeat={(row, seat) => {
                      setWalkInSelectedSeats((prev) => {
                        const exists = prev.some((s) => s.row === row && s.seat === seat);
                        if (exists) return prev.filter((s) => !(s.row === row && s.seat === seat));
                        // Compute contract seat (1-based index) at selection time while walkInRows is current
                        const rowDef = walkInRows.find((r) => r.row_label === row);
                        let contractSeat = seat;
                        if (rowDef?.seat_numbers && rowDef.seat_numbers.length > 0) {
                          const idx = rowDef.seat_numbers.indexOf(seat);
                          if (idx !== -1) contractSeat = idx + 1;
                        }
                        return [...prev, { row, seat, contractSeat }];
                      });
                    }}
                    bulkSelect={true}
                  />
                ) : (
                  <p className="text-xs text-white/25 text-center py-4">No rows configured for this enclosure.</p>
                )
              )}

              {walkInSelectedSeats.length > 0 && (
                <p className="text-xs text-[#56a963]">
                  {walkInSelectedSeats.length} seat{walkInSelectedSeats.length !== 1 ? "s" : ""} selected
                </p>
              )}

              <div className="pt-2 flex gap-2 max-[400px]:flex-col-reverse">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleWalkIn}
                  disabled={walkInSelectedSeats.length === 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#002a0c] hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                >
                  Mint {walkInSelectedSeats.length > 1 ? `${walkInSelectedSeats.length} Tickets` : "Walk-in"}
                </button>
              </div>

              {/* ── Walk-in History ── */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <History size={13} className="text-white/30" />
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[1px]">Walk-in History</span>
                  {walkInHistoryLoading && <Loader2 size={11} className="text-white/20 animate-spin" />}
                </div>

                {walkInHistory.length === 0 && !walkInHistoryLoading ? (
                  <p className="text-xs text-white/20 text-center py-3">No walk-in tickets minted yet.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                    {walkInHistory.map((t) => (
                      <div key={t.tokenId} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 max-[400px]:flex-col max-[400px]:items-center max-[400px]:text-center max-[400px]:gap-2">
                        <div className="flex items-center gap-2 min-w-0 max-[400px]:justify-center">
                          <span className="text-[10px] font-mono text-white/40">#{String(t.tokenId).padStart(4,"0")}</span>
                          <span className="text-xs text-white/60">Row {t.rowLabel}, Seat {t.seatNumber}</span>
                        </div>
                        <div className="shrink-0">
                          {showQRFor?.tokenId === t.tokenId ? (
                            <div className="flex flex-col items-end gap-2">
                              <button onClick={() => setShowQRFor(null)} className="text-[10px] text-white/30 hover:text-white/60">Hide</button>
                              <div id={`walkin-qr-history-${t.tokenId}`} className="bg-white rounded-xl p-2">
                                <QRCodeSVG
                                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?ids=${t.tokenId}&walkin=true&code=${showQRFor.code}`}
                                  size={130}
                                  bgColor="#ffffff"
                                  fgColor="#0a0a0a"
                                  level="M"
                                />
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => printAllWalkInQRs([{ tokenId: t.tokenId, entryCode: showQRFor!.code }], "walkin-qr-history")}
                                  className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 border border-white/10 rounded-md px-2 py-1"
                                >
                                  <Printer size={10} /> Print
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/verify?ids=${t.tokenId}&walkin=true&code=${showQRFor.code}`);
                                    toast.success("Link copied!");
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 border border-white/10 rounded-md px-2 py-1"
                                >
                                  <Copy size={10} /> Copy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleShowQRForHistory(t.tokenId)}
                              disabled={fetchingQRFor === t.tokenId}
                              className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 border border-white/10 rounded-md px-2 py-1 transition-colors disabled:opacity-40"
                            >
                              {fetchingQRFor === t.tokenId ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <QrCode size={10} />
                              )}
                              Show QR
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Force Refund Enclosure */}
      {activeModal === "forceRefund" && (
        <Modal title={`Force Refund — ${targetEventRef.current?.matchTitle}`} onClose={() => setActiveModal(null)}>
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
            <p className="text-xs text-red-400/80">All ticket holders in the selected enclosure will be refunded. <span className="font-semibold text-red-400">This cannot be undone.</span></p>
          </div>
          <div>
            <SectionLabel>Enclosure <span className="text-red-400">*</span></SectionLabel>
            <select
              value={formForceEnclosureId}
              onChange={(e) => setFormForceEnclosureId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/8 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#56a963]/40"
            >
              <option value="">Select enclosure…</option>
              {(enclosuresByEvent[targetEventRef.current?.id ?? ""] ?? []).map((enc) => (
                <option key={enc.id} value={enc.id}>{enc.name} — {enc.soldSeats} tickets sold</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex gap-2 max-[500px]:flex-col-reverse">
            <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 border border-white/8 hover:text-white/70 transition-colors">
              Cancel
            </button>
            {formForceEnclosureId && !(enclosuresByEvent[targetEventRef.current?.id ?? ""]?.find(e => e.id === formForceEnclosureId)?.refundInitiated) ? (
              <button
                onClick={handleInitiateEnclosureRefund}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
              >
                Step 1: Initiate Refund
              </button>
            ) : (
              <button
                onClick={handleProcessEnclosureBatches}
                disabled={!formForceEnclosureId}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors disabled:opacity-40"
              >
                Step 2: Process Batches
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Shared Transaction Progress Modal */}
      <TransactionProgressModal
        open={txModal.open}
        onClose={() => {
          setTxModal((p) => ({ ...p, open: false }));
          activeTx.reset();
        }}
        step={activeTx.step}
        txHash={activeTx.txHash}
        errorMessage={activeTx.errorMessage}
        successTitle={txModal.successTitle}
        successDescription={txModalDesc}
      />
    </div>
  );
}
