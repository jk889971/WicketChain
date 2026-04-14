"use client";

import { useEffect, useState } from "react";
import { X, Ticket, ShieldCheck, QrCode, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQRSigning, type QRTicket, QR_DURATION } from "@/hooks/useQRSigning";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QRModalTicket extends QRTicket {
  /** The event the ticket belongs to — only tickets in the same event are batchable */
  eventId: string;
  /** Connected wallet IS the delegate for this ticket (not the owner) */
  isDelegate: boolean;
  /** This ticket is owned by the connected wallet but has been delegated to someone else */
  isDelegated: boolean;
}

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  /** The ticket whose "Show QR" button was clicked — always pre-selected */
  initialTicket: QRModalTicket | null;
  /** All eligible (active, not-entered) tickets for the wallet */
  allTickets: QRModalTicket[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatCountdown(s: number) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}s`;
}

/** Short human-readable batch ID derived from token IDs */
function batchId(ids: number[]) {
  const hash = ids.reduce((acc, id) => acc + id, 0);
  return `WC-${String(hash % 9000 + 1000)}-Z`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QRModal({ open, onClose, initialTicket, allTickets }: QRModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Build the list of tickets that can be shown in the checklist:
  //   - Same event as the initial ticket
  //   - If it's a delegate ticket, only that one ticket is listed (no batch)
  const eligible: QRModalTicket[] = initialTicket
    ? initialTicket.isDelegate
      ? [initialTicket]                                          // delegate → solo only
      : allTickets.filter(
          (t) =>
            t.eventId === initialTicket.eventId &&
            !t.isDelegate &&                                     // owner tickets, same event
            !t.isDelegated                                       // exclude tickets delegated to someone else
        )
    : [];

  // Sync selection when modal opens / initial ticket changes
  useEffect(() => {
    if (open && initialTicket) {
      setSelectedIds(new Set([initialTicket.tokenId]));
    }
    if (!open) {
      setSelectedIds(new Set());
    }
  }, [open, initialTicket]);

  // Build the QRTicket array for the signing hook (ordered, stable)
  const selectedTickets: QRTicket[] = eligible
    .filter((t) => selectedIds.has(t.tokenId))
    .map(({ tokenId, rowLabel, seatNumber, enclosureName }) => ({
      tokenId,
      rowLabel,
      seatNumber,
      enclosureName,
    }));

  const { qrUrl, qrSecondsLeft, isSigning, hasSigned, signingError, sign } =
    useQRSigning(selectedTickets);

  // Progress bar width
  const progressPct = (qrSecondsLeft / QR_DURATION) * 100;
  const isExpiring  = qrSecondsLeft <= 10;

  // Toggle a ticket in the selection (initial ticket cannot be deselected)
  function toggleTicket(tokenId: number) {
    if (tokenId === initialTicket?.tokenId) return; // always selected
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tokenId)) next.delete(tokenId);
      else next.add(tokenId);
      return next;
    });
  }

  if (!initialTicket) return null;

  const showBatchPanel = eligible.length > 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] focus:outline-none px-3 sm:px-4 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ maxWidth: showBatchPanel ? 780 : 420 }}
        >
          <div className="backdrop-blur-xl bg-[rgba(22,22,22,0.97)] border border-white/[0.07] rounded-2xl shadow-[0px_24px_48px_-8px_rgba(0,0,0,0.7)] overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-start justify-between px-4 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5">
              <div>
                <h2 className="text-base sm:text-xl font-bold font-heading text-white tracking-tight">
                  {showBatchPanel ? "Batch QR Check-In" : "Ticket QR Code"}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#ababab] mt-1">
                  {showBatchPanel
                    ? "Streamline entry for multiple ticket holders in one scan."
                    : "Show this QR at the stadium gate to enter."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className={`flex ${showBatchPanel ? "flex-col min-[700px]:flex-row" : "flex-col"} gap-0`}>

              {/* ── LEFT: Ticket checklist (batch only) ── */}
              {showBatchPanel && (
                <div className="flex flex-col min-[700px]:w-[300px] shrink-0 border-b min-[700px]:border-b-0 min-[700px]:border-r border-white/[0.05] px-4 sm:px-6 pb-5 min-[700px]:pb-7">

                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded bg-[rgba(165,252,173,0.1)] flex items-center justify-center">
                      <span className="text-[#a5fcad] text-[10px] font-bold">≡</span>
                    </div>
                    <p className="text-xs font-bold text-[#a5fcad] uppercase tracking-[1px]">
                      Select Tickets to Include
                    </p>
                  </div>

                  {/* Ticket rows */}
                  <div className="flex flex-col gap-2 mb-5 max-h-[200px] min-[700px]:max-h-[280px] overflow-y-auto pr-1">
                    {eligible.map((t) => {
                      const isSelected  = selectedIds.has(t.tokenId);
                      const isAnchor    = t.tokenId === initialTicket.tokenId;
                      return (
                        <button
                          key={t.tokenId}
                          onClick={() => toggleTicket(t.tokenId)}
                          className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all
                            ${isSelected
                              ? "bg-[rgba(86,169,99,0.1)] border-[rgba(165,252,173,0.2)]"
                              : "bg-[rgba(255,255,255,0.03)] border-white/[0.06] hover:bg-white/[0.05]"}
                            ${isAnchor ? "cursor-default" : "cursor-pointer"}
                          `}
                        >
                          {/* Checkbox */}
                          <div
                            className={`
                              w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors
                              ${isSelected
                                ? "bg-[#56a963] border-[#56a963]"
                                : "border-white/20 bg-transparent"}
                            `}
                          >
                            {isSelected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-white/50"}`}>
                              Ticket #{String(t.tokenId).padStart(4, "0")}
                            </p>
                            <p className={`text-xs ${isSelected ? "text-[#ababab]" : "text-white/30"}`}>
                              Row {t.rowLabel}, Seat {t.seatNumber}
                            </p>
                          </div>

                          {/* Ticket icon */}
                          <Ticket
                            size={16}
                            className={isSelected ? "text-[#a5fcad] shrink-0" : "text-white/20 shrink-0"}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Update / Generate button */}
                  <button
                    onClick={sign}
                    disabled={isSigning || selectedIds.size === 0}
                    className="w-full py-3.5 rounded-xl bg-[#56a963] text-white text-sm font-bold font-heading uppercase tracking-wide hover:bg-[#56a963]/90 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    style={{ boxShadow: "0px 8px 16px -4px rgba(86,169,99,0.3)" }}
                  >
                    {isSigning ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Waiting for Signature…
                      </>
                    ) : hasSigned ? (
                      <>
                        <QrCode size={14} />
                        Update Batch QR
                      </>
                    ) : (
                      <>
                        <QrCode size={14} />
                        Generate Batch QR
                      </>
                    )}
                  </button>

                  {/* Security note */}
                  <div className="flex gap-3 mt-5 pt-5 border-t border-white/[0.05]">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(86,169,99,0.1)] flex items-center justify-center shrink-0">
                      <ShieldCheck size={14} className="text-[#56a963]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/70 mb-0.5">
                        Secured by Obsidian Ledger
                      </p>
                      <p className="text-[11px] text-white/30 leading-relaxed">
                        Single-use dynamic QR codes ensure that your batch entry
                        remains valid for only one scan session.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── RIGHT: QR display ── */}
              <div className={`flex flex-col ${showBatchPanel ? "flex-1 px-4 sm:px-7 pb-5 sm:pb-7" : "px-4 sm:px-7 pb-5 sm:pb-7"}`}>

                {/* Ticket count badge (batch) or ticket info (single) */}
                {showBatchPanel ? (
                  <div className="flex justify-center mb-5">
                    <div className={`
                      flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold
                      ${hasSigned
                        ? "bg-[rgba(86,169,99,0.15)] text-[#a5fcad] border border-[rgba(165,252,173,0.2)]"
                        : "bg-white/[0.05] text-white/40 border border-white/[0.06]"}
                    `}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${hasSigned ? "bg-[#a5fcad]" : "bg-white/20"}`}
                      />
                      {selectedIds.size} {selectedIds.size === 1 ? "TICKET" : "TICKETS"} IN THIS QR
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mb-5">
                    <div className="text-center">
                      <p className="text-xs text-[#ababab]">
                        Ticket #{String(initialTicket.tokenId).padStart(4, "0")} —{" "}
                        Row {initialTicket.rowLabel}, Seat {initialTicket.seatNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── QR code area ── */}
                <div
                  className={`
                    flex items-center justify-center rounded-2xl mx-auto w-full
                    ${hasSigned
                      ? "bg-[rgba(86,169,99,0.12)] border border-[rgba(165,252,173,0.15)]"
                      : "bg-[rgba(255,255,255,0.03)] border border-white/[0.06]"}
                  `}
                  style={{ minHeight: 180, maxWidth: 280, padding: hasSigned ? 16 : 0 }}
                >
                  {/* Not yet signed */}
                  {!hasSigned && !isSigning && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center">
                        <QrCode size={24} className="text-white/20" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/60 mb-1">
                          {signingError ?? (showBatchPanel ? "Select tickets and generate QR" : "Sign to generate your QR code")}
                        </p>
                        {signingError && (
                          <p className="text-xs text-white/30">
                            Tap the button below to try again.
                          </p>
                        )}
                      </div>
                      {!showBatchPanel && (
                        <button
                          onClick={sign}
                          disabled={isSigning}
                          className="px-5 py-2.5 rounded-xl bg-[#56a963] text-white text-sm font-bold hover:bg-[#56a963]/90 transition-colors flex items-center gap-2"
                        >
                          <QrCode size={14} />
                          Generate QR
                        </button>
                      )}
                    </div>
                  )}

                  {/* Signing in progress */}
                  {isSigning && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={28} className="text-[#56a963] animate-spin" />
                      <p className="text-sm text-[#ababab] text-center px-4">
                        Check your wallet to sign the QR request
                      </p>
                    </div>
                  )}

                  {/* QR ready */}
                  {hasSigned && qrUrl && (
                    <div className="bg-white rounded-xl p-2 sm:p-3 shadow-lg">
                      <QRCodeSVG
                        value={qrUrl}
                        size={160}
                        className="w-full h-auto"
                        bgColor="#ffffff"
                        fgColor="#0a0a0a"
                        level="M"
                      />
                    </div>
                  )}
                </div>

                {/* ── Countdown ── */}
                {hasSigned && (
                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#ababab] text-center mb-2">
                      Refreshes In
                    </p>
                    <p
                      className={`text-3xl font-bold font-heading text-center tabular-nums mb-3 ${
                        isExpiring ? "text-[#ff7351]" : "text-[#a5fcad]"
                      }`}
                    >
                      {formatCountdown(qrSecondsLeft)}
                    </p>
                    {/* Progress bar */}
                    <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                          isExpiring ? "bg-[#ff7351]" : "bg-[#56a963]"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/20 text-center mt-2">
                      Rotates automatically · Wallet re-prompts every 30 min
                    </p>
                  </div>
                )}

                {/* ── Auto-refreshing — shown briefly while new sig is requested ── */}
                {!hasSigned && !isSigning && qrSecondsLeft === 0 && (
                  <div className="mt-5 flex items-center justify-center gap-2 text-[#ababab]">
                    <Loader2 size={13} className="animate-spin" />
                    <p className="text-xs">Refreshing QR…</p>
                  </div>
                )}


                {/* ── Single ticket security note ── */}
                {!showBatchPanel && (
                  <div className="flex gap-3 mt-5 pt-5 border-t border-white/[0.05]">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(86,169,99,0.1)] flex items-center justify-center shrink-0">
                      <ShieldCheck size={12} className="text-[#56a963]" />
                    </div>
                    <p className="text-[11px] text-white/30 leading-relaxed">
                      Cryptographically signed — expires in 1 minute to prevent screenshot fraud.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
