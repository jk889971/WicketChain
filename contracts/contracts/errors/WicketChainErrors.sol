// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

// WicketChain Shared Error Definitions
// All custom errors used across WicketChain contracts. Saves ~200 gas per revert vs require strings.

// ── General ──
error ZeroAddress();
error Unauthorized(address caller, bytes32 role);

// ── Venue ──
error VenueNotFound(uint256 venueId);
error VenueNotActive(uint256 venueId);
error EnclosureNotFound(uint256 venueId, uint256 enclosureId);
error EnclosureNotActive(uint256 venueId, uint256 enclosureId);
error InvalidRow(uint256 venueId, uint256 enclosureId, bytes1 rowLabel);
error RowAlreadyExists(uint256 venueId, uint256 enclosureId, bytes1 rowLabel);
error RowSeatCountMismatch();
error EmptyRowLabels(uint256 venueId);

// ── Event ──
error EventNotFound(uint256 eventId);
error EventNotLive(uint256 eventId);
error EventNotCompleted(uint256 eventId);
error EventAlreadySettled(uint256 eventId);
error EventAlreadyCancelled(uint256 eventId);
error InvalidEventTimes(uint256 startTime, uint256 endTime);
error EventNotCancelled(uint256 eventId);

// ── Ticket ──
error NotTicketOwner(uint256 tokenId, address caller);
error TicketNotFound(uint256 tokenId);
error TicketAlreadyReturned(uint256 tokenId);

error WalkInNonRefundable(uint256 tokenId);
error RefundWindowClosed(uint256 eventId, uint256 startTime);
error AlreadyEntered(uint256 tokenId);
error UseClaimCancellationRefund(uint256 tokenId);
error InsufficientPayment(uint256 required, uint256 sent);
error InvalidSeatNumber(uint256 venueId, uint256 enclosureId, bytes1 rowLabel, uint256 seat);
error SeatAlreadyBooked(uint256 eventId, uint256 enclosureId, bytes1 rowLabel, uint256 seat);
error SoulboundTransferBlocked(uint256 tokenId);
error MinimumPriceNotMet(uint256 price, uint256 minimum);
error DelegateLocked(uint256 tokenId);
error TooManySeats(uint256 count, uint256 max);
error PricingNotSet(uint256 eventId, uint256 enclosureId);
error EventVenueChangeLocked(uint256 eventId);
error EnclosureRefundNotInitiated(uint256 eventId, uint256 enclosureId);


// ── Profile ──
error ProfileRequired(address user);

// ── Vault ──
error NothingToClaim();
error TransferFailed();
error InsufficientVaultBalance(uint256 requested, uint256 available);
error ContractNotAuthorized(address caller);
error AlreadySettled(uint256 eventId);
error InvalidPlatformPercent(uint256 percent);
error InsufficientConfirmedEarnings(uint256 requested, uint256 available);
error InvalidWithdrawalAmount();
error InvalidShopFeeBps(uint256 bps, uint256 max);

// ── Shop ──
error ShopNotFound(uint256 shopId);
error ShopNotApproved(uint256 shopId);
error ShopNotActive(uint256 shopId);
error NotShopOwner(uint256 shopId, address caller);
error ProductNotFound(uint256 productId);
error ProductNotActive(uint256 productId);
error InsufficientStock(uint256 productId, uint256 requested, uint256 available);
error OrderNotFound(uint256 orderId);
error OrderNotActive(uint256 orderId);
error OrderNotConfirmed(uint256 orderId);
error NotOrderOwner(uint256 orderId, address caller);

error RefundWindowStillOpen(uint256 orderId);
error OrderAlreadyConfirmed(uint256 orderId);
error InvalidCartLength();
error TicketNotOwnedByCaller(uint256 tokenId, address caller);
error VenueNotAssociatedWithShop(uint256 shopId, uint256 venueId);
error ShopAlreadyRegistered(address owner);
error ShopOwnerBanned(address owner);
error ShopNotRejectable(uint256 shopId);
error VenueNotInShop(uint256 shopId, uint256 venueId);
error RowNotFound(uint256 venueId, uint256 enclosureId, uint256 rowIndex);
error EventEnded(uint256 eventId, uint256 endTime);
error ShopNotRegistered(address caller);
error SeatCountReductionNotAllowed(uint256 venueId, uint256 enclosureId, bytes1 rowLabel, uint256 current, uint256 requested);
error MaxOrdersExceeded();

