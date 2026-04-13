// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title IVenueRegistry — Interface for venue, enclosure, and row data
interface IVenueRegistry {
    struct Venue {
        uint256 venueId;
        string name;
        string city;
        string imageURI;
        bool isActive;
    }

    struct Enclosure {
        uint256 enclosureId;
        uint256 venueId;
        string name;
        bool isActive;
    }

    struct Row {
        bytes1 label;       // 'A', 'B', 'C', etc.
        uint256 seatCount;  // Number of seats in this row (numbered 1..seatCount)
    }

    function getVenue(uint256 venueId) external view returns (Venue memory);
    function getEnclosure(uint256 venueId, uint256 enclosureId) external view returns (Enclosure memory);
    function isVenueActive(uint256 venueId) external view returns (bool);
    function isEnclosureActive(uint256 venueId, uint256 enclosureId) external view returns (bool);
    function getEnclosures(uint256 venueId) external view returns (Enclosure[] memory);
    function getRows(uint256 venueId, uint256 enclosureId) external view returns (Row[] memory);
    function getRowSeatCount(uint256 venueId, uint256 enclosureId, bytes1 rowLabel) external view returns (uint256);
}
