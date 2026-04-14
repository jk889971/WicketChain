"use client";

import Image from "next/image";
import { ShoppingBag, User, CalendarDays, Ticket, X } from "lucide-react";
import { formatWire } from "@/lib/utils/formatWire";
import { truncateAddress } from "@/lib/utils/truncateAddress";
import type { OrderStatus } from "./OrderCard";

interface VendorOrderCardProps {
  orderId: string;
  orderIdOnchain: number;
  productName: string;
  productImageUrl: string | null;
  buyerAddress: string;
  ticketLabel: string;
  matchTitle: string;
  matchTime: string;
  venueName: string;
  quantity: number;
  totalPaidWei: string;
  status: OrderStatus;
  createdAt: string;
  canConfirmCollection: boolean;
  onConfirmCollection: () => void;
  onCancelOrder?: () => void;
}

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-[rgba(0,109,66,0.3)] text-[#77f5af]",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-amber-500/20 text-amber-400",
  },
  COLLECTED: {
    label: "Collected",
    className: "bg-blue-500/20 text-blue-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-white/5 text-white/30",
  },
  REFUNDED: {
    label: "Cancelled",
    className: "bg-white/5 text-white/30",
  },
};

export function VendorOrderCard({
  orderIdOnchain,
  productName,
  productImageUrl,
  buyerAddress,
  ticketLabel,
  matchTitle,
  matchTime,
  venueName,
  quantity,
  totalPaidWei,
  status,
  canConfirmCollection,
  onConfirmCollection,
  onCancelOrder,
}: VendorOrderCardProps) {
  const badge = STATUS_BADGE[status];
  const shortAddr = truncateAddress(buyerAddress);

  const formattedMatchTime = matchTime
    ? new Date(matchTime).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-5 flex gap-3 sm:gap-4 items-start">
      {/* Product image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#1f1f1f] border border-white/5 flex items-center justify-center">
        {productImageUrl ? (
          <Image
            src={productImageUrl}
            alt={productName}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <ShoppingBag size={22} className="text-white/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Name + status */}
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">
            {productName}
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Buyer */}
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <User size={11} className="shrink-0" />
          <span className="font-mono">{shortAddr}</span>
        </div>

        {/* Match title + date */}
        {matchTitle && (
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <CalendarDays size={11} className="shrink-0" />
            <span className="line-clamp-1">
              {matchTitle}{formattedMatchTime ? ` · ${formattedMatchTime}` : ""}
            </span>
          </div>
        )}

        {/* Venue */}
        {venueName && (
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Ticket size={11} className="shrink-0" />
            <span className="line-clamp-1">{venueName}</span>
          </div>
        )}

        {/* Ticket label + qty */}
        <p className="text-xs text-white/30">
          {ticketLabel} · Qty {quantity}
        </p>

        {/* Total */}
        <p className="text-sm font-mono text-[#a5fcad] font-semibold">
          {formatWire(BigInt(totalPaidWei))}
        </p>

        {/* Order ID */}
        <p className="text-xs text-white/20">#{orderIdOnchain}</p>

        {/* Confirm collection button */}
        {canConfirmCollection && (
          <button
            onClick={onConfirmCollection}
            className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-lg px-3 py-1.5 hover:bg-amber-500/15 w-full mt-2 transition-colors"
          >
            Confirm Collection
          </button>
        )}

        {/* Cancel order button */}
        {status === "ACTIVE" && onCancelOrder && (
          <button
            onClick={onCancelOrder}
            className="flex items-center justify-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 border border-red-500/10 hover:border-red-500/25 hover:bg-red-500/5 rounded-lg px-3 py-1.5 w-full mt-2 transition-colors"
          >
            <X size={11} />
            Cancel Order &amp; Refund Buyer
          </button>
        )}
      </div>
    </div>
  );
}

export function VendorOrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex gap-4 items-start">
      <div className="w-16 h-16 rounded-xl bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 bg-white/5 animate-pulse rounded w-2/3" />
          <div className="h-4 bg-white/5 animate-pulse rounded w-16 shrink-0" />
        </div>
        <div className="h-3 bg-white/5 animate-pulse rounded w-1/3" />
        <div className="h-3 bg-white/5 animate-pulse rounded w-1/2" />
        <div className="h-3 bg-white/5 animate-pulse rounded w-2/3" />
        <div className="h-3 bg-white/5 animate-pulse rounded w-1/4" />
      </div>
    </div>
  );
}
