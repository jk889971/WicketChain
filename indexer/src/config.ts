// ============================================================
// WicketChain Indexer — Configuration
// Loads env vars, contract addresses, chain config
// ============================================================

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load from contracts/.env (shared with the rest of the project)
dotenv.config({ path: path.resolve(__dirname, "../../contracts/.env") });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

// ── Chain ──
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "92533");

// WebSocket RPC — prefer WSS, fall back to HTTPS (ethers handles both)
export const WS_RPC_URL =
  process.env.WS_RPC_URL ||
  process.env.WIREFLUID_RPC_URL?.replace("https://", "wss://") ||
  "wss://ws.wirefluid.com";

// HTTP RPC for gap recovery (eth_getLogs)
export const HTTP_RPC_URL =
  process.env.WIREFLUID_RPC_URL || "https://evm.wirefluid.com";

// ── Contracts ──
export const CONTRACTS = {
  TicketNFT: required("TICKET_NFT_ADDRESS"),
  StadiumShop: required("STADIUM_SHOP_ADDRESS"),
  WicketChainVault: required("VAULT_ADDRESS"),
  VenueRegistry: required("VENUE_REGISTRY_ADDRESS"),
  UserProfile: required("USER_PROFILE_ADDRESS"),
} as const;

// ── Supabase ──
export const SUPABASE_URL = required("SUPABASE_URL");
export const SUPABASE_SERVICE_KEY = required("SUPABASE_SERVICE_KEY");

// ── Indexer settings ──
export const RECONNECT_DELAY_MS = 3000;
export const MAX_RECONNECT_DELAY_MS = 30000;
export const GAP_RECOVERY_BLOCK_RANGE = 2000; // max blocks per eth_getLogs call

console.log(`[config] Chain ID: ${CHAIN_ID}`);
console.log(`[config] WS RPC:   ${WS_RPC_URL}`);
console.log(`[config] HTTP RPC: ${HTTP_RPC_URL}`);
console.log(`[config] Contracts:`);
Object.entries(CONTRACTS).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
