"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Store } from "lucide-react";
import { formatWire } from "@/lib/utils/formatWire";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  priceWei: string;
  priceDisplay: string | null;
  availableUnits: number;
  isActive: boolean;
  onAddToCart: () => void;
  disabled?: boolean;
  /** When provided, renders a clickable shop name below the product name */
  shopName?: string;
  shopId?: string;
}

export function ProductCard({
  name,
  imageUrl,
  priceWei,
  priceDisplay,
  availableUnits,
  isActive,
  onAddToCart,
  disabled = false,
  shopName,
  shopId,
}: ProductCardProps) {
  const isSoldOut = availableUnits === 0;
  const isButtonDisabled = isSoldOut || disabled || !isActive;

  const priceLabel = priceDisplay
    ? priceDisplay
    : formatWire(BigInt(priceWei));

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
      {/* Square image area */}
      <div className="relative aspect-square w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#56a963]/15 to-[#56a963]/5 flex items-center justify-center">
            <ShoppingBag size={32} className="text-white/25" />
          </div>
        )}

        {/* Sold Out badge */}
        {isSoldOut && (
          <div className="absolute top-2 left-2 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5">
            Sold Out
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="font-semibold text-sm text-white leading-snug line-clamp-2">{name}</p>

        {shopName && shopId && (
          <Link
            href={`/shops/${shopId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-white/35 hover:text-[#56a963] transition-colors w-fit"
          >
            <Store size={10} className="shrink-0" />
            <span className="truncate">{shopName}</span>
          </Link>
        )}

        <p className="text-[#a5fcad] font-bold text-base font-mono">{priceLabel}</p>

        {availableUnits > 0 ? (
          <p className="text-xs text-white/30">{availableUnits} left</p>
        ) : (
          <p className="text-xs text-red-400">Out of stock</p>
        )}

        <div className="mt-auto pt-2">
          <button
            onClick={onAddToCart}
            disabled={isButtonDisabled}
            className={`w-full py-2 rounded-lg text-sm font-bold transition-opacity ${
              isButtonDisabled
                ? "opacity-40 cursor-not-allowed text-[#002a0c]"
                : "text-[#002a0c] hover:opacity-90"
            }`}
            style={
              isButtonDisabled
                ? { backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }
                : { backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }
            }
          >
            Add to Cart
          </button>

          {/* Ticket required hint */}
          {disabled && !isSoldOut && (
            <p className="text-xs text-white/30 text-center mt-1.5">Ticket Required</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
      <div className="aspect-square w-full bg-white/5 animate-pulse" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-white/5 animate-pulse rounded w-4/5" />
        <div className="h-4 bg-white/5 animate-pulse rounded w-2/5" />
        <div className="h-8 bg-white/5 animate-pulse rounded w-full mt-1" />
      </div>
    </div>
  );
}
