"use client";

import { formatWire } from "@/lib/utils/formatWire";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import { X, Ticket, Wallet } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { SelectedSeat } from "./SelectionSummary";

interface ConfirmPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  matchTitle: string;
  enclosureName: string;
  seats: SelectedSeat[];
  priceWei: bigint;
  priceDisplay: string;
  walletAddress?: string;
}

export function ConfirmPurchaseModal({
  open,
  onClose,
  onConfirm,
  matchTitle,
  enclosureName,
  seats,
  priceWei,
  priceDisplay,
  walletAddress,
}: ConfirmPurchaseModalProps) {
  const totalWei = priceWei * BigInt(seats.length);
  const totalDisplay = formatWire(totalWei);
  const seatsLabel =
    seats.length === 1
      ? `Row ${seats[0].row}, Seat ${seats[0].seat}`
      : seats.map((s) => `${s.row}-${s.seat}`).join(", ");

  const shortAddr = walletAddress ? truncateAddress(walletAddress) : "—";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 scale-[0.8] min-[500px]:scale-100">
          <div className="backdrop-blur-[10px] bg-[rgba(25,25,25,0.95)] border border-white/5 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#56a963]/20 flex items-center justify-center shrink-0">
                    <Ticket size={15} className="text-[#a5fcad]" />
                  </div>
                  <h2 className="text-base font-bold font-heading text-white tracking-tight">
                    Confirm Your Purchase
                  </h2>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-3 space-y-3">
              {/* Event Card */}
              <div className="bg-[#1f1f1f] border border-white/5 rounded-xl p-3.5">
                <p className="text-white font-semibold text-sm leading-snug">{matchTitle}</p>
                <p className="text-[#a5fcad] text-[10px] uppercase tracking-widest mt-0.5 mb-3">HBL PSL 2026</p>
                <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#ababab] mb-0.5">Enclosure</p>
                    <p className="text-white font-medium text-sm">{enclosureName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#ababab] mb-0.5">Seats</p>
                    <p className="text-white font-medium text-xs leading-snug">{seatsLabel}</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#ababab]">Ticket Price ({seats.length}x)</span>
                <span className="text-sm text-white font-mono">{priceDisplay}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-[#a5fcad] font-bold">Total</p>
                <p className="text-xl font-bold font-heading text-[#a5fcad]">{totalDisplay}</p>
              </div>

              {/* Wallet */}
              <div className="bg-[#131313] border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
                <Wallet size={13} className="text-[#ababab] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#ababab]">Connected Wallet</p>
                  <p className="text-xs text-white font-mono">{shortAddr}</p>
                </div>
                <span className="text-[10px] text-[#77f5af] bg-[rgba(0,109,66,0.3)] px-2 py-0.5 rounded-full">
                  Testnet
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pt-2 pb-5 space-y-2">
              <button
                onClick={onConfirm}
                className="w-full py-3 rounded-xl font-bold font-heading text-sm text-[#002a0c] text-center"
                style={{
                  backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)",
                  boxShadow: "0px 6px 12px -3px rgba(165,252,173,0.2)",
                }}
              >
                Confirm &amp; Pay
              </button>
              <button
                onClick={onClose}
                className="w-full py-1.5 text-center text-sm text-[#ababab] hover:text-white transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
