"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingBag, MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { ProductCard, ProductCardSkeleton } from "@/components/shops/ProductCard";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface MatchInfo {
  matchTitle: string;
  startTime: string;
  venueId: string;
  venueName: string;
  venueCity: string;
}

interface ProductRow {
  id: string;
  productIdOnchain: number;
  shopId: string;
  shopIdOnchain: number;
  shopName: string;
  venueId: string;
  name: string;
  imageUrl: string | null;
  priceWei: string;
  priceDisplay: string | null;
  availableUnits: number;
  isActive: boolean;
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function MatchShopPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { addItem, purchaseSignal } = useCart();

  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch products for a given venue ─────────────────────────────────── */
  async function fetchProducts(venueId: string) {
    const { data } = await supabase
      .from("shop_products")
      .select(
        `id, product_id_onchain, shop_id, venue_id, name, image_url,
         price_wei, price_display, available_units, is_active,
         shops ( id, shop_id_onchain, name, is_approved, is_active )`
      )
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const rows: ProductRow[] = ((data as any[]) || [])
      .filter(
        (p) =>
          p.shops &&
          !Array.isArray(p.shops) &&
          p.shops.is_approved === true &&
          p.shops.is_active === true
      )
      .map((p) => ({
        id: p.id,
        productIdOnchain: p.product_id_onchain,
        shopId: p.shops.id,
        shopIdOnchain: p.shops.shop_id_onchain,
        shopName: p.shops.name,
        venueId: p.venue_id,
        name: p.name,
        imageUrl: p.image_url,
        priceWei: p.price_wei,
        priceDisplay: p.price_display,
        availableUnits: p.available_units,
        isActive: p.is_active,
      }));

    setProducts(rows);
  }

  /* ── Init: fetch match then products ───────────────────────────────────── */
  useEffect(() => {
    if (!matchId) return;

    async function init() {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("id, match_title, start_time, venue_id, venues ( name, city )")
        .eq("id", matchId)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      const venue = Array.isArray(data.venues) ? data.venues[0] : data.venues;

      setMatchInfo({
        matchTitle: data.match_title,
        startTime: data.start_time,
        venueId: data.venue_id,
        venueName: venue?.name ?? "—",
        venueCity: venue?.city ?? "—",
      });

      await fetchProducts(data.venue_id);
      setLoading(false);
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  /* ── Re-fetch when a purchase completes (stock counts update) ──────────── */
  useEffect(() => {
    if (purchaseSignal > 0 && matchInfo) {
      fetchProducts(matchInfo.venueId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseSignal]);

  /* ── Add to cart ───────────────────────────────────────────────────────── */
  const handleAddToCart = (product: ProductRow) => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    addItem({
      cartItemId: `${product.id}-${Date.now()}`,
      productId: product.id,
      productIdOnchain: product.productIdOnchain,
      ticketTokenId: 0,
      quantity: 1,
      name: product.name,
      shopName: product.shopName,
      priceWei: BigInt(product.priceWei),
      imageUrl: product.imageUrl,
      shopId: product.shopId,
      shopIdOnchain: product.shopIdOnchain,
      venueId: product.venueId,
      availableUnits: product.availableUnits,
    });
  };

  /* ── Loading skeleton ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-8" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-64 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Match not found ───────────────────────────────────────────────────── */
  if (!matchInfo) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 mx-auto">
          <ShoppingBag size={28} className="text-white/20" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Match not found</h2>
        <p className="text-sm text-white/40 mb-6">This match may no longer exist.</p>
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 border border-white/10 rounded-xl px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Matches
        </Link>
      </div>
    );
  }

  const date = new Date(matchInfo.startTime);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">

      {/* Back link */}
      <Link
        href={`/matches/${matchId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to Match
      </Link>

      {/* Page header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShoppingBag size={20} className="text-[#56a963]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[1.35rem] min-[350px]:text-2xl font-bold font-heading leading-tight">
            Shop for this Match
          </h1>
          <p className="text-[0.7rem] min-[350px]:text-sm text-white/40 mt-0.5 truncate">
            {matchInfo.matchTitle}
          </p>
        </div>
      </div>

      {/* Match meta row */}
      <div className="flex flex-wrap items-center gap-4 mb-8 ml-[52px]">
        <div className="flex items-center gap-1.5 text-[0.65rem] min-[350px]:text-xs text-white/30">
          <MapPin size={12} />
          <span>{matchInfo.venueName}, {matchInfo.venueCity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.65rem] min-[350px]:text-xs text-white/30">
          <Calendar size={12} />
          <span>{format(date, "MMM dd, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.65rem] min-[350px]:text-xs text-white/30">
          <Clock size={12} />
          <span>{format(date, "hh:mm a")}</span>
        </div>
      </div>

      {/* Product count */}
      {products.length > 0 && (
        <p className="text-xs text-white/25 mb-6">
          {products.length} {products.length === 1 ? "product" : "products"} available
        </p>
      )}

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.imageUrl}
              priceWei={product.priceWei}
              priceDisplay={product.priceDisplay}
              availableUnits={product.availableUnits}
              isActive={product.isActive}
              onAddToCart={() => handleAddToCart(product)}
              disabled={!isConnected}
              shopName={product.shopName}
              shopId={product.shopId}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-white/20" />
          </div>
          <h2 className="text-lg font-semibold text-white/70 mb-1">
            No products available
          </h2>
          <p className="text-sm text-white/40 max-w-sm">
            Stadium shops for {matchInfo.venueName} haven&apos;t listed any
            products yet. Check back closer to match day.
          </p>
        </div>
      )}
    </div>
  );
}
