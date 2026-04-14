"use client";

import { useEffect, useState, useMemo } from "react";
import { Store } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ShopCard, ShopCardSkeleton } from "@/components/shops/ShopCard";

interface ShopRow {
  id: string;
  shop_id_onchain: number;
  owner_address: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_approved: boolean;
  is_active: boolean;
  shop_venues: Array<{
    venue_id: string;
    location_in_venue: string | null;
    venues: { name: string; city: string } | null;
  }>;
  shop_products: Array<{ id: string }>;
}

interface MappedShop {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  venues: Array<{ name: string; city: string; locationInVenue: string | null }>;
  productCount: number;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<MappedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueFilter, setVenueFilter] = useState("all");

  useEffect(() => {
    async function fetchShops() {
      const { data, error } = await supabase
        .from("shops")
        .select(`
          id,
          shop_id_onchain,
          owner_address,
          name,
          description,
          image_url,
          is_approved,
          is_active,
          shop_venues (
            venue_id,
            location_in_venue,
            venues ( name, city )
          ),
          shop_products ( id )
        `)
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shops:", error);
        setLoading(false);
        return;
      }

      const mapped: MappedShop[] = ((data as unknown as ShopRow[]) || []).map((shop) => ({
        id: shop.id,
        name: shop.name,
        description: shop.description,
        imageUrl: shop.image_url,
        venues: (shop.shop_venues || []).map((sv) => ({
          name: sv.venues?.name ?? "",
          city: sv.venues?.city ?? "",
          locationInVenue: sv.location_in_venue,
        })),
        productCount: shop.shop_products?.length ?? 0,
      }));

      setShops(mapped);
      setLoading(false);
    }

    fetchShops();
  }, []);

  // Collect unique venue labels for the filter
  const uniqueVenues = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const shop of shops) {
      for (const v of shop.venues) {
        const key = `${v.name}, ${v.city}`;
        if (v.name && !seen.has(key)) {
          seen.add(key);
          result.push(key);
        }
      }
    }
    return result;
  }, [shops]);

  const filteredShops = useMemo(() => {
    if (venueFilter === "all") return shops;
    return shops.filter((shop) =>
      shop.venues.some((v) => `${v.name}, ${v.city}` === venueFilter)
    );
  }, [shops, venueFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
          <Store size={20} className="text-[#56a963]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Stadium Shops</h1>
          <p className="text-sm text-white/40">
            Browse stadium shops and pre-order products for your match
          </p>
        </div>
      </div>

      {/* Venue filter bar */}
      {!loading && uniqueVenues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setVenueFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              venueFilter === "all"
                ? "bg-[#56a963]/20 border border-[#56a963]/30 text-[#56a963]"
                : "bg-white/[0.03] border border-white/5 text-white/50 hover:text-white/80"
            }`}
          >
            All Venues
          </button>
          {uniqueVenues.map((venue) => (
            <button
              key={venue}
              onClick={() => setVenueFilter(venue)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                venueFilter === venue
                  ? "bg-[#56a963]/20 border border-[#56a963]/30 text-[#56a963]"
                  : "bg-white/[0.03] border border-white/5 text-white/50 hover:text-white/80"
              }`}
            >
              {venue}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Shop grid */}
      {!loading && filteredShops.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <ShopCard
              key={shop.id}
              id={shop.id}
              name={shop.name}
              description={shop.description}
              imageUrl={shop.imageUrl}
              venues={shop.venues}
              productCount={shop.productCount}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredShops.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Store size={28} className="text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white/70 mb-1">No shops available</h2>
          <p className="text-sm text-white/40 max-w-sm">
            Stadium shops will appear here once vendors register and get approved.
          </p>
        </div>
      )}
    </div>
  );
}
