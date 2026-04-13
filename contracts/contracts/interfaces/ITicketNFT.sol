// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title ITicketNFT — Interface for ticket NFT ownership and data queries
interface ITicketNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getTicketEventId(uint256 tokenId) external view returns (uint256);
    function isTicketValid(uint256 tokenId) external view returns (bool);
    function getDelegate(uint256 tokenId) external view returns (address);
    function isEntered(uint256 tokenId) external view returns (bool);
    function getEventStartTime(uint256 eventId) external view returns (uint256);
    function getEventVenueId(uint256 eventId) external view returns (uint256);
}
