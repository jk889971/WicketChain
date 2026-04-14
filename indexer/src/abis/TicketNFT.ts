// TicketNFT — Event ABI fragments only
export const TicketNFTEvents = [
  "event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, uint256 enclosureId, bytes1 rowLabel, uint256 seatNumber, address indexed buyer, uint256 price)",
  "event TicketReturned(uint256 indexed tokenId, address indexed owner, uint256 refundAmount)",
  "event EventCreated(uint256 indexed eventId, uint256 indexed venueId, string matchTitle, address eventManager)",
  "event EventLive(uint256 indexed eventId)",
  "event EventUpdated(uint256 indexed eventId, string newTitle, uint256 newVenueId)",
  "event EventCancelled(uint256 indexed eventId)",
  "event EventPostponed(uint256 indexed eventId, uint256 newStartTime, uint256 newEndTime)",
  "event EventStatusChanged(uint256 indexed eventId, uint8 status)",
  "event EventPricingSet(uint256 indexed eventId, uint256 indexed enclosureId, uint256 priceInWei)",
  "event DelegateSet(uint256 indexed tokenId, address indexed delegate)",
  "event DelegateRemoved(uint256 indexed tokenId)",
  "event EntryMarked(uint256 indexed tokenId, address indexed entrant)",
  "event WalkInTicketMinted(uint256 indexed tokenId, uint256 indexed eventId, bytes1 rowLabel, uint256 seatNumber, bytes32 entryCodeHash)",
  "event CancellationRefundClaimed(uint256 indexed tokenId, address indexed owner, uint256 refundAmount)",
  "event EnclosureForceRefunded(uint256 indexed eventId, uint256 indexed enclosureId)",
] as const;
