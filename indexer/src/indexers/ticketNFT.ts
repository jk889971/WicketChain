// ============================================================
// TicketNFT Indexer
// Events: TicketPurchased, TicketReturned, EventCreated, EventLive,
// EventCancelled, EventPostponed, EventStatusChanged, EventPricingSet,
// DelegateSet, DelegateRemoved, EntryMarked, WalkInTicketMinted,
// CancellationRefundClaimed, EnclosureForceRefunded
// ============================================================

import { ethers } from "ethers";
import { BaseIndexer, LogMeta } from "./base.js";
import { TicketNFTEvents } from "../abis/TicketNFT.js";
import { CONTRACTS } from "../config.js";
import { supabase } from "../supabase.js";

// Map on-chain EventStatus enum to DB enum
const EVENT_STATUS_MAP: Record<number, string> = {
  0: "CREATED",
  1: "LIVE",
  2: "REFUNDS_CLOSED",
  3: "GATES_OPEN",
  4: "IN_PROGRESS",
  5: "COMPLETED",
  6: "CANCELLED",
  7: "POSTPONED",
};

export class TicketNFTIndexer extends BaseIndexer {
  constructor() {
    super("TicketNFT", CONTRACTS.TicketNFT, TicketNFTEvents);
  }

  async handleEvent(eventName: string, args: ethers.Result, meta: LogMeta): Promise<void> {
    switch (eventName) {
      case "TicketPurchased":
        return this.onTicketPurchased(args, meta);
      case "TicketReturned":
        return this.onTicketReturned(args, meta);
      case "EventCreated":
        return this.onEventCreated(args, meta);
      case "EventLive":
        return this.onEventLive(args, meta);
      case "EventUpdated":
        return this.onEventUpdated(args, meta);
      case "EventCancelled":
        return this.onEventCancelled(args, meta);
      case "EventPostponed":
        return this.onEventPostponed(args, meta);
      case "EventStatusChanged":
        return this.onEventStatusChanged(args, meta);
      case "EventPricingSet":
        return this.onEventPricingSet(args, meta);
      case "DelegateSet":
        return this.onDelegateSet(args, meta);
      case "DelegateRemoved":
        return this.onDelegateRemoved(args, meta);
      case "EntryMarked":
        return this.onEntryMarked(args, meta);
      case "WalkInTicketMinted":
        return this.onWalkInTicketMinted(args, meta);
      case "CancellationRefundClaimed":
        return this.onCancellationRefundClaimed(args, meta);
      case "EnclosureForceRefunded":
        return this.onEnclosureForceRefunded(args, meta);
      default:
        // Ignore non-business events (Transfer, Approval, Role*, Pause*)
        return;
    }
  }

  // ── TicketPurchased ──
  private async onTicketPurchased(args: ethers.Result, meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);
    const eventIdOnchain = Number(args[1]);
    const enclosureIdOnchain = Number(args[2]);
    const rowLabel = ethers.toUtf8String(args[3]).replace(/\0/g, ""); // bytes1 → char
    const seatNumber = Number(args[4]);
    const buyer = args[5].toLowerCase();
    const price = args[6].toString();

    // Resolve UUIDs from on-chain IDs
    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    const venueUUID = await this.resolveVenueUUIDFromEvent(eventIdOnchain);
    const enclosureUUID = await this.resolveEnclosureUUID(enclosureIdOnchain, venueUUID);

    // Upsert ticket
    const { error } = await supabase.from("tickets").upsert(
      {
        token_id: tokenId,
        event_id: eventUUID,
        venue_id: venueUUID,
        enclosure_id: enclosureUUID,
        row_label: rowLabel,
        seat_number: seatNumber,
        owner_address: buyer,
        purchase_price_wei: price,
        is_returned: false,
        is_walk_in: false,
        is_entered: false,
        tx_hash: meta.txHash,
      },
      { onConflict: "token_id", ignoreDuplicates: true }
    );
    if (error) throw new Error(`tickets upsert: ${error.message}`);

    // Atomically increment sold_seats — avoids race condition when concurrent tickets are purchased
    if (eventUUID && enclosureUUID) {
      const { error: incrError } = await supabase.rpc("increment_sold_seats", {
        p_event_id: eventUUID,
        p_enclosure_id: enclosureUUID,
      });
      if (incrError) {
        this.log(`Warning: sold_seats increment failed (event ${eventUUID}): ${incrError.message}`);
      }
    }

    // Remove seat hold if exists
    if (eventUUID && enclosureUUID) {
      await supabase
        .from("seat_holds")
        .delete()
        .eq("event_id", eventUUID)
        .eq("enclosure_id", enclosureUUID)
        .eq("row_label", rowLabel)
        .eq("seat_number", seatNumber);
    }
  }

  // ── TicketReturned ──
  private async onTicketReturned(args: ethers.Result, meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);

    const { error } = await supabase
      .from("tickets")
      .update({ is_returned: true })
      .eq("token_id", tokenId);
    if (error) throw new Error(`ticket return update: ${error.message}`);
  }

  // ── EnclosureForceRefunded ──
  // Emitted after forceRefundEnclosure() burns all tickets in an enclosure.
  // Each ticket already has is_returned=true (set by TicketReturned events above).
  // We now mark them is_force_refunded=true so the frontend shows 100% refund.
  private async onEnclosureForceRefunded(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain    = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);

    this.log(`EnclosureForceRefunded: event ${eventIdOnchain}, enclosure ${enclosureIdOnchain}`);

    const eventUUID     = await this.resolveEventUUID(eventIdOnchain);
    const venueUUID     = await this.resolveVenueUUIDFromEvent(eventIdOnchain);
    const enclosureUUID = await this.resolveEnclosureUUID(enclosureIdOnchain, venueUUID);

    if (!eventUUID || !enclosureUUID) {
      this.log(`EnclosureForceRefunded: could not resolve UUIDs for event ${eventIdOnchain} enclosure ${enclosureIdOnchain}`);
      return;
    }

    const { error } = await supabase
      .from("tickets")
      .update({ is_force_refunded: true })
      .eq("event_id", eventUUID)
      .eq("enclosure_id", enclosureUUID)
      .eq("is_returned", true);

    if (error) throw new Error(`EnclosureForceRefunded update: ${error.message}`);
  }

  // ── EventUpdated ──
  private async onEventUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const newTitle = args[1];
    const newVenueIdOnchain = Number(args[2]);

    const venueUUID = await this.resolveVenueUUID(newVenueIdOnchain);

    const { error } = await supabase
      .from("events")
      .update({ match_title: newTitle, venue_id: venueUUID })
      .eq("event_id_onchain", eventIdOnchain);
    if (error) throw new Error(`event update: ${error.message}`);
  }

  // ── CancellationRefundClaimed ──
  private async onCancellationRefundClaimed(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);
    this.log(`CancellationRefundClaimed: token ${tokenId}, owner ${args[1]}, amount ${args[2]}`);

    const { error } = await supabase
      .from("tickets")
      .update({ is_returned: true, is_force_refunded: true })
      .eq("token_id", tokenId);
    if (error) throw new Error(`cancellation refund claimed update: ${error.message}`);
  }

  // ── EventCreated ──
  private async onEventCreated(args: ethers.Result, meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const venueIdOnchain = Number(args[1]);
    const matchTitle = args[2];
    const eventManager = args[3].toLowerCase();

    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);

    // We don't have start/end time in the event — the contract stores it.
    // ignoreDuplicates: true preserves any manually-seeded start/end times.
    // If the row doesn't exist yet, we insert with placeholder times.
    const { error } = await supabase.from("events").upsert(
      {
        event_id_onchain: eventIdOnchain,
        venue_id: venueUUID,
        match_title: matchTitle,
        start_time: new Date().toISOString(), // only used on first insert
        end_time: new Date().toISOString(),   // only used on first insert
        status: "CREATED",
        event_manager_address: eventManager,
      },
      { onConflict: "event_id_onchain", ignoreDuplicates: true }
    );
    if (error) throw new Error(`events upsert: ${error.message}`);
  }

  // ── EventLive ──
  private async onEventLive(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    await this.updateEventStatus(eventIdOnchain, "LIVE");
  }

  // ── EventCancelled ──
  private async onEventCancelled(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    await this.updateEventStatus(eventIdOnchain, "CANCELLED");
  }

  // ── EventPostponed ──
  private async onEventPostponed(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const newStart = Number(args[1]);
    const newEnd = Number(args[2]);

    const { error } = await supabase
      .from("events")
      .update({
        status: "POSTPONED",
        start_time: new Date(newStart * 1000).toISOString(),
        end_time: new Date(newEnd * 1000).toISOString(),
      })
      .eq("event_id_onchain", eventIdOnchain);
    if (error) throw new Error(`event postpone update: ${error.message}`);
  }

  // ── EventStatusChanged ──
  private async onEventStatusChanged(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const statusNum = Number(args[1]);
    const statusStr = EVENT_STATUS_MAP[statusNum] || "CREATED";
    await this.updateEventStatus(eventIdOnchain, statusStr);
  }

  // ── EventPricingSet ──
  private async onEventPricingSet(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);
    const priceInWei = args[2].toString();

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    const venueUUID = await this.resolveVenueUUIDFromEvent(eventIdOnchain);
    const enclosureUUID = await this.resolveEnclosureUUID(enclosureIdOnchain, venueUUID);

    // Human-readable price display
    const priceEth = ethers.formatEther(priceInWei);
    const priceDisplay = `${priceEth} WIRE`;

    const { error } = await supabase.from("event_pricing").upsert(
      {
        event_id: eventUUID,
        enclosure_id: enclosureUUID,
        price_wei: priceInWei,
        price_display: priceDisplay,
        sold_seats: 0,
      },
      { onConflict: "event_id,enclosure_id", ignoreDuplicates: false }
    );
    if (error) throw new Error(`event_pricing upsert: ${error.message}`);
  }

  // ── DelegateSet ──
  private async onDelegateSet(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);
    const delegate = args[1].toLowerCase();

    const { error } = await supabase
      .from("tickets")
      .update({ delegate_address: delegate })
      .eq("token_id", tokenId);
    if (error) throw new Error(`delegate set update: ${error.message}`);
  }

  // ── DelegateRemoved ──
  private async onDelegateRemoved(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);

    const { error } = await supabase
      .from("tickets")
      .update({ delegate_address: null })
      .eq("token_id", tokenId);
    if (error) throw new Error(`delegate remove update: ${error.message}`);
  }

  // ── EntryMarked ──
  private async onEntryMarked(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);

    const { error } = await supabase
      .from("tickets")
      .update({ is_entered: true })
      .eq("token_id", tokenId);
    if (error) throw new Error(`entry marked update: ${error.message}`);
  }

  // ── WalkInTicketMinted ──
  private async onWalkInTicketMinted(args: ethers.Result, meta: LogMeta): Promise<void> {
    const tokenId = Number(args[0]);
    const eventIdOnchain = Number(args[1]);
    const rowLabel = ethers.toUtf8String(args[2]).replace(/\0/g, "");
    const seatNumber = Number(args[3]);
    const entryCodeHash = args[4];

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    const venueUUID = await this.resolveVenueUUIDFromEvent(eventIdOnchain);

    // Look up enclosure from row → enclosure_rows → enclosure
    const enclosureUUID = await this.resolveEnclosureFromRow(venueUUID, rowLabel);

    // Insert ticket record
    await supabase.from("tickets").upsert(
      {
        token_id: tokenId,
        event_id: eventUUID,
        venue_id: venueUUID,
        enclosure_id: enclosureUUID,
        row_label: rowLabel,
        seat_number: seatNumber,
        owner_address: "0x0000000000000000000000000000000000000000", // walk-in, no owner
        purchase_price_wei: "0",
        is_returned: false,
        is_walk_in: true,
        is_entered: false,
        tx_hash: meta.txHash,
      },
      { onConflict: "token_id", ignoreDuplicates: true }
    );

    // Atomically increment sold_seats — avoids race condition when concurrent tickets are purchased
    if (eventUUID && enclosureUUID) {
      const { error: incrError } = await supabase.rpc("increment_sold_seats", {
        p_event_id: eventUUID,
        p_enclosure_id: enclosureUUID,
      });
      if (incrError) {
        this.log(`Warning: sold_seats increment failed (event ${eventUUID}): ${incrError.message}`);
      }
    }
    // Note: walk_in_tickets table write removed — walk-in data is stored in the main
    // tickets table with is_walk_in=true, which is what all frontend queries read.
  }

  // ── Helpers ──

  private async updateEventStatus(eventIdOnchain: number, status: string): Promise<void> {
    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("event_id_onchain", eventIdOnchain);
    if (error) throw new Error(`event status update: ${error.message}`);
  }

  private async resolveVenueUUID(venueIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("venues")
      .select("id")
      .eq("venue_id_onchain", venueIdOnchain)
      .single();
    return data?.id || null;
  }

  private async resolveEventUUID(eventIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("events")
      .select("id")
      .eq("event_id_onchain", eventIdOnchain)
      .single();
    return data?.id || null;
  }

  private async resolveVenueUUIDFromEvent(eventIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("events")
      .select("venue_id")
      .eq("event_id_onchain", eventIdOnchain)
      .single();
    return data?.venue_id || null;
  }

  private async resolveEnclosureUUID(enclosureIdOnchain: number, venueUUID?: string | null): Promise<string | null> {
    let query = supabase
      .from("enclosures")
      .select("id")
      .eq("enclosure_id_onchain", enclosureIdOnchain);

    // Scope by venue when available — enclosure_id_onchain is per-venue, not global
    if (venueUUID) query = query.eq("venue_id", venueUUID);

    const { data } = await query.single();
    return data?.id || null;
  }

  private async resolveEnclosureFromRow(venueUUID: string | null, rowLabel: string): Promise<string | null> {
    if (!venueUUID) return null;
    // Find enclosure that has this row label within this venue
    const { data } = await supabase
      .from("enclosure_rows")
      .select("enclosure_id, enclosures!inner(venue_id)")
      .eq("row_label", rowLabel)
      .eq("enclosures.venue_id", venueUUID)
      .limit(1)
      .single();
    return data?.enclosure_id || null;
  }
}
