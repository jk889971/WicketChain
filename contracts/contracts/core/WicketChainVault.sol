// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../base/WicketChainBase.sol";
import "../errors/WicketChainErrors.sol";
import "../interfaces/IVault.sol";

/// @title WicketChain Vault — Central Treasury for all WicketChain ETH flows
/// @author WicketChain Team
/// @notice All ETH in the platform flows through this single contract: ticket revenue, shop revenue,
///         refunds, shop earnings, and post-match settlement. Fully auditable on-chain.
/// @dev Pull-over-push pattern for refunds. Per-event and per-shop accounting.
contract WicketChainVault is WicketChainBase, IVault, AccessControl, ReentrancyGuard, Pausable {
    // ── Roles ──
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant AUTHORIZED_CONTRACT_ROLE = keccak256("AUTHORIZED_CONTRACT_ROLE");

    // ── Structs ──
    struct EventBalance {
        uint256 ticketRevenue;
        uint256 ticketRefunds;
        uint256 shopRevenue;
        uint256 shopRefunds;
        uint256 shopFeesCollected;
        bool isSettled;
    }

    struct ShopBalance {
        uint256 totalEarnings;
        uint256 pendingEarnings;
        uint256 confirmedEarnings;
        uint256 shopFeeDeducted;
        uint256 withdrawnAmount;
    }

    // ── State ──
    address public platformTreasury;
    uint256 public shopFeeBps;

    mapping(uint256 => EventBalance) public eventBalances;
    mapping(uint256 => ShopBalance) public shopBalances;
    mapping(address => uint256) public claimableRefunds;
    mapping(uint256 => address) public shopOwners;

    // ── Events ──
    event Deposited(uint256 indexed eventId, VaultCategory category, uint256 amount);
    event RefundCredited(uint256 indexed eventId, address indexed to, uint256 amount);
    event RefundClaimed(address indexed claimant, uint256 amount);
    event ShopEarningRecorded(uint256 indexed eventId, uint256 indexed shopId, uint256 amount);
    event ShopEarningsConfirmed(uint256 indexed shopId, uint256 indexed eventId, uint256 amount, uint256 feeDeducted);
    event ShopWithdrawal(uint256 indexed shopId, address indexed owner, uint256 amount);
    event EventSettled(uint256 indexed eventId, uint256 platformAmount, uint256 eventManagerAmount, uint256 platformPercent);
    event ShopFeeUpdated(uint256 oldBps, uint256 newBps);
    event PlatformTreasuryUpdated(address oldTreasury, address newTreasury);
    event ShopRefundCredited(uint256 indexed eventId, uint256 indexed shopId, address indexed to, uint256 amount);
    event ShopOwnerRegistered(uint256 indexed shopId, address indexed owner);

    constructor(address _platformTreasury, uint256 _shopFeeBps) {
        if (_platformTreasury == address(0)) revert ZeroAddress();
        platformTreasury = _platformTreasury;
        shopFeeBps = _shopFeeBps;
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function deposit(uint256 eventId, VaultCategory category) external payable override onlyRole(AUTHORIZED_CONTRACT_ROLE) {
        if (category == VaultCategory.TICKET_REVENUE) {
            eventBalances[eventId].ticketRevenue += msg.value;
        } else if (category == VaultCategory.SHOP_REVENUE) {
            eventBalances[eventId].shopRevenue += msg.value;
        }
        emit Deposited(eventId, category, msg.value);
    }

    function recordShopEarning(uint256 eventId, uint256 shopId, address shopOwner) external payable override onlyRole(AUTHORIZED_CONTRACT_ROLE) {
        eventBalances[eventId].shopRevenue += msg.value;
        shopBalances[shopId].totalEarnings += msg.value;
        shopBalances[shopId].pendingEarnings += msg.value;

        if (shopOwners[shopId] == address(0)) {
            shopOwners[shopId] = shopOwner;
            emit ShopOwnerRegistered(shopId, shopOwner);
        }

        emit ShopEarningRecorded(eventId, shopId, msg.value);
        emit Deposited(eventId, VaultCategory.SHOP_REVENUE, msg.value);
    }

    function creditRefund(uint256 eventId, address to, uint256 amount) external override onlyRole(AUTHORIZED_CONTRACT_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        claimableRefunds[to] += amount;
        eventBalances[eventId].ticketRefunds += amount;
        emit RefundCredited(eventId, to, amount);
    }

    function creditShopRefund(uint256 eventId, uint256 shopId, address to, uint256 amount) external override onlyRole(AUTHORIZED_CONTRACT_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (shopBalances[shopId].pendingEarnings < amount)
            revert InsufficientVaultBalance(amount, shopBalances[shopId].pendingEarnings);
        claimableRefunds[to] += amount;
        eventBalances[eventId].shopRefunds += amount;
        shopBalances[shopId].pendingEarnings -= amount;
        emit ShopRefundCredited(eventId, shopId, to, amount);
    }

    function claimRefunds() external nonReentrant {
        uint256 amount = claimableRefunds[msg.sender];
        if (amount == 0) revert NothingToClaim();
        claimableRefunds[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit RefundClaimed(msg.sender, amount);
    }

    function confirmShopEarnings(uint256 shopId, uint256 eventId, uint256[] calldata amounts) external override onlyRole(AUTHORIZED_CONTRACT_ROLE) {
        ShopBalance storage sb = shopBalances[shopId];
        uint256 totalAmount;
        uint256 totalFee;

        for (uint256 i = 0; i < amounts.length; i++) {
            uint256 amount = amounts[i];
            uint256 fee = (amount * shopFeeBps) / BPS_DENOMINATOR;
            uint256 netAmount = amount - fee;
            totalAmount += netAmount;
            totalFee += fee;
        }

        sb.pendingEarnings -= (totalAmount + totalFee);
        sb.confirmedEarnings += totalAmount;
        sb.shopFeeDeducted += totalFee;
        eventBalances[eventId].shopFeesCollected += totalFee;

        emit ShopEarningsConfirmed(shopId, eventId, totalAmount, totalFee);
    }

    function withdrawShopEarnings(uint256 shopId, uint256 amount) external nonReentrant {
        if (shopOwners[shopId] != msg.sender) revert ContractNotAuthorized(msg.sender);
        if (amount == 0) revert InvalidWithdrawalAmount();
        ShopBalance storage sb = shopBalances[shopId];
        uint256 withdrawable = sb.confirmedEarnings - sb.withdrawnAmount;
        if (amount > withdrawable) revert InsufficientConfirmedEarnings(amount, withdrawable);
        sb.withdrawnAmount += amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit ShopWithdrawal(shopId, msg.sender, amount);
    }

    function settleEvent(
        uint256 eventId,
        uint256 platformPercent,
        address eventManager
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        if (platformPercent > 100) revert InvalidPlatformPercent(platformPercent);
        EventBalance storage eb = eventBalances[eventId];
        if (eb.isSettled) revert AlreadySettled(eventId);
        eb.isSettled = true;

        // C-02 fix: subtract shopRefunds (ETH already credited to buyers but not yet claimed).
        // H-01 fix: safe subtraction prevents underflow panic if refunds exceed revenue.
        uint256 netTicket = eb.ticketRevenue > eb.ticketRefunds
            ? eb.ticketRevenue - eb.ticketRefunds
            : 0;
        uint256 remaining = netTicket + eb.shopFeesCollected;

        uint256 platformAmount = (remaining * platformPercent) / 100;
        uint256 eventManagerAmount = remaining - platformAmount;

        if (platformAmount > 0) {
            (bool ok1, ) = platformTreasury.call{value: platformAmount}("");
            if (!ok1) revert TransferFailed();
        }
        if (eventManagerAmount > 0 && eventManager != address(0)) {
            (bool ok2, ) = eventManager.call{value: eventManagerAmount}("");
            if (!ok2) revert TransferFailed();
        }

        emit EventSettled(eventId, platformAmount, eventManagerAmount, platformPercent);
    }

    function setShopFeeBps(uint256 newBps) external onlyRole(ADMIN_ROLE) {
        if (newBps > BPS_DENOMINATOR) revert InvalidShopFeeBps(newBps, BPS_DENOMINATOR);
        uint256 oldBps = shopFeeBps;
        shopFeeBps = newBps;
        emit ShopFeeUpdated(oldBps, newBps);
    }

    function setPlatformTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = platformTreasury;
        platformTreasury = newTreasury;
        emit PlatformTreasuryUpdated(oldTreasury, newTreasury);
    }

    function authorizeContract(address contractAddr) external onlyRole(ADMIN_ROLE) {
        if (contractAddr == address(0)) revert ZeroAddress();
        _grantRole(AUTHORIZED_CONTRACT_ROLE, contractAddr);
    }

    function deauthorizeContract(address contractAddr) external onlyRole(ADMIN_ROLE) {
        _revokeRole(AUTHORIZED_CONTRACT_ROLE, contractAddr);
    }

    function pause(string calldata reason) external onlyRole(ADMIN_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    function getEventBalance(uint256 eventId) external view returns (EventBalance memory) {
        return eventBalances[eventId];
    }

    function getShopBalance(uint256 shopId) external view returns (ShopBalance memory) {
        return shopBalances[shopId];
    }

    function getClaimableRefund(address user) external view returns (uint256) {
        return claimableRefunds[user];
    }

    /// @dev M-07: Reject direct ETH sends. All ETH must enter via deposit() to maintain accounting integrity.
    receive() external payable { revert("WicketChainVault: direct ETH not accepted"); }
}

