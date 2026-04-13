import type { NetworkConnection } from "hardhat/types/network";

export async function deployFixture(viem: NetworkConnection["viem"]) {
  const publicClient = await viem.getPublicClient();
  const [admin, eventManager, fan1, fan2, fan3, shopOwner, shopStaff, qrVerifier, walkInManager] =
    await viem.getWalletClients();

  // Deploy UserProfile
  const userProfile = await viem.deployContract("UserProfile");

  // Deploy VenueRegistry
  const venueRegistry = await viem.deployContract("VenueRegistry");

  // Deploy WicketChainVault (platformTreasury = admin, shopFeeBps = 500 = 5%)
  const vault = await viem.deployContract("WicketChainVault", [
    admin.account.address,
    500n,
  ]);

  // Deploy TicketNFT
  const ticketNFT = await viem.deployContract("TicketNFT", [
    vault.address,
    venueRegistry.address,
  ]);

  // Deploy StadiumShop
  const stadiumShop = await viem.deployContract("StadiumShop", [
    vault.address,
    ticketNFT.address,
    userProfile.address,
  ]);

  // Wire contracts: TicketNFT → StadiumShop
  await ticketNFT.write.setStadiumShopAddress([stadiumShop.address]);

  // Authorize contracts on Vault
  await vault.write.authorizeContract([ticketNFT.address]);
  await vault.write.authorizeContract([stadiumShop.address]);

  // Grant roles
  const EVENT_MANAGER_ROLE = await ticketNFT.read.EVENT_MANAGER_ROLE();
  const QR_VERIFIER_ROLE = await ticketNFT.read.QR_VERIFIER_ROLE();
  const WALK_IN_MANAGER_ROLE = await ticketNFT.read.WALK_IN_MANAGER_ROLE();
  const SHOP_STAFF_ROLE = await stadiumShop.read.SHOP_STAFF_ROLE();
  const TICKET_CONTRACT_ROLE = await stadiumShop.read.TICKET_CONTRACT_ROLE();

  await ticketNFT.write.grantRole([EVENT_MANAGER_ROLE, eventManager.account.address]);
  await ticketNFT.write.grantRole([QR_VERIFIER_ROLE, qrVerifier.account.address]);
  await ticketNFT.write.grantRole([WALK_IN_MANAGER_ROLE, walkInManager.account.address]);
  await stadiumShop.write.grantRole([SHOP_STAFF_ROLE, shopStaff.account.address]);
  await stadiumShop.write.grantRole([TICKET_CONTRACT_ROLE, ticketNFT.address]);

  return {
    publicClient,
    userProfile,
    venueRegistry,
    vault,
    ticketNFT,
    stadiumShop,
    admin,
    eventManager,
    fan1,
    fan2,
    fan3,
    shopOwner,
    shopStaff,
    qrVerifier,
    walkInManager,
  };
}

export async function createVenueAndEvent(
  viem: NetworkConnection["viem"],
  fixtures: Awaited<ReturnType<typeof deployFixture>>,
  startTime?: bigint,
  endTime?: bigint,
) {
  const { venueRegistry, ticketNFT, eventManager } = fixtures;

  // Create venue with admin
  await venueRegistry.write.createVenue(["Gaddafi Stadium", "Lahore", "ipfs://venue1"]);

  // Add enclosures with row-based seating
  // General Stand: Row A (5000 seats), Row B (3000 seats), Row C (2000 seats)
  await venueRegistry.write.addEnclosure([1n, "General Stand", ["0x41", "0x42", "0x43"], [5000n, 3000n, 2000n]]);
  // VIP Lounge: Rows start from D (500 seats), Row E (300 seats)
  await venueRegistry.write.addEnclosure([1n, "VIP Lounge", ["0x44", "0x45"], [500n, 300n]]);

  // Create event (as event manager)
  const publicClient = await viem.getPublicClient();
  const latestBlock = await publicClient.getBlock();
  const now = latestBlock.timestamp;
  const finalStart = startTime ?? (now + 864000n); // Default 10 days
  const finalEnd = endTime ?? (finalStart + 14400n); // 4 hours match

  const ticketNFTAsManager = await viem.getContractAt("TicketNFT", ticketNFT.address, {
    client: { wallet: eventManager },
  });
  await ticketNFTAsManager.write.createEvent([1n, "LQ vs KK", finalStart, finalEnd]);

  // Set pricing: General = 0.01 ETH, VIP = 0.05 ETH
  const generalPrice = 10000000000000000n; // 0.01 ETH
  const vipPrice = 50000000000000000n; // 0.05 ETH
  await ticketNFTAsManager.write.setEventPricing([1n, 1n, generalPrice]);
  await ticketNFTAsManager.write.setEventPricing([1n, 2n, vipPrice]);

  // Set event live
  await ticketNFTAsManager.write.setEventLive([1n]);

  return { startTime: finalStart, endTime: finalEnd, generalPrice, vipPrice };
}
