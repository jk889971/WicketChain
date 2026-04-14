// Domain-specific hooks — encapsulate all Web3 logic per business domain.
// Components import from here, never call Wagmi/Viem directly.

export { useTicketPurchase } from "./useTicketPurchase";
export { useTicketReturn } from "./useTicketReturn";
export { useDelegate } from "./useDelegate";
export { useRefundClaim } from "./useRefundClaim";
export { useVaultEventBalance, useVaultShopBalance, useShopFeeBps } from "./useVaultBalance";
export { useShopManagement } from "./useShopManagement";
export { useEventManagement } from "./useEventManagement";
export { useVenueManagement } from "./useVenueManagement";
export { useSettlement } from "./useSettlement";
