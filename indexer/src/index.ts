// ============================================================
// WicketChain Event Indexer — Main Entry Point
// Starts one indexer per contract (5 total, 16+ event listeners)
// WebSocket-based, NOT polling [Sec 16]
// Gap recovery on reconnect via eth_getLogs [Sec 21]
// Idempotent upserts on (chain_id, tx_hash, log_index) [Sec 21]
// ============================================================

import { TicketNFTIndexer } from "./indexers/ticketNFT.js";
import { StadiumShopIndexer } from "./indexers/stadiumShop.js";
import { VaultIndexer } from "./indexers/vault.js";
import { VenueRegistryIndexer } from "./indexers/venueRegistry.js";
import { UserProfileIndexer } from "./indexers/userProfile.js";

async function main() {
  console.log("============================================");
  console.log("  WicketChain Event Indexer");
  console.log("  5 contracts · 16+ events · WebSocket");
  console.log("============================================\n");

  // Create all indexers
  const indexers = [
    new VenueRegistryIndexer(),
    new UserProfileIndexer(),
    new VaultIndexer(),
    new TicketNFTIndexer(),
    new StadiumShopIndexer(),
  ];

  // Start all concurrently
  await Promise.all(indexers.map((idx) => idx.start()));

  console.log("\n[main] All indexers running. Press Ctrl+C to stop.\n");

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[main] Shutting down...");
    await Promise.all(indexers.map((idx) => idx.stop()));
    console.log("[main] All indexers stopped. Goodbye!");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});

// ── Process-level safety nets ──
// These catch anything that escapes individual try/catch blocks and prevent
// the process from dying on unexpected errors.
process.on("uncaughtException", (err) => {
  console.error(`[${new Date().toISOString()}] [UNCAUGHT EXCEPTION]`, err);
  // Do NOT exit — let the indexers keep running and self-recover.
});

process.on("unhandledRejection", (reason) => {
  console.error(`[${new Date().toISOString()}] [UNHANDLED REJECTION]`, reason);
  // Do NOT exit — log and continue.
});
