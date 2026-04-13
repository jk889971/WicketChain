// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title IVault — Interface for WicketChain Vault central treasury
interface IVault {
    enum VaultCategory {
        TICKET_REVENUE,
        SHOP_REVENUE,
        DONATION
    }

    function deposit(uint256 eventId, VaultCategory category) external payable;
    function creditRefund(uint256 eventId, address to, uint256 amount) external;
    function creditShopRefund(uint256 eventId, uint256 shopId, address to, uint256 amount) external;
    function recordShopEarning(uint256 eventId, uint256 shopId, address shopOwner) external payable;
    function confirmShopEarnings(uint256 shopId, uint256 eventId, uint256[] calldata amounts) external;
}
