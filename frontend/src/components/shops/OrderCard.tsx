"use client";

import Image from "next/image";
import { ShoppingBag, Store, Ticket, CalendarDays } from "lucide-react";
import { formatWire } from "@/lib/utils/formatWire";

export type OrderStatus = "ACTIVE" | "CONFIRMED" | "COLLECTED" | "CANCELLED" | "REFUNDED";

export interface OrderCardProps {
  orderId: string;
  orderIdOnchain: number;
  productName: string;
  productImageUrl: string | null;
  shopName: string;
  matchTitle: string;
  matchTime: string;
  venueName: string;
  ticketLabel: string;
  quantity: number;
  totalPaidWei: string;
  status: OrderStatus;
  createdAt: string;
  canCancel: boolean;
  onCancel: () => void;
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
    label: "Refunded",
    className: "bg-red-500/20 text-red-400",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-red-500/20 text-red-400",
  },
};

export function OrderCard({
  orderIdOnchain,
  productName,
  productImageUrl,
  shopName,
  matchTitle,
  matchTime,
  venueName,
  ticketLabel,
  quantity,
  totalPaidWei,
  status,
  canCancel,
  onCancel,
}: OrderCardProps) {
  const badge = STATUS_BADGE[status];
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
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex gap-4 items-start">
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
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Shop */}
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Store size={11} className="shrink-0" />
          <span>{shopName}</span>
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
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Ticket size={11} className="shrink-0" />
          <span className="line-clamp-1">
            {venueName}
          </span>
        </div>

        {/* Ticket + qty */}
        <p className="text-xs text-white/30">
          {ticketLabel} · Qty {quantity}
        </p>

        {/* Total */}
        <p className="text-sm font-mono text-[#a5fcad] font-semibold">
          {formatWire(BigInt(totalPaidWei))}
        </p>

        {/* Action buttons */}
        {canCancel && (
          <div className="mt-1 flex gap-2">
            <button
              onClick={onCancel}
              className="border border-red-500/30 text-red-400 text-xs rounded-lg px-3 py-1.5 hover:bg-red-500/5 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
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
        <div className="h-3 bg-white/5 animate-pulse rounded w-1/4" />
      </div>
    </div>
  );
}
