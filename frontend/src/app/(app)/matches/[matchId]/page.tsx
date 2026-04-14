"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { decodeEventLog } from "viem";
import { formatWire } from "@/lib/utils/formatWire";
import { useAccount, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { STATUS_LABEL, STATUS_STYLE, STATUS_STYLE_FALLBACK } from "@/lib/eventStatus";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";
import { useTicketPurchase } from "@/hooks/domain";

import {
  StadiumMap,
  type Enclosure,
} from "@/components/stadium/StadiumMap";
import {
  SeatMap,
  SeatMapPlaceholder,
  type SeatStatus,
} from "@/components/stadium/SeatMap";
import { HoldTimer } from "@/components/stadium/HoldTimer";
import {
  SelectionSummary,
  type SelectedSeat,
} from "@/components/stadium/SelectionSummary";
import { ConfirmPurchaseModal } from "@/components/stadium/ConfirmPurchaseModal";
import { SwitchEnclosureModal } from "@/components/stadium/SwitchEnclosureModal";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";

const MAX_SEATS = 10;

/* ── types ── */
interface EventData {
  id: string;
  event_id_onchain: number;
  match_title: string;
  image_url: string | null;
  status: string;
  start_time: string;
  end_time: string;
  venue_id: string;
  venues: { name: string; city: string } | null;
}

interface PricingRow {
  enclosure_id: string;
  price_wei: string;
  price_display: string | null;
}

interface TicketRow {
  enclosure_id: string;
  row_label: string;
  seat_number: number;
  owner_address: string;
}

interface HoldRow {
  enclosure_id: string;
  row_label: string;
  seat_number: number;
  wallet_address: string;
  expires_at: string;
}


/* ============================================================
   MATCH DETAIL PAGE
   ============================================================ */
export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { openConnectModal } = useConnectModal();

  // ── data state ──
  const [event, setEvent] = useState<EventData | null>(null);
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [holds, setHolds] = useState<HoldRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ── selection state ──
  const [selectedEnclosureId, setSelectedEnclosureId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [bulkSelect, setBulkSelect] = useState(false);

  // ── modal state ──
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [pendingSwitchEnclosure, setPendingSwitchEnclosure] = useState<Enclosure | null>(null);

  // ── contract write (domain hook) ──
  const { purchaseSingle, purchaseMultiple, step: txStep, txHash, errorMessage, reset: resetTx } = useTicketPurchase({
    onSuccess: () => {
      setSelectedSeats([]);
      fetchSeats();
    },
  });

  /* ── Fetch event + enclosures + pricing ── */
  useEffect(() => {
    if (!matchId) return;

    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("id, event_id_onchain, match_title, image_url, status, start_time, end_time, venue_id, venues(name, city)")
        .eq("id", matchId)
        .single();

      if (error || !data) {
        console.error("Error fetching event:", error);
        setLoading(false);
        return;
      }

      const eventData = {
        ...data,
        venues: Array.isArray(data.venues) ? data.venues[0] : data.venues,
      } as EventData;
      setEvent(eventData);

      // Fetch enclosures for this venue
      const { data: encData } = await supabase
        .from("enclosures")
        .select("id, enclosure_id_onchain, name, category, color, svg_path_id, total_seats, is_active, enclosure_rows(row_label, seat_count, seat_numbers)")
        .eq("venue_id", eventData.venue_id)
        .order("enclosure_id_onchain");

      setEnclosures((encData as Enclosure[]) || []);

      // Fetch pricing
      const { data: priceData } = await supabase
        .from("event_pricing")
        .select("enclosure_id, price_wei, price_display")
        .eq("event_id", matchId);

      setPricing(priceData || []);
      setLoading(false);
    }

    fetchEvent();
  }, [matchId]);

  /* ── Fetch seats (tickets + holds) ── */
  const fetchSeats = useCallback(async () => {
    if (!matchId) return;

    const [ticketsRes, holdsRes] = await Promise.all([
      supabase
        .from("tickets")
        .select("enclosure_id, row_label, seat_number, owner_address")
        .eq("event_id", matchId)
        .eq("is_returned", false),
      supabase
        .from("seat_holds")
        .select("enclosure_id, row_label, seat_number, wallet_address, expires_at")
        .eq("event_id", matchId)
        .gt("expires_at", new Date().toISOString()),
    ]);

    setTickets(ticketsRes.data || []);
    setHolds(holdsRes.data || []);
  }, [matchId]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  /* ── Realtime subscriptions ── */
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seat_holds", filter: `event_id=eq.${matchId}` },
        () => fetchSeats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `event_id=eq.${matchId}` },
        () => fetchSeats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchSeats]);

  /* ── Derived data ── */
  const priceMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of pricing) {
      map[p.enclosure_id] =
        p.price_display || formatWire(BigInt(p.price_wei));
    }
    return map;
  }, [pricing]);

  const priceWeiMap = useMemo(() => {
    const map: Record<string, bigint> = {};
    for (const p of pricing) {
      map[p.enclosure_id] = BigInt(p.price_wei);
    }
    return map;
  }, [pricing]);

  const seatAvailability = useMemo(() => {
    const map: Record<string, { total: number; booked: number }> = {};
    for (const enc of enclosures) {
      const total = enc.enclosure_rows.reduce((sum, r) => {
        if (r.seat_numbers && r.seat_numbers.length > 0) {
          return sum + r.seat_numbers.length;
        }
        return sum + r.seat_count;
      }, 0);
      const booked = tickets.filter((t) => t.enclosure_id === enc.id).length;
      map[enc.id] = { total, booked };
    }
    return map;
  }, [enclosures, tickets]);

  // Seat statuses for the selected enclosure
  const seatStatuses = useMemo((): SeatStatus[] => {
    if (!selectedEnclosureId) return [];
    const statuses: SeatStatus[] = [];
    const lowerAddr = address?.toLowerCase();

    for (const t of tickets) {
      if (t.enclosure_id !== selectedEnclosureId) continue;
      const isYours = t.owner_address.toLowerCase() === lowerAddr;
      statuses.push({
        row: t.row_label.trim(),
        seat: t.seat_number,
        state: isYours ? "yours" : "booked",
      });
    }

    for (const h of holds) {
      if (h.enclosure_id !== selectedEnclosureId) continue;
      const isYours = h.wallet_address.toLowerCase() === lowerAddr;
      if (isYours) continue;
      statuses.push({
        row: h.row_label.trim(),
        seat: h.seat_number,
        state: "held",
      });
    }

    return statuses;
  }, [selectedEnclosureId, tickets, holds, address]);

  const selectedEnclosure = enclosures.find((e) => e.id === selectedEnclosureId);

  const holdExpiry = useMemo(() => {
    if (selectedSeats.length === 0) return null;
    const myHolds = holds.filter(
      (h) =>
        h.wallet_address.toLowerCase() === address?.toLowerCase() &&
        h.enclosure_id === selectedEnclosureId
    );
    if (myHolds.length === 0) {
      return new Date(Date.now() + 10 * 60 * 1000);
    }
    const earliest = myHolds.reduce((a, b) =>
      new Date(a.expires_at) < new Date(b.expires_at) ? a : b
    );
    return new Date(earliest.expires_at);
  }, [holds, selectedSeats, address, selectedEnclosureId]);

  /* ── Handlers ── */
  const handleSelectEnclosure = useCallback(
    (enc: Enclosure) => {
      if (selectedEnclosureId === enc.id) return;

      if (selectedSeats.length > 0 && selectedEnclosureId !== enc.id) {
        // Open the switch-enclosure modal instead of window.confirm
        setPendingSwitchEnclosure(enc);
        return;
      }

      setSelectedEnclosureId(enc.id);
    },
    [selectedEnclosureId, selectedSeats]
  );

  const handleSwitchEnclosureConfirm = useCallback(async () => {
    if (!pendingSwitchEnclosure) return;

    if (address) {
      await supabase
        .from("seat_holds")
        .delete()
        .eq("event_id", matchId)
        .eq("enclosure_id", selectedEnclosureId!)
        .eq("wallet_address", address);
    }

    setSelectedSeats([]);
    setSelectedEnclosureId(pendingSwitchEnclosure.id);
    setPendingSwitchEnclosure(null);
  }, [pendingSwitchEnclosure, address, matchId, selectedEnclosureId]);

  const handleSwitchEnclosureCancel = useCallback(() => {
    setPendingSwitchEnclosure(null);
  }, []);

  const handleToggleSeat = useCallback(
    async (row: string, seatNum: number) => {
      if (!address || !isConnected) {
        openConnectModal?.();
        return;
      }
      if (!selectedEnclosureId) return;

      const existing = selectedSeats.find(
        (s) => s.row === row && s.seat === seatNum
      );

      if (existing) {
        // Deselect — remove hold
        await supabase
          .from("seat_holds")
          .delete()
          .eq("event_id", matchId)
          .eq("enclosure_id", selectedEnclosureId)
          .eq("row_label", row)
          .eq("seat_number", seatNum)
          .eq("wallet_address", address);

        setSelectedSeats((prev) =>
          prev.filter((s) => !(s.row === row && s.seat === seatNum))
        );
      } else {
        // Enforce max seats limit
        if (bulkSelect && selectedSeats.length >= MAX_SEATS) {
          toast.error(`Maximum ${MAX_SEATS} seats can be selected at once.`);
          return;
        }

        // Select — insert hold
        const { error } = await supabase.from("seat_holds").insert({
          event_id: matchId,
          enclosure_id: selectedEnclosureId,
          row_label: row,
          seat_number: seatNum,
          wallet_address: address,
        });

        if (error) {
          if (error.code === "23505") {
            toast.error("That seat was just taken — please select another.");
          } else {
            toast.error(`Failed to hold seat: ${error.message} (${error.code})`);
            console.error("Hold error:", error);
          }
          fetchSeats();
          return;
        }

        if (bulkSelect) {
          setSelectedSeats((prev) => [...prev, { row, seat: seatNum }]);
        } else {
          // Single select: release previous hold
          if (selectedSeats.length > 0) {
            const prev = selectedSeats[0];
            await supabase
              .from("seat_holds")
              .delete()
              .eq("event_id", matchId)
              .eq("enclosure_id", selectedEnclosureId)
              .eq("row_label", prev.row)
              .eq("seat_number", prev.seat)
              .eq("wallet_address", address);
          }
          setSelectedSeats([{ row, seat: seatNum }]);
        }
      }

      fetchSeats();
    },
    [address, isConnected, selectedEnclosureId, selectedSeats, bulkSelect, matchId, openConnectModal, fetchSeats]
  );

  const handleRemoveSeat = useCallback(
    async (row: string, seat: number) => {
      if (!address || !selectedEnclosureId) return;
      await supabase
        .from("seat_holds")
        .delete()
        .eq("event_id", matchId)
        .eq("enclosure_id", selectedEnclosureId)
        .eq("row_label", row)
        .eq("seat_number", seat)
        .eq("wallet_address", address);

      setSelectedSeats((prev) =>
        prev.filter((s) => !(s.row === row && s.seat === seat))
      );
      fetchSeats();
    },
    [address, selectedEnclosureId, matchId, fetchSeats]
  );

  const handleHoldExpired = useCallback(() => {
    toast.warning("Hold expired — seats released");
    setSelectedSeats([]);
    fetchSeats();
  }, [fetchSeats]);

  // Opens the confirmation modal (called from SelectionSummary "Purchase" button)
  const handlePurchaseClick = useCallback(() => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    // Gap 7: block purchase for non-purchasable statuses
    if (event && event.status !== "LIVE") {
      toast.error(`Tickets are not on sale — match status: ${STATUS_LABEL[event.status] ?? event.status}`);
      return;
    }
    // Gap 7: block purchase after match end time
    if (event && new Date(event.end_time) <= new Date()) {
      toast.error("This match has ended — ticket sales are closed.");
      return;
    }
    setShowConfirmModal(true);
  }, [isConnected, openConnectModal, event]);

  // Actually execute the on-chain purchase (called from ConfirmPurchaseModal "Confirm & Pay")
  const handleConfirmPurchase = useCallback(async () => {
    if (!event || !selectedEnclosure || selectedSeats.length === 0 || !address)
      return;

    setShowConfirmModal(false);
    setShowTxModal(true);
    resetTx();

    const encIdOnchain = selectedEnclosure.enclosure_id_onchain;
    const pricePerSeat = priceWeiMap[selectedEnclosure.id];
    if (!pricePerSeat) {
      toast.error("Pricing not set for this enclosure");
      setShowTxModal(false);
      return;
    }

    const totalValue = pricePerSeat * BigInt(selectedSeats.length);

    // Snapshot before execute — onSuccess() clears selectedSeats immediately
    const seatsSnapshot = [...selectedSeats];
    const enclosureSnapshot = selectedEnclosure;

    // The contract validates seatNumber <= rowSeatCount (1-based index).
    // seat_numbers in DB are the real display numbers (e.g. [101,102,103]).
    // Map display seat number → its 1-based position in seat_numbers array.
    const toContractSeatNumber = (row: string, displaySeat: number): bigint => {
      const rowDef = enclosureSnapshot.enclosure_rows.find((r) => r.row_label === row);
      if (rowDef?.seat_numbers && rowDef.seat_numbers.length > 0) {
        const idx = rowDef.seat_numbers.indexOf(displaySeat);
        if (idx !== -1) return BigInt(idx + 1);
      }
      // Fallback: seat numbers are already 1-based indices
      return BigInt(displaySeat);
    };

    try {
      let hash: string;

      if (seatsSnapshot.length === 1) {
        const s = seatsSnapshot[0];
        const rowBytes = `0x${Buffer.from(s.row).toString("hex")}` as `0x${string}`;
        hash = await purchaseSingle({
          eventId: BigInt(event.event_id_onchain),
          enclosureId: BigInt(encIdOnchain),
          rowLabel: rowBytes,
          seatNumber: toContractSeatNumber(s.row, s.seat),
          value: totalValue,
        });
      } else {
        const rowLabels = seatsSnapshot.map(
          (s) => `0x${Buffer.from(s.row).toString("hex")}` as `0x${string}`
        );
        const seatNumbers = seatsSnapshot.map((s) => toContractSeatNumber(s.row, s.seat));
        hash = await purchaseMultiple({
          eventId: BigInt(event.event_id_onchain),
          enclosureId: BigInt(encIdOnchain),
          rowLabels,
          seatNumbers,
          value: totalValue,
        });
      }

      // ── Sync purchased tickets to Supabase ────────────────────────
      // Parse TicketPurchased events from the receipt to get token IDs,
      // then INSERT into the tickets table and clean up holds.
      if (hash && publicClient) {
        try {
          const receipt = await publicClient.getTransactionReceipt({
            hash: hash as `0x${string}`,
          });

          // Build a map keyed by contract seat number (what the event emits)
          // e.g. "Z-1" → tokenId, because the contract stores 1-based indices
          const tokenIdMap = new Map<string, number>();
          for (const log of receipt.logs) {
            try {
              const decoded = decodeEventLog({
                abi: ticketNftAbi,
                data: log.data,
                topics: log.topics,
                eventName: "TicketPurchased",
              });
              const { tokenId, rowLabel, seatNumber } = decoded.args as unknown as {
                tokenId: bigint;
                rowLabel: `0x${string}`;
                seatNumber: bigint;
              };
              // bytes1 "0x41" → "A"
              const rowChar = String.fromCharCode(parseInt(rowLabel.slice(2), 16));
              // Key by contract seat number (the index we sent, not the display number)
              tokenIdMap.set(`${rowChar}-${Number(seatNumber)}`, Number(tokenId));
            } catch {
              // Not a TicketPurchased log — skip
            }
          }

          // Upsert one row per purchased seat.
          // Look up tokenId using the contract seat index, but store the display seat number.
          // Upsert on token_id so if the indexer already wrote the row (with seat=index),
          // we overwrite it with the correct display seat_number.
          const ticketRows = seatsSnapshot.map((s) => {
            const contractSeat = Number(toContractSeatNumber(s.row, s.seat));
            return {
              token_id: tokenIdMap.get(`${s.row}-${contractSeat}`) ?? 0,
              event_id: event.id,
              venue_id: event.venue_id,
              enclosure_id: enclosureSnapshot.id,
              row_label: s.row,
              seat_number: s.seat,
              owner_address: address.toLowerCase(),
              purchase_price_wei: pricePerSeat.toString(),
              tx_hash: hash,
            };
          });

          const { error: insertError } = await supabase
            .from("tickets")
            .upsert(ticketRows, { onConflict: "token_id" });

          if (insertError) {
            console.error("Failed to write tickets to DB:", insertError);
          }

          // Remove holds for the seats we just purchased
          for (const s of seatsSnapshot) {
            await supabase
              .from("seat_holds")
              .delete()
              .eq("event_id", event.id)
              .eq("enclosure_id", enclosureSnapshot.id)
              .eq("row_label", s.row)
              .eq("seat_number", s.seat);
          }

          // Final refresh so UI reflects the new tickets
          fetchSeats();
        } catch (syncErr) {
          console.error("Error syncing tickets to DB:", syncErr);
          fetchSeats();
        }
      }
    } catch {
      // Error state handled by TransactionProgressModal
      fetchSeats();
    }
  }, [event, selectedEnclosure, selectedSeats, address, priceWeiMap, purchaseSingle, purchaseMultiple, fetchSeats, resetTx, publicClient]);

  const handleTxModalClose = useCallback(() => {
    setShowTxModal(false);
    resetTx();
  }, [resetTx]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  /* ── Not found ── */
  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-xl font-bold text-white/70">Match not found</h1>
        <Link href="/matches" className="text-[#56a963] text-sm mt-2 inline-block hover:underline">
          &larr; Back to Matches
        </Link>
      </div>
    );
  }

  const date = new Date(event.start_time);

  /* ── Render ── */
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      {/* Back */}
      <Link
        href="/matches"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Matches
      </Link>

      {/* Match Image */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.match_title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#56a963]/20 to-[#56a963]/5" />
        )}
        <Badge
          className={`absolute top-4 left-4 text-xs font-medium border-0 ${STATUS_STYLE[event.status] ?? STATUS_STYLE_FALLBACK}`}
        >
          {event.status === "LIVE" && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
          )}
          {STATUS_LABEL[event.status] ?? event.status}
        </Badge>
      </div>

      {/* Title */}
      <h1 className="text-[1.1rem] min-[400px]:text-2xl sm:text-3xl font-bold font-heading">
        {event.match_title}
      </h1>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoBox
          icon={<Building2 size={16} />}
          label="Venue"
          value={event.venues?.name || "—"}
        />
        <InfoBox
          icon={<MapPin size={16} />}
          label="City"
          value={event.venues?.city || "—"}
        />
        <InfoBox
          icon={<Calendar size={16} />}
          label="Date"
          value={format(date, "MMM dd, yyyy")}
        />
        <InfoBox
          icon={<Clock size={16} />}
          label="Time"
          value={format(date, "hh:mm a")}
        />
      </div>

      {/* Shop Banner */}
      <Link
        href={`/matches/${matchId}/shop`}
        className="flex min-[420px]:items-center flex-col min-[420px]:flex-row items-center min-[420px]:items-start gap-3 min-[420px]:gap-4 rounded-xl border border-[#56a963]/20 bg-[#56a963]/[0.06] px-5 py-4 hover:border-[#56a963]/40 hover:bg-[#56a963]/[0.10] transition-all group"
      >
        <div className="w-9 h-9 rounded-lg bg-[#56a963]/15 flex items-center justify-center shrink-0">
          <ShoppingBag size={18} className="text-[#56a963]" />
        </div>
        <div className="flex-1 min-w-0 text-center min-[420px]:text-left">
          <p className="text-sm font-semibold text-white leading-tight">
            Pre-order food &amp; merch
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            Browse stadium shops and collect on match day
          </p>
        </div>
        <span className="text-sm text-[#56a963] font-medium min-[420px]:shrink-0 group-hover:translate-x-0.5 transition-transform">
          Browse Shop →
        </span>
      </Link>

      {/* Stadium Map */}
      <StadiumMap
        enclosures={enclosures}
        selectedEnclosureId={selectedEnclosureId}
        onSelectEnclosure={handleSelectEnclosure}
        seatAvailability={seatAvailability}
        priceMap={priceMap}
        disabled={event.status === "COMPLETED" || event.status === "CANCELLED"}
      />

      {/* Seat Map */}
      {selectedEnclosure ? (
        selectedEnclosure.is_active === false ? (
          /* ── Inactive enclosure — no seats to show ── */
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center space-y-2">
            <p className="text-lg font-semibold text-white/70">{selectedEnclosure.name}</p>
            <p className="text-sm text-white/40">
              This enclosure is not yet available for booking.
            </p>
            <p className="text-xs text-white/25 mt-1">No seats available</p>
          </div>
        ) : (
          <>
            {/* Bulk select toggle + Hold timer */}
            <div className="flex min-[430px]:items-center min-[430px]:flex-row flex-col items-center gap-2 min-[430px]:justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[0.7rem] min-[330px]:text-sm [&_svg]:scale-[0.7] min-[330px]:[&_svg]:scale-100">
              <button
                type="button"
                onClick={() => setBulkSelect((v) => !v)}
                className={`flex items-center gap-2.5 font-medium transition-colors ${
                  bulkSelect
                    ? "text-[#56a963]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {bulkSelect ? (
                  <ToggleRight size={24} className="text-[#56a963]" />
                ) : (
                  <ToggleLeft size={24} className="text-white/40" />
                )}
                <span>
                  {bulkSelect ? "Multi-Select ON" : "Multi-Select OFF"}
                </span>
                {selectedSeats.length > 0 && (
                  <span className="inline-flex items-center justify-center bg-[#56a963] text-white font-bold rounded-full w-5 h-5 min-[330px]:w-6 min-[330px]:h-6">
                    {selectedSeats.length}
                  </span>
                )}
                {bulkSelect && (
                  <span className="text-white/30 ml-1">
                    (max {MAX_SEATS})
                  </span>
                )}
              </button>

              {holdExpiry && selectedSeats.length > 0 && (
                <div className="flex items-center gap-2 text-white/50">
                  <span>Held for</span>
                  <HoldTimer expiresAt={holdExpiry} onExpired={handleHoldExpired} />
                </div>
              )}
            </div>

            <SeatMap
              enclosureName={selectedEnclosure.name}
              rows={selectedEnclosure.enclosure_rows}
              seatStatuses={seatStatuses}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              bulkSelect={bulkSelect}
            />
          </>
        )
      ) : (
        <SeatMapPlaceholder />
      )}

      {/* Selection Summary — NOT sticky */}
      {selectedEnclosure && selectedSeats.length > 0 && (
        <div>
          <SelectionSummary
            seats={selectedSeats}
            priceWei={priceWeiMap[selectedEnclosure.id] || 0n}
            priceDisplay={priceMap[selectedEnclosure.id] || "—"}
            onRemoveSeat={handleRemoveSeat}
            onPurchase={handlePurchaseClick}
            isPurchasing={txStep === "confirming" || txStep === "pending"}
            isConnected={isConnected}
            onConnect={() => openConnectModal?.()}
          />
        </div>
      )}

      {/* Switch Enclosure Modal */}
      {pendingSwitchEnclosure && selectedEnclosure && (
        <SwitchEnclosureModal
          open={!!pendingSwitchEnclosure}
          onClose={handleSwitchEnclosureCancel}
          onConfirm={handleSwitchEnclosureConfirm}
          fromName={selectedEnclosure.name}
          toName={pendingSwitchEnclosure.name}
          seatCount={selectedSeats.length}
        />
      )}

      {/* Confirm Purchase Modal */}
      {selectedEnclosure && (
        <ConfirmPurchaseModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPurchase}
          matchTitle={event.match_title}
          enclosureName={selectedEnclosure.name}
          seats={selectedSeats}
          priceWei={priceWeiMap[selectedEnclosure.id] || 0n}
          priceDisplay={priceMap[selectedEnclosure.id] || "—"}
          walletAddress={address}
        />
      )}

      {/* Transaction Progress Modal */}
      <TransactionProgressModal
        open={showTxModal}
        onClose={handleTxModalClose}
        step={txStep}
        txHash={txHash}
        errorMessage={errorMessage}
        successActions={
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/tickets"
                onClick={handleTxModalClose}
                className="flex items-center justify-center py-3 rounded-xl bg-[#56a963] text-[#002a0c] font-bold text-sm"
              >
                View My Tickets
              </Link>
              <button
                onClick={() => { setShowTxModal(false); resetTx(); }}
                className="py-3 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-colors"
              >
                Buy More
              </button>
            </div>
            <Link
              href={`/matches/${matchId}/shop`}
              onClick={handleTxModalClose}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#56a963]/25 bg-[#56a963]/[0.07] text-[#56a963] font-medium text-sm hover:bg-[#56a963]/[0.12] transition-colors"
            >
              <ShoppingBag size={15} />
              Pre-order food &amp; merch for this match
            </Link>
          </div>
        }
      />
    </div>
  );
}

/* ── Small helper component ── */
function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium text-white truncate">{value}</p>
    </div>
  );
}
