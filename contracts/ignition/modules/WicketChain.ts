import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * WicketChain Ignition Module — Deploys all 5 core contracts
 *
 * Deploy order:
 *   1. UserProfile (standalone)
 *   2. VenueRegistry (standalone)
 *   3. WicketChainVault (needs: platformTreasury, shopFeeBps)
 *   4. TicketNFT (needs: vault, venueRegistry)
 *   5. StadiumShop (needs: vault, ticketNFT, userProfile)
 *
 * Post-deploy wiring (done in this module):
 *   - TicketNFT.setStadiumShopAddress(stadiumShop)
 *   - Vault.authorizeContract(ticketNFT)
 *   - Vault.authorizeContract(stadiumShop)
 */

const SHOP_FEE_BPS = 500n; // 5%

// Read platform treasury from .env — MUST be set before deploying
const PLATFORM_TREASURY = process.env.PLATFORM_TREASURY_ADDRESS;
if (!PLATFORM_TREASURY || PLATFORM_TREASURY === "0x0000000000000000000000000000000000000000") {
  throw new Error(
    "PLATFORM_TREASURY_ADDRESS must be set in .env (non-zero address)"
  );
}

const WicketChainModule = buildModule("WicketChain", (m) => {
  const platformTreasury = m.getParameter(
    "platformTreasury",
    PLATFORM_TREASURY
  );

  // ── 1. Standalone Contracts ──
  const userProfile = m.contract("UserProfile", []);
  const venueRegistry = m.contract("VenueRegistry", []);

  // ── 2. Vault (Central Treasury) ──
  const vault = m.contract("WicketChainVault", [platformTreasury, SHOP_FEE_BPS]);

  // ── 3. TicketNFT (depends on vault + venueRegistry) ──
  const ticketNFT = m.contract("TicketNFT", [vault, venueRegistry]);

  // ── 4. StadiumShop (depends on vault + ticketNFT + userProfile) ──
  const stadiumShop = m.contract("StadiumShop", [vault, ticketNFT, userProfile]);

  // ── 5. Post-deploy wiring ──
  // Wire TicketNFT → StadiumShop for cascade refunds
  m.call(ticketNFT, "setStadiumShopAddress", [stadiumShop]);

  // Authorize both TicketNFT and StadiumShop on Vault
  m.call(vault, "authorizeContract", [ticketNFT], { id: "authorizeTicketNFT" });
  m.call(vault, "authorizeContract", [stadiumShop], {
    id: "authorizeStadiumShop",
  });

  return { userProfile, venueRegistry, vault, ticketNFT, stadiumShop };
});

export default WicketChainModule;
