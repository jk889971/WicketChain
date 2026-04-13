/**
 * Post-deploy role setup script for WicketChain (Hardhat v3)
 *
 * Grants the following roles:
 *   - TicketNFT: EVENT_MANAGER_ROLE → eventManagerAddress
 *   - TicketNFT: QR_VERIFIER_ROLE → qrVerifierAddress
 *   - TicketNFT: WALK_IN_MANAGER_ROLE → walkInManagerAddress
 *   - StadiumShop: TICKET_CONTRACT_ROLE → ticketNFTAddress
 *   - WicketChainVault: AUTHORIZED_CONTRACT_ROLE → ticketNFTAddress
 *   - WicketChainVault: AUTHORIZED_CONTRACT_ROLE → stadiumShopAddress
 *
 * Usage:
 *   npx hardhat run scripts/setup-roles.ts --network wirefluidTestnet
 *
 * Required env vars:
 *   TICKET_NFT_ADDRESS      — deployed TicketNFT contract address
 *   STADIUM_SHOP_ADDRESS    — deployed StadiumShop contract address
 *   VAULT_ADDRESS           — deployed WicketChainVault contract address
 *   EVENT_MANAGER_ADDRESS   — wallet to grant EVENT_MANAGER_ROLE
 *   QR_VERIFIER_ADDRESS     — wallet to grant QR_VERIFIER_ROLE
 *   WALK_IN_MANAGER_ADDRESS — wallet to grant WALK_IN_MANAGER_ROLE
 */

import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const { viem } = connection;
  const publicClient = await viem.getPublicClient();

  // ── Read addresses from env ──
  const ticketNFTAddress = process.env.TICKET_NFT_ADDRESS;
  const stadiumShopAddress = process.env.STADIUM_SHOP_ADDRESS;
  const vaultAddress = process.env.VAULT_ADDRESS;
  const eventManagerAddress = process.env.EVENT_MANAGER_ADDRESS;
  const qrVerifierAddress = process.env.QR_VERIFIER_ADDRESS;
  const walkInManagerAddress = process.env.WALK_IN_MANAGER_ADDRESS;

  if (!ticketNFTAddress || !stadiumShopAddress || !vaultAddress) {
    console.error(
      "ERROR: Set TICKET_NFT_ADDRESS, STADIUM_SHOP_ADDRESS, and VAULT_ADDRESS in .env"
    );
    process.exit(1);
  }
  if (!eventManagerAddress || !qrVerifierAddress || !walkInManagerAddress) {
    console.error(
      "ERROR: Set EVENT_MANAGER_ADDRESS, QR_VERIFIER_ADDRESS, WALK_IN_MANAGER_ADDRESS in .env"
    );
    process.exit(1);
  }

  console.log("\n=== WicketChain Role Setup ===\n");
  console.log(`TicketNFT:      ${ticketNFTAddress}`);
  console.log(`StadiumShop:    ${stadiumShopAddress}`);
  console.log(`Vault:          ${vaultAddress}`);
  console.log(`Event Manager:  ${eventManagerAddress}`);
  console.log(`QR Verifier:    ${qrVerifierAddress}`);
  console.log(`Walk-In Mgr:    ${walkInManagerAddress}`);
  console.log("");

  // ── Get contract instances ──
  const ticketNFT = await viem.getContractAt(
    "TicketNFT",
    ticketNFTAddress as `0x${string}`
  );
  const stadiumShop = await viem.getContractAt(
    "StadiumShop",
    stadiumShopAddress as `0x${string}`
  );
  const vault = await viem.getContractAt(
    "WicketChainVault",
    vaultAddress as `0x${string}`
  );

  // ── Read role hashes ──
  const EVENT_MANAGER_ROLE = await ticketNFT.read.EVENT_MANAGER_ROLE();
  const QR_VERIFIER_ROLE = await ticketNFT.read.QR_VERIFIER_ROLE();
  const WALK_IN_MANAGER_ROLE = await ticketNFT.read.WALK_IN_MANAGER_ROLE();
  const TICKET_CONTRACT_ROLE = await stadiumShop.read.TICKET_CONTRACT_ROLE();

  // ── Grant roles on TicketNFT ──
  console.log("1. Granting EVENT_MANAGER_ROLE on TicketNFT...");
  let tx = await ticketNFT.write.grantRole([
    EVENT_MANAGER_ROLE,
    eventManagerAddress as `0x${string}`,
  ]);
  console.log(`   TX: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("   Confirmed.");

  console.log("2. Granting QR_VERIFIER_ROLE on TicketNFT...");
  tx = await ticketNFT.write.grantRole([
    QR_VERIFIER_ROLE,
    qrVerifierAddress as `0x${string}`,
  ]);
  console.log(`   TX: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("   Confirmed.");

  console.log("3. Granting WALK_IN_MANAGER_ROLE on TicketNFT...");
  tx = await ticketNFT.write.grantRole([
    WALK_IN_MANAGER_ROLE,
    walkInManagerAddress as `0x${string}`,
  ]);
  console.log(`   TX: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("   Confirmed.");

  // ── Grant TICKET_CONTRACT_ROLE on StadiumShop → TicketNFT address ──
  console.log(
    "4. Granting TICKET_CONTRACT_ROLE on StadiumShop -> TicketNFT..."
  );
  tx = await stadiumShop.write.grantRole([
    TICKET_CONTRACT_ROLE,
    ticketNFTAddress as `0x${string}`,
  ]);
  console.log(`   TX: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("   Confirmed.");

  // ── Authorize TicketNFT and StadiumShop on WicketChainVault ──
  // Required so both contracts can call vault.deposit(), vault.creditRefund(),
  // vault.recordShopEarning(), vault.creditShopRefund(), vault.confirmShopEarnings().
  console.log("5. Authorizing TicketNFT on WicketChainVault...");
  tx = await vault.write.authorizeContract([ticketNFTAddress as `0x${string}`]);
  console.log(`   TX: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("   Confirmed.");

  console.log("6. Authorizing StadiumShop on WicketChainVault...");
  tx = await vault.write.authorizeContract([stadiumShopAddress as `0x${string}`]);
  console.log(`   TX: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("   Confirmed.");

  console.log("\n=== All roles granted successfully! ===\n");

  // ── Verify all roles and authorizations ──
  console.log("Verifying roles...");
  const hasEM = await ticketNFT.read.hasRole([
    EVENT_MANAGER_ROLE,
    eventManagerAddress as `0x${string}`,
  ]);
  const hasQR = await ticketNFT.read.hasRole([
    QR_VERIFIER_ROLE,
    qrVerifierAddress as `0x${string}`,
  ]);
  const hasWI = await ticketNFT.read.hasRole([
    WALK_IN_MANAGER_ROLE,
    walkInManagerAddress as `0x${string}`,
  ]);
  const hasTC = await stadiumShop.read.hasRole([
    TICKET_CONTRACT_ROLE,
    ticketNFTAddress as `0x${string}`,
  ]);
  const AUTH_ROLE = await vault.read.AUTHORIZED_CONTRACT_ROLE();
  const vaultAuthTicket = await vault.read.hasRole([AUTH_ROLE, ticketNFTAddress as `0x${string}`]);
  const vaultAuthShop = await vault.read.hasRole([AUTH_ROLE, stadiumShopAddress as `0x${string}`]);

  console.log(`  EVENT_MANAGER_ROLE:              ${hasEM ? "OK" : "FAILED"}`);
  console.log(`  QR_VERIFIER_ROLE:                ${hasQR ? "OK" : "FAILED"}`);
  console.log(`  WALK_IN_MANAGER_ROLE:            ${hasWI ? "OK" : "FAILED"}`);
  console.log(`  TICKET_CONTRACT_ROLE:            ${hasTC ? "OK" : "FAILED"}`);
  console.log(`  Vault authorized: TicketNFT:     ${vaultAuthTicket ? "OK" : "FAILED"}`);
  console.log(`  Vault authorized: StadiumShop:   ${vaultAuthShop ? "OK" : "FAILED"}`);

  if (!hasEM || !hasQR || !hasWI || !hasTC || !vaultAuthTicket || !vaultAuthShop) {
    console.error("\nERROR: Some roles failed to grant!");
    process.exit(1);
  }

  console.log("\nAll roles verified successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
