// ============================================================
// WicketChainVault Indexer
// Events: Deposited, RefundCredited, RefundClaimed,
// ShopEarningsConfirmed, ShopWithdrawal, EventSettled,
// ShopEarningRecorded, ShopRefundCredited, ShopOwnerRegistered
//
// Shop balances (pending/available/withdrawn) are read directly
// from the contract via getShopBalance() — not stored in DB.
// Only vault_event_balances is maintained here.
// ============================================================

import { ethers } from "ethers";
import { BaseIndexer, LogMeta } from "./base.js";
import { WicketChainVaultEvents } from "../abis/WicketChainVault.js";
import { CONTRACTS } from "../config.js";
import { supabase } from "../supabase.js";

// VaultCategory enum mapping
const VAULT_CATEGORY_MAP: Record<number, string> = {
  0: "TICKET_REVENUE",
  1: "SHOP_REVENUE",
  2: "DONATION",
};

export class VaultIndexer extends BaseIndexer {
  constructor() {
    super("Vault", CONTRACTS.WicketChainVault, WicketChainVaultEvents);
  }

  async handleEvent(eventName: string, args: ethers.Result, meta: LogMeta): Promise<void> {
    switch (eventName) {
      case "Deposited":
        return this.onDeposited(args, meta);
      case "RefundCredited":
        return this.onRefundCredited(args, meta);
      case "RefundClaimed":
        this.log(`RefundClaimed: ${args[0]} claimed ${ethers.formatEther(args[1])} ETH`);
        return;
      case "ShopEarningRecorded":
        this.log(`ShopEarningRecorded: shop ${args[1]}, amount ${ethers.formatEther(args[2])} ETH`);
        return;
      case "ShopEarningsConfirmed":
        return this.onShopEarningsConfirmed(args, meta);
      case "ShopWithdrawal":
        this.log(`ShopWithdrawal: shop ${args[0]}, amount ${ethers.formatEther(args[2])} ETH`);
        return;
      case "EventSettled":
        return this.onEventSettled(args, meta);
      case "ShopRefundCredited":
        return this.onShopRefundCredited(args, meta);
      case "ShopOwnerRegistered":
        this.log(`ShopOwnerRegistered: shop ${args[0]}, owner ${args[1]}`);
        return;
      case "ShopFeeUpdated":
        this.log(`ShopFeeUpdated: ${args[0]} → ${args[1]} BPS`);
        return;
      default:
        return;
    }
  }

  // ── Deposited ──
  // Event: Deposited(uint256 indexed eventId, uint8 category, uint256 amount)
  private async onDeposited(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const category = VAULT_CATEGORY_MAP[Number(args[1])] || "TICKET_REVENUE";
    const amount = args[2].toString();

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    if (!eventUUID) return;

    await this.ensureEventBalanceRow(eventUUID);

    const { data: current, error: selErr } = await supabase
      .from("vault_event_balances")
      .select("ticket_revenue_wei, shop_revenue_wei")
      .eq("event_id", eventUUID)
      .single();

    if (selErr) throw new Error(`event balance select (Deposited): ${selErr.message}`);
    if (!current) return;

    if (category === "TICKET_REVENUE") {
      const { error } = await supabase
        .from("vault_event_balances")
        .update({ ticket_revenue_wei: (BigInt(current.ticket_revenue_wei) + BigInt(amount)).toString() })
        .eq("event_id", eventUUID);
      if (error) throw new Error(`event balance update ticket_revenue (Deposited): ${error.message}`);
    } else if (category === "SHOP_REVENUE") {
      const { error } = await supabase
        .from("vault_event_balances")
        .update({ shop_revenue_wei: (BigInt(current.shop_revenue_wei) + BigInt(amount)).toString() })
        .eq("event_id", eventUUID);
      if (error) throw new Error(`event balance update shop_revenue (Deposited): ${error.message}`);
    }
  }

  // ── RefundCredited (ticket refunds) ──
  // Event: RefundCredited(uint256 indexed eventId, address indexed to, uint256 amount)
  private async onRefundCredited(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    // args[1] = to (address, indexed) — skip
    const amount = args[2].toString();

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    if (!eventUUID) return;

    await this.ensureEventBalanceRow(eventUUID);

    const { data: current, error: selErr } = await supabase
      .from("vault_event_balances")
      .select("ticket_refunds_wei")
      .eq("event_id", eventUUID)
      .single();

    if (selErr) throw new Error(`event balance select (RefundCredited): ${selErr.message}`);
    if (!current) return;

    const { error } = await supabase
      .from("vault_event_balances")
      .update({ ticket_refunds_wei: (BigInt(current.ticket_refunds_wei) + BigInt(amount)).toString() })
      .eq("event_id", eventUUID);
    if (error) throw new Error(`event balance update ticket_refunds (RefundCredited): ${error.message}`);
  }

  // ── ShopEarningsConfirmed ──
  // Event: ShopEarningsConfirmed(uint256 indexed shopId, uint256 indexed eventId, uint256 amount, uint256 feeDeducted)
  // Only records the fee into vault_event_balances — shop balance read from chain.
  private async onShopEarningsConfirmed(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const shopIdOnchain = Number(args[0]);
    const eventIdOnchain = Number(args[1]);
    const amount = args[2].toString();       // net amount after fee
    const feeDeducted = args[3].toString();  // fee amount

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    if (!eventUUID) {
      this.log(`ShopEarningsConfirmed: shop ${shopIdOnchain}, event ${eventIdOnchain} not in DB — skipping fee record`);
      return;
    }

    await this.ensureEventBalanceRow(eventUUID);

    const { data: evBal, error: selErr } = await supabase
      .from("vault_event_balances")
      .select("shop_fees_wei")
      .eq("event_id", eventUUID)
      .single();

    if (selErr) throw new Error(`event balance select shop_fees (EarningsConfirmed): ${selErr.message}`);
    if (!evBal) return;

    const { error } = await supabase
      .from("vault_event_balances")
      .update({ shop_fees_wei: (BigInt(evBal.shop_fees_wei) + BigInt(feeDeducted)).toString() })
      .eq("event_id", eventUUID);
    if (error) throw new Error(`event balance update shop_fees (EarningsConfirmed): ${error.message}`);

    this.log(`ShopEarningsConfirmed: shop ${shopIdOnchain}, event ${eventIdOnchain}, net ${ethers.formatEther(amount)} ETH, fee ${ethers.formatEther(feeDeducted)} ETH`);
  }

  // ── ShopRefundCredited ──
  // Event: ShopRefundCredited(uint256 indexed eventId, uint256 indexed shopId, address indexed to, uint256 amount)
  // Only records the refund into vault_event_balances — shop balance read from chain.
  private async onShopRefundCredited(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const shopIdOnchain = Number(args[1]);
    // args[2] = to (address, indexed) — skip
    const amount = args[3] ? args[3].toString() : "0";

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    if (!eventUUID) return;

    await this.ensureEventBalanceRow(eventUUID);

    const { data: current, error: selErr } = await supabase
      .from("vault_event_balances")
      .select("shop_refunds_wei")
      .eq("event_id", eventUUID)
      .single();

    if (selErr) throw new Error(`event balance select (ShopRefundCredited): ${selErr.message}`);
    if (!current) return;

    const { error } = await supabase
      .from("vault_event_balances")
      .update({ shop_refunds_wei: (BigInt(current.shop_refunds_wei) + BigInt(amount)).toString() })
      .eq("event_id", eventUUID);
    if (error) throw new Error(`event balance update shop_refunds (ShopRefundCredited): ${error.message}`);

    this.log(`ShopRefundCredited: shop ${shopIdOnchain}, event ${eventIdOnchain}, amount ${ethers.formatEther(amount)} ETH`);
  }

  // ── EventSettled ──
  private async onEventSettled(args: ethers.Result, _meta: LogMeta): Promise<void> {
    const eventIdOnchain = Number(args[0]);
    const platformAmount = args[1].toString();
    const eventManagerAmount = args[2].toString();
    const platformPercent = Number(args[3]);

    const eventUUID = await this.resolveEventUUID(eventIdOnchain);
    if (!eventUUID) return;

    const { error } = await supabase
      .from("vault_event_balances")
      .update({
        is_settled: true,
        platform_amount_wei: platformAmount,
        event_manager_amount_wei: eventManagerAmount,
      })
      .eq("event_id", eventUUID);
    if (error) throw new Error(`event settle: ${error.message}`);

    this.log(`Event ${eventIdOnchain} settled: platform ${ethers.formatEther(platformAmount)} ETH (${platformPercent}%), manager ${ethers.formatEther(eventManagerAmount)} ETH`);
  }

  // ── Helpers ──

  private async ensureEventBalanceRow(eventUUID: string): Promise<void> {
    const { error } = await supabase.from("vault_event_balances").upsert(
      {
        event_id: eventUUID,
        ticket_revenue_wei: "0",
        ticket_refunds_wei: "0",
        shop_revenue_wei: "0",
        shop_refunds_wei: "0",
        shop_fees_wei: "0",
        is_settled: false,
        platform_amount_wei: "0",
        event_manager_amount_wei: "0",
      },
      { onConflict: "event_id", ignoreDuplicates: true }
    );
    if (error) throw new Error(`ensureEventBalanceRow: ${error.message}`);
  }

  private async resolveEventUUID(eventIdOnchain: number): Promise<string | null> {
    const { data } = await supabase
      .from("events")
      .select("id")
      .eq("event_id_onchain", eventIdOnchain)
      .single();
    return data?.id || null;
  }
}
