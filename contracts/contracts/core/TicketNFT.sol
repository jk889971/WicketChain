// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../base/WicketChainBase.sol";
import "../errors/WicketChainErrors.sol";
import "../interfaces/IVault.sol";
import "../interfaces/IVenueRegistry.sol";
import "../interfaces/IStadiumShop.sol";
import "../interfaces/ITicketNFT.sol";

/// @title WicketChain Ticket NFT — Soulbound Match Tickets
/// @author WicketChain Team
/// @notice Soulbound ERC-721 tickets with row-based seating, delegate entry, bulk purchase, and walk-in support
/// @dev All ETH flows through IVault. Transfers blocked via _update override.
contract TicketNFT is WicketChainBase, ERC721, ERC721Enumerable, AccessControl, ReentrancyGuard, Pausable {
    // ── Roles ──
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant EVENT_MANAGER_ROLE = keccak256("EVENT_MANAGER_ROLE");
    bytes32 public constant QR_VERIFIER_ROLE = keccak256("QR_VERIFIER_ROLE");
    bytes32 public constant WALK_IN_MANAGER_ROLE = keccak256("WALK_IN_MANAGER_ROLE");

    // ── Event Status ──
    enum EventStatus {
        CREATED,
        LIVE,
        REFUNDS_CLOSED,
        GATES_OPEN,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }

    // ── Structs ──
    struct Event {
        uint256 eventId;
        uint256 venueId;
        string matchTitle;
        uint256 startTime;
        uint256 endTime;
        EventStatus status;
        address eventManager;
    }

    struct EventEnclosurePricing {
        uint256 priceInWei;
        uint256 soldSeats;
    }

    /// @dev Storage-packed ticket data for gas efficiency (5 slots)
    struct TicketData {
        uint256 eventId;          // slot 1
        uint256 purchasePrice;    // slot 2
        uint128 venueId;          // slot 3 (16 bytes)
        uint128 enclosureId;      // slot 3 (16 bytes)
        bytes1 rowLabel;          // slot 4 (1 byte)
        uint64 seatNumber;        // slot 4 (8 bytes)
        uint64 purchaseTimestamp;  // slot 4 (8 bytes)
        uint8 flags;              // slot 4 (1 byte) — bit 0: isReturned, bit 1: isWalkIn, bit 2: isEntered
        bytes32 walkInEntryCode;  // slot 5
    }

    // ── Immutables (zero SLOAD cost) ──
    IVault public immutable vault;
    IVenueRegistry public immutable venueRegistry;

    // ── State ──
    address public stadiumShopAddress;
    uint256 public minimumTicketPrice = 5e11; // 0.0000005 ETH — adjustable by admin
    uint256 private _nextEventId = 1;
    uint256 private _nextTokenId = 1;

    mapping(uint256 => Event) private _events;
    mapping(uint256 => mapping(uint256 => EventEnclosurePricing)) public eventPricing;
    mapping(uint256 => TicketData) private _tickets;
    mapping(uint256 => address) public delegates;
    // eventId => enclosureId => rowLabel => seatNumber => booked
    mapping(uint256 => mapping(uint256 => mapping(bytes1 => mapping(uint256 => bool)))) public seatBooked;

    // ── C-01: Batch-refund cursors ──
    /// @dev Per-event cancellation progress. Public so frontend can poll completion.
    mapping(uint256 => uint256) public cancellationCursor;
    /// @dev Per-(event,enclosure) force-refund progress.
    mapping(uint256 => mapping(uint256 => uint256)) public enclosureRefundCursor;
    /// @dev True once forceRefundEnclosure has been called for a (event,enclosure) pair.
    mapping(uint256 => mapping(uint256 => bool)) public enclosureRefundInitiated;


    // ── Events ──
    event EventCreated(uint256 indexed eventId, uint256 indexed venueId, string matchTitle, address eventManager);
    event EventLive(uint256 indexed eventId);
    event EventStatusChanged(uint256 indexed eventId, EventStatus status);
    event EventPricingSet(uint256 indexed eventId, uint256 indexed enclosureId, uint256 priceInWei);
    event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, uint256 enclosureId, bytes1 rowLabel, uint256 seatNumber, address indexed buyer, uint256 price);
    event TicketReturned(uint256 indexed tokenId, address indexed owner, uint256 refundAmount);
    event EventUpdated(uint256 indexed eventId, string newTitle, uint256 newVenueId);
    event EventCancelled(uint256 indexed eventId);
    event CancellationRefundClaimed(uint256 indexed tokenId, address indexed owner, uint256 refundAmount);
    event EventPostponed(uint256 indexed eventId, uint256 newStartTime, uint256 newEndTime);
    event DelegateSet(uint256 indexed tokenId, address indexed delegate);
    event DelegateRemoved(uint256 indexed tokenId);
    event EntryMarked(uint256 indexed tokenId, address indexed entrant);
    event WalkInTicketMinted(uint256 indexed tokenId, uint256 indexed eventId, bytes1 rowLabel, uint256 seatNumber, bytes32 entryCodeHash);
    event EnclosureForceRefunded(uint256 indexed eventId, uint256 indexed enclosureId);
    event MinimumTicketPriceUpdated(uint256 oldPrice, uint256 newPrice);
    /// @dev Emitted after each processCancellationRefunds / processEnclosureRefunds batch.
    ///      Frontend reads cursor vs totalTokens to know when processing is complete.
    event CancellationBatchProcessed(uint256 indexed eventId, uint256 cursor, uint256 totalTokens);


    // ── Flag Bit Constants ──
    uint8 internal constant RETURNED_FLAG = 1;
    uint8 internal constant WALK_IN_FLAG  = 2;
    uint8 internal constant ENTERED_FLAG  = 4;

    // ── Flag Helpers ──
    function _isReturned(uint8 flags) internal pure returns (bool) { return flags & RETURNED_FLAG != 0; }
    function _isWalkIn(uint8 flags) internal pure returns (bool) { return flags & WALK_IN_FLAG != 0; }
    function _isEntered(uint8 flags) internal pure returns (bool) { return flags & ENTERED_FLAG != 0; }
    function _setReturned(uint8 flags) internal pure returns (uint8) { return flags | RETURNED_FLAG; }
    function _setWalkIn(uint8 flags) internal pure returns (uint8) { return flags | WALK_IN_FLAG; }
    function _setEntered(uint8 flags) internal pure returns (uint8) { return flags | ENTERED_FLAG; }

    /// @notice Initializes TicketNFT with vault and venue registry dependencies
    /// @param _vault The WicketChain Vault address for all ETH flows
    /// @param _venueRegistry The VenueRegistry address for venue validation
    constructor(
        address _vault,
        address _venueRegistry
    ) ERC721("WicketChain Ticket", "WCKT") {
        if (_vault == address(0) || _venueRegistry == address(0)) revert ZeroAddress();
        vault = IVault(_vault);
        venueRegistry = IVenueRegistry(_venueRegistry);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EVENT_MANAGER_ROLE, msg.sender);
    }

    // ═══════════════════════════════════════════════════════════
    //                    ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Sets the StadiumShop address for cascade refunds
    /// @param _shop The StadiumShop contract address
    function setStadiumShopAddress(address _shop) external onlyRole(ADMIN_ROLE) {
        if (_shop == address(0)) revert ZeroAddress();
        stadiumShopAddress = _shop;
    }

    /// @notice Pauses all ticket operations in an emergency
    /// @param reason The reason for pausing
    function pause(string calldata reason) external onlyRole(ADMIN_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    /// @notice Unpauses ticket operations
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    /// @notice Updates the minimum ticket price enforced on setEventPricing
    /// @param _price New minimum price in wei
    function setMinimumTicketPrice(uint256 _price) external onlyRole(ADMIN_ROLE) {
        uint256 oldPrice = minimumTicketPrice;
        minimumTicketPrice = _price;
        emit MinimumTicketPriceUpdated(oldPrice, _price);
    }

    // ═══════════════════════════════════════════════════════════
    //                    EVENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    /// @notice Creates a new event referencing a venue
    /// @param venueId The venue for this event (must exist and be active)
    /// @param matchTitle The match title (e.g., "Lahore Qalandars vs Karachi Kings")
    /// @param startTime Unix timestamp for match start
    /// @param endTime Unix timestamp for match end
    /// @return eventId The ID of the newly created event
    function createEvent(
        uint256 venueId,
        string calldata matchTitle,
        uint256 startTime,
        uint256 endTime
    ) external onlyRole(EVENT_MANAGER_ROLE) returns (uint256 eventId) {
        if (!venueRegistry.isVenueActive(venueId)) revert VenueNotActive(venueId);
        if (startTime >= endTime || startTime <= block.timestamp) revert InvalidEventTimes(startTime, endTime);

        eventId = _nextEventId++;
        _events[eventId] = Event({
            eventId: eventId,
            venueId: venueId,
            matchTitle: matchTitle,
            startTime: startTime,
            endTime: endTime,
            status: EventStatus.CREATED,
            eventManager: msg.sender
        });
        emit EventCreated(eventId, venueId, matchTitle, msg.sender);
    }

    /// @notice Updates the match title and/or venue for an existing event
    /// @param eventId The event to update
    /// @param newTitle New match title
    /// @param newVenueId New venue ID (must be active)
    /// @dev Venue changes are blocked once the event moves past CREATED status to prevent
    ///      orphaning existing tickets that reference the original venue's enclosure layout.
    function updateEvent(uint256 eventId, string calldata newTitle, uint256 newVenueId) external onlyRole(ADMIN_ROLE) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (!venueRegistry.isVenueActive(newVenueId)) revert VenueNotActive(newVenueId);
        if (newVenueId != evt.venueId && evt.status != EventStatus.CREATED)
            revert EventVenueChangeLocked(eventId);
        evt.matchTitle = newTitle;
        evt.venueId = newVenueId;
        emit EventUpdated(eventId, newTitle, newVenueId);
    }


    /// @notice Sets ticket price per enclosure for an event
    /// @param eventId The event to set pricing for
    /// @param enclosureId The enclosure within the venue
    /// @param priceInWei The ticket price in wei (must meet MINIMUM_TICKET_PRICE)
    function setEventPricing(
        uint256 eventId,
        uint256 enclosureId,
        uint256 priceInWei
    ) external onlyRole(EVENT_MANAGER_ROLE) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (priceInWei < minimumTicketPrice) revert MinimumPriceNotMet(priceInWei, minimumTicketPrice);
        if (!venueRegistry.isEnclosureActive(evt.venueId, enclosureId))
            revert EnclosureNotActive(evt.venueId, enclosureId);

        eventPricing[eventId][enclosureId].priceInWei = priceInWei;
        emit EventPricingSet(eventId, enclosureId, priceInWei);
    }

    /// @notice Opens ticket sales for an event
    /// @param eventId The event to make live
    function setEventLive(uint256 eventId) external onlyRole(EVENT_MANAGER_ROLE) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        evt.status = EventStatus.LIVE;
        emit EventLive(eventId);
        emit EventStatusChanged(eventId, EventStatus.LIVE);
    }

    /// @notice Updates event status (REFUNDS_CLOSED, GATES_OPEN, IN_PROGRESS, COMPLETED)
    /// @param eventId The event to update
    /// @param newStatus The new status
    /// @dev INTENTIONAL: Admin can set any status including re-opening a CANCELLED or COMPLETED event.
    ///      This is a deliberate admin escape-hatch for emergency recovery. Use with care.
    function updateEventStatus(uint256 eventId, EventStatus newStatus) external onlyRole(ADMIN_ROLE) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        evt.status = newStatus;
        emit EventStatusChanged(eventId, newStatus);
    }


    /// @notice Cancels an event. Marks status as CANCELLED.
    /// @dev C-01 fix: The auto-refund loop is replaced with a cursor-based batch processor.
    ///      Call processCancellationRefunds(eventId, batchSize) repeatedly after this until
    ///      cancellationCursor[eventId] >= _nextTokenId. Fan refund flow is unchanged:
    ///      fans still call vault.claimRefunds() — the batching is invisible to them.
    ///      Fans may also call claimCancellationRefund(tokenId) individually at any time.
    /// @param eventId The event to cancel
    function cancelEvent(uint256 eventId) external onlyRole(ADMIN_ROLE) nonReentrant {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (evt.status == EventStatus.CANCELLED) revert EventAlreadyCancelled(eventId);
        evt.status = EventStatus.CANCELLED;
        emit EventCancelled(eventId);
        emit EventStatusChanged(eventId, EventStatus.CANCELLED);
    }

    /// @notice Processes cancellation refunds in batches to avoid block gas limit.
    /// @dev C-01 fix: Call repeatedly with maxTokens (~300) until
    ///      cancellationCursor[eventId] >= totalTokens emitted in CancellationBatchProcessed.
    ///      Walk-in tickets are skipped (non-refundable). Already-returned tickets are skipped.
    /// @param eventId The cancelled event
    /// @param maxTokens Maximum tokens to process in this call (recommended: 300)
    function processCancellationRefunds(
        uint256 eventId,
        uint256 maxTokens
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (evt.status != EventStatus.CANCELLED) revert EventNotCancelled(eventId);

        uint256 cursor = cancellationCursor[eventId];
        if (cursor == 0) cursor = 1;

        uint256 processed = 0;
        while (cursor < _nextTokenId && processed < maxTokens) {
            TicketData storage ticket = _tickets[cursor];
            if (
                ticket.eventId == eventId &&
                !_isReturned(ticket.flags) &&
                !_isWalkIn(ticket.flags)
            ) {
                address ticketOwner = ownerOf(cursor);
                uint256 refundAmount = ticket.purchasePrice;

                ticket.flags = _setReturned(ticket.flags);
                seatBooked[eventId][uint256(ticket.enclosureId)][ticket.rowLabel][uint256(ticket.seatNumber)] = false;
                eventPricing[eventId][uint256(ticket.enclosureId)].soldSeats--;
                _burn(cursor);

                if (stadiumShopAddress != address(0)) {
                    IStadiumShop(stadiumShopAddress).refundLinkedItems(cursor, ticketOwner);
                }
                vault.creditRefund(eventId, ticketOwner, refundAmount);
                emit CancellationRefundClaimed(cursor, ticketOwner, refundAmount);
                processed++;
            }
            cursor++;
        }
        cancellationCursor[eventId] = cursor;
        emit CancellationBatchProcessed(eventId, cursor, _nextTokenId);
    }


    /// @notice Postpones an event with new times. Refund window resets.
    /// @param eventId The event to postpone
    /// @param newStartTime New start time
    /// @param newEndTime New end time
    function postponeEvent(
        uint256 eventId,
        uint256 newStartTime,
        uint256 newEndTime
    ) external onlyRole(ADMIN_ROLE) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (newStartTime >= newEndTime) revert InvalidEventTimes(newStartTime, newEndTime);
        evt.startTime = newStartTime;
        evt.endTime = newEndTime;
        evt.status = EventStatus.LIVE;
        emit EventPostponed(eventId, newStartTime, newEndTime);
        emit EventStatusChanged(eventId, EventStatus.LIVE);
    }

    // ═══════════════════════════════════════════════════════════
    //                    TICKET PURCHASE
    // ═══════════════════════════════════════════════════════════

    /// @notice Purchase a single ticket for an event
    /// @param eventId The event to purchase for
    /// @param enclosureId The enclosure (seating section)
    /// @param rowLabel The row label (e.g., 0x41 for row 'A')
    /// @param seatNumber The specific seat number within the row
    /// @return tokenId The minted NFT token ID
    function purchaseTicket(
        uint256 eventId,
        uint256 enclosureId,
        bytes1 rowLabel,
        uint256 seatNumber
    ) external payable nonReentrant whenNotPaused returns (uint256 tokenId) {
        tokenId = _mintTicket(eventId, enclosureId, rowLabel, seatNumber, msg.sender);
    }

    /// @notice Purchase multiple tickets in a single transaction
    /// @param eventId The event to purchase for
    /// @param enclosureId The enclosure (seating section)
    /// @param rowLabels Array of row labels for each seat
    /// @param seatNumbers Array of seat numbers for each seat
    /// @return tokenIds Array of minted NFT token IDs
    function purchaseMultipleTickets(
        uint256 eventId,
        uint256 enclosureId,
        bytes1[] calldata rowLabels,
        uint256[] calldata seatNumbers
    ) external payable nonReentrant whenNotPaused returns (uint256[] memory tokenIds) {
        uint256 count = seatNumbers.length;
        if (count == 0 || count > MAX_BULK_PURCHASE) revert TooManySeats(count, MAX_BULK_PURCHASE);
        if (rowLabels.length != count) revert RowSeatCountMismatch();

        EventEnclosurePricing storage pricing = eventPricing[eventId][enclosureId];
        if (pricing.priceInWei == 0) revert PricingNotSet(eventId, enclosureId);
        uint256 totalRequired = pricing.priceInWei * count;
        if (msg.value != totalRequired) revert InsufficientPayment(totalRequired, msg.value);

        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (evt.status != EventStatus.LIVE) revert EventNotLive(eventId);
        // H-04 fix: bulk purchase must respect endTime, same as single purchase
        if (block.timestamp >= evt.endTime) revert EventEnded(eventId, evt.endTime);

        tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = _mintTicketInternal(eventId, enclosureId, rowLabels[i], seatNumbers[i], msg.sender, evt, pricing);
        }

        vault.deposit{value: msg.value}(eventId, IVault.VaultCategory.TICKET_REVENUE);
    }

    /// @dev Internal: validates and mints a single ticket (used by purchaseTicket)
    function _mintTicket(
        uint256 eventId,
        uint256 enclosureId,
        bytes1 rowLabel,
        uint256 seatNumber,
        address buyer
    ) internal returns (uint256 tokenId) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (evt.status != EventStatus.LIVE) revert EventNotLive(eventId);
        if (block.timestamp >= evt.endTime) revert EventEnded(eventId, evt.endTime);

        EventEnclosurePricing storage pricing = eventPricing[eventId][enclosureId];
        if (pricing.priceInWei == 0) revert PricingNotSet(eventId, enclosureId);
        if (msg.value != pricing.priceInWei) revert InsufficientPayment(pricing.priceInWei, msg.value);

        tokenId = _mintTicketInternal(eventId, enclosureId, rowLabel, seatNumber, buyer, evt, pricing);

        vault.deposit{value: msg.value}(eventId, IVault.VaultCategory.TICKET_REVENUE);
    }

    /// @dev Internal: core mint logic shared by single and bulk purchase
    function _mintTicketInternal(
        uint256 eventId,
        uint256 enclosureId,
        bytes1 rowLabel,
        uint256 seatNumber,
        address buyer,
        Event storage evt,
        EventEnclosurePricing storage pricing
    ) internal returns (uint256 tokenId) {
        // Validate row and seat
        uint256 rowSeats = venueRegistry.getRowSeatCount(evt.venueId, enclosureId, rowLabel);
        if (rowSeats == 0) revert InvalidRow(evt.venueId, enclosureId, rowLabel);
        if (seatNumber == 0 || seatNumber > rowSeats)
            revert InvalidSeatNumber(evt.venueId, enclosureId, rowLabel, seatNumber);
        if (seatBooked[eventId][enclosureId][rowLabel][seatNumber])
            revert SeatAlreadyBooked(eventId, enclosureId, rowLabel, seatNumber);

        tokenId = _nextTokenId++;
        seatBooked[eventId][enclosureId][rowLabel][seatNumber] = true;
        pricing.soldSeats++;

        _tickets[tokenId] = TicketData({
            eventId: eventId,
            purchasePrice: pricing.priceInWei,
            venueId: uint128(evt.venueId),
            enclosureId: uint128(enclosureId),
            rowLabel: rowLabel,
            seatNumber: uint64(seatNumber),
            purchaseTimestamp: uint64(block.timestamp),
            flags: 0,
            walkInEntryCode: bytes32(0)
        });

        _safeMint(buyer, tokenId);
        emit TicketPurchased(tokenId, eventId, enclosureId, rowLabel, seatNumber, buyer, pricing.priceInWei);
    }

    // ═══════════════════════════════════════════════════════════
    //                    WALK-IN TICKETS
    // ═══════════════════════════════════════════════════════════

    /// @notice Mints a walk-in ticket for non-crypto fans at the stadium counter
    /// @param eventId The event
    /// @param enclosureId The enclosure
    /// @param rowLabel The row label
    /// @param seatNumber The seat number within the row
    /// @param vaultAddress The platform walk-in vault address to mint to
    /// @param secretHash Pre-hashed server-generated secret used for entry code. Never published on-chain naturally.
    ///        Compute off-chain as keccak256(secret_nonce_string). Store the raw pre-image server-side.
    /// @return tokenId The minted token ID
    /// @return entryCode The stored hash representation of the secret string
    function purchaseWalkInTicket(
        uint256 eventId,
        uint256 enclosureId,
        bytes1 rowLabel,
        uint256 seatNumber,
        address vaultAddress,
        bytes32 secretHash
    ) external onlyRole(WALK_IN_MANAGER_ROLE) whenNotPaused returns (uint256 tokenId, bytes32 entryCode) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        if (evt.status != EventStatus.GATES_OPEN && evt.status != EventStatus.IN_PROGRESS)
            revert EventNotLive(eventId);
        if (vaultAddress == address(0)) revert ZeroAddress();


        uint256 rowSeats = venueRegistry.getRowSeatCount(evt.venueId, enclosureId, rowLabel);
        if (rowSeats == 0) revert InvalidRow(evt.venueId, enclosureId, rowLabel);
        if (seatNumber == 0 || seatNumber > rowSeats)
            revert InvalidSeatNumber(evt.venueId, enclosureId, rowLabel, seatNumber);
        if (seatBooked[eventId][enclosureId][rowLabel][seatNumber])
            revert SeatAlreadyBooked(eventId, enclosureId, rowLabel, seatNumber);

        tokenId = _nextTokenId++;
        // The frontend already pre-hashed the original secret nonce. We just store the hash.
        entryCode = secretHash;


        seatBooked[eventId][enclosureId][rowLabel][seatNumber] = true;

        EventEnclosurePricing storage pricing = eventPricing[eventId][enclosureId];
        pricing.soldSeats++;

        _tickets[tokenId] = TicketData({
            eventId: eventId,
            purchasePrice: pricing.priceInWei,
            venueId: uint128(evt.venueId),
            enclosureId: uint128(enclosureId),
            rowLabel: rowLabel,
            seatNumber: uint64(seatNumber),
            purchaseTimestamp: uint64(block.timestamp),
            flags: _setWalkIn(0),
            walkInEntryCode: entryCode
        });

        _safeMint(vaultAddress, tokenId);
        emit WalkInTicketMinted(tokenId, eventId, rowLabel, seatNumber, entryCode);
    }

    // ═══════════════════════════════════════════════════════════
    //                    REFUND & RETURN
    // ═══════════════════════════════════════════════════════════

    /// @notice Return a ticket for an 80% refund. Cascades shop item refunds.
    /// @dev Follows CEI: checks -> effects (state + burn) -> interactions (vault + shop)
    /// @param tokenId The NFT token ID to return
    /// @custom:security nonReentrant, checks-effects-interactions
    function returnTicket(uint256 tokenId) external nonReentrant whenNotPaused {
        if (ownerOf(tokenId) != msg.sender) revert NotTicketOwner(tokenId, msg.sender);
        TicketData storage ticket = _tickets[tokenId];
        Event storage evt = _events[ticket.eventId];

        if (_isReturned(ticket.flags)) revert TicketAlreadyReturned(tokenId);
        if (_isWalkIn(ticket.flags)) revert WalkInNonRefundable(tokenId);
        if (evt.status == EventStatus.CANCELLED) revert UseClaimCancellationRefund(tokenId);
        if (_isEntered(ticket.flags)) revert AlreadyEntered(tokenId);
        if (block.timestamp > evt.startTime - REFUND_WINDOW)
            revert RefundWindowClosed(ticket.eventId, evt.startTime);

        uint256 refundAmount = (ticket.purchasePrice * REFUND_BPS) / BPS_DENOMINATOR;

        ticket.flags = _setReturned(ticket.flags);
        seatBooked[ticket.eventId][uint256(ticket.enclosureId)][ticket.rowLabel][uint256(ticket.seatNumber)] = false;
        eventPricing[ticket.eventId][uint256(ticket.enclosureId)].soldSeats--;
        _burn(tokenId);

        if (stadiumShopAddress != address(0)) {
            IStadiumShop(stadiumShopAddress).refundLinkedItems(tokenId, msg.sender);
        }
        vault.creditRefund(ticket.eventId, msg.sender, refundAmount);

        emit TicketReturned(tokenId, msg.sender, refundAmount);
    }

    /// @notice Claims 100% refund for a cancelled event
    /// @param tokenId The NFT token ID to claim refund for
    function claimCancellationRefund(uint256 tokenId) external nonReentrant whenNotPaused {
        if (ownerOf(tokenId) != msg.sender) revert NotTicketOwner(tokenId, msg.sender);
        TicketData storage ticket = _tickets[tokenId];
        Event storage evt = _events[ticket.eventId];

        if (evt.status != EventStatus.CANCELLED) revert EventNotCancelled(ticket.eventId);
        if (_isReturned(ticket.flags)) revert TicketAlreadyReturned(tokenId);
        // H-03 fix: walk-in tickets are not refundable even on cancellation (no ETH was deposited)
        if (_isWalkIn(ticket.flags)) revert WalkInNonRefundable(tokenId);


        uint256 refundAmount = ticket.purchasePrice;

        ticket.flags = _setReturned(ticket.flags);
        seatBooked[ticket.eventId][uint256(ticket.enclosureId)][ticket.rowLabel][uint256(ticket.seatNumber)] = false;
        eventPricing[ticket.eventId][uint256(ticket.enclosureId)].soldSeats--;
        _burn(tokenId);

        if (stadiumShopAddress != address(0)) {
            IStadiumShop(stadiumShopAddress).refundLinkedItems(tokenId, msg.sender);
        }
        vault.creditRefund(ticket.eventId, msg.sender, refundAmount);

        emit CancellationRefundClaimed(tokenId, msg.sender, refundAmount);
    }

    /// @notice Initiates a force-refund for all tickets in an enclosure.
    /// @dev C-01 fix: no longer loops here. Call processEnclosureRefunds(eventId, enclosureId, batchSize)
    ///      repeatedly until CancellationBatchProcessed shows cursor >= totalTokens.
    /// @param eventId The event
    /// @param enclosureId The enclosure to force-refund
    function forceRefundEnclosure(uint256 eventId, uint256 enclosureId) external onlyRole(ADMIN_ROLE) {
        Event storage evt = _events[eventId];
        if (evt.eventId == 0) revert EventNotFound(eventId);
        enclosureRefundInitiated[eventId][enclosureId] = true;
        emit EnclosureForceRefunded(eventId, enclosureId);
    }

    /// @notice Processes enclosure force-refunds in batches to avoid block gas limit.
    /// @dev Call repeatedly with maxTokens (~300) after forceRefundEnclosure until done.
    ///      Refunds ALL non-returned tickets in the enclosure at 100% (including walk-ins).
    /// @param eventId The event
    /// @param enclosureId The enclosure being refunded
    /// @param maxTokens Maximum tokens to process per call (recommended: 300)
    function processEnclosureRefunds(
        uint256 eventId,
        uint256 enclosureId,
        uint256 maxTokens
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        if (!enclosureRefundInitiated[eventId][enclosureId])
            revert EnclosureRefundNotInitiated(eventId, enclosureId);

        uint256 cursor = enclosureRefundCursor[eventId][enclosureId];
        if (cursor == 0) cursor = 1;

        uint256 processed = 0;
        while (cursor < _nextTokenId && processed < maxTokens) {
            TicketData storage ticket = _tickets[cursor];
            if (
                ticket.eventId == eventId &&
                uint256(ticket.enclosureId) == enclosureId &&
                !_isReturned(ticket.flags)
            ) {
                address ticketOwner = ownerOf(cursor);
                uint256 refundAmount = ticket.purchasePrice;

                ticket.flags = _setReturned(ticket.flags);
                seatBooked[eventId][enclosureId][ticket.rowLabel][uint256(ticket.seatNumber)] = false;
                eventPricing[eventId][enclosureId].soldSeats--;
                _burn(cursor);

                if (stadiumShopAddress != address(0)) {
                    IStadiumShop(stadiumShopAddress).refundLinkedItems(cursor, ticketOwner);
                }
                vault.creditRefund(eventId, ticketOwner, refundAmount);
                emit TicketReturned(cursor, ticketOwner, refundAmount);
                processed++;
            }
            cursor++;
        }
        enclosureRefundCursor[eventId][enclosureId] = cursor;
        emit CancellationBatchProcessed(eventId, cursor, _nextTokenId);
    }


    // ═══════════════════════════════════════════════════════════
    //                    DELEGATE SYSTEM
    // ═══════════════════════════════════════════════════════════

    /// @notice Assigns a delegate who can generate QR and enter the stadium
    /// @param tokenId The ticket to delegate
    /// @param delegate The delegate's address
    function setDelegate(uint256 tokenId, address delegate) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTicketOwner(tokenId, msg.sender);
        if (delegate == address(0)) revert ZeroAddress();
        if (_isEntered(_tickets[tokenId].flags)) revert DelegateLocked(tokenId);
        delegates[tokenId] = delegate;
        emit DelegateSet(tokenId, delegate);
    }

    /// @notice Removes a delegate from a ticket
    /// @param tokenId The ticket to remove delegate from
    function removeDelegate(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTicketOwner(tokenId, msg.sender);
        if (_isEntered(_tickets[tokenId].flags)) revert DelegateLocked(tokenId);
        delete delegates[tokenId];
        emit DelegateRemoved(tokenId);
    }

    // ═══════════════════════════════════════════════════════════
    //                    QR ENTRY
    // ═══════════════════════════════════════════════════════════

    /// @notice Marks a ticket as entered at the stadium gate
    /// @param tokenId The ticket that has been verified and entered
    function markEntered(uint256 tokenId) external onlyRole(QR_VERIFIER_ROLE) {
        TicketData storage ticket = _tickets[tokenId];
        // L-02 fix: correct error — token doesn't exist, not event not found
        if (ticket.eventId == 0) revert TicketNotFound(tokenId);
        if (_isEntered(ticket.flags)) revert AlreadyEntered(tokenId);
        if (_isReturned(ticket.flags)) revert TicketAlreadyReturned(tokenId);
        ticket.flags = _setEntered(ticket.flags);
        emit EntryMarked(tokenId, msg.sender);
    }


    /// @notice Verifies a walk-in entry code
    /// @param tokenId The walk-in ticket token ID
    /// @param rawSecret The raw un-hashed entry code from the physical physical receipt
    /// @return valid True if the entry code matches
    function verifyWalkInCode(uint256 tokenId, bytes32 rawSecret) external view returns (bool valid) {
        TicketData storage ticket = _tickets[tokenId];
        if (!_isWalkIn(ticket.flags)) return false;
        return ticket.walkInEntryCode == keccak256(abi.encodePacked(rawSecret));
    }

    // ═══════════════════════════════════════════════════════════
    //                    VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Returns full ticket data for a token
    /// @param tokenId The token to query
    /// @return data The ticket data struct
    function getTicketData(uint256 tokenId) external view returns (TicketData memory data) {
        data = _tickets[tokenId];
    }

    /// @notice Returns the event ID for a ticket (used by ITicketNFT interface)
    /// @param tokenId The token to query
    /// @return The event ID
    function getTicketEventId(uint256 tokenId) external view returns (uint256) {
        return _tickets[tokenId].eventId;
    }

    /// @notice Checks if a ticket is valid (not returned)
    /// @param tokenId The token to check
    /// @return True if valid
    function isTicketValid(uint256 tokenId) external view returns (bool) {
        TicketData storage t = _tickets[tokenId];
        return t.eventId != 0 && !_isReturned(t.flags);
    }

    /// @notice Returns the delegate address for a token
    /// @param tokenId The token to query
    /// @return The delegate address (address(0) if none)
    function getDelegate(uint256 tokenId) external view returns (address) {
        return delegates[tokenId];
    }

    /// @notice Checks if a ticket has been entered
    /// @param tokenId The token to check
    /// @return True if entered
    function isEntered(uint256 tokenId) external view returns (bool) {
        return _isEntered(_tickets[tokenId].flags);
    }

    /// @notice Returns event start time
    /// @param eventId The event to query
    /// @return The start time as unix timestamp
    function getEventStartTime(uint256 eventId) external view returns (uint256) {
        return _events[eventId].startTime;
    }

    /// @notice Returns event venue ID
    /// @param eventId The event to query
    /// @return The venue ID
    function getEventVenueId(uint256 eventId) external view returns (uint256) {
        return _events[eventId].venueId;
    }

    /// @notice Returns full event data
    /// @param eventId The event to query
    /// @return The Event struct
    function getEvent(uint256 eventId) external view returns (Event memory) {
        if (_events[eventId].eventId == 0) revert EventNotFound(eventId);
        return _events[eventId];
    }

    /// @notice Returns the event manager address
    /// @param eventId The event to query
    /// @return The event manager address
    function getEventManager(uint256 eventId) external view returns (address) {
        return _events[eventId].eventManager;
    }

    // ═══════════════════════════════════════════════════════════
    //                    SOULBOUND OVERRIDE
    // ═══════════════════════════════════════════════════════════

    /// @dev Override _update to prevent transfers (soulbound). Only mint and burn allowed.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferBlocked(tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    /// @dev Required override for ERC721Enumerable
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /// @dev Required override for AccessControl + ERC721
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
