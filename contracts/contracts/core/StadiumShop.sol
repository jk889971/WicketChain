// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../base/WicketChainBase.sol";
import "../errors/WicketChainErrors.sol";
import "../interfaces/IVault.sol";
import "../interfaces/ITicketNFT.sol";
import "../interfaces/IUserProfile.sol";
import "../interfaces/IStadiumShop.sol";

/// @title StadiumShop — Registration, Cart, and Collection for stadium vendors
/// @author WicketChain Team
/// @notice Two-sided marketplace. Vendors register per venue, fans buy via cart with multi-ticket allocation.
///         All payments go through WicketChain Vault. Order lifecycle: Active → Confirmed → Collected.
/// @dev Implements IStadiumShop for cascade refunds from TicketNFT.
contract StadiumShop is WicketChainBase, IStadiumShop, AccessControl, ReentrancyGuard, Pausable {
    // ── Roles ──
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant SHOP_STAFF_ROLE = keccak256("SHOP_STAFF_ROLE");
    bytes32 public constant TICKET_CONTRACT_ROLE = keccak256("TICKET_CONTRACT_ROLE");

    // ── Enums ──
    enum OrderStatus { ACTIVE, CONFIRMED, COLLECTED, CANCELLED, REFUNDED }

    // ── Structs ──
    struct Shop {
        uint256 shopId;
        address owner;
        string name;
        string description;
        string imageURI;
        bool isApproved;
        bool isActive;
    }

    struct ShopVenueInfo {
        uint256 venueId;
        string locationInVenue;
        bool isActive;
    }

    struct Product {
        uint256 productId;
        uint256 shopId;
        uint256 venueId;
        string name;
        string imageURI;
        uint256 priceInWei;
        uint256 availableUnits;
        bool isActive;
    }

    struct Order {
        uint256 orderId;
        uint256 ticketTokenId;
        uint256 productId;
        uint256 shopId;
        uint256 venueId;
        uint256 eventId;
        uint256 quantity;
        uint256 totalPaid;
        address buyer;
        OrderStatus status;
    }

    struct CartItemAllocation {
        uint256 productId;
        uint256 ticketTokenId;
        uint256 quantity;
    }

    // ── Immutables ──
    IVault public immutable vault;
    ITicketNFT public immutable ticketNFT;
    IUserProfile public immutable userProfile;

    // ── State ──
    uint256 private _nextShopId = 1;
    uint256 private _nextProductId = 1;
    uint256 private _nextOrderId = 1;

    uint256 public maxOrdersPerTicket = 50;

    mapping(uint256 => Shop) public shops;
    mapping(address => uint256) public ownerShopId; // owner => shopId (one shop per owner)
    mapping(uint256 => mapping(uint256 => ShopVenueInfo)) public shopVenues; // shopId => venueId => info
    mapping(uint256 => uint256[]) public shopVenueIds; // shopId => venueId[]
    mapping(uint256 => Product) public products;
    mapping(uint256 => uint256[]) public shopProductIds; // shopId => productId[]
    mapping(uint256 => Order) public orders;
    mapping(uint256 => uint256[]) public ticketOrders; // tokenId => orderId[]
    mapping(address => uint256[]) public buyerOrders; // buyer => orderId[]

    // ── State (ban list) ──
    mapping(address => bool) public isBanned;

    // ── Events ──
    event ShopRegistered(uint256 indexed shopId, address indexed owner, string name);
    event ShopApproved(uint256 indexed shopId);
    event ShopRejected(uint256 indexed shopId, string reason);
    event ShopActiveToggled(uint256 indexed shopId, bool isActive);
    event ShopPaused(uint256 indexed shopId, bool isActive);
    event ShopVenueRemoved(uint256 indexed shopId, uint256 indexed venueId);
    event VenueAddedToShop(uint256 indexed shopId, uint256 indexed venueId, string location);
    event VenueLocationUpdated(uint256 indexed shopId, uint256 indexed venueId, string newLocation);
    event ProductAdded(uint256 indexed productId, uint256 indexed shopId, uint256 indexed venueId, string name, uint256 price);
    event ProductUpdated(uint256 indexed productId, string name, uint256 price);
    event InventoryUpdated(uint256 indexed productId, uint256 newUnits);
    event ProductActiveToggled(uint256 indexed productId, bool isActive);
    event ItemPurchased(uint256 indexed orderId, uint256 indexed ticketTokenId, uint256 productId, uint256 quantity, address buyer);
    event CartCheckout(address indexed buyer, uint256 orderCount, uint256 totalPaid);
    event OrderCancelled(uint256 indexed orderId, address indexed buyer, uint256 refundAmount);
    event OrderCancelledByVendor(uint256 indexed orderId, uint256 indexed shopId);
    event OrderRefunded(uint256 indexed orderId, address indexed buyer, uint256 refundAmount);
    event OrderConfirmed(uint256 indexed orderId);
    event OrderCollected(uint256 indexed orderId);

    /// @notice Initializes StadiumShop with dependencies
    /// @param _vault The WicketChain Vault address
    /// @param _ticketNFT The TicketNFT address for ownership verification
    /// @param _userProfile The UserProfile address for profile verification
    constructor(
        address _vault,
        address _ticketNFT,
        address _userProfile
    ) {
        if (_vault == address(0) || _ticketNFT == address(0) || _userProfile == address(0)) revert ZeroAddress();
        vault = IVault(_vault);
        ticketNFT = ITicketNFT(_ticketNFT);
        userProfile = IUserProfile(_userProfile);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(TICKET_CONTRACT_ROLE, _ticketNFT);
    }

    /// @notice Allows admin to adjust the maximum allowed active shop orders per ticket
    /// @dev Helps mitigate block gas limit DoS during massive cancellation refunds
    /// @param newMax The new maximum active shop orders permitted per ticket
    function setMaxOrdersPerTicket(uint256 newMax) external onlyRole(ADMIN_ROLE) {
        maxOrdersPerTicket = newMax;
    }

    // ═══════════════════════════════════════════════════════════
    //                    SHOP REGISTRATION
    // ═══════════════════════════════════════════════════════════

    /// @notice Registers a new shop at selected venues. Requires UserProfile.
    /// @param name Shop name (e.g., "Ali's Popcorn Stand")
    /// @param description Shop description
    /// @param imageURI Image URI for the shop
    /// @param venueIds Array of venue IDs this shop operates at
    /// @param locations Array of location strings (e.g., "Gate 3, Section B")
    /// @return shopId The ID of the newly registered shop
    function registerShop(
        string calldata name,
        string calldata description,
        string calldata imageURI,
        uint256[] calldata venueIds,
        string[] calldata locations
    ) external returns (uint256 shopId) {
        if (!userProfile.hasCompleteProfile(msg.sender)) revert ProfileRequired(msg.sender);
        if (isBanned[msg.sender]) revert ShopOwnerBanned(msg.sender);
        if (ownerShopId[msg.sender] != 0) revert ShopAlreadyRegistered(msg.sender);
        if (venueIds.length != locations.length) revert InvalidCartLength();

        shopId = _nextShopId++;
        shops[shopId] = Shop({
            shopId: shopId,
            owner: msg.sender,
            name: name,
            description: description,
            imageURI: imageURI,
            isApproved: false,
            isActive: true
        });
        ownerShopId[msg.sender] = shopId;

        for (uint256 i = 0; i < venueIds.length; i++) {
            shopVenues[shopId][venueIds[i]] = ShopVenueInfo({
                venueId: venueIds[i],
                locationInVenue: locations[i],
                isActive: true
            });
            shopVenueIds[shopId].push(venueIds[i]);
            emit VenueAddedToShop(shopId, venueIds[i], locations[i]);
        }

        emit ShopRegistered(shopId, msg.sender, name);
    }

    /// @notice Admin approves a shop. Products become visible to fans.
    /// @param shopId The shop to approve
    function approveShop(uint256 shopId) external onlyRole(ADMIN_ROLE) {
        if (shops[shopId].shopId == 0) revert ShopNotFound(shopId);
        shops[shopId].isApproved = true;
        emit ShopApproved(shopId);
    }

    /// @notice Admin rejects a pending shop and bans the owner from re-registering.
    /// @param shopId The shop to reject
    /// @param reason Human-readable rejection reason
    function rejectShop(uint256 shopId, string calldata reason) external onlyRole(ADMIN_ROLE) {
        Shop storage s = shops[shopId];
        if (s.shopId == 0) revert ShopNotFound(shopId);
        if (s.isApproved) revert ShopNotRejectable(shopId);
        isBanned[s.owner] = true;
        emit ShopRejected(shopId, reason);
    }

    /// @notice Admin toggles a shop active/inactive without ownership requirement.
    /// @param shopId The shop to toggle
    /// @param active New active state
    function adminToggleShop(uint256 shopId, bool active) external onlyRole(ADMIN_ROLE) {
        if (shops[shopId].shopId == 0) revert ShopNotFound(shopId);
        shops[shopId].isActive = active;
        emit ShopPaused(shopId, active);
    }

    /// @notice Adds a new venue to an existing shop
    /// @param shopId The shop ID
    /// @param venueId The venue to add
    /// @param location Location string within the venue
    function addVenueToShop(uint256 shopId, uint256 venueId, string calldata location) external {
        if (shops[shopId].owner != msg.sender) revert NotShopOwner(shopId, msg.sender);
        shopVenues[shopId][venueId] = ShopVenueInfo({
            venueId: venueId,
            locationInVenue: location,
            isActive: true
        });
        shopVenueIds[shopId].push(venueId);
        emit VenueAddedToShop(shopId, venueId, location);
    }

    /// @notice Updates location string for a venue
    /// @param shopId The shop ID
    /// @param venueId The venue to update
    /// @param newLocation New location string
    function updateVenueLocation(uint256 shopId, uint256 venueId, string calldata newLocation) external {
        if (shops[shopId].owner != msg.sender) revert NotShopOwner(shopId, msg.sender);
        shopVenues[shopId][venueId].locationInVenue = newLocation;
        emit VenueLocationUpdated(shopId, venueId, newLocation);
    }

    /// @notice Vendor removes a venue from their shop.
    /// @param venueId The venue to remove
    function removeVenueFromShop(uint256 venueId) external {
        uint256 shopId = ownerShopId[msg.sender];
        if (shopId == 0) revert ShopNotRegistered(msg.sender);
        if (shopVenues[shopId][venueId].venueId == 0) revert VenueNotInShop(shopId, venueId);

        delete shopVenues[shopId][venueId];

        // Swap-and-pop from shopVenueIds array
        uint256[] storage venueIds = shopVenueIds[shopId];
        for (uint256 i = 0; i < venueIds.length; i++) {
            if (venueIds[i] == venueId) {
                venueIds[i] = venueIds[venueIds.length - 1];
                venueIds.pop();
                break;
            }
        }

        emit ShopVenueRemoved(shopId, venueId);
    }

    /// @notice Toggle shop active/inactive
    function toggleShopActive() external {
        uint256 shopId = ownerShopId[msg.sender];
        if (shopId == 0) revert ShopNotRegistered(msg.sender);
        shops[shopId].isActive = !shops[shopId].isActive;
        emit ShopActiveToggled(shopId, shops[shopId].isActive);
    }

    // ═══════════════════════════════════════════════════════════
    //                    PRODUCT MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    /// @notice Creates a product with per-venue inventory
    /// @param venueId The venue this product is sold at
    /// @param name Product name
    /// @param imageURI Product image URI
    /// @param priceInWei Product price in wei
    /// @param availableUnits Initial stock
    /// @return productId The new product ID
    function addProduct(
        uint256 venueId,
        string calldata name,
        string calldata imageURI,
        uint256 priceInWei,
        uint256 availableUnits
    ) external returns (uint256 productId) {
        uint256 shopId = ownerShopId[msg.sender];
        if (shopId == 0) revert ShopNotRegistered(msg.sender);
        if (!shops[shopId].isApproved) revert ShopNotApproved(shopId);
        if (shopVenues[shopId][venueId].venueId == 0) revert VenueNotAssociatedWithShop(shopId, venueId);

        productId = _nextProductId++;
        products[productId] = Product({
            productId: productId,
            shopId: shopId,
            venueId: venueId,
            name: name,
            imageURI: imageURI,
            priceInWei: priceInWei,
            availableUnits: availableUnits,
            isActive: true
        });
        shopProductIds[shopId].push(productId);
        emit ProductAdded(productId, shopId, venueId, name, priceInWei);
    }

    /// @notice Updates product details. Existing orders keep old price.
    /// @param productId The product to update
    /// @param name New name
    /// @param imageURI New image URI
    /// @param priceInWei New price
    function updateProduct(uint256 productId, string calldata name, string calldata imageURI, uint256 priceInWei) external {
        Product storage p = products[productId];
        if (p.productId == 0) revert ProductNotFound(productId);
        if (shops[p.shopId].owner != msg.sender) revert NotShopOwner(p.shopId, msg.sender);
        p.name = name;
        p.imageURI = imageURI;
        p.priceInWei = priceInWei;
        emit ProductUpdated(productId, name, priceInWei);
    }

    /// @notice Updates available stock for a product
    /// @param productId The product to update
    /// @param newUnits New available units
    function updateInventory(uint256 productId, uint256 newUnits) external {
        Product storage p = products[productId];
        if (p.productId == 0) revert ProductNotFound(productId);
        if (shops[p.shopId].owner != msg.sender) revert NotShopOwner(p.shopId, msg.sender);
        p.availableUnits = newUnits;
        emit InventoryUpdated(productId, newUnits);
    }

    /// @notice Toggle product active/inactive
    /// @param productId The product to toggle
    function toggleProductActive(uint256 productId) external {
        Product storage p = products[productId];
        if (p.productId == 0) revert ProductNotFound(productId);
        if (shops[p.shopId].owner != msg.sender) revert NotShopOwner(p.shopId, msg.sender);
        p.isActive = !p.isActive;
        emit ProductActiveToggled(productId, p.isActive);
    }

    // ═══════════════════════════════════════════════════════════
    //                    PURCHASE (Single + Cart)
    // ═══════════════════════════════════════════════════════════

    /// @notice Purchase a single item linked to one ticket
    /// @param productId The product to purchase
    /// @param quantity Quantity to purchase
    /// @param ticketTokenId The ticket NFT this purchase is linked to
    /// @return orderId The new order ID
    function purchaseSingleItem(
        uint256 productId,
        uint256 quantity,
        uint256 ticketTokenId
    ) external payable nonReentrant whenNotPaused returns (uint256 orderId) {
        orderId = _createOrder(productId, quantity, ticketTokenId, msg.sender, msg.value);

        // Forward ETH to vault (includes shop owner for withdrawal access control)
        Product storage p = products[productId];
        uint256 eventId = ticketNFT.getTicketEventId(ticketTokenId);
        vault.recordShopEarning{value: msg.value}(eventId, p.shopId, shops[p.shopId].owner);
    }

    /// @notice Batch checkout. Each allocation specifies product, qty, AND ticket.
    /// @dev Verifies ownership of ALL tickets. Creates individual Orders. Total msg.value = sum of all items.
    /// @param items Array of CartItemAllocation structs
    /// @return orderIds Array of created order IDs
    function purchaseCart(CartItemAllocation[] calldata items) external payable nonReentrant whenNotPaused returns (uint256[] memory orderIds) {
        if (items.length == 0) revert InvalidCartLength();

        uint256 totalRequired;
        orderIds = new uint256[](items.length);

        // First pass: validate and calculate total
        for (uint256 i = 0; i < items.length; i++) {
            Product storage p = products[items[i].productId];
            if (p.productId == 0) revert ProductNotFound(items[i].productId);
            totalRequired += p.priceInWei * items[i].quantity;
        }
        if (msg.value != totalRequired) revert InsufficientPayment(totalRequired, msg.value);

        // Second pass: create orders and forward ETH per shop
        for (uint256 i = 0; i < items.length; i++) {
            orderIds[i] = _createOrder(items[i].productId, items[i].quantity, items[i].ticketTokenId, msg.sender, products[items[i].productId].priceInWei * items[i].quantity);
        }

        // H-06 fix: fetch each item's own eventId from the ticket — don't assume all items
        //           belong to the same event as items[0].
        _batchRecordEarnings(items);


        emit CartCheckout(msg.sender, items.length, msg.value);
    }

    /// @dev Internal: creates a single order
    function _createOrder(
        uint256 productId,
        uint256 quantity,
        uint256 ticketTokenId,
        address buyer,
        uint256 payment
    ) internal returns (uint256 orderId) {
        Product storage p = products[productId];
        if (p.productId == 0) revert ProductNotFound(productId);
        if (!p.isActive) revert ProductNotActive(productId);

        Shop storage shop = shops[p.shopId];
        if (!shop.isApproved) revert ShopNotApproved(p.shopId);
        if (!shop.isActive) revert ShopNotActive(p.shopId);

        // Verify ticket ownership
        if (ticketNFT.ownerOf(ticketTokenId) != buyer) revert TicketNotOwnedByCaller(ticketTokenId, buyer);

        // Security: Restrict maximum orders per ticket to prevent OOG on cascade refunds
        if (ticketOrders[ticketTokenId].length >= maxOrdersPerTicket) revert MaxOrdersExceeded();

        // Verify payment
        uint256 required = p.priceInWei * quantity;
        if (payment != required) revert InsufficientPayment(required, payment);

        // Check stock
        if (p.availableUnits < quantity) revert InsufficientStock(productId, quantity, p.availableUnits);

        // Effects
        p.availableUnits -= quantity;
        orderId = _nextOrderId++;

        uint256 eventId = ticketNFT.getTicketEventId(ticketTokenId);

        orders[orderId] = Order({
            orderId: orderId,
            ticketTokenId: ticketTokenId,
            productId: productId,
            shopId: p.shopId,
            venueId: p.venueId,
            eventId: eventId,
            quantity: quantity,
            totalPaid: required,
            buyer: buyer,
            status: OrderStatus.ACTIVE
        });

        ticketOrders[ticketTokenId].push(orderId);
        buyerOrders[buyer].push(orderId);

        emit ItemPurchased(orderId, ticketTokenId, productId, quantity, buyer);
    }

    /// @dev Internal: batch record shop earnings to vault, each using its own ticket's eventId.
    ///      H-06 fix: removed shared eventId parameter — each item looks up its own event.
    function _batchRecordEarnings(CartItemAllocation[] calldata items) internal {
        for (uint256 i = 0; i < items.length; i++) {
            Product storage p = products[items[i].productId];
            uint256 amount = p.priceInWei * items[i].quantity;
            // Per-item eventId to correctly attribute shop revenue to the right event balance
            uint256 itemEventId = ticketNFT.getTicketEventId(items[i].ticketTokenId);
            vault.recordShopEarning{value: amount}(itemEventId, p.shopId, shops[p.shopId].owner);
        }
    }


    // ═══════════════════════════════════════════════════════════
    //                    ORDER MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    /// @notice Fan cancels an ACTIVE order. 100% refund from Vault. Inventory restored.
    /// @param orderId The order to cancel
    function cancelOrder(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        if (order.orderId == 0) revert OrderNotFound(orderId);
        if (order.buyer != msg.sender) revert NotOrderOwner(orderId, msg.sender);
        if (order.status != OrderStatus.ACTIVE) revert OrderNotActive(orderId);

        // Check refund window: must be > 3hrs before event start AND not entered
        uint256 eventStartTime = ticketNFT.getEventStartTime(order.eventId);
        if (block.timestamp > eventStartTime - REFUND_WINDOW)
            revert RefundWindowClosed(order.eventId, eventStartTime);
        if (ticketNFT.isEntered(order.ticketTokenId)) revert AlreadyEntered(order.ticketTokenId);

        // ── EFFECTS ──
        order.status = OrderStatus.CANCELLED;
        products[order.productId].availableUnits += order.quantity;

        // ── INTERACTIONS ──
        vault.creditShopRefund(order.eventId, order.shopId, msg.sender, order.totalPaid);

        emit OrderCancelled(orderId, msg.sender, order.totalPaid);
    }

    /// @notice Vendor cancels an ACTIVE order on behalf of a buyer. Full refund from Vault.
    /// @param orderId The order to cancel
    function vendorCancelOrder(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        if (order.orderId == 0) revert OrderNotFound(orderId);
        uint256 shopId = ownerShopId[msg.sender];
        if (shopId == 0 || order.shopId != shopId) revert NotShopOwner(order.shopId, msg.sender);
        if (order.status != OrderStatus.ACTIVE) revert OrderNotActive(orderId);

        // ── EFFECTS ──
        order.status = OrderStatus.CANCELLED;
        products[order.productId].availableUnits += order.quantity;

        // ── INTERACTIONS ──
        vault.creditShopRefund(order.eventId, order.shopId, order.buyer, order.totalPaid);

        emit OrderCancelledByVendor(orderId, shopId);
    }

    /// @notice Cascade refund on ticket return. Refunds ALL ACTIVE orders for that ticket.
    /// @dev Called by TicketNFT on return. Only refunds ACTIVE orders, not CONFIRMED or COLLECTED.
    /// @param ticketTokenId The ticket being returned
    /// @param buyer The ticket owner getting refunds
    /// @return totalRefund Total ETH credited to buyer's claimable balance
    function refundLinkedItems(uint256 ticketTokenId, address buyer) external override onlyRole(TICKET_CONTRACT_ROLE) returns (uint256 totalRefund) {
        uint256[] storage orderIds = ticketOrders[ticketTokenId];
        for (uint256 i = 0; i < orderIds.length; i++) {
            Order storage order = orders[orderIds[i]];
            if (order.status != OrderStatus.ACTIVE) continue;

            // Effects
            order.status = OrderStatus.REFUNDED;
            products[order.productId].availableUnits += order.quantity;
            totalRefund += order.totalPaid;

            // Interaction
            vault.creditShopRefund(order.eventId, order.shopId, buyer, order.totalPaid);

            emit OrderRefunded(orderIds[i], buyer, order.totalPaid);
        }
    }

    /// @notice Batch-confirms orders whose refund window has closed or ticket was scanned.
    ///         Also triggers vault.confirmShopEarnings to move pending→confirmed and deduct shop fee.
    /// @dev On-chain time check per Section 17: block.timestamp > startTime - 3hrs OR isEntered.
    /// @param orderIds Array of order IDs to confirm
    function confirmOrders(uint256[] calldata orderIds) external nonReentrant {
        // Temporary arrays to batch vault calls per shopId+eventId
        uint256[] memory confirmedAmounts = new uint256[](orderIds.length);
        uint256[] memory confirmedShopIds = new uint256[](orderIds.length);
        uint256[] memory confirmedEventIds = new uint256[](orderIds.length);
        uint256 confirmedCount;

        for (uint256 i = 0; i < orderIds.length; i++) {
            Order storage order = orders[orderIds[i]];
            if (order.orderId == 0) revert OrderNotFound(orderIds[i]);
            if (order.status != OrderStatus.ACTIVE) continue;

            // On-chain verification: refund window must be closed for this order (Sec 17)
            uint256 eventStartTime = ticketNFT.getEventStartTime(order.eventId);
            bool windowClosed = block.timestamp > eventStartTime - REFUND_WINDOW;
            bool alreadyEntered = ticketNFT.isEntered(order.ticketTokenId);

            if (!windowClosed && !alreadyEntered) revert RefundWindowStillOpen(orderIds[i]);

            order.status = OrderStatus.CONFIRMED;
            confirmedAmounts[confirmedCount] = order.totalPaid;
            confirmedShopIds[confirmedCount] = order.shopId;
            confirmedEventIds[confirmedCount] = order.eventId;
            confirmedCount++;
            emit OrderConfirmed(orderIds[i]);
        }

        // H-05 fix: call vault.confirmShopEarnings once per confirmed order to avoid
        //           the broken O(n^2) grouping bug that could double-credit or panic on underflow.
        for (uint256 i = 0; i < confirmedCount; i++) {
            uint256[] memory single = new uint256[](1);
            single[0] = confirmedAmounts[i];
            vault.confirmShopEarnings(confirmedShopIds[i], confirmedEventIds[i], single);
        }
    }


    /// @notice Marks order as collected at stadium. Status: COLLECTED. On-chain proof of delivery.
    /// @dev Only the shop owner who owns the order's shop can confirm collection.
    /// @param orderId The order being collected
    function confirmCollection(uint256 orderId) external {
        Order storage order = orders[orderId];
        if (order.orderId == 0) revert OrderNotFound(orderId);
        if (shops[order.shopId].owner != msg.sender) revert NotShopOwner(order.shopId, msg.sender);
        if (order.status != OrderStatus.CONFIRMED)
            revert OrderNotConfirmed(orderId);

        order.status = OrderStatus.COLLECTED;
        emit OrderCollected(orderId);
    }

    // ═══════════════════════════════════════════════════════════
    //                    ADMIN
    // ═══════════════════════════════════════════════════════════

    /// @notice Pauses all shop operations
    function pause(string calldata reason) external onlyRole(ADMIN_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    /// @notice Unpauses shop operations
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    // ═══════════════════════════════════════════════════════════
    //                    VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Returns all orders linked to a ticket (for QR display)
    /// @param ticketTokenId The ticket to query
    /// @return Array of Order structs
    function getOrdersByTicket(uint256 ticketTokenId) external view returns (Order[] memory) {
        uint256[] storage ids = ticketOrders[ticketTokenId];
        Order[] memory result = new Order[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = orders[ids[i]];
        }
        return result;
    }

    /// @notice Returns all orders for a buyer
    /// @param buyer The buyer address
    /// @return Array of Order structs
    function getOrdersByBuyer(address buyer) external view returns (Order[] memory) {
        uint256[] storage ids = buyerOrders[buyer];
        Order[] memory result = new Order[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = orders[ids[i]];
        }
        return result;
    }

    /// @notice Returns all product IDs for a shop
    /// @param shopId The shop to query
    /// @return Array of product IDs
    function getShopProducts(uint256 shopId) external view returns (uint256[] memory) {
        return shopProductIds[shopId];
    }

    /// @notice Returns all venue IDs for a shop
    /// @param shopId The shop to query
    /// @return Array of venue IDs
    function getShopVenues(uint256 shopId) external view returns (uint256[] memory) {
        return shopVenueIds[shopId];
    }
}
