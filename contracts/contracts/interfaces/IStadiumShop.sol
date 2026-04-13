// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title IStadiumShop — Interface for stadium shop cascade refunds
interface IStadiumShop {
    function refundLinkedItems(uint256 ticketTokenId, address buyer) external returns (uint256 totalRefund);
}
