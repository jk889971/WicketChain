"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useAccount, usePublicClient } from "wagmi";
import { parseEventLogs } from "viem";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { CONTRACTS } from "@/config/contracts";
import { stadiumShopAbi } from "@/lib/contracts/generated";
import { useContractWrite } from "@/hooks/useContractWrite";
import { CartDrawer, type CartItem, type EligibleTicket } from "@/components/shops/CartDrawer";
import { ConfirmShopPurchaseModal } from "@/components/shops/ConfirmShopPurchaseModal";
import { TransactionProgressModal } from "@/components/stadium/TransactionProgressModal";

// ── BigInt serialization for localStorage ────────────────────────────────────
type StoredCartItem = Omit<CartItem, "priceWei"> & { priceWei: string };

function serializeCart(cart: CartItem[]): StoredCartItem[] {
  return cart.map((i) => ({ ...i, priceWei: i.priceWei.toString() }));
}

function deserializeCart(stored: StoredCartItem[]): CartItem[] {
  const result: CartItem[] = [];
  for (const i of stored) {
    try {
      result.push({ ...i, priceWei: BigInt(i.priceWei) });
    } catch {
      console.warn("[CartContext] Skipping corrupt cart item:", i);
    }
  }
  return result;
}

// ── Context shape ─────────────────────────────────────────────────────────────
interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  toggleTicket: (productId: string, ticketTokenId: number) => void;
  clearCart: () => void;
  eligibleTickets: EligibleTicket[];
  purchaseSignal: number;
}

const CartContext = createContext<CartContextValue>({
  cart: [],
  cartCount: 0,
  cartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addItem: () => {},
  removeProduct: () => {},
  updateQuantity: () => {},
  toggleTicket: () => {},
  clearCart: () => {},
  eligibleTickets: [],
  purchaseSignal: 0,
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [eligibleTickets, setEligibleTickets] = useState<EligibleTicket[]>([]);

  const [purchaseSignal, setPurchaseSignal] = useState(0);
  const pendingCartRef = useRef<CartItem[]>([]);

  // ── Load cart from localStorage when wallet changes ───────────────────────
  useEffect(() => {
    if (!address) {
      setCart([]);
      return;
    }
    try {
      const stored = localStorage.getItem(`wicketchain:cart:${address.toLowerCase()}`);
      setCart(stored ? deserializeCart(JSON.parse(stored)) : []);
    } catch {
      setCart([]);
    }
  }, [address]);

  // ── Persist cart to localStorage on every change ─────────────────────────
  useEffect(() => {
    if (!address) return;
    localStorage.setItem(
      `wicketchain:cart:${address.toLowerCase()}`,
      JSON.stringify(serializeCart(cart))
    );
  }, [cart, address]);

  // ── Load eligible tickets when wallet connects or cart opens ─────────────
  async function fetchTickets() {
      const { data: ticketsData } = await supabase
        .from("tickets")
        .select("token_id, venue_id, event_id, enclosures(name), row_label, seat_number")
        .eq("owner_address", address!.toLowerCase())
        .eq("is_returned", false)
        .eq("is_entered", false);

      const rawTickets = (ticketsData as any[]) || [];

      const eventIds = [...new Set(rawTickets.map((t) => t.event_id).filter(Boolean))];
      const venueIds = [...new Set(rawTickets.map((t) => t.venue_id).filter(Boolean))];

      const [eventsRes, venuesRes] = await Promise.all([
        eventIds.length > 0
          ? supabase.from("events").select("id, match_title, start_time, status").in("id", eventIds)
          : { data: [] },
        venueIds.length > 0
          ? supabase.from("venues").select("id, name").in("id", venueIds)
          : { data: [] },
      ]);

      const eventsMap: Record<string, any> = {};
      for (const e of (eventsRes.data as any[]) || []) eventsMap[e.id] = e;

      const venuesMap: Record<string, any> = {};
      for (const v of (venuesRes.data as any[]) || []) venuesMap[v.id] = v;

      const INACTIVE_STATUSES = ["COMPLETED", "CANCELLED"];

      setEligibleTickets(
        rawTickets
          .filter((t) => {
            const event = eventsMap[t.event_id];
            // Exclude tickets whose match is completed or cancelled
            return event && !INACTIVE_STATUSES.includes(event.status);
          })
          .map((t) => {
            const enclosure = Array.isArray(t.enclosures) ? t.enclosures[0] : t.enclosures;
            const event = eventsMap[t.event_id];
            const venue = venuesMap[t.venue_id];
            return {
              tokenId: t.token_id,
              label: `${enclosure?.name || "General"} · Row ${t.row_label} · Seat ${t.seat_number}`,
              venueId: t.venue_id,
              matchTitle: event?.match_title ?? "",
              matchTime: event?.start_time ?? null,
              venueName: venue?.name ?? "",
            };
          })
      );
  }

  // Re-fetch on wallet connect/disconnect
  useEffect(() => {
    if (!address) { setEligibleTickets([]); return; }
    fetchTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Re-fetch every time the cart is opened (picks up newly purchased tickets)
  useEffect(() => {
    if (cartOpen && address) fetchTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  // ── Purchase contract ─────────────────────────────────────────────────────
  const purchaseContract = useContractWrite({
    onSuccess: async (hash) => {
      if (!address) return;

      const pending = pendingCartRef.current;
      setCart([]);
      setCartOpen(false);
      toast.success("Order placed successfully!");

      // Decrement stock immediately from pending cart — no log parsing needed
      for (const item of pending) {
        const { error: rpcError } = await supabase.rpc("decrement_product_units", {
          p_product_id: item.productId,
          p_qty: item.quantity,
        });
        if (rpcError) console.error("Failed to decrement stock:", rpcError);
      }

      // Signal any watching page to re-fetch product listings
      setPurchaseSignal((s) => s + 1);

      // Parse logs to record order IDs in DB (best-effort)
      if (!publicClient) return;
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
        });
        const logs = parseEventLogs({
          abi: stadiumShopAbi,
          eventName: "ItemPurchased",
          logs: receipt.logs,
        });

        for (const log of logs) {
          const orderId = Number(log.args.orderId);
          const productIdOnchain = Number(log.args.productId);
          const ticketTokenId = Number(log.args.ticketTokenId);
          const qty = Number(log.args.quantity);

          const cartItem = pending.find(
            (i) => i.productIdOnchain === productIdOnchain && i.ticketTokenId === ticketTokenId
          );
          if (!cartItem) continue;

          const { error: insertError } = await supabase.from("shop_orders").insert({
            order_id_onchain: orderId,
            ticket_token_id: ticketTokenId,
            product_id: cartItem.productId,
            shop_id: cartItem.shopId,
            venue_id: cartItem.venueId,
            quantity: qty,
            total_paid_wei: (cartItem.priceWei * BigInt(qty)).toString(),
            buyer_address: address.toLowerCase(),
            status: "ACTIVE",
            tx_hash: hash,
          });

          if (insertError) {
            console.error("Order insert failed:", insertError);
            toast.error(
              `Order #${orderId} synced on-chain but couldn't save to database: ${insertError.message}`
            );
          }
        }
      } catch (err) {
        console.error("Failed to sync order to DB:", err);
      }
    },
  });

  // ── Cart operations ───────────────────────────────────────────────────────
  const addItem = useCallback((item: CartItem) => {
    setCart((prev) => {
      if (prev.some((i) => i.productId === item.productId)) return prev;
      return [...prev, item];
    });
    setCartOpen(true);
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const toggleTicket = useCallback((productId: string, ticketTokenId: number) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === productId && i.ticketTokenId === ticketTokenId
      );
      if (existing) {
        const remaining = prev.filter((i) => i.cartItemId !== existing.cartItemId);
        const hasAssigned = remaining.some(
          (i) => i.productId === productId && i.ticketTokenId !== 0
        );
        if (!hasAssigned) return remaining.filter((i) => i.productId !== productId);
        return remaining;
      } else {
        const group = prev.filter((i) => i.productId === productId);
        const template = group[0];
        if (!template) return prev;
        const totalInCart = group.reduce((sum, i) => sum + i.quantity, 0);
        if (totalInCart >= template.availableUnits) {
          toast.error("No more stock available");
          return prev;
        }
        const placeholder = group.find((i) => i.ticketTokenId === 0);
        if (placeholder) {
          return prev.map((i) =>
            i.cartItemId === placeholder.cartItemId ? { ...i, ticketTokenId } : i
          );
        }
        return [
          ...prev,
          {
            ...template,
            cartItemId: `${productId}-${Date.now()}-${Math.random()}`,
            ticketTokenId,
            quantity: 1,
          },
        ];
      }
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!address || !publicClient) return;
    const assignedCart = cart.filter((i) => i.ticketTokenId !== 0);
    if (assignedCart.length === 0) return;

    // ── Security Check: Enforce MAX_ORDERS_PER_TICKET ──
    const ticketCartCounts = new Map<number, number>();
    for (const item of assignedCart) {
      ticketCartCounts.set(item.ticketTokenId, (ticketCartCounts.get(item.ticketTokenId) || 0) + 1);
    }

    try {
      const maxOrders: any = await publicClient.readContract({
        address: CONTRACTS.stadiumShop,
        abi: stadiumShopAbi as any,
        functionName: "maxOrdersPerTicket",
      });

      for (const [ticketId, addedOrders] of ticketCartCounts.entries()) {
        const existingOrders: any = await publicClient.readContract({
          address: CONTRACTS.stadiumShop,
          abi: stadiumShopAbi as any,
          functionName: "getOrdersByTicket",
          args: [BigInt(ticketId)],
        });
        const activeCount = existingOrders.filter((o: any) => o.status === 0).length;

        if (activeCount + addedOrders > Number(maxOrders)) {
          toast.error(`Ticket #${ticketId} exceeds the maximum allowed shop orders (${maxOrders}).`);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to verify max orders:", err);
      toast.error("Could not verify order limits. Please try again.");
      return;
    }

    pendingCartRef.current = assignedCart;
    setShowConfirm(false);
    setShowTxModal(true);

    const totalWei = assignedCart.reduce(
      (sum, i) => sum + i.priceWei * BigInt(i.quantity),
      0n
    );

    try {
      if (assignedCart.length === 1) {
        const item = assignedCart[0];
        await purchaseContract.execute({
          address: CONTRACTS.stadiumShop,
          abi: stadiumShopAbi,
          functionName: "purchaseSingleItem",
          args: [BigInt(item.productIdOnchain), BigInt(item.quantity), BigInt(item.ticketTokenId)],
          value: totalWei,
        });
      } else {
        const items = assignedCart.map((i) => ({
          productId: BigInt(i.productIdOnchain),
          ticketTokenId: BigInt(i.ticketTokenId),
          quantity: BigInt(i.quantity),
        }));
        await purchaseContract.execute({
          address: CONTRACTS.stadiumShop,
          abi: stadiumShopAbi,
          functionName: "purchaseCart",
          args: [items],
          value: totalWei,
        });
      }
    } catch {
      // Error stored in purchaseContract.errorMessage
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const assignedCart = cart.filter((i) => i.ticketTokenId !== 0);
  const totalWei = assignedCart.reduce((sum, i) => sum + i.priceWei * BigInt(i.quantity), 0n);
  const cartCount = assignedCart.reduce((s, i) => s + i.quantity, 0);
  const isCheckoutDisabled =
    !address || assignedCart.length === 0 || cart.some((i) => i.ticketTokenId === 0);
  const shopName = cart[0]?.shopName ?? "Shop";

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        addItem,
        removeProduct,
        updateQuantity,
        toggleTicket,
        clearCart,
        eligibleTickets,
        purchaseSignal,
      }}
    >
      {children}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        eligibleTickets={eligibleTickets}
        onUpdateQuantity={updateQuantity}
        onToggleTicket={toggleTicket}
        onRemoveProduct={removeProduct}
        onClearAll={clearCart}
        onCheckout={() => setShowConfirm(true)}
        isCheckoutDisabled={isCheckoutDisabled}
      />

      <ConfirmShopPurchaseModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCheckout}
        shopName={shopName}
        items={assignedCart.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          priceWei: i.priceWei,
          priceDisplay: null,
          ticketLabel:
            eligibleTickets.find((t) => t.tokenId === i.ticketTokenId)?.label ??
            `Ticket #${i.ticketTokenId}`,
        }))}
        totalWei={totalWei}
        walletAddress={address}
      />

      <TransactionProgressModal
        open={showTxModal}
        onClose={() => {
          setShowTxModal(false);
          purchaseContract.reset();
        }}
        step={purchaseContract.step}
        txHash={purchaseContract.txHash}
        errorMessage={purchaseContract.errorMessage}
        successTitle="Order Placed!"
        successDescription="Your order is confirmed on-chain. Pick it up at the stadium!"
        successActions={
          <Link
            href="/shops/my-orders"
            className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-[#002a0c] text-sm"
            style={{ backgroundImage: "linear-gradient(135deg, #a5fcad 0%, #5fb26b 100%)" }}
            onClick={() => {
              setShowTxModal(false);
              purchaseContract.reset();
            }}
          >
            View My Orders
          </Link>
        }
      />
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
