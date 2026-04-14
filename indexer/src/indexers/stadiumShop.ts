// ============================================================
// StadiumShop Indexer
// Events: ShopRegistered, ShopApproved, ProductAdded, ItemPurchased,
// CartCheckout, OrderCancelled, OrderRefunded, OrderConfirmed,
// OrderCollected, + product/shop updates
// ============================================================

import { ethers } from "ethers";
import { BaseIndexer, LogMeta } from "./base.js";
import { StadiumShopEvents } from "../abis/StadiumShop.js";
import { CONTRACTS } from "../config.js";
import { supabase } from "../supabase.js";

export class StadiumShopIndexer extends BaseIndexer {
  constructor() {
    super("StadiumShop", CONTRACTS.StadiumShop, StadiumShopEvents);
  }

  async handleEvent(eventName: string, args: ethers.Result, meta: LogMeta): Promise<void> {
    switch (eventName) {
      case "ShopRegistered":
        return this.onShopRegistered(args, meta);
      case "ShopApproved":
        return this.onShopApproved(args, meta);
      case "ShopRejected":
        return this.onShopRejected(args, meta);
      case "ShopUpdated":
        return this.onShopUpdated(args, meta);
      case "ShopActiveToggled":
        return this.onShopActiveToggled(args, meta);
      case "ShopPaused":
        return this.onShopActiveToggled(args, meta);
      case "ProductAdded":
        return this.onProductAdded(args, meta);
      case "ProductUpdated":
        return this.onProductUpdated(args, meta);
      case "InventoryUpdated":
        return this.onInventoryUpdated(args, meta);
      case "ProductActiveToggled":
        return this.onProductActiveToggled(args, meta);
      case "ItemPurchased":
        return this.onItemPurchased(args, meta);
      case "CartCheckout":
        // Logged for audit; individual ItemPurchased events handle DB writes
        this.log(`CartCheckout: buyer ${args[0]}, orders ${args[1]}, total ${args[2]}`);
        return;
      case "OrderCancelled":
        return this.onOrderStatusChange(Number(args[0]), "CANCELLED");
      case "OrderCancelledByVendor":
        return this.onOrderStatusChange(Number(args[0]), "CANCELLED");
      case "OrderRefunded":
        return this.onOrderStatusChange(Number(args[0]), "REFUNDED");
      case "OrderConfirmed":
        return this.onOrderStatusChange(Number(args[0]), "CONFIRMED");
      case "OrderCollected":
        return this.onOrderStatusChange(Number(args[0]), "COLLECTED");
      case "VenueAddedToShop":
        return this.onVenueAddedToShop(args, meta);
      case "VenueLocationUpdated":
        return this.onVenueLocationUpdated(args, meta);
      case "ShopVenueRemoved":
        return this.onShopVenueRemoved(args, meta);
      default:
        return;
    }
  }

  // ── ShopRegistered ──
  private async onShopRegistered(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const owner = args[1].toLowerCase();
    const name = args[2];

    const { error } = await supabase.from("shops").upsert(
      {
        shop_id_onchain: shopIdOnchain,
        owner_address: owner,
        name,
        is_approved: false,
        is_active: true,
      },
      { onConflict: "shop_id_onchain" }
    );
    if (error) throw new Error(`shops upsert: ${error.message}`);
  }

  // ── ShopApproved ──
  private async onShopApproved(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const { error } = await supabase
      .from("shops")
      .update({ is_approved: true })
      .eq("shop_id_onchain", shopIdOnchain);
    if (error) throw new Error(`shop approve: ${error.message}`);
  }

  // ── ShopActiveToggled ──
  private async onShopActiveToggled(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const isActive = args[1];
    const { error } = await supabase
      .from("shops")
      .update({ is_active: isActive })
      .eq("shop_id_onchain", shopIdOnchain);
    if (error) throw new Error(`shop toggle: ${error.message}`);
  }

  // ── ProductAdded ──
  private async onProductAdded(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const productIdOnchain = Number(args[0]);
    const shopIdOnchain = Number(args[1]);
    const venueIdOnchain = Number(args[2]);
    const name = args[3];
    const price = args[4].toString();

    const shopUUID = await this.resolveShopUUID(shopIdOnchain);
    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);

    const priceDisplay = `${ethers.formatEther(price)} WIRE`;

    // ignoreDuplicates: true → if the frontend already inserted this product
    // (with correct image_url and available_units), leave it untouched.
    // If the indexer fires first, it inserts a minimal row; the frontend will
    // then upsert and fill in image_url and available_units.
    const { error } = await supabase.from("shop_products").upsert(
      {
        product_id_onchain: productIdOnchain,
        shop_id: shopUUID,
        venue_id: venueUUID,
        name,
        price_wei: price,
        price_display: priceDisplay,
        is_active: true,
      },
      { onConflict: "product_id_onchain", ignoreDuplicates: true }
    );
    if (error) throw new Error(`product upsert: ${error.message}`);
  }

  // ── ProductUpdated ──
  private async onProductUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const productIdOnchain = Number(args[0]);
    const name = args[1];
    const price = args[2].toString();
    const priceDisplay = `${ethers.formatEther(price)} WIRE`;

    const { error } = await supabase
      .from("shop_products")
      .update({ name, price_wei: price, price_display: priceDisplay })
      .eq("product_id_onchain", productIdOnchain);
    if (error) throw new Error(`product update: ${error.message}`);
  }

  // ── InventoryUpdated ──
  private async onInventoryUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const productIdOnchain = Number(args[0]);
    const newUnits = Number(args[1]);

    const { error } = await supabase
      .from("shop_products")
      .update({ available_units: newUnits })
      .eq("product_id_onchain", productIdOnchain);
    if (error) throw new Error(`inventory update: ${error.message}`);
  }

  // ── ProductActiveToggled ──
  private async onProductActiveToggled(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const productIdOnchain = Number(args[0]);
    const isActive = args[1];

    const { error } = await supabase
      .from("shop_products")
      .update({ is_active: isActive })
      .eq("product_id_onchain", productIdOnchain);
    if (error) throw new Error(`product toggle: ${error.message}`);
  }

  // ── ItemPurchased ──
  private async onItemPurchased(args: ethers.Result, meta: LogMeta): Promise<void> {
    const orderIdOnchain = Number(args[0]);
    const ticketTokenId = Number(args[1]);
    const productIdOnchain = Number(args[2]);
    const quantity = Number(args[3]);
    const buyer = args[4].toLowerCase();

    // Resolve product → shop, venue, price
    const { data: product } = await supabase
      .from("shop_products")
      .select("id, shop_id, venue_id, price_wei")
      .eq("product_id_onchain", productIdOnchain)
      .single();

    if (!product) {
      this.log(`Warning: product ${productIdOnchain} not found in DB`);
      return;
    }

    const totalPaid = (BigInt(product.price_wei) * BigInt(quantity)).toString();

    const { error } = await supabase.from("shop_orders").upsert(
      {
        order_id_onchain: orderIdOnchain,
        ticket_token_id: ticketTokenId,
        product_id: product.id,
        shop_id: product.shop_id,
        venue_id: product.venue_id,
        quantity,
        total_paid_wei: totalPaid,
        buyer_address: buyer,
        status: "ACTIVE",
        tx_hash: meta.txHash,
      },
      { onConflict: "order_id_onchain" }
    );
    if (error) throw new Error(`order upsert: ${error.message}`);
  }

  // ── Order status transitions ──
  private async onOrderStatusChange(orderIdOnchain: number, status: string): Promise<void> {
    const { error } = await supabase
      .from("shop_orders")
      .update({ status })
      .eq("order_id_onchain", orderIdOnchain);
    if (error) throw new Error(`order ${status}: ${error.message}`);
  }

  // ── VenueAddedToShop ──
  private async onVenueAddedToShop(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const venueIdOnchain = Number(args[1]);
    const location = args[2];

    const shopUUID = await this.resolveShopUUID(shopIdOnchain);
    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);

    if (shopUUID && venueUUID) {
      const { error } = await supabase.from("shop_venues").upsert(
        {
          shop_id: shopUUID,
          venue_id: venueUUID,
          location_in_venue: location,
        },
        { onConflict: "shop_id,venue_id" }
      );
      if (error) throw new Error(`shop_venues upsert: ${error.message}`);
    }
  }

  // ── VenueLocationUpdated ──
  private async onVenueLocationUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const venueIdOnchain = Number(args[1]);
    const newLocation = args[2];

    const shopUUID = await this.resolveShopUUID(shopIdOnchain);
    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);

    if (shopUUID && venueUUID) {
      const { error } = await supabase
        .from("shop_venues")
        .update({ location_in_venue: newLocation })
        .eq("shop_id", shopUUID)
        .eq("venue_id", venueUUID);
      if (error) throw new Error(`venue location update: ${error.message}`);
    }
  }

  // ── ShopRejected ──
  private async onShopRejected(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const reason = args[1];
    const { error } = await supabase
      .from("shops")
      .update({ is_approved: false, rejection_reason: reason })
      .eq("shop_id_onchain", shopIdOnchain);
    if (error) throw new Error(`shop reject: ${error.message}`);
  }

  // ── ShopUpdated ──
  private async onShopUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const name         = args[1];
    const description  = args[2];
    const imageURI     = args[3];

    const { error } = await supabase
      .from("shops")
      .update({
        name,
        description: description || null,
        image_url:   imageURI    || null,
      })
      .eq("shop_id_onchain", shopIdOnchain);

    if (error) throw new Error(`shop update: ${error.message}`);
  }

  // ── ShopVenueRemoved ──
  private async onShopVenueRemoved(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const venueIdOnchain = Number(args[1]);

    const shopUUID = await this.resolveShopUUID(shopIdOnchain);
    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);

    if (!shopUUID || !venueUUID) return;

    const { error } = await supabase
      .from("shop_venues")
      .delete()
      .eq("shop_id", shopUUID)
      .eq("venue_id", venueUUID);
    if (error) throw new Error(`shop_venues delete: ${error.message}`);
  }

  // ── Helpers ──

  private async resolveShopUUID(shopIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("shops")
      .select("id")
      .eq("shop_id_onchain", shopIdOnchain)
      .single();
    return data?.id || null;
  }

  private async resolveVenueUUID(venueIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("venues")
      .select("id")
      .eq("venue_id_onchain", venueIdOnchain)
      .single();
    return data?.id || null;
  }
}
