"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Wallet,
  Package,
  Clock,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  Plus,
  Pencil,
  Boxes,
  X,
  MapPin,
  Settings,
  TrendingUp,
  CircleDollarSign,
  Hourglass,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { parseEther, formatEther, parseEventLogs } from "viem";
import { formatWire } from "@/lib/utils/formatWire";
import { supabase } from "@/lib/supabase";
import { CONTRACTS } from "@/config/contracts";
import { stadiumShopAbi, userProfileAbi, wicketChainVaultAbi } from "@/lib/contracts/generated";
import { useContractWrite } from "@/hooks/useContractWrite";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";
import { RegisterShopModal } from "@/components/shops/RegisterShopModal";
import { AddProductModal } from "@/components/shops/AddProductModal";
import { EditInventoryModal } from "@/components/shops/EditInventoryModal";
import { EditShopModal } from "@/components/shops/EditShopModal";
import { ManageVenuesModal } from "@/components/shops/ManageVenuesModal";
import { CreateProfileModal } from "@/components/shops/CreateProfileModal";
import { VendorOrderCard, VendorOrderCardSkeleton } from "@/components/shops/VendorOrderCard";
import { ExpandableDescription } from "@/components/shops/ExpandableDescription";

// ── Types ──────────────────────────────────────────────────────────────────

interface VendorShop {
  id: string;
  shopIdOnchain: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isApproved: boolean;
  isActive: boolean;
  rejectionReason: string | null;
  venues: Array<{
    venueIdOnchain: number;
    venueId: string;
    name: string;
    city: string;
    locationInVenue: string | null;
  }>;
}

interface VendorProduct {
  id: string;
  productIdOnchain: number;
  venueId: string;
  name: string;
  imageUrl: string | null;
  priceWei: string;
  priceDisplay: string | null;
  availableUnits: number;
  isActive: boolean;
}

interface VendorOrder {
  id: string;
  orderIdOnchain: number;
  productName: string;
  productImageUrl: string | null;
  buyerAddress: string;
  ticketLabel: string;
  matchTitle: string | null;
  matchTime: string | null;
  venueName: string | null;
  quantity: number;
  totalPaidWei: string;
  status: "ACTIVE" | "CONFIRMED" | "COLLECTED" | "CANCELLED" | "REFUNDED";
  createdAt: string;
}

type MainTab = "products" | "orders" | "earnings";
type OrderSubTab = "all" | "active" | "confirmed" | "collected";

interface EventEarning {
  eventId: string;
  eventTitle: string;
  startTime: string | null;
  totalRevenueWei: string;
  orderCount: number;
  activeCount: number;
  confirmedCount: number;
  collectedCount: number;
  cancelledCount: number;
}
type TxAction = "createProfile" | "register" | "addProduct" | "toggleShop" | "confirmCollection" | "editProduct" | "editInventory" | "toggleProduct" | "updateVenueLocation" | "addVenueToShop" | "withdraw" | "removeVenue" | "vendorCancelOrder" | "editShop";

// ── Component ──────────────────────────────────────────────────────────────

export default function VendorDashboardPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [vendorShop, setVendorShop] = useState<VendorShop | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>("products");
  const [orderSubTab, setOrderSubTab] = useState<OrderSubTab>("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [showEditInventoryModal, setShowEditInventoryModal] = useState(false);
  const [inventoryProduct, setInventoryProduct] = useState<VendorProduct | null>(null);
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [eventEarnings, setEventEarnings] = useState<EventEarning[]>([]);
  const [allVenues, setAllVenues] = useState<
    Array<{ id: string; venueIdOnchain: number; name: string; city: string }>
  >([]);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txAction, setTxAction] = useState<TxAction>("register");

  const confirmCollectionPendingId = useRef<number>(0);
  const preToggleActiveRef = useRef<boolean>(false);
  const pendingProfileRef = useRef<{
    fullName: string;
    email: string;
    phone: string;
    city: string;
  } | null>(null);
  const pendingProductRef = useRef<{
    venueId: string; // UUID for Supabase
    venueIdOnchain: number;
    name: string;
    imageURI: string;
    priceInWei: bigint;
    availableUnits: number;
  } | null>(null);

  const pendingEditRef = useRef<{
    productId: string;        // Supabase UUID
    productIdOnchain: number;
    name: string;
    imageURI: string;
    priceInWei: bigint;
  } | null>(null);

  const pendingInventoryRef = useRef<{
    productId: string;
    productIdOnchain: number;
    availableUnits: number;
  } | null>(null);

  const pendingToggleProductRef = useRef<{
    productId: string;
    productIdOnchain: number;
    currentlyActive: boolean;
  } | null>(null);

  const pendingVenueLocationRef = useRef<{
    shopUUID: string;
    venueUUID: string;
    venueIdOnchain: number;
    newLocation: string;
  } | null>(null);

  const pendingAddVenueRef = useRef<{
    shopUUID: string;
    shopIdOnchain: number;
    venueUUID: string;
    venueIdOnchain: number;
    venueName: string;
    venueCity: string;
    location: string;
  } | null>(null);

  const pendingRemoveVenueRef = useRef<{
    shopUUID: string;
    venueIdOnchain: number;
    venueUUID: string;
  } | null>(null);

  const vendorCancelOrderPendingId = useRef<number>(0);
  const pendingEditShopRef = useRef<{
    name: string;
    description: string;
    imageURI: string;
  } | null>(null);

  // ── Contract hooks ────────────────────────────────────────────────────────

  const { data: hasProfile, refetch: refetchProfile } = useReadContract({
    address: CONTRACTS.userProfile,
    abi: userProfileAbi,
    functionName: "hasCompleteProfile",
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { data: shopFeeBps } = useReadContract({
    address: CONTRACTS.vault,
    abi: wicketChainVaultAbi,
    functionName: "shopFeeBps",
    query: { enabled: true },
  });

  const { data: shopBalanceOnchain, refetch: refetchShopBalance } = useReadContract({
    address: CONTRACTS.vault,
    abi: wicketChainVaultAbi,
    functionName: "getShopBalance",
    args: [BigInt(vendorShop?.shopIdOnchain ?? 0)],
    query: { enabled: !!vendorShop?.shopIdOnchain, staleTime: 0 },
  });

  const createProfileContract = useContractWrite({
    onSuccess: async () => {
      if (!address) return;
      const pending = pendingProfileRef.current;
      if (!pending) return;

      // Upsert profile data to Supabase
      await supabase.from("user_profiles").upsert(
        {
          wallet_address: address.toLowerCase(),
          full_name: pending.fullName,
          email: pending.email,
          phone_number: pending.phone,
          shipping_address: pending.city ? { city: pending.city } : null,
        },
        { onConflict: "wallet_address" }
      );

      await refetchProfile();
      setShowCreateProfileModal(false);
      setShowRegisterModal(true);
      toast.success("Profile created! You can now register your shop.");
    },
  });

  const registerContract = useContractWrite();

  const addProductContract = useContractWrite({
    onSuccess: async (hash) => {
      if (!address || !publicClient || !vendorShop) return;
      try {
        const receipt = await publicClient.getTransactionReceipt({
          hash: hash as `0x${string}`,
        });
        const logs = parseEventLogs({
          abi: stadiumShopAbi,
          eventName: "ProductAdded",
          logs: receipt.logs,
        });

        if (logs.length === 0) return;
        const productIdOnchain = Number(logs[0].args.productId);
        const pending = pendingProductRef.current;
        if (!pending) return;

        // Use upsert so we win regardless of whether the indexer fired first.
        // onConflict "product_id_onchain" → update the row if it already exists
        // (indexer may have inserted a minimal row without image/units).
        const { data: inserted, error: syncError } = await supabase
          .from("shop_products")
          .upsert(
            {
              product_id_onchain: productIdOnchain,
              shop_id: vendorShop.id,
              venue_id: pending.venueId,
              name: pending.name,
              image_url: pending.imageURI || null,
              price_wei: pending.priceInWei.toString(),
              price_display: formatWire(pending.priceInWei),
              available_units: pending.availableUnits,
              is_active: true,
            },
            { onConflict: "product_id_onchain" }
          )
          .select()
          .single();

        if (syncError) {
          console.error("Supabase sync error for product:", syncError);
          toast.error("Product created on-chain but metadata sync failed: " + syncError.message);
        }

        if (inserted) {
          const newProduct: VendorProduct = {
            id: inserted.id,
            productIdOnchain,
            venueId: inserted.venue_id,
            name: inserted.name,
            imageUrl: inserted.image_url,
            priceWei: inserted.price_wei,
            priceDisplay: inserted.price_display,
            availableUnits: inserted.available_units,
            isActive: inserted.is_active,
          };
          setProducts((prev) => [newProduct, ...prev]);
        }

        toast.success("Product added successfully!");
      } catch (err) {
        console.error("Failed to sync product:", err);
      }
    },
  });

  const editProductContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingEditRef.current;
      if (!pending) return;

      await supabase
        .from("shop_products")
        .update({
          name: pending.name,
          image_url: pending.imageURI || null,
          price_wei: pending.priceInWei.toString(),
          price_display: formatWire(pending.priceInWei),
        })
        .eq("id", pending.productId);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === pending.productId
            ? {
                ...p,
                name: pending.name,
                imageUrl: pending.imageURI || null,
                priceWei: pending.priceInWei.toString(),
                priceDisplay: formatWire(pending.priceInWei),
              }
            : p
        )
      );

      setEditingProduct(null);
      toast.success("Product updated!");
    },
  });

  const editInventoryContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingInventoryRef.current;
      if (!pending) return;

      await supabase
        .from("shop_products")
        .update({ available_units: pending.availableUnits })
        .eq("id", pending.productId);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === pending.productId
            ? { ...p, availableUnits: pending.availableUnits }
            : p
        )
      );

      setInventoryProduct(null);
      toast.success("Inventory updated!");
    },
  });

  const updateVenueLocationContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingVenueLocationRef.current;
      if (!pending) return;

      await supabase
        .from("shop_venues")
        .update({ location_in_venue: pending.newLocation })
        .eq("shop_id", pending.shopUUID)
        .eq("venue_id", pending.venueUUID);

      setVendorShop((prev) =>
        prev
          ? {
              ...prev,
              venues: prev.venues.map((v) =>
                v.venueIdOnchain === pending.venueIdOnchain
                  ? { ...v, locationInVenue: pending.newLocation }
                  : v
              ),
            }
          : prev
      );

      toast.success("Venue location updated!");
    },
  });

  const addVenueToShopContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingAddVenueRef.current;
      if (!pending) return;

      await supabase.from("shop_venues").insert({
        shop_id: pending.shopUUID,
        venue_id: pending.venueUUID,
        location_in_venue: pending.location || null,
      });

      setVendorShop((prev) =>
        prev
          ? {
              ...prev,
              venues: [
                ...prev.venues,
                {
                  venueId: pending.venueUUID,
                  venueIdOnchain: pending.venueIdOnchain,
                  name: pending.venueName,
                  city: pending.venueCity,
                  locationInVenue: pending.location || null,
                },
              ],
            }
          : prev
      );

      toast.success("Venue added to your shop!");
    },
  });

  const toggleProductContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingToggleProductRef.current;
      if (!pending) return;

      const newActive = !pending.currentlyActive;

      await supabase
        .from("shop_products")
        .update({ is_active: newActive })
        .eq("id", pending.productId);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === pending.productId ? { ...p, isActive: newActive } : p
        )
      );

      toast.success(newActive ? "Product activated." : "Product deactivated.");
    },
  });

  const toggleShopContract = useContractWrite({
    onSuccess: async () => {
      if (!vendorShop) return;
      const newActive = !vendorShop.isActive;

      await supabase
        .from("shops")
        .update({ is_active: newActive })
        .eq("id", vendorShop.id);

      setVendorShop((prev) =>
        prev ? { ...prev, isActive: newActive } : prev
      );
      toast.success(newActive ? "Shop is now active." : "Shop is now inactive.");
    },
  });

  const confirmCollectionContract = useContractWrite({
    onSuccess: async () => {
      const orderIdOnchain = confirmCollectionPendingId.current;

      await supabase
        .from("shop_orders")
        .update({ status: "COLLECTED" })
        .eq("order_id_onchain", orderIdOnchain);

      setOrders((prev) =>
        prev.map((o) =>
          o.orderIdOnchain === orderIdOnchain
            ? { ...o, status: "COLLECTED" as const }
            : o
        )
      );
    },
  });

  const withdrawContract = useContractWrite({
    onSuccess: async () => {
      await refetchShopBalance();
    },
  });

  const removeVenueContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingRemoveVenueRef.current;
      if (!pending) return;
      await supabase
        .from("shop_venues")
        .delete()
        .eq("shop_id", pending.shopUUID)
        .eq("venue_id", pending.venueUUID);
      setVendorShop((prev) =>
        prev
          ? { ...prev, venues: prev.venues.filter((v) => v.venueIdOnchain !== pending.venueIdOnchain) }
          : prev
      );
      toast.success("Venue removed from shop.");
    },
  });

  const vendorCancelOrderContract = useContractWrite({
    onSuccess: async () => {
      const orderIdOnchain = vendorCancelOrderPendingId.current;
      await supabase
        .from("shop_orders")
        .update({ status: "CANCELLED" })
        .eq("order_id_onchain", orderIdOnchain);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderIdOnchain === orderIdOnchain ? { ...o, status: "CANCELLED" as const } : o
        )
      );
      toast.success("Order cancelled and buyer refunded.");
    },
  });

  const editShopContract = useContractWrite({
    onSuccess: async () => {
      const pending = pendingEditShopRef.current;
      if (!pending || !vendorShop) return;

      await supabase
        .from("shops")
        .update({
          name: pending.name,
          description: pending.description || null,
          image_url: pending.imageURI || null,
        })
        .eq("id", vendorShop.id);

      setVendorShop((prev) =>
        prev
          ? {
              ...prev,
              name: pending.name,
              description: pending.description || null,
              imageUrl: pending.imageURI || null,
            }
          : prev
      );
      toast.success("Shop updated on-chain and in database!");
    },
  });

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchVendorData = useCallback(async () => {
    if (!address) return;
    setLoading(true);

    // 1. Fetch all active venues (for register modal)
    const { data: venuesData } = await supabase
      .from("venues")
      .select("id, venue_id_onchain, name, city")
      .eq("is_active", true);

    setAllVenues(
      ((venuesData as any[]) || []).map((v) => ({
        id: v.id,
        venueIdOnchain: v.venue_id_onchain,
        name: v.name,
        city: v.city,
      }))
    );

    // 2. Fetch vendor's shop (no nested join — avoids PostgREST inner-join filtering)
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select(
        "id, shop_id_onchain, name, description, image_url, is_approved, is_active, rejection_reason"
      )
      .eq("owner_address", address.toLowerCase())
      .single();

    if (shopError || !shopData) {
      setVendorShop(null);
      setProducts([]);
      setOrders([]);
      setLoading(false);
      return;
    }

    // 2b. Get venue IDs from the contract (authoritative, no RLS concerns),
    //     then enrich with name/city/UUID from the venues table.
    let shopVenues: VendorShop["venues"] = [];

    if (shopData.shop_id_onchain && publicClient) {
      try {
        const onchainVenueIds = await publicClient.readContract({
          address: CONTRACTS.stadiumShop,
          abi: stadiumShopAbi,
          functionName: "getShopVenues",
          args: [BigInt(shopData.shop_id_onchain)],
        }) as bigint[];

        if (onchainVenueIds.length > 0) {
          // Get location + isActive for each venue from the contract
          const venueStructs = await Promise.all(
            onchainVenueIds.map((venueId) =>
              publicClient.readContract({
                address: CONTRACTS.stadiumShop,
                abi: stadiumShopAbi,
                functionName: "shopVenues",
                args: [BigInt(shopData.shop_id_onchain), venueId],
              })
            )
          );

          // Fetch venue metadata (UUID, name, city) from Supabase
          const venueIdsOnchainNums = onchainVenueIds.map(Number);
          const { data: venueDetails } = await supabase
            .from("venues")
            .select("id, venue_id_onchain, name, city")
            .in("venue_id_onchain", venueIdsOnchainNums);

          const venueMap = new Map(
            ((venueDetails as any[]) || []).map((v: any) => [
              v.venue_id_onchain as number,
              { id: v.id as string, name: v.name as string, city: v.city as string },
            ])
          );

          shopVenues = onchainVenueIds
            .map((venueId, i) => {
              const struct = venueStructs[i] as any;
              const v = venueMap.get(Number(venueId));
              return {
                venueId: v?.id ?? "",
                venueIdOnchain: Number(venueId),
                name: v?.name ?? "",
                city: v?.city ?? "",
                locationInVenue: struct?.locationInVenue || null,
              };
            })
            .filter((_, i) => (venueStructs[i] as any)?.isActive !== false);
        }
      } catch (err) {
        console.error("[fetchVendorData] Failed to read venues from contract:", err);
      }
    }

    const shop: VendorShop = {
      id: shopData.id,
      shopIdOnchain: shopData.shop_id_onchain,
      name: shopData.name,
      description: shopData.description,
      imageUrl: shopData.image_url,
      isApproved: shopData.is_approved,
      isActive: shopData.is_active,
      rejectionReason: shopData.rejection_reason,
      venues: shopVenues,
    };

    setVendorShop(shop);

    // 3. Fetch products
    const { data: productsData } = await supabase
      .from("shop_products")
      .select(
        "id, product_id_onchain, venue_id, name, image_url, price_wei, price_display, available_units, is_active"
      )
      .eq("shop_id", shopData.id)
      .order("created_at", { ascending: false });

    setProducts(
      ((productsData as any[]) || []).map((p) => ({
        id: p.id,
        productIdOnchain: p.product_id_onchain,
        venueId: p.venue_id,
        name: p.name,
        imageUrl: p.image_url,
        priceWei: p.price_wei,
        priceDisplay: p.price_display,
        availableUnits: p.available_units,
        isActive: p.is_active,
      }))
    );

    // 4. Fetch orders
    const { data: ordersData } = await supabase
      .from("shop_orders")
      .select(
        "id, order_id_onchain, quantity, total_paid_wei, buyer_address, ticket_token_id, venue_id, status, created_at, shop_products(name, image_url)"
      )
      .eq("shop_id", shopData.id)
      .order("created_at", { ascending: false });

    const rawOrders = (ordersData as any[]) || [];

    // Batch-fetch tickets, events, venues for enriched display
    const ticketTokenIds = [...new Set(rawOrders.map((o: any) => o.ticket_token_id).filter(Boolean))];
    const venueIds = [...new Set(rawOrders.map((o: any) => o.venue_id).filter(Boolean))];

    const [ticketsRes, venuesRes] = await Promise.all([
      ticketTokenIds.length > 0
        ? supabase.from("tickets").select("token_id, row_label, seat_number, event_id, enclosures(name)").in("token_id", ticketTokenIds)
        : { data: [] },
      venueIds.length > 0
        ? supabase.from("venues").select("id, name").in("id", venueIds)
        : { data: [] },
    ]);

    const ticketsMap: Record<number, any> = {};
    for (const t of (ticketsRes.data as any[]) || []) ticketsMap[t.token_id] = t;

    const venuesMap: Record<string, any> = {};
    for (const v of (venuesRes.data as any[]) || []) venuesMap[v.id] = v;

    const eventIds = [...new Set((ticketsRes.data as any[] || []).map((t: any) => t.event_id).filter(Boolean))];
    const eventsRes = eventIds.length > 0
      ? await supabase.from("events").select("id, match_title, start_time").in("id", eventIds)
      : { data: [] };

    const eventsMap: Record<string, any> = {};
    for (const e of (eventsRes.data as any[]) || []) eventsMap[e.id] = e;

    setOrders(
      rawOrders.map((o: any) => {
        const product = Array.isArray(o.shop_products) ? o.shop_products[0] : o.shop_products;
        const ticket = ticketsMap[o.ticket_token_id];
        const ticketLabel = ticket
          ? `${ticket.enclosures?.name ?? "Enclosure"} · Row ${ticket.row_label} · Seat ${ticket.seat_number}`
          : `Ticket #${String(o.ticket_token_id).padStart(4, "0")}`;
        const event = ticket ? eventsMap[ticket.event_id] : null;
        const venue = venuesMap[o.venue_id];
        return {
          id: o.id,
          orderIdOnchain: o.order_id_onchain,
          productName: product?.name ?? "Product",
          productImageUrl: product?.image_url ?? null,
          buyerAddress: o.buyer_address,
          ticketLabel,
          matchTitle: event?.match_title ?? null,
          matchTime: event?.start_time ?? null,
          venueName: venue?.name ?? null,
          quantity: o.quantity,
          totalPaidWei: o.total_paid_wei,
          status: o.status,
          createdAt: o.created_at,
        };
      })
    );

    // 5. Per-event earnings breakdown via ticket → event join
    const tokenIds = [...new Set(rawOrders.map((o: any) => o.ticket_token_id as number))];

    if (tokenIds.length > 0) {
      const { data: ticketsData } = await supabase
        .from("tickets")
        .select("token_id, event_id, events(id, match_title, start_time)")
        .in("token_id", tokenIds);

      if (ticketsData) {
        const tokenEventMap: Record<number, { eventId: string; eventTitle: string; startTime: string | null }> = {};
        for (const t of ticketsData as any[]) {
          const evt = Array.isArray(t.events) ? t.events[0] : t.events;
          tokenEventMap[t.token_id] = {
            eventId: t.event_id,
            eventTitle: evt?.match_title ?? "Unknown Event",
            startTime: evt?.start_time ?? null,
          };
        }

        const eventMap: Record<string, EventEarning> = {};
        for (const o of rawOrders) {
          const info = tokenEventMap[o.ticket_token_id];
          if (!info) continue;
          if (!eventMap[info.eventId]) {
            eventMap[info.eventId] = {
              eventId: info.eventId,
              eventTitle: info.eventTitle,
              startTime: info.startTime,
              totalRevenueWei: "0",
              orderCount: 0,
              activeCount: 0,
              confirmedCount: 0,
              collectedCount: 0,
              cancelledCount: 0,
            };
          }
          const ev = eventMap[info.eventId];
          ev.totalRevenueWei = (BigInt(ev.totalRevenueWei) + BigInt(o.total_paid_wei)).toString();
          ev.orderCount++;
          if (o.status === "ACTIVE")     ev.activeCount++;
          else if (o.status === "CONFIRMED") ev.confirmedCount++;
          else if (o.status === "COLLECTED") ev.collectedCount++;
          else                              ev.cancelledCount++;
        }

        setEventEarnings(
          Object.values(eventMap).sort((a, b) =>
            (b.startTime ?? "") > (a.startTime ?? "") ? 1 : -1
          )
        );
      }
    } else {
      setEventEarnings([]);
    }

    setLoading(false);
  }, [address, publicClient]);

  useEffect(() => {
    if (!address) {
      setVendorShop(null);
      setProducts([]);
      setOrders([]);
      return;
    }
    fetchVendorData();
  }, [address, fetchVendorData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Called when user clicks "Register Your Shop" button
  const handleOpenRegisterFlow = () => {
    if (!hasProfile) {
      setShowCreateProfileModal(true);
    } else {
      setShowRegisterModal(true);
    }
  };

  const handleCreateProfile = async (data: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    profileHash: `0x${string}`;
  }) => {
    pendingProfileRef.current = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      city: data.city,
    };
    setShowCreateProfileModal(false);
    setTxAction("createProfile");
    setShowTxModal(true);

    try {
      await createProfileContract.execute({
        address: CONTRACTS.userProfile,
        abi: userProfileAbi,
        functionName: "setProfileHash",
        args: [data.profileHash],
      });
    } catch {
      // Error stored in createProfileContract.errorMessage
    }
  };

  const handleRegister = async (data: {
    name: string;
    description: string;
    imageURI: string;
    venueIds: number[];
    venueUUIDs: string[];
    locations: string[];
  }) => {
    setShowRegisterModal(false);
    setTxAction("register");
    setShowTxModal(true);

    try {
      const hash = await registerContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "registerShop",
        args: [
          data.name,
          data.description,
          data.imageURI,
          data.venueIds.map(BigInt),
          data.locations,
        ],
      });

      // ── Sync to Supabase (all data is in scope, no closures) ──
      if (!hash || !address || !publicClient) return;

      const receipt = await publicClient.getTransactionReceipt({
        hash: hash as `0x${string}`,
      });
      const logs = parseEventLogs({
        abi: stadiumShopAbi,
        eventName: "ShopRegistered",
        logs: receipt.logs,
      });

      if (logs.length === 0) {
        console.error("No ShopRegistered event found in receipt");
        return;
      }

      const shopIdOnchain = Number(logs[0].args.shopId);

      // Upsert shop row (handles re-registration gracefully)
      const { data: upserted, error } = await supabase
        .from("shops")
        .upsert(
          {
            shop_id_onchain: shopIdOnchain,
            owner_address: address.toLowerCase(),
            name: data.name,
            description: data.description || null,
            image_url: data.imageURI || null,
            is_approved: false,
            is_active: true,
          },
          { onConflict: "shop_id_onchain" }
        )
        .select("id")
        .single();

      if (error || !upserted) {
        console.error("Failed to upsert shop:", error);
        return;
      }

      // Replace venues: delete old then insert fresh
      await supabase.from("shop_venues").delete().eq("shop_id", upserted.id);

      for (let i = 0; i < data.venueUUIDs.length; i++) {
        const { error: svError } = await supabase.from("shop_venues").insert({
          shop_id: upserted.id,
          venue_id: data.venueUUIDs[i],
          location_in_venue: data.locations[i] || null,
        });
        if (svError) {
          console.error("Failed to insert shop_venue:", svError, {
            shopId: upserted.id,
            venueUUID: data.venueUUIDs[i],
          });
          toast.error(`Failed to save venue: ${svError.message}`);
        }
      }

      await fetchVendorData();

      // Safety net: if the contract read in fetchVendorData hasn't picked up the
      // new venues yet (e.g. slight propagation delay on a local testnet), restore
      // them directly from the known registration data so the UI isn't left empty.
      setVendorShop((prev) => {
        if (!prev || prev.venues.length > 0) return prev;
        return {
          ...prev,
          venues: data.venueUUIDs.map((uuid, i) => {
            const v = allVenues.find((av) => av.id === uuid);
            return {
              venueId: uuid,
              venueIdOnchain: v?.venueIdOnchain ?? 0,
              name: v?.name ?? "",
              city: v?.city ?? "",
              locationInVenue: data.locations[i] || null,
            };
          }),
        };
      });

      toast.success("Shop registered! Pending admin approval.");
    } catch {
      // Error stored in registerContract.errorMessage
    }
  };

  const handleAddProduct = async (data: {
    venueId: number;
    name: string;
    imageURI: string;
    priceInWire: string;
    availableUnits: number;
  }) => {
    const priceInWei = parseEther(data.priceInWire);
    const venueUUID =
      vendorShop?.venues.find((v) => v.venueIdOnchain === data.venueId)
        ?.venueId ?? "";

    pendingProductRef.current = {
      venueId: venueUUID,
      venueIdOnchain: data.venueId,
      name: data.name,
      imageURI: data.imageURI,
      priceInWei,
      availableUnits: data.availableUnits,
    };

    setShowAddProductModal(false);
    setTxAction("addProduct");
    setShowTxModal(true);

    try {
      await addProductContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "addProduct",
        args: [
          BigInt(data.venueId),
          data.name,
          data.imageURI,
          priceInWei,
          BigInt(data.availableUnits),
        ],
      });
    } catch {
      // Error stored in addProductContract.errorMessage
    }
  };

  const handleEditProduct = async (data: {
    venueId: number; // unused in edit mode
    name: string;
    imageURI: string;
    priceInWire: string;
    availableUnits: number; // unused in edit mode
  }) => {
    if (!editingProduct) return;

    const priceInWei = parseEther(data.priceInWire);

    const noChange =
      data.name.trim() === editingProduct.name &&
      (data.imageURI || null) === editingProduct.imageUrl &&
      priceInWei.toString() === editingProduct.priceWei;

    if (noChange) {
      setShowAddProductModal(false);
      setEditingProduct(null);
      toast.info("No changes detected.");
      return;
    }

    pendingEditRef.current = {
      productId: editingProduct.id,
      productIdOnchain: editingProduct.productIdOnchain,
      name: data.name.trim(),
      imageURI: data.imageURI,
      priceInWei,
    };

    setShowAddProductModal(false);
    setTxAction("editProduct");
    setShowTxModal(true);

    try {
      await editProductContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "updateProduct",
        args: [
          BigInt(editingProduct.productIdOnchain),
          data.name.trim(),
          data.imageURI,
          priceInWei,
        ],
      });
    } catch {
      // error shown in modal
    }
  };

  const handleUpdateInventory = async (units: number) => {
    if (!inventoryProduct) return;

    if (units === inventoryProduct.availableUnits) {
      setShowEditInventoryModal(false);
      setInventoryProduct(null);
      toast.info("No changes detected.");
      return;
    }

    pendingInventoryRef.current = {
      productId: inventoryProduct.id,
      productIdOnchain: inventoryProduct.productIdOnchain,
      availableUnits: units,
    };

    setShowEditInventoryModal(false);
    setTxAction("editInventory");
    setShowTxModal(true);

    try {
      await editInventoryContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "updateInventory",
        args: [BigInt(inventoryProduct.productIdOnchain), BigInt(units)],
      });
    } catch {
      // error shown in modal
    }
  };

  const handleEditShop = async (data: { name: string; description: string; imageURI: string }) => {
    if (!vendorShop) return;
    setShowEditShopModal(false);

    const detailsChanged =
      data.name !== vendorShop.name ||
      (data.description || null) !== vendorShop.description ||
      (data.imageURI || null) !== vendorShop.imageUrl;

    if (!detailsChanged) {
      toast.info("No changes detected.");
      return;
    }

    pendingEditShopRef.current = {
      name: data.name,
      description: data.description,
      imageURI: data.imageURI,
    };
    setTxAction("editShop");
    setShowTxModal(true);

    try {
      await editShopContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "updateShop",
        args: [data.name, data.description, data.imageURI],
      });
    } catch {
      // error shown in modal
    }
  };

  const handleAddVenue = async (data: {
    venueIdOnchain: number;
    venueUUID: string;
    location: string;
  }) => {
    if (!vendorShop) return;

    const venueInfo = allVenues.find((v) => v.venueIdOnchain === data.venueIdOnchain);
    if (!venueInfo) return;

    pendingAddVenueRef.current = {
      shopUUID: vendorShop.id,
      shopIdOnchain: vendorShop.shopIdOnchain,
      venueUUID: data.venueUUID,
      venueIdOnchain: data.venueIdOnchain,
      venueName: venueInfo.name,
      venueCity: venueInfo.city,
      location: data.location,
    };

    setShowAddVenueModal(false);
    setTxAction("addVenueToShop");
    setShowTxModal(true);

    try {
      await addVenueToShopContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "addVenueToShop",
        args: [
          BigInt(vendorShop.shopIdOnchain),
          BigInt(data.venueIdOnchain),
          data.location,
        ],
      });
    } catch {
      // error shown in modal
    }
  };

  const handleToggleProduct = async (product: VendorProduct) => {
    pendingToggleProductRef.current = {
      productId: product.id,
      productIdOnchain: product.productIdOnchain,
      currentlyActive: product.isActive,
    };
    setTxAction("toggleProduct");
    setShowTxModal(true);
    try {
      await toggleProductContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "toggleProductActive",
        args: [BigInt(product.productIdOnchain)],
      });
    } catch {
      // error shown in modal
    }
  };

  const handleToggleShop = async () => {
    preToggleActiveRef.current = vendorShop?.isActive ?? false;
    setTxAction("toggleShop");
    setShowTxModal(true);
    try {
      await toggleShopContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "toggleShopActive",
        args: [],
      });
    } catch {
      // Error stored in toggleShopContract.errorMessage
    }
  };

  const handleConfirmCollection = async (orderIdOnchain: number) => {
    confirmCollectionPendingId.current = orderIdOnchain;
    setTxAction("confirmCollection");
    setShowTxModal(true);
    try {
      await confirmCollectionContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "confirmCollection",
        args: [BigInt(orderIdOnchain)],
      });
    } catch {
      // Error stored in confirmCollectionContract.errorMessage
    }
  };

  const handleWithdraw = async (confirmedWei: bigint) => {
    if (!vendorShop?.shopIdOnchain || confirmedWei <= 0n) return;
    setTxAction("withdraw");
    setShowTxModal(true);
    try {
      await withdrawContract.execute({
        address: CONTRACTS.vault,
        abi: wicketChainVaultAbi,
        functionName: "withdrawShopEarnings",
        args: [BigInt(vendorShop.shopIdOnchain), confirmedWei],
      });
    } catch {
      // Error stored in withdrawContract.errorMessage
    }
  };

  // Gap 5: Remove venue from shop
  const handleRemoveVenue = async (venueIdOnchain: number, venueUUID: string) => {
    if (!vendorShop) return;
    pendingRemoveVenueRef.current = { shopUUID: vendorShop.id, venueIdOnchain, venueUUID };
    setTxAction("removeVenue");
    setShowTxModal(true);
    try {
      await removeVenueContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "removeVenueFromShop",
        args: [BigInt(venueIdOnchain)],
      });
    } catch {}
  };

  const handleUpdateVenueLocation = async (
    venueIdOnchain: number,
    venueUUID: string,
    newLocation: string
  ) => {
    if (!vendorShop) return;
    pendingVenueLocationRef.current = {
      shopUUID: vendorShop.id,
      venueUUID,
      venueIdOnchain,
      newLocation,
    };
    setShowAddVenueModal(false);
    setTxAction("updateVenueLocation");
    setShowTxModal(true);
    try {
      await updateVenueLocationContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "updateVenueLocation",
        args: [BigInt(vendorShop.shopIdOnchain), BigInt(venueIdOnchain), newLocation],
      });
    } catch {}
  };

  // Gap 6: Vendor cancel active order
  const handleVendorCancelOrder = async (orderIdOnchain: number) => {
    vendorCancelOrderPendingId.current = orderIdOnchain;
    setTxAction("vendorCancelOrder");
    setShowTxModal(true);
    try {
      await vendorCancelOrderContract.execute({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi,
        functionName: "vendorCancelOrder",
        args: [BigInt(orderIdOnchain)],
      });
    } catch {}
  };

  // ── Active tx contract (for modal step/hash/error) ────────────────────────

  const activeTxContract = (() => {
    switch (txAction) {
      case "createProfile":
        return createProfileContract;
      case "register":
        return registerContract;
      case "addProduct":
        return addProductContract;
      case "editProduct":
        return editProductContract;
      case "editInventory":
        return editInventoryContract;
      case "toggleShop":
        return toggleShopContract;
      case "confirmCollection":
        return confirmCollectionContract;
      case "toggleProduct":
        return toggleProductContract;
      case "updateVenueLocation":
        return updateVenueLocationContract;
      case "addVenueToShop":
        return addVenueToShopContract;
      case "withdraw":
        return withdrawContract;
      case "removeVenue":
        return removeVenueContract;
      case "vendorCancelOrder":
        return vendorCancelOrderContract;
      case "editShop":
        return editShopContract;
    }
  })();

  const txModalCopy = (() => {
    switch (txAction) {
      case "createProfile":
        return {
          successTitle: "Profile Created!",
          successDescription: "Your on-chain profile is verified. Opening shop registration…",
        };
      case "register":
        return {
          successTitle: "Shop Registered!",
          successDescription:
            "Your shop has been submitted for admin approval.",
        };
      case "addProduct":
        return {
          successTitle: "Product Added!",
          successDescription: "Your product is now live in your shop.",
        };
      case "editProduct":
        return {
          successTitle: "Product Updated!",
          successDescription: "Product details have been saved.",
        };
      case "editInventory":
        return {
          successTitle: "Product Updated!",
          successDescription: "Inventory has been updated.",
        };
      case "toggleShop":
        return {
          successTitle: "Shop Updated!",
          // preToggleActiveRef holds the state BEFORE the toggle fired
          successDescription: preToggleActiveRef.current
            ? "Your shop has been deactivated."
            : "Your shop is now active.",
        };
      case "confirmCollection":
        return {
          successTitle: "Collection Confirmed!",
          successDescription: "Order marked as collected on-chain.",
        };
      case "toggleProduct":
        return {
          successTitle: pendingToggleProductRef.current?.currentlyActive
            ? "Product Deactivated!"
            : "Product Activated!",
          successDescription: pendingToggleProductRef.current?.currentlyActive
            ? "This product is now hidden from your shop."
            : "This product is now visible in your shop.",
        };
      case "updateVenueLocation":
        return {
          successTitle: "Location Updated!",
          successDescription: "Your venue location has been saved on-chain.",
        };
      case "addVenueToShop":
        return {
          successTitle: "Venue Added!",
          successDescription: "Your shop is now active at the new venue.",
        };
      case "withdraw":
        return {
          successTitle: "Withdrawal Successful!",
          successDescription: "Your confirmed earnings have been sent to your wallet.",
        };
      case "removeVenue":
        return {
          successTitle: "Venue Removed!",
          successDescription: "Your shop is no longer active at this venue.",
        };
      case "vendorCancelOrder":
        return {
          successTitle: "Order Cancelled!",
          successDescription: "The order has been cancelled and the buyer refunded on-chain.",
        };
      case "editShop":
        return {
          successTitle: "Shop Updated!",
          successDescription: "Your shop details have been updated on-chain.",
        };
    }
  })();

  // ── Order filtering ───────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    switch (orderSubTab) {
      case "active":
        return orders.filter((o) => o.status === "ACTIVE");
      case "confirmed":
        return orders.filter((o) => o.status === "CONFIRMED");
      case "collected":
        return orders.filter((o) => o.status === "COLLECTED");
      default:
        return orders;
    }
  }, [orders, orderSubTab]);

  // ── Render ────────────────────────────────────────────────────────────────

  // Not connected
  if (!isConnected) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 mx-auto">
          <Wallet size={28} className="text-white/20" />
        </div>
        <h2 className="text-lg font-semibold text-white/70 mb-1">
          Connect your wallet
        </h2>
        <p className="text-sm text-white/40 mb-6">
          Connect your wallet to access the vendor dashboard.
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#56a963]/10 flex items-center justify-center shrink-0">
            <Store size={20} className="text-[#56a963]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Vendor Dashboard</h1>
            <p className="text-sm text-white/40">
              Manage your stadium shop, products &amp; orders
            </p>
          </div>
        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="h-32 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        </div>
      )}

      {/* Rejected shop */}
      {!loading && vendorShop && vendorShop.rejectionReason && (
        <div className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5 mx-auto">
            <X size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold font-heading mb-2 text-white">
            Shop Application Rejected
          </h2>
          <p className="text-sm text-white/40 max-w-sm mx-auto mb-3">
            Your shop registration was reviewed and could not be approved.
          </p>
          <p className="text-sm text-red-400/80 max-w-sm mx-auto mb-6">
            <span className="font-semibold text-red-400">Reason: </span>
            {vendorShop.rejectionReason}
          </p>
          <p className="text-xs text-white/20 max-w-xs mx-auto">
            Each wallet can only register one shop. This wallet is no longer eligible to open a shop. Please contact support if you believe this is an error.
          </p>
        </div>
      )}

      {/* No shop yet */}
      {!loading && vendorShop === null && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#56a963]/10 flex items-center justify-center mb-5 mx-auto">
            <Store size={32} className="text-[#56a963]" />
          </div>
          <h2 className="text-xl font-bold font-heading mb-2">
            Start Selling at the Stadium
          </h2>
          <p className="text-sm text-white/40 max-w-sm mx-auto mb-8">
            Register your shop to sell products to cricket fans. Your shop will be reviewed by admins before going live.
          </p>
          <button
            onClick={handleOpenRegisterFlow}
            className="px-6 py-3 rounded-xl font-bold text-[#002a0c] text-sm"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)",
            }}
          >
            Register Your Shop
          </button>
        </div>
      )}

      {/* Pending approval */}
      {!loading && vendorShop && !vendorShop.isApproved && !vendorShop.rejectionReason && (
        <>
          {/* Amber banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-amber-400">
            <Clock size={18} className="shrink-0" />
            <p className="text-sm">
              Your shop is pending admin approval. You can add products once
              approved.
            </p>
          </div>

          {/* Shop info (read-only) */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              {vendorShop.imageUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={vendorShop.imageUrl}
                    alt={vendorShop.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Store size={24} className="text-white/20" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold">{vendorShop.name}</h2>
                {vendorShop.description && (
                  <ExpandableDescription
                    text={vendorShop.description}
                    className="text-sm text-white/40 mt-1"
                  />
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {vendorShop.venues.map((v, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50"
                    >
                      <MapPin size={10} className="text-[#56a963] shrink-0" />
                      {v.name}, {v.city}
                      {v.locationInVenue && (
                        <span className="text-white/30"> · {v.locationInVenue}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Approved shop view */}
      {!loading && vendorShop && vendorShop.isApproved && (
        <>
          {/* Shop info header card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6">
            {/* Top row: status badge (left) + toggle (right) */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  vendorShop.isActive
                    ? "bg-[rgba(0,109,66,0.3)] text-[#77f5af]"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {vendorShop.isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={handleToggleShop}
                className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                  vendorShop.isActive
                    ? "border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                    : "border-[#56a963]/20 text-[#77f5af]/60 hover:bg-[#56a963]/10 hover:text-[#77f5af]"
                }`}
              >
                {vendorShop.isActive ? (
                  <ToggleRight size={13} />
                ) : (
                  <ToggleLeft size={13} />
                )}
                {vendorShop.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>

            {/* Shop image + info */}
            <div className="flex items-start gap-4">
              {vendorShop.imageUrl ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={vendorShop.imageUrl}
                    alt={vendorShop.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Store size={22} className="text-white/20" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold truncate">{vendorShop.name}</p>
                {vendorShop.description && (
                  <ExpandableDescription
                    text={vendorShop.description}
                    className="text-sm text-white/40 mt-0.5"
                  />
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vendorShop.venues.map((v, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-white/50"
                    >
                      {v.name}, {v.city}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setShowEditShopModal(true)}
                    className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <Settings size={12} />
                    Edit Shop
                  </button>
                  <button
                    onClick={() => setShowAddVenueModal(true)}
                    className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <MapPin size={12} />
                    Manage Venues
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main tabs */}
          <div className="overflow-x-auto mb-8">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 w-fit max-[349px]:scale-[0.8] max-[349px]:origin-left">
            {(["products", "orders", "earnings"] as MainTab[]).map((tab) => {
              const isActive = activeTab === tab;
              const count =
                tab === "products" ? products.length :
                tab === "orders" ? orders.length : 0;
              const label =
                tab === "products" ? "Products" :
                tab === "orders" ? "Orders" : "Earnings";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
                    ${isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"}
                  `}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#56a963] text-white"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          </div>

          {/* Products tab */}
          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-white/40">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[#002a0c] text-sm"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)",
                  }}
                >
                  <Plus size={15} />
                  Add Product
                </button>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-2.5"
                    >
                      {/* Top row: status badge (left) + toggle (right) */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            product.isActive
                              ? "bg-[rgba(0,109,66,0.3)] text-[#77f5af]"
                              : "bg-white/5 text-white/30"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => handleToggleProduct(product)}
                          className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                            product.isActive
                              ? "border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                              : "border-[#56a963]/20 text-[#77f5af]/60 hover:bg-[#56a963]/10 hover:text-[#77f5af]"
                          }`}
                        >
                          {product.isActive ? (
                            <ToggleRight size={13} />
                          ) : (
                            <ToggleLeft size={13} />
                          )}
                          {product.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>

                      {/* Image + details row */}
                      <div className="flex gap-3">
                        {product.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-white/20" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {product.priceDisplay ??
                              `${Number(BigInt(product.priceWei)) / 1e18} WIRE`}
                          </p>
                          <p className="text-xs text-white/40">
                            {product.availableUnits} units
                          </p>
                          {(() => {
                            const venue = vendorShop.venues.find((v) => v.venueId === product.venueId);
                            return venue ? (
                              <p className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {venue.name}, {venue.city}
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowAddProductModal(true);
                          }}
                          className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setInventoryProduct(product);
                            setShowEditInventoryModal(true);
                          }}
                          className="flex items-center gap-1.5 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <Boxes size={12} />
                          Inventory
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Package size={20} className="text-white/20" />
                  </div>
                  <p className="text-sm text-white/40">
                    No products yet. Add your first product to start selling.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Orders tab */}
          {activeTab === "orders" && (
            <div>
              {/* Sub-tabs */}
              <div className="overflow-x-auto mb-6">
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 w-fit">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "confirmed", label: "Confirmed" },
                    { key: "collected", label: "Collected" },
                  ] as { key: OrderSubTab; label: string }[]
                ).map(({ key, label }) => {
                  const isActive = orderSubTab === key;
                  const count =
                    key === "all"
                      ? orders.length
                      : orders.filter((o) => o.status === key.toUpperCase())
                          .length;
                  return (
                    <button
                      key={key}
                      onClick={() => setOrderSubTab(key)}
                      className={`
                        flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
                        ${isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/40 hover:text-white/70"}
                      `}
                    >
                      {label}
                      {count > 0 && (
                        <span
                          className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-[#56a963] text-white"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id}>
                      <VendorOrderCard
                        orderId={order.id}
                        orderIdOnchain={order.orderIdOnchain}
                        productName={order.productName}
                        productImageUrl={order.productImageUrl}
                        buyerAddress={order.buyerAddress}
                        ticketLabel={order.ticketLabel}
                        matchTitle={order.matchTitle ?? ""}
                        matchTime={order.matchTime ?? ""}
                        venueName={order.venueName ?? ""}
                        quantity={order.quantity}
                        totalPaidWei={order.totalPaidWei}
                        status={order.status}
                        createdAt={order.createdAt}
                        canConfirmCollection={order.status === "CONFIRMED"}
                        onConfirmCollection={() =>
                          handleConfirmCollection(order.orderIdOnchain)
                        }
                        onCancelOrder={
                          order.status === "ACTIVE"
                            ? () => handleVendorCancelOrder(order.orderIdOnchain)
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <ShoppingBag size={20} className="text-white/20" />
                  </div>
                  <p className="text-sm text-white/40">
                    {orderSubTab === "all"
                      ? "No orders yet."
                      : `No ${orderSubTab} orders.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Earnings tab */}
          {activeTab === "earnings" && (() => {
            const bal = shopBalanceOnchain as { totalEarnings: bigint; pendingEarnings: bigint; confirmedEarnings: bigint; shopFeeDeducted: bigint; withdrawnAmount: bigint } | undefined;
            const fmt = (wei: bigint) =>
              parseFloat(formatEther(wei)).toFixed(8);
            const total     = bal?.totalEarnings    ?? 0n;
            const pending   = bal?.pendingEarnings  ?? 0n;
            const confirmed = bal?.confirmedEarnings ?? 0n; // cumulative confirmed (never decrements)
            const withdrawn = bal?.withdrawnAmount   ?? 0n; // cumulative withdrawn
            const fee       = bal?.shopFeeDeducted   ?? 0n;
            const available = confirmed > withdrawn ? confirmed - withdrawn : 0n; // actual withdrawable
            const cancelled = total > (pending + confirmed + fee)
              ? total - pending - confirmed - fee
              : 0n;
            const netTotal = total - cancelled;
            const pct = (n: bigint) =>
              total > 0n ? Number((n * 10000n) / total) / 100 : 0;
            const feePct = Number(shopFeeBps ?? 500n) / 100;

            return (
              <div>
                {/* 4 stat cards */}
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Total Earned",
                      value: fmt(netTotal),
                      icon: <CircleDollarSign size={16} className="text-white/50" />,
                      sub: "After refunds & cancellations",
                      color: "border-white/5",
                    },
                    {
                      label: "Pending",
                      value: fmt(pending),
                      icon: <Hourglass size={16} className="text-amber-400" />,
                      sub: "Awaiting confirmation",
                      color: "border-amber-500/10",
                    },
                    {
                      label: "Available",
                      value: fmt(available),
                      icon: <CheckCircle2 size={16} className="text-[#56a963]" />,
                      sub: "Ready to withdraw",
                      color: "border-[#56a963]/10",
                    },
                    {
                      label: "Withdrawn",
                      value: fmt(withdrawn),
                      icon: <ArrowUpRight size={16} className="text-blue-400" />,
                      sub: "Paid out",
                      color: "border-blue-500/10",
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className={`bg-white/[0.02] border ${card.color} rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
                        {card.icon}
                      </div>
                      <p className="text-lg font-bold font-heading text-white leading-none break-all">
                        {card.value}
                        <span className="text-xs font-normal text-white/30 ml-1">WIRE</span>
                      </p>
                      <p className="text-[11px] text-white/25 mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Withdraw CTA */}
                {available > 0n && (
                  <div className="flex items-center justify-between flex-wrap gap-3 bg-[#56a963]/5 border border-[#56a963]/15 rounded-xl px-5 py-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {fmt(available)} WIRE ready to withdraw
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Claim directly in your wallet
                      </p>
                    </div>
                    <button
                      onClick={() => handleWithdraw(available)}
                      disabled={withdrawContract.isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#002a0c] disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0 ml-4"
                      style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
                    >
                      <ArrowUpRight size={15} />
                      Withdraw
                    </button>
                  </div>
                )}

                {/* Breakdown bar */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp size={15} className="text-[#56a963]" />
                      Earnings Breakdown
                    </p>
                    <span className="text-xs text-white/40">
                      Platform fee: <span className="text-white/60 font-medium">{feePct}%</span>
                    </span>
                  </div>

                  {/* Stacked bar */}
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden flex mb-3">
                    {pending > 0n && (
                      <div
                        style={{ width: `${pct(pending)}%` }}
                        className="bg-amber-400/70 transition-all"
                      />
                    )}
                    {available > 0n && (
                      <div
                        style={{ width: `${pct(available)}%` }}
                        className="bg-[#56a963]/80 transition-all"
                      />
                    )}
                    {withdrawn > 0n && (
                      <div
                        style={{ width: `${pct(withdrawn)}%` }}
                        className="bg-blue-400/70 transition-all"
                      />
                    )}
                    {fee > 0n && (
                      <div
                        style={{ width: `${pct(fee)}%` }}
                        className="bg-white/20 transition-all"
                      />
                    )}
                    {cancelled > 0n && (
                      <div
                        style={{ width: `${pct(cancelled)}%` }}
                        className="bg-[#812b2a]/80 transition-all"
                      />
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-[11px]">
                    {[
                      { label: "Pending", pct: pct(pending), color: "bg-amber-400/70" },
                      { label: "Available", pct: pct(available), color: "bg-[#56a963]/80" },
                      { label: "Withdrawn", pct: pct(withdrawn), color: "bg-blue-400/70" },
                      { label: "Cancelled/Refunded", pct: pct(cancelled), color: "bg-[#812b2a]/80" },
                      { label: "Platform Fee", pct: pct(fee), color: "bg-white/20", value: fmt(fee) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-1.5 text-white/40">
                        <span className={`w-2 h-2 rounded-sm ${item.color}`} />
                        {item.label}
                        <span className="text-white/20">
                          {item.value
                            ? `${item.value} WIRE`
                            : `${item.pct.toFixed(1)}%`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {withdrawn > 0n && (
                    <p className="text-[11px] text-white/25 mt-3 border-t border-white/5 pt-3">
                      Total paid out:{" "}
                      <span className="text-white/50 font-medium">{fmt(withdrawn)} WIRE</span>
                    </p>
                  )}
                </div>

                {/* Per-event breakdown */}
                {eventEarnings.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-4">Per-Event Breakdown</p>
                    <div className="space-y-3">
                      {eventEarnings.map((ev) => {
                        const evTotal = Number(formatEther(BigInt(ev.totalRevenueWei)));
                        const filled = ev.collectedCount + ev.confirmedCount;
                        const fillPct = ev.orderCount > 0 ? (filled / ev.orderCount) * 100 : 0;
                        return (
                          <div
                            key={ev.eventId}
                            className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{ev.eventTitle}</p>
                                {ev.startTime && (
                                  <p className="text-xs text-white/35 mt-0.5">
                                    {new Date(ev.startTime).toLocaleDateString("en-US", {
                                      month: "short", day: "numeric", year: "numeric",
                                    })}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-white break-all">
                                  {evTotal.toFixed(8)}
                                  <span className="text-xs font-normal text-white/30 ml-1">WIRE</span>
                                </p>
                                <p className="text-[11px] text-white/35">{ev.orderCount} order{ev.orderCount !== 1 ? "s" : ""}</p>
                              </div>
                            </div>

                            {/* Order status progress bar */}
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex mb-2">
                              {ev.collectedCount > 0 && (
                                <div
                                  style={{ width: `${(ev.collectedCount / ev.orderCount) * 100}%` }}
                                  className="bg-[#56a963]/80"
                                />
                              )}
                              {ev.confirmedCount > 0 && (
                                <div
                                  style={{ width: `${(ev.confirmedCount / ev.orderCount) * 100}%` }}
                                  className="bg-[#56a963]/40"
                                />
                              )}
                              {ev.activeCount > 0 && (
                                <div
                                  style={{ width: `${(ev.activeCount / ev.orderCount) * 100}%` }}
                                  className="bg-amber-400/50"
                                />
                              )}
                              {ev.cancelledCount > 0 && (
                                <div
                                  style={{ width: `${(ev.cancelledCount / ev.orderCount) * 100}%` }}
                                  className="bg-[#812b2a]/80"
                                />
                              )}
                            </div>

                            {/* Status counts */}
                            <div className="flex flex-wrap gap-3 text-[10px] text-white/35">
                              {ev.collectedCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-[#56a963]/80" />
                                  {ev.collectedCount} collected
                                </span>
                              )}
                              {ev.confirmedCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-[#56a963]/40" />
                                  {ev.confirmedCount} confirmed
                                </span>
                              )}
                              {ev.activeCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-amber-400/50" />
                                  {ev.activeCount} active
                                </span>
                              )}
                              {ev.cancelledCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-sm bg-[#812b2a]/80" />
                                  {ev.cancelledCount} cancelled/refunded
                                </span>
                              )}
                              <span className="ml-auto text-white/20">
                                {fillPct.toFixed(0)}% fulfilled
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {total === 0n && eventEarnings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <TrendingUp size={20} className="text-white/20" />
                    </div>
                    <p className="text-sm text-white/40">
                      No earnings yet. Earnings appear here once customers place orders.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}

      {/* Modals */}
      <CreateProfileModal
        open={showCreateProfileModal}
        onClose={() => setShowCreateProfileModal(false)}
        onConfirm={handleCreateProfile}
        walletAddress={address ?? ""}
        isLoading={createProfileContract.isLoading}
      />

      <RegisterShopModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={handleRegister}
        venues={allVenues}
        isLoading={registerContract.isLoading}
      />

      <AddProductModal
        open={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setEditingProduct(null);
        }}
        onSave={editingProduct ? handleEditProduct : handleAddProduct}
        shopVenues={
          vendorShop?.venues.map((v) => ({
            venueIdOnchain: v.venueIdOnchain,
            name: v.name,
            city: v.city,
          })) ?? []
        }
        isLoading={editingProduct ? editProductContract.isLoading : addProductContract.isLoading}
        editProduct={
          editingProduct
            ? {
                name: editingProduct.name,
                imageUrl: editingProduct.imageUrl,
                priceDisplay: editingProduct.priceDisplay,
                priceWei: editingProduct.priceWei,
                availableUnits: editingProduct.availableUnits,
              }
            : null
        }
      />

      {/* Edit Shop modal */}
      <EditShopModal
        open={showEditShopModal}
        onClose={() => setShowEditShopModal(false)}
        onSave={handleEditShop}
        isLoading={editShopContract.isLoading}
        currentShop={{
          name: vendorShop?.name ?? "",
          description: vendorShop?.description ?? null,
          imageUrl: vendorShop?.imageUrl ?? null,
        }}
      />

      {/* Manage Venues modal */}
      <ManageVenuesModal
        open={showAddVenueModal}
        onClose={() => setShowAddVenueModal(false)}
        onAddVenue={handleAddVenue}
        onRemoveVenue={handleRemoveVenue}
        onUpdateVenueLocation={handleUpdateVenueLocation}
        isAddLoading={addVenueToShopContract.isLoading}
        isRemoveLoading={removeVenueContract.isLoading}
        isUpdateLocationLoading={updateVenueLocationContract.isLoading}
        availableVenues={allVenues.filter(
          (v) => !vendorShop?.venues.some((sv) => sv.venueIdOnchain === v.venueIdOnchain)
        )}
        currentVenues={vendorShop?.venues ?? []}
      />

      {/* Edit Inventory modal */}
      <EditInventoryModal
        open={showEditInventoryModal}
        onClose={() => {
          setShowEditInventoryModal(false);
          setInventoryProduct(null);
        }}
        onSave={handleUpdateInventory}
        isLoading={editInventoryContract.isLoading}
        productName={inventoryProduct?.name ?? ""}
        currentUnits={inventoryProduct?.availableUnits ?? 0}
      />

      {/* Transaction progress modal */}
      <TransactionProgressModal
        open={showTxModal}
        onClose={() => {
          setShowTxModal(false);
          activeTxContract.reset();
          if (txAction === "editProduct") setEditingProduct(null);
          if (txAction === "editInventory") setInventoryProduct(null);
        }}
        step={activeTxContract.step}
        txHash={activeTxContract.txHash}
        errorMessage={activeTxContract.errorMessage}
        successTitle={txModalCopy.successTitle}
        successDescription={txModalCopy.successDescription}
      />
    </div>
  );
}
