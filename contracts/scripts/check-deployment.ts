/**
 * Post-deployment health check — verifies all contracts are wired correctly (Hardhat v3)
 *
 * Usage:
 *   npx hardhat run scripts/check-deployment.ts --network wirefluidTestnet
 *
 * Required env vars: all contract addresses (same as verify-all.ts)
 */

import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const { viem } = connection;

  const userProfileAddr = process.env.USER_PROFILE_ADDRESS! as `0x${string}`;
  const venueRegistryAddr = process.env
    .VENUE_REGISTRY_ADDRESS! as `0x${string}`;
  const vaultAddr = process.env.VAULT_ADDRESS! as `0x${string}`;
  const ticketNFTAddr = process.env.TICKET_NFT_ADDRESS! as `0x${string}`;
  const stadiumShopAddr = process.env.STADIUM_SHOP_ADDRESS! as `0x${string}`;

  if (
    !userProfileAddr ||
    !venueRegistryAddr ||
    !vaultAddr ||
    !ticketNFTAddr ||
    !stadiumShopAddr
  ) {
    console.error("ERROR: Set all contract addresses in .env");
    process.exit(1);
  }

  console.log("=== WicketChain Deployment Health Check ===\n");

  const ticketNFT = await viem.getContractAt("TicketNFT", ticketNFTAddr);
  const vault = await viem.getContractAt("WicketChainVault", vaultAddr);
  const stadiumShop = await viem.getContractAt("StadiumShop", stadiumShopAddr);
  const venueRegistry = await viem.getContractAt(
    "VenueRegistry",
    venueRegistryAddr
  );

  let allOk = true;
  const check = (name: string, ok: boolean) => {
    console.log(`  ${ok ? "OK" : "FAIL"} ${name}`);
    if (!ok) allOk = false;
  };

  // ── 1. Contract wiring ──
  console.log("1. Contract Wiring:");
  const shopAddrOnTicket = await ticketNFT.read.stadiumShopAddress();
  check(
    `TicketNFT.stadiumShopAddress = StadiumShop`,
    shopAddrOnTicket.toLowerCase() === stadiumShopAddr.toLowerCase()
  );

  const vaultOnTicket = await ticketNFT.read.vault();
  check(
    `TicketNFT.vault = Vault`,
    vaultOnTicket.toLowerCase() === vaultAddr.toLowerCase()
  );

  const venueOnTicket = await ticketNFT.read.venueRegistry();
  check(
    `TicketNFT.venueRegistry = VenueRegistry`,
    venueOnTicket.toLowerCase() === venueRegistryAddr.toLowerCase()
  );

  const vaultOnShop = await stadiumShop.read.vault();
  check(
    `StadiumShop.vault = Vault`,
    vaultOnShop.toLowerCase() === vaultAddr.toLowerCase()
  );

  const ticketOnShop = await stadiumShop.read.ticketNFT();
  check(
    `StadiumShop.ticketNFT = TicketNFT`,
    ticketOnShop.toLowerCase() === ticketNFTAddr.toLowerCase()
  );

  const profileOnShop = await stadiumShop.read.userProfile();
  check(
    `StadiumShop.userProfile = UserProfile`,
    profileOnShop.toLowerCase() === userProfileAddr.toLowerCase()
  );

  // ── 2. Vault authorizations ──
  console.log("\n2. Vault Authorizations:");
  const AUTH_ROLE = await vault.read.AUTHORIZED_CONTRACT_ROLE();
  const ticketAuthed = await vault.read.hasRole([AUTH_ROLE, ticketNFTAddr]);
  check(`Vault authorized: TicketNFT`, ticketAuthed);

  const shopAuthed = await vault.read.hasRole([AUTH_ROLE, stadiumShopAddr]);
  check(`Vault authorized: StadiumShop`, shopAuthed);

  // ── 3. Role grants ──
  console.log("\n3. Role Grants:");
  const TICKET_CONTRACT_ROLE = await stadiumShop.read.TICKET_CONTRACT_ROLE();
  const ticketHasShopRole = await stadiumShop.read.hasRole([
    TICKET_CONTRACT_ROLE,
    ticketNFTAddr,
  ]);
  check(
    `StadiumShop TICKET_CONTRACT_ROLE -> TicketNFT`,
    ticketHasShopRole
  );

  if (process.env.EVENT_MANAGER_ADDRESS) {
    const EM_ROLE = await ticketNFT.read.EVENT_MANAGER_ROLE();
    const hasEM = await ticketNFT.read.hasRole([
      EM_ROLE,
      process.env.EVENT_MANAGER_ADDRESS as `0x${string}`,
    ]);
    check(`TicketNFT EVENT_MANAGER_ROLE -> ${process.env.EVENT_MANAGER_ADDRESS}`, hasEM);
  }

  if (process.env.QR_VERIFIER_ADDRESS) {
    const QR_ROLE = await ticketNFT.read.QR_VERIFIER_ROLE();
    const hasQR = await ticketNFT.read.hasRole([
      QR_ROLE,
      process.env.QR_VERIFIER_ADDRESS as `0x${string}`,
    ]);
    check(`TicketNFT QR_VERIFIER_ROLE -> ${process.env.QR_VERIFIER_ADDRESS}`, hasQR);
  }

  if (process.env.WALK_IN_MANAGER_ADDRESS) {
    const WI_ROLE = await ticketNFT.read.WALK_IN_MANAGER_ROLE();
    const hasWI = await ticketNFT.read.hasRole([
      WI_ROLE,
      process.env.WALK_IN_MANAGER_ADDRESS as `0x${string}`,
    ]);
    check(`TicketNFT WALK_IN_MANAGER_ROLE -> ${process.env.WALK_IN_MANAGER_ADDRESS}`, hasWI);
  }

  // ── 4. Constants ──
  console.log("\n4. Constants:");
  const platformTreasury = await vault.read.platformTreasury();
  const shopFeeBps = await vault.read.shopFeeBps();
  console.log(`  Platform Treasury: ${platformTreasury}`);
  console.log(`  Shop Fee BPS:      ${shopFeeBps} (${Number(shopFeeBps) / 100}%)`);

  // ── Summary ──
  console.log(`\n=== ${allOk ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED"} ===`);
  if (!allOk) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
