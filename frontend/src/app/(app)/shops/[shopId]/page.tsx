"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Store, MapPin, ArrowLeft, Package } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { supabase } from "@/lib/supabase";
import { ProductCard, ProductCardSkeleton } from "@/components/shops/ProductCard";
import { ExpandableDescription } from "@/components/shops/ExpandableDescription";
import { useCart } from "@/context/CartContext";

interface ShopData {
  id: string;
  shopIdOnchain: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  venues: Array<{
    venueId: string;
    name: string;
    city: string;
    locationInVenue: string | null;
    venueIdOnchain: number;
  }>;
}

interface ProductData {
  id: string;
  productIdOnchain: number;
  shopId: string;
  venueId: string;
  name: string;
  imageUrl: string | null;
  priceWei: string;
  priceDisplay: string | null;
  availableUnits: number;
  isActive: boolean;
}

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params.shopId as string;

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { addItem, purchaseSignal } = useCart();

  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Data fetching ─────────────────────────────────────────────────────────
  async function fetchProducts() {
    const { data: productsData } = await supabase
      .from("shop_products")
      .select(
        "id, product_id_onchain, shop_id, venue_id, name, image_url, price_wei, price_display, available_units, is_active"
      )
      .eq("shop_id", shopId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setProducts(
      ((productsData as any[]) || []).map((p) => ({
        id: p.id,
        productIdOnchain: p.product_id_onchain,
        shopId: p.shop_id,
        venueId: p.venue_id,
        name: p.name,
        imageUrl: p.image_url,
        priceWei: p.price_wei,
        priceDisplay: p.price_display,
        availableUnits: p.available_units,
        isActive: p.is_active,
      }))
    );
  }

  useEffect(() => {
    if (!shopId) return;

    async function fetchData() {
      setLoading(true);

      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select(`
          id, shop_id_onchain, name, description, image_url, is_active,
          shop_venues (
            venue_id,
            location_in_venue,
            venues ( id, venue_id_onchain, name, city )
          )
        `)
        .eq("id", shopId)
        .eq("is_approved", true)
        .single();

      if (shopError || !shopData) {
        setLoading(false);
        return;
      }

      const rawVenues = (shopData.shop_venues || []) as unknown as Array<{
        venue_id: string;
        location_in_venue: string | null;
        venues: { id: string; venue_id_onchain: number; name: string; city: string } | null;
      }>;

      setShop({
        id: shopData.id,
        shopIdOnchain: shopData.shop_id_onchain,
        name: shopData.name,
        description: shopData.description,
        imageUrl: shopData.image_url,
        isActive: shopData.is_active,
        venues: rawVenues.map((sv) => ({
          venueId: sv.venue_id,
          name: sv.venues?.name ?? "",
          city: sv.venues?.city ?? "",
          locationInVenue: sv.location_in_venue,
          venueIdOnchain: sv.venues?.venue_id_onchain ?? 0,
        })),
      });

      await fetchProducts();
      setLoading(false);
    }

    fetchData();
  }, [shopId]);

  // Re-fetch products whenever a purchase completes
  useEffect(() => {
    if (purchaseSignal > 0) fetchProducts();
  }, [purchaseSignal]);

  // ── Add to cart ───────────────────────────────────────────────────────────
  const addToCart = (product: ProductData) => {
    addItem({
      cartItemId: `${product.id}-${Date.now()}`,
      productId: product.id,
      productIdOnchain: product.productIdOnchain,
      ticketTokenId: 0,
      quantity: 1,
      name: product.name,
      shopName: shop?.name ?? "",
      priceWei: BigInt(product.priceWei),
      imageUrl: product.imageUrl,
      shopId: product.shopId,
      shopIdOnchain: shop?.shopIdOnchain ?? 0,
      venueId: product.venueId,
      availableUnits: product.availableUnits,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-6" />
        <div className="aspect-video w-full bg-white/5 rounded-xl animate-pulse mb-6" />
        <div className="h-8 w-64 bg-white/5 rounded animate-pulse mb-3" />
        <div className="h-4 w-96 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-white/5 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 mx-auto">
          <Store size={28} className="text-white/20" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">Shop not found</h2>
        <p className="text-sm text-white/40 mb-6">
          This shop may have been removed or is no longer active.
        </p>
        <Link
          href="/shops"
          className="inline-flex items-center gap-2 border border-white/10 rounded-xl px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/shops"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Shops
      </Link>

      {/* Shop header */}
      <div className="flex items-start gap-4 mb-8">
        {shop.imageUrl ? (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
            <Image
              src={shop.imageUrl}
              alt={shop.name}
              fill
              className="object-cover"
              sizes="64px"
              priority
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[#56a963]/10 border border-white/5 flex items-center justify-center shrink-0">
            <Store size={28} className="text-[#56a963]/60" />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-heading leading-tight">{shop.name}</h1>

          {shop.description && (
            <ExpandableDescription
              text={shop.description}
              className="text-white/50 text-sm mt-1 leading-relaxed"
            />
          )}

          {shop.venues.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {shop.venues.map((v, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-white/40">
                  <MapPin size={11} className="text-white/25 shrink-0" />
                  <span>
                    {v.name}, {v.city}
                    {v.locationInVenue && (
                      <span className="text-white/25"> · {v.locationInVenue}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-semibold mb-6">Products</h2>

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
              onAddToCart={() => {
                if (!isConnected) {
                  openConnectModal?.();
                  return;
                }
                addToCart(product);
              }}
              disabled={!isConnected}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Package size={20} className="text-white/20" />
          </div>
          <p className="text-sm text-white/40">No products available yet.</p>
        </div>
      )}
    </div>
  );
}
