// ── Plain-English error mapping for contract reverts ──
// Maps Solidity custom error names to user-friendly messages

export const REVERT_MAP: Record<string, string> = {
  // ── TicketNFT ──
  SoulboundTransferBlocked: "Tickets are non-transferable. You cannot send them to another wallet.",
  EventNotLive: "This event is not available for ticket purchases yet.",
  EventNotFound: "This event does not exist.",
  EventAlreadyLive: "This event is already live.",
  EventAlreadyCancelled: "This event has been cancelled.",
  EventAlreadyCompleted: "This event has already ended.",
  InsufficientPayment: "The amount sent is not enough. Please check the ticket price.",
  TicketAlreadyReturned: "This ticket has already been returned.",
  TicketAlreadyEntered: "This ticket has already been scanned for entry.",
  ReturnWindowClosed: "The return window has closed (less than 3 hours before event).",
  WalkInTicketCannotReturn: "Walk-in tickets cannot be returned.",
  NotTicketOwner: "You don't own this ticket.",
  NotOwnerOrDelegate: "Only the ticket owner or their delegate can do this.",
  DelegateAlreadySet: "A delegate is already set for this ticket.",
  NoDelegateSet: "No delegate is assigned to this ticket.",
  DelegateLocked: "Delegate cannot be changed after entry.",
  InvalidEnclosure: "This enclosure doesn't exist for the selected venue.",
  SeatNotAvailable: "This seat is no longer available.",
  PriceBelowMinimum: "Ticket price must be at least 0.001 WIRE.",
  InvalidTimeRange: "Event end time must be after start time.",
  QRExpired: "QR code has expired. Please generate a new one.",
  InvalidSignature: "Invalid QR signature. Please try again.",
  CancellationRefundAlreadyClaimed: "You have already claimed your refund for this cancelled event.",

  // ── StadiumShop ──
  ShopNotApproved: "This shop hasn't been approved yet.",
  ShopNotActive: "This shop is currently inactive.",
  ProductNotActive: "This product is currently unavailable.",
  InsufficientInventory: "Not enough stock available.",
  OrderNotActive: "This order is no longer active.",
  OrderRefundWindowClosed: "The refund window for this order has closed.",
  NotOrderBuyer: "You didn't place this order.",
  ProfileRequired: "Please complete your profile before proceeding.",
  InvalidTicketForPurchase: "The ticket used for this purchase is invalid.",

  // ── Vault ──
  NoRefundAvailable: "You have no refunds to claim.",
  EventNotSettled: "This event hasn't been settled yet.",
  EventAlreadySettled: "This event has already been settled.",
  UnauthorizedDepositor: "Not authorized to deposit funds.",
  InsufficientBalance: "Insufficient balance in the vault.",
  WithdrawalExceedsBalance: "Withdrawal amount exceeds available balance.",

  // ── General ──
  OwnableUnauthorizedAccount: "You don't have permission to perform this action.",
  EnforcedPause: "The contract is currently paused for maintenance.",
  ReentrancyGuardReentrantCall: "Transaction rejected for security reasons. Please try again.",
};

/**
 * Extract a user-friendly error message from a contract revert.
 * Falls back to a generic message if the error isn't in our map.
 */
export function getRevertMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  const errorStr = String(error);

  // Check for custom error names in the error string
  for (const [key, message] of Object.entries(REVERT_MAP)) {
    if (errorStr.includes(key)) {
      return message;
    }
  }

  // Check for user rejection
  if (
    errorStr.includes("User rejected") ||
    errorStr.includes("user rejected") ||
    errorStr.includes("ACTION_REJECTED")
  ) {
    return "Transaction was cancelled.";
  }

  // Check for insufficient funds
  if (
    errorStr.includes("insufficient funds") ||
    errorStr.includes("InsufficientFunds")
  ) {
    return "Insufficient WIRE balance to complete this transaction.";
  }

  return "Transaction failed. Please try again or check the block explorer for details.";
}
