"use client";

import { MapPin, Calendar, Clock, QrCode } from "lucide-react";
import { format } from "date-fns";

export interface TicketCardProps {
  tokenId: number;
  matchTitle: string;
  venueName: string;
  venueCity: string;
  startTime: string;
  enclosureName: string;
  rowLabel: string;
  seatNumber: number;
  isReturned: boolean;
  isForceRefunded?: boolean;
  isEntered: boolean;
  delegateAddress: string | null;
  ownerAddress: string;
  walletAddress: string;
  eventStatus: string;
  returnDisabled?: boolean;
  onShowQR: () => void;
  onManageDelegate: () => void;
  onReturnTicket: () => void;
}

export function TicketCard({
  tokenId,
  matchTitle,
  venueName,
  venueCity,
  startTime,
  enclosureName,
  rowLabel,
  seatNumber,
  isReturned,
  isForceRefunded = false,
  isEntered,
  delegateAddress,
  ownerAddress,
  walletAddress,
  eventStatus,
  returnDisabled,
  onShowQR,
  onManageDelegate,
  onReturnTicket,
}: TicketCardProps) {
  const date = new Date(startTime);
  const isEventOver = eventStatus === "COMPLETED" || eventStatus === "CANCELLED";
  const isExpiredCard = isReturned || isForceRefunded || isEventOver;
  const isDelegated =
    delegateAddress != null &&
    delegateAddress.toLowerCase() !== "0x0000000000000000000000000000000000000000" &&
    delegateAddress.toLowerCase() !== ownerAddress.toLowerCase();
  const isDelegate = walletAddress.toLowerCase() !== ownerAddress.toLowerCase();

  return (
    <div
      className={`
        relative rounded-xl border overflow-hidden flex flex-col
        backdrop-blur-sm
        ${isExpiredCard
          ? "border-white/5 bg-[rgba(20,20,20,0.5)]"
          : "border-[rgba(165,252,173,0.06)] bg-[rgba(25,25,25,0.6)]"}
      `}
    >
      {/* Top glow bar */}
      <div
        className={`h-2 w-full shrink-0 ${
          isExpiredCard
            ? "bg-white/10"
            : "bg-[#a5fcad] shadow-[0_0_15px_rgba(165,252,173,0.3)]"
        }`}
      />

      {/* Body */}
      <div className="flex flex-col flex-1 p-6 gap-0">
        {/* Top row: token ID + status badges */}
        <div className="flex items-start justify-between mb-6">
          {/* Token ID pill */}
          <div
            className={`
              px-3 py-1 rounded-full border text-[10px] font-bold tracking-[1px]
              ${isExpiredCard
                ? "bg-white/5 border-white/10 text-white/40"
                : "bg-[#262626] border-[rgba(165,252,173,0.2)] text-[#a5fcad]"}
            `}
          >
            #{String(tokenId).padStart(4, "0")}
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2">
            {isForceRefunded ? (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-blue-500/20 text-blue-400">
                Refunded
              </span>
            ) : isReturned ? (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-red-500/20 text-red-400">
                Returned
              </span>
            ) : eventStatus === "CANCELLED" ? (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-red-500/10 text-red-400/70">
                Cancelled
              </span>
            ) : eventStatus === "COMPLETED" ? (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-white/5 text-white/30">
                Expired
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-[rgba(0,109,66,0.3)] text-[#77f5af]">
                Valid
              </span>
            )}

            {isEntered && !isReturned && (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-amber-500/20 text-amber-400">
                Entered
              </span>
            )}

            {isDelegate ? (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-[rgba(0,227,255,0.15)] text-[#86ecff]">
                Delegate
              </span>
            ) : isDelegated ? (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-[rgba(0,227,255,0.15)] text-[#86ecff]">
                Delegated
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight bg-[#1f1f1f] text-[#ababab]">
                Owner
              </span>
            )}
          </div>
        </div>

        {/* Match title */}
        <h3 className="font-heading font-bold text-[22px] leading-tight text-white mb-1">
          {matchTitle}
        </h3>

        {/* Venue */}
        <div className="flex items-center gap-2 text-[#ababab] text-sm mb-5">
          <MapPin size={12} className="shrink-0" />
          <span>
            {venueName}, {venueCity}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(72,72,72,0.1)] mb-5" />

        {/* Date & Time */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#ababab] mb-1">
            Date &amp; Time
          </p>
          <p className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar size={13} className="text-white/40" />
            {format(date, "MMM dd, yyyy")}
            <Clock size={13} className="text-white/40 ml-1" />
            {format(date, "hh:mm a")}
          </p>
        </div>

        {/* Seating info */}
        <div className="bg-[#131313] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#ababab] mb-1">
            Seating Info
          </p>
          <p
            className={`text-sm font-bold ${
              isExpiredCard ? "text-white/40" : "text-[#a5fcad]"
            }`}
          >
            Row {rowLabel}, Seat {seatNumber} &mdash; {enclosureName}
          </p>
        </div>
      </div>

      {/* ── Active ticket actions ── */}
      {!isReturned && !isForceRefunded && !isEventOver && (
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* Show QR — hidden for owner when ticket is delegated */}
          {(!isDelegated || isDelegate) && (
            <button
              onClick={onShowQR}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[rgba(165,252,173,0.4)] text-[#a5fcad] text-sm font-bold hover:bg-[rgba(165,252,173,0.05)] transition-colors"
            >
              <QrCode size={14} />
              Show QR
            </button>
          )}
          {isDelegated && !isDelegate && (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.06] text-white/25 text-sm cursor-default select-none">
              <QrCode size={14} />
              QR available to delegate only
            </div>
          )}
          {/* Owner-only actions */}
          {!isDelegate && (
            <div className="flex gap-3">
              <button
                onClick={onManageDelegate}
                className="flex-1 py-2.5 rounded-xl border border-[rgba(72,72,72,0.25)] text-[#ababab] text-xs font-bold hover:bg-white/[0.04] transition-colors"
              >
                Manage Delegate
              </button>
              <button
                onClick={returnDisabled ? undefined : onReturnTicket}
                disabled={returnDisabled}
                title={returnDisabled ? "Refund window has closed for this match" : undefined}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  returnDisabled
                    ? "border-white/5 text-white/20 cursor-not-allowed"
                    : "border-[rgba(255,115,81,0.2)] text-[#d53d18] hover:bg-red-500/[0.05]"
                }`}
              >
                {returnDisabled ? "Return Closed" : "Return Ticket"}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
      <div className="h-2 bg-white/5" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="h-6 w-16 rounded-full bg-white/5 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-12 rounded bg-white/5 animate-pulse" />
            <div className="h-6 w-14 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
        <div className="border-t border-white/5" />
        <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
        <div className="h-16 w-full bg-white/5 rounded-xl animate-pulse" />
        <div className="h-11 w-full bg-white/5 rounded-xl animate-pulse" />
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="flex-1 h-10 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
