"use client";

import { formatWire } from "@/lib/utils/formatWire";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SelectedSeat {
  row: string;
  seat: number;
}

interface SelectionSummaryProps {
  seats: SelectedSeat[];
  priceWei: bigint;
  priceDisplay: string;
  onRemoveSeat: (row: string, seat: number) => void;
  onPurchase: () => void;
  isPurchasing: boolean;
  isConnected: boolean;
  onConnect: () => void;
}

export function SelectionSummary({
  seats,
  priceWei,
  priceDisplay,
  onRemoveSeat,
  onPurchase,
  isPurchasing,
  isConnected,
  onConnect,
}: SelectionSummaryProps) {
  if (seats.length === 0) return null;

  const totalWei = priceWei * BigInt(seats.length);
  const totalDisplay = formatWire(totalWei);
    // Removed gas estimate line

      return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
      {/* Selected Seats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Selected Seat{seats.length > 1 ? "s" : ""}</h3>
        </div>
        <div className="space-y-2">
          {seats.map((s) => (
            <div
              key={`${s.row}-${s.seat}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-[#56a963] font-medium">
                Row {s.row}, Seat {s.seat}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white/60">{priceDisplay}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSeat(s.row, s.seat)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Price Breakdown */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-white/50">
          <span>
            {seats.length} x Seat Ticket
          </span>
          <span>{totalDisplay}</span>
        </div>
        <div className="flex justify-between text-white font-bold text-[0.9rem] min-[350px]:text-base pt-1">
          <span>Total Payable</span>
          <span>{totalDisplay}</span>
        </div>
      </div>

      {/* Purchase Button */}
      {isConnected ? (
        <Button
          onClick={onPurchase}
          disabled={isPurchasing}
          className="w-full h-12 bg-[#56a963] hover:bg-[#4a9356] text-white font-semibold text-base rounded-xl disabled:opacity-50"
        >
          {isPurchasing ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Purchase Tickets"
          )}
        </Button>
      ) : (
        <Button
          onClick={onConnect}
          className="w-full h-12 bg-[#56a963] hover:bg-[#4a9356] text-white font-semibold text-base rounded-xl"
        >
          Connect Wallet
        </Button>
      )}

      <p className="text-[11px] text-center text-white/30">
        Tickets are non-transferable (soulbound)
      </p>
    </div>
  );
}
