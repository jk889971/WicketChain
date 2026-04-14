// ── Contract Addresses ──
// All deployed on WireFluid Testnet (chain 92533)

function requireAddress(val: string | undefined, name: string): `0x${string}` {
  if (!val || !val.startsWith("0x") || val.length !== 42) {
    throw new Error(`[WicketChain] Invalid or missing contract address for ${name}. Check your .env file.`);
  }
  return val as `0x${string}`;
}

export const CONTRACTS = {
  ticketNFT:     requireAddress(process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS,     "NEXT_PUBLIC_TICKET_NFT_ADDRESS"),
  stadiumShop:   requireAddress(process.env.NEXT_PUBLIC_STADIUM_SHOP_ADDRESS,   "NEXT_PUBLIC_STADIUM_SHOP_ADDRESS"),
  vault:         requireAddress(process.env.NEXT_PUBLIC_VAULT_ADDRESS,           "NEXT_PUBLIC_VAULT_ADDRESS"),
  venueRegistry: requireAddress(process.env.NEXT_PUBLIC_VENUE_REGISTRY_ADDRESS, "NEXT_PUBLIC_VENUE_REGISTRY_ADDRESS"),
  userProfile:   requireAddress(process.env.NEXT_PUBLIC_USER_PROFILE_ADDRESS,   "NEXT_PUBLIC_USER_PROFILE_ADDRESS"),
  walkInWallet:  requireAddress(process.env.NEXT_PUBLIC_WALKIN_WALLET,          "NEXT_PUBLIC_WALKIN_WALLET"),
} as const;
