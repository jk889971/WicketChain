// ============================================================
// VenueRegistry Indexer
// Events: VenueCreated, VenueUpdated, VenueDeactivated,
// VenueActivated, EnclosureAdded, EnclosureUpdated, RowsAdded
// ============================================================

import { ethers } from "ethers";
import { BaseIndexer, LogMeta } from "./base.js";
import { VenueRegistryEvents } from "../abis/VenueRegistry.js";
import { CONTRACTS } from "../config.js";
import { supabase } from "../supabase.js";

export class VenueRegistryIndexer extends BaseIndexer {
  constructor() {
    super("VenueRegistry", CONTRACTS.VenueRegistry, VenueRegistryEvents);
  }

  async handleEvent(eventName: string, args: ethers.Result, meta: LogMeta): Promise<void> {
    switch (eventName) {
      case "VenueCreated":
        return this.onVenueCreated(args, meta);
      case "VenueUpdated":
        return this.onVenueUpdated(args, meta);
      case "VenueDeactivated":
        return this.onVenueActiveToggle(Number(args[0]), false);
      case "VenueActivated":
        return this.onVenueActiveToggle(Number(args[0]), true);
      case "EnclosureAdded":
        return this.onEnclosureAdded(args, meta);
      case "EnclosureUpdated":
        return this.onEnclosureUpdated(args, meta);
      case "RowsAdded":
        return this.onRowsAdded(args, meta);
      case "EnclosureStatusChanged":
        return this.onEnclosureStatusChanged(args, meta);
      case "RowUpdated":
        return this.onRowUpdated(args, meta);
      default:
        return;
    }
  }

  // ── VenueCreated ──
  private async onVenueCreated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const name = args[1];
    const city = args[2];

    const { error } = await supabase.from("venues").upsert(
      {
        venue_id_onchain: venueIdOnchain,
        name,
        city,
        is_active: true,
      },
      { onConflict: "venue_id_onchain" }
    );
    if (error) throw new Error(`venues upsert: ${error.message}`);
  }

  // ── VenueUpdated ──
  private async onVenueUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const name = args[1];
    const city = args[2];

    const { error } = await supabase
      .from("venues")
      .update({ name, city })
      .eq("venue_id_onchain", venueIdOnchain);
    if (error) throw new Error(`venue update: ${error.message}`);
  }

  // ── VenueDeactivated / VenueActivated ──
  private async onVenueActiveToggle(venueIdOnchain: number, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("venues")
      .update({ is_active: isActive })
      .eq("venue_id_onchain", venueIdOnchain);
    if (error) throw new Error(`venue active toggle: ${error.message}`);
  }

  // ── EnclosureAdded ──
  private async onEnclosureAdded(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);
    const name = args[2];

    // Resolve venue UUID
    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);
    if (!venueUUID) {
      this.log(`Warning: venue ${venueIdOnchain} not found, cannot add enclosure`);
      return;
    }

    const { error } = await supabase.from("enclosures").upsert(
      {
        venue_id: venueUUID,
        enclosure_id_onchain: enclosureIdOnchain,
        name,
        total_seats: 0,
        is_active: true,
      },
      { onConflict: "venue_id,enclosure_id_onchain" }
    );
    if (error) throw new Error(`enclosure upsert: ${error.message}`);
  }

  // ── EnclosureUpdated ──
  private async onEnclosureUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);
    const name = args[2];

    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);
    if (!venueUUID) return;

    const { error } = await supabase
      .from("enclosures")
      .update({ name })
      .eq("venue_id", venueUUID)
      .eq("enclosure_id_onchain", enclosureIdOnchain);
    if (error) throw new Error(`enclosure update: ${error.message}`);
  }

  // ── RowsAdded ──
  // The RowsAdded event only tells us the count. We need to read
  // the actual row data from the contract to get labels/seats.
  // For now, we log it — the admin can sync via Supabase seed data
  // or the frontend will read directly from the contract.
  private async onRowsAdded(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);
    const rowCount = Number(args[2]);

    this.log(`RowsAdded: venue ${venueIdOnchain}, enclosure ${enclosureIdOnchain}, ${rowCount} rows`);

    // Resolve enclosure UUID to update total_seats
    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);
    if (!venueUUID) return;

    const { data: enclosure } = await supabase
      .from("enclosures")
      .select("id")
      .eq("venue_id", venueUUID)
      .eq("enclosure_id_onchain", enclosureIdOnchain)
      .single();

    if (!enclosure) return;

    // Re-count total seats from enclosure_rows
    const { data: rows } = await supabase
      .from("enclosure_rows")
      .select("seat_count")
      .eq("enclosure_id", enclosure.id);

    if (rows) {
      const totalSeats = rows.reduce((sum, r) => sum + r.seat_count, 0);
      await supabase
        .from("enclosures")
        .update({ total_seats: totalSeats })
        .eq("id", enclosure.id);
    }
  }

  // ── EnclosureStatusChanged ──
  private async onEnclosureStatusChanged(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);
    const isActive = args[2];

    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);
    if (!venueUUID) return;

    const { error } = await supabase
      .from("enclosures")
      .update({ is_active: isActive })
      .eq("venue_id", venueUUID)
      .eq("enclosure_id_onchain", enclosureIdOnchain);
    if (error) throw new Error(`enclosure status toggle: ${error.message}`);
  }

  // ── RowUpdated ──
  private async onRowUpdated(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const venueIdOnchain = Number(args[0]);
    const enclosureIdOnchain = Number(args[1]);
    // args[2] = rowIndex (not used for DB lookup)
    const oldRowLabel = ethers.toUtf8String(args[3]).replace(/\0/g, "");
    const newRowLabel = ethers.toUtf8String(args[4]).replace(/\0/g, "");
    const newSeatCount = Number(args[5]);

    const venueUUID = await this.resolveVenueUUID(venueIdOnchain);
    if (!venueUUID) return;

    const { data: enclosure } = await supabase
      .from("enclosures")
      .select("id")
      .eq("venue_id", venueUUID)
      .eq("enclosure_id_onchain", enclosureIdOnchain)
      .single();
    if (!enclosure) return;

    const { error } = await supabase
      .from("enclosure_rows")
      .update({ row_label: newRowLabel, seat_count: newSeatCount })
      .eq("enclosure_id", enclosure.id)
      .eq("row_label", oldRowLabel);
    if (error) throw new Error(`row update: ${error.message}`);

    // Re-sum total_seats on the enclosure
    const { data: rows } = await supabase
      .from("enclosure_rows")
      .select("seat_count")
      .eq("enclosure_id", enclosure.id);
    if (rows) {
      const totalSeats = rows.reduce((sum, r) => sum + r.seat_count, 0);
      await supabase.from("enclosures").update({ total_seats: totalSeats }).eq("id", enclosure.id);
    }
  }

  // ── Helpers ──

  private async resolveVenueUUID(venueIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("venues")
      .select("id")
      .eq("venue_id_onchain", venueIdOnchain)
      .single();
    return data?.id || null;
  }
}
