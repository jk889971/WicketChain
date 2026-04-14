"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, Package, MapPin } from "lucide-react";

interface ShopCardProps {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  venues: Array<{ name: string; city: string; locationInVenue: string | null }>;
  productCount: number;
}

export function ShopCard({
  id,
  name,
  description,
  imageUrl,
  venues,
  productCount,
}: ShopCardProps) {
  const visibleVenues = venues.slice(0, 2);
  const extraVenueCount = venues.length - 2;

  return (
    <Link
      href={`/shops/${id}`}
      className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all hover:-translate-y-1 hover:border-[#56a963]/30 flex flex-col"
    >
      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Logo + name row */}
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0 border border-white/5">
              <Store size={20} className="text-[#56a963]/60" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-white leading-snug line-clamp-1">{name}</p>
            {/* Product count badge */}
            <div className="flex items-center gap-1 mt-0.5">
              <Package size={11} className="text-[#a5fcad]" />
              <span className="text-xs text-white/40">{productCount} items</span>
            </div>
          </div>
        </div>

        {description && (
          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">{description}</p>
        )}

        {venues.length > 0 && (
          <div className="mt-1 space-y-1">
            {visibleVenues.map((venue, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-white/40">
                <MapPin size={12} className="shrink-0 text-white/25" />
                <span className="line-clamp-1">
                  {venue.name}, {venue.city}
                  {venue.locationInVenue && (
                    <span className="text-white/25"> · {venue.locationInVenue}</span>
                  )}
                </span>
              </div>
            ))}
            {extraVenueCount > 0 && (
              <p className="text-xs text-white/25 pl-[18px]">+{extraVenueCount} more venues</p>
            )}
          </div>
        )}

        <div className="mt-auto" />

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-1">
          <span className="text-xs text-white/50">Stadium Shop</span>
          <span className="text-xs text-[#56a963] group-hover:underline">Browse →</span>
        </div>
      </div>
    </Link>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-4 bg-white/5 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-white/5 animate-pulse rounded w-1/3" />
          </div>
        </div>
        <div className="h-3 bg-white/5 animate-pulse rounded w-full" />
        <div className="h-3 bg-white/5 animate-pulse rounded w-5/6" />
      </div>
    </div>
  );
}
