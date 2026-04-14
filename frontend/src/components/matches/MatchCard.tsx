"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_STYLE, STATUS_STYLE_FALLBACK } from "@/lib/eventStatus";

interface MatchCardProps {
  id: string;
  matchTitle: string;
  imageUrl: string | null;
  status: string;
  startTime: string;
  venueName: string;
  venueCity: string;
  minPriceDisplay: string | null;
}


export function MatchCard({
  id,
  matchTitle,
  imageUrl,
  status,
  startTime,
  venueName,
  venueCity,
  minPriceDisplay,
}: MatchCardProps) {
  const date = new Date(startTime);

  return (
    <Link href={`/matches/${id}`} className="group block h-full">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all hover:-translate-y-1 hover:border-[#56a963]/30 flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={matchTitle}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#56a963]/20 to-[#56a963]/5" />
          )}
          <Badge
            className={`absolute top-3 left-3 text-xs font-medium border-0 ${STATUS_STYLE[status] ?? STATUS_STYLE_FALLBACK}`}
          >
            {status === "LIVE" && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
            )}
            {STATUS_LABEL[status] ?? status}
          </Badge>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-grow gap-3">
          <h3 className="font-bold text-base text-white leading-tight line-clamp-2 flex-grow">
            {matchTitle}
          </h3>

          <div className="flex items-center gap-1.5 text-white/40 text-sm">
            <MapPin size={14} />
            <span>
              {venueName}, {venueCity}
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/40 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{format(date, "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{format(date, "hh:mm a")}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Bottom */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">
              {minPriceDisplay ? `From ${minPriceDisplay}` : "Pricing TBA"}
            </span>
            <span className="text-sm font-medium text-[#56a963] group-hover:underline">
              View Seats &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="aspect-video bg-white/5 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-white/5 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
        <div className="border-t border-white/5" />
        <div className="flex justify-between">
          <div className="h-4 bg-white/5 rounded w-24 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
