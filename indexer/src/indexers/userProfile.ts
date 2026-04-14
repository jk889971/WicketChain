// ============================================================
// UserProfile Indexer
// Events: ProfileHashSet, ProfileHashRemoved
// ============================================================

import { ethers } from "ethers";
import { BaseIndexer, LogMeta } from "./base.js";
import { UserProfileEvents } from "../abis/UserProfile.js";
import { CONTRACTS } from "../config.js";
import { supabase } from "../supabase.js";

export class UserProfileIndexer extends BaseIndexer {
  constructor() {
    super("UserProfile", CONTRACTS.UserProfile, UserProfileEvents);
  }

  async handleEvent(eventName: string, args: ethers.Result, meta: LogMeta): Promise<void> {
    switch (eventName) {
      case "ProfileHashSet":
        return this.onProfileHashSet(args, meta);
      case "ProfileHashRemoved":
        return this.onProfileHashRemoved(args, meta);
      default:
        return;
    }
  }

  // ── ProfileHashSet ──
  private async onProfileHashSet(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const user = args[0].toLowerCase();
    const profileHash = args[1];

    // Upsert: create profile row if it doesn't exist, update hash if it does
    const { error } = await supabase.from("user_profiles").upsert(
      {
        wallet_address: user,
        profile_hash: profileHash,
      },
      { onConflict: "wallet_address" }
    );
    if (error) throw new Error(`profile hash set: ${error.message}`);
  }

  // ── ProfileHashRemoved ──
  private async onProfileHashRemoved(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const user = args[0].toLowerCase();

    const { error } = await supabase
      .from("user_profiles")
      .update({ profile_hash: null })
      .eq("wallet_address", user);
    if (error) throw new Error(`profile hash remove: ${error.message}`);
  }
}
