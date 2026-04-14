"use client";

import { useEffect, useState, useMemo } from "react";
import { Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MatchCard, MatchCardSkeleton } from "@/components/matches/MatchCard";
import { formatWire } from "@/lib/utils/formatWire";

// Statuses that belong to each tab
const TAB_STATUSES = {
  upcoming:  ["CREATED", "LIVE", "REFUNDS_CLOSED", "GATES_OPEN", "IN_PROGRESS", "POSTPONED"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
} as const;

type Tab = keyof typeof TAB_STATUSES;

const TABS: { key: Tab; label: string }[] = [
  { key: "upcoming",  label: "Upcoming"  },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

interface EventRow {
  id: string;
  match_title: string;
  image_url: string | null;
  status: string;
  start_time: string;
  venues: { name: string; city: string } | null;
  min_price?: string | null;
}

export default function MatchesPage() {
  const [events, setEvents]   = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("id, match_title, image_url, status, start_time, venues(name, city)")
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
        return;
      }

      // Fetch min price for each event
      const eventIds = (data || []).map((e) => e.id);
      const priceMap: Record<string, string> = {};

      if (eventIds.length > 0) {
        const { data: pricing } = await supabase
          .from("event_pricing")
          .select("event_id, price_wei, price_display")
          .in("event_id", eventIds);

        if (pricing) {
          const grouped: Record<string, { wei: bigint; display: string }[]> = {};
          for (const p of pricing) {
            const wei = BigInt(p.price_wei);
            const display = p.price_display || formatWire(wei);
            if (!grouped[p.event_id]) grouped[p.event_id] = [];
            grouped[p.event_id].push({ wei, display });
          }
          for (const [eventId, prices] of Object.entries(grouped)) {
            const min = prices.reduce((a, b) => (a.wei < b.wei ? a : b));
            priceMap[eventId] = min.display;
          }
        }
      }

      setEvents(
        (data || []).map((e) => ({
          ...e,
          venues: Array.isArray(e.venues) ? e.venues[0] : e.venues,
          min_price: priceMap[e.id] || null,
        }))
      );
      setLoading(false);
    }

    fetchEvents();
  }, []);

  // Filter events for the active tab + count badges
  const tabEvents = useMemo(
    () => events.filter((e) => (TAB_STATUSES[activeTab] as readonly string[]).includes(e.status)),
    [events, activeTab]
  );

  const counts = useMemo(() => {
    const result: Record<Tab, number> = { upcoming: 0, completed: 0, cancelled: 0 };
    for (const e of events) {
      for (const [tab, statuses] of Object.entries(TAB_STATUSES) as [Tab, readonly string[]][]) {
        if (statuses.includes(e.status)) result[tab]++;
      }
    }
    return result;
  }, [events]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center">
          <Ticket size={20} className="text-[#56a963]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Matches</h1>
          <p className="text-sm text-white/40">Browse and book cricket matches</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center sm:justify-start mb-8">
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 w-full sm:w-fit">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key;
            const count = counts[key];
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-1.5 min-[400px]:px-3 min-[450px]:px-5 py-1 min-[400px]:py-1.5 min-[450px]:py-2 rounded-lg text-[10px] min-[400px]:text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/70"}
                `}
              >
              {label}
              {!loading && count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold
                    ${isActive ? "bg-[#56a963] text-white" : "bg-white/10 text-white/50"}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && tabEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabEvents.map((event) => (
            <MatchCard
              key={event.id}
              id={event.id}
              matchTitle={event.match_title}
              imageUrl={event.image_url}
              status={event.status}
              startTime={event.start_time}
              venueName={event.venues?.name || "Unknown Venue"}
              venueCity={event.venues?.city || ""}
              minPriceDisplay={event.min_price || null}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && tabEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Ticket size={28} className="text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white/70 mb-1">
            {activeTab === "upcoming"  && "No upcoming matches"}
            {activeTab === "completed" && "No completed matches yet"}
            {activeTab === "cancelled" && "No cancelled matches"}
          </h2>
          <p className="text-sm text-white/40">
            {activeTab === "upcoming" ? "Check back soon for new cricket matches!" : "Nothing to show here."}
          </p>
        </div>
      )}
    </div>
  );
}
