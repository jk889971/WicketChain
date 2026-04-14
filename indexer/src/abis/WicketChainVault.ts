// WicketChainVault — Event ABI fragments only
export const WicketChainVaultEvents = [
  "event Deposited(uint256 indexed eventId, uint8 category, uint256 amount)",
  "event RefundCredited(uint256 indexed eventId, address indexed to, uint256 amount)",
  "event RefundClaimed(address indexed claimant, uint256 amount)",
  "event ShopEarningRecorded(uint256 indexed eventId, uint256 indexed shopId, uint256 amount)",
  "event ShopEarningsConfirmed(uint256 indexed shopId, uint256 indexed eventId, uint256 amount, uint256 feeDeducted)",
  "event ShopWithdrawal(uint256 indexed shopId, address indexed owner, uint256 amount)",
  "event EventSettled(uint256 indexed eventId, uint256 platformAmount, uint256 eventManagerAmount, uint256 platformPercent)",
  "event ShopFeeUpdated(uint256 oldBps, uint256 newBps)",
  "event ShopRefundCredited(uint256 indexed eventId, uint256 indexed shopId, address indexed to, uint256 amount)",
  "event ShopOwnerRegistered(uint256 indexed shopId, address indexed owner)",
] as const;
