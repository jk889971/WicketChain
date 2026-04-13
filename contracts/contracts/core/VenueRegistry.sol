// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../base/WicketChainBase.sol";
import "../errors/WicketChainErrors.sol";
import "../interfaces/IVenueRegistry.sol";

/// @title VenueRegistry — On-chain stadium venue, enclosure, and row management
/// @author WicketChain Team
/// @notice Stores reusable venue data with row-based seating. Each enclosure has rows (A, B, C...)
///         with individual seat counts. Pricing lives on events, not venues.
/// @dev Standalone contract. Admin-only write access via AccessControl.
contract VenueRegistry is IVenueRegistry, WicketChainBase, AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    uint256 private _nextVenueId = 1;
    mapping(uint256 => uint256) private _nextEnclosureId; // venueId => next enclosureId

    mapping(uint256 => Venue) private _venues;
    mapping(uint256 => mapping(uint256 => Enclosure)) private _enclosures;
    mapping(uint256 => uint256[]) private _venueEnclosureIds;

    // Row storage
    mapping(uint256 => mapping(uint256 => Row[])) private _enclosureRows; // venueId => enclosureId => Row[]
    mapping(uint256 => mapping(uint256 => mapping(bytes1 => uint256))) private _rowSeatCount; // venueId => enclosureId => label => seatCount

    // ── Events ──
    event VenueCreated(uint256 indexed venueId, string name, string city);
    event VenueUpdated(uint256 indexed venueId, string name, string city);
    event VenueDeactivated(uint256 indexed venueId);
    event VenueActivated(uint256 indexed venueId);
    event EnclosureAdded(uint256 indexed venueId, uint256 indexed enclosureId, string name);
    event EnclosureUpdated(uint256 indexed venueId, uint256 indexed enclosureId, string name);
    event EnclosureStatusChanged(uint256 indexed venueId, uint256 indexed enclosureId, bool isActive);
    event RowsAdded(uint256 indexed venueId, uint256 indexed enclosureId, uint256 rowCount);
    event RowUpdated(uint256 indexed venueId, uint256 indexed enclosureId, uint256 rowIndex, bytes1 oldRowLabel, bytes1 newRowLabel, uint256 newSeatCount);

    /// @notice Initializes the contract and grants admin role to deployer
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Creates a new reusable stadium venue
    /// @param name The venue name (e.g., "Gaddafi Stadium")
    /// @param city The city where the venue is located (e.g., "Lahore")
    /// @param imageURI The URI for the venue image
    /// @return venueId The ID of the newly created venue
    function createVenue(
        string calldata name,
        string calldata city,
        string calldata imageURI
    ) external onlyRole(ADMIN_ROLE) returns (uint256 venueId) {
        venueId = _nextVenueId++;
        _venues[venueId] = Venue({
            venueId: venueId,
            name: name,
            city: city,
            imageURI: imageURI,
            isActive: true
        });
        emit VenueCreated(venueId, name, city);
    }

    /// @notice Adds an enclosure with rows to an existing venue
    /// @param venueId The venue to add the enclosure to
    /// @param name The enclosure name (e.g., "VIP Lounge", "General Stand")
    /// @param rowLabels Array of row labels (e.g., [0x41, 0x42] for rows A, B)
    /// @param seatCounts Array of seat counts per row (e.g., [50, 50])
    /// @return enclosureId The ID of the newly created enclosure
    function addEnclosure(
        uint256 venueId,
        string calldata name,
        bytes1[] calldata rowLabels,
        uint256[] calldata seatCounts
    ) external onlyRole(ADMIN_ROLE) returns (uint256 enclosureId) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        if (!_venues[venueId].isActive) revert VenueNotActive(venueId);

        if (rowLabels.length == 0) revert EmptyRowLabels(venueId);
        if (rowLabels.length != seatCounts.length) revert RowSeatCountMismatch();

        enclosureId = ++_nextEnclosureId[venueId];
        _enclosures[venueId][enclosureId] = Enclosure({
            enclosureId: enclosureId,
            venueId: venueId,
            name: name,
            isActive: true
        });
        _venueEnclosureIds[venueId].push(enclosureId);

        // Add rows
        for (uint256 i = 0; i < rowLabels.length; i++) {
            if (_rowSeatCount[venueId][enclosureId][rowLabels[i]] != 0)
                revert RowAlreadyExists(venueId, enclosureId, rowLabels[i]);
            _enclosureRows[venueId][enclosureId].push(Row({
                label: rowLabels[i],
                seatCount: seatCounts[i]
            }));
            _rowSeatCount[venueId][enclosureId][rowLabels[i]] = seatCounts[i];
        }

        emit EnclosureAdded(venueId, enclosureId, name);
        emit RowsAdded(venueId, enclosureId, rowLabels.length);
    }

    /// @notice Adds more rows to an existing enclosure
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure to add rows to
    /// @param rowLabels Array of new row labels
    /// @param seatCounts Array of seat counts per row
    function addRows(
        uint256 venueId,
        uint256 enclosureId,
        bytes1[] calldata rowLabels,
        uint256[] calldata seatCounts
    ) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        if (_enclosures[venueId][enclosureId].enclosureId == 0) revert EnclosureNotFound(venueId, enclosureId);
        if (rowLabels.length != seatCounts.length) revert RowSeatCountMismatch();

        for (uint256 i = 0; i < rowLabels.length; i++) {
            if (_rowSeatCount[venueId][enclosureId][rowLabels[i]] != 0)
                revert RowAlreadyExists(venueId, enclosureId, rowLabels[i]);
            _enclosureRows[venueId][enclosureId].push(Row({
                label: rowLabels[i],
                seatCount: seatCounts[i]
            }));
            _rowSeatCount[venueId][enclosureId][rowLabels[i]] = seatCounts[i];
        }

        emit RowsAdded(venueId, enclosureId, rowLabels.length);
    }

    /// @notice Updates venue metadata
    /// @param venueId The venue to update
    /// @param name New venue name
    /// @param city New city
    /// @param imageURI New image URI
    function updateVenue(
        uint256 venueId,
        string calldata name,
        string calldata city,
        string calldata imageURI
    ) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        Venue storage venue = _venues[venueId];
        venue.name = name;
        venue.city = city;
        venue.imageURI = imageURI;
        emit VenueUpdated(venueId, name, city);
    }

    /// @notice Updates enclosure name
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure to update
    /// @param name New enclosure name
    function updateEnclosure(
        uint256 venueId,
        uint256 enclosureId,
        string calldata name
    ) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        if (_enclosures[venueId][enclosureId].enclosureId == 0) revert EnclosureNotFound(venueId, enclosureId);
        _enclosures[venueId][enclosureId].name = name;
        emit EnclosureUpdated(venueId, enclosureId, name);
    }

    /// @notice Toggles an enclosure active/inactive
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure to toggle
    /// @param active New active state
    function toggleEnclosureActive(uint256 venueId, uint256 enclosureId, bool active) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        if (_enclosures[venueId][enclosureId].enclosureId == 0) revert EnclosureNotFound(venueId, enclosureId);
        _enclosures[venueId][enclosureId].isActive = active;
        emit EnclosureStatusChanged(venueId, enclosureId, active);
    }

    /// @notice Updates a row's label and/or seat count
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure containing the row
    /// @param rowIndex The 0-based index of the row in the enclosure's rows array
    /// @param newRowLabel New row label byte (e.g., 0x41 for 'A')
    /// @param newSeatCount New seat count for the row
    function updateRow(
        uint256 venueId,
        uint256 enclosureId,
        uint256 rowIndex,
        bytes1 newRowLabel,
        uint256 newSeatCount
    ) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        if (_enclosures[venueId][enclosureId].enclosureId == 0) revert EnclosureNotFound(venueId, enclosureId);
        Row[] storage rows = _enclosureRows[venueId][enclosureId];
        if (rowIndex >= rows.length) revert RowNotFound(venueId, enclosureId, rowIndex);

        bytes1 oldLabel = rows[rowIndex].label;
        uint256 currentSeatCount = _rowSeatCount[venueId][enclosureId][oldLabel];

        // M-02: Prevent seat count reduction to avoid orphaning already-sold seat numbers
        if (newSeatCount < currentSeatCount)
            revert SeatCountReductionNotAllowed(venueId, enclosureId, oldLabel, currentSeatCount, newSeatCount);

        // Remove old label from seat count mapping
        delete _rowSeatCount[venueId][enclosureId][oldLabel];
        // Ensure new label is not already used by another row
        if (newRowLabel != oldLabel && _rowSeatCount[venueId][enclosureId][newRowLabel] != 0)
            revert RowAlreadyExists(venueId, enclosureId, newRowLabel);

        rows[rowIndex].label = newRowLabel;
        rows[rowIndex].seatCount = newSeatCount;
        _rowSeatCount[venueId][enclosureId][newRowLabel] = newSeatCount;

        emit RowUpdated(venueId, enclosureId, rowIndex, oldLabel, newRowLabel, newSeatCount);
    }


    /// @notice Deactivates a venue
    /// @param venueId The venue to deactivate
    function deactivateVenue(uint256 venueId) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        _venues[venueId].isActive = false;
        emit VenueDeactivated(venueId);
    }

    /// @notice Activates a previously deactivated venue
    /// @param venueId The venue to activate
    function activateVenue(uint256 venueId) external onlyRole(ADMIN_ROLE) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        _venues[venueId].isActive = true;
        emit VenueActivated(venueId);
    }

    // ═══════════════════════════════════════════════════════════
    //                    VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Returns venue data
    /// @param venueId The venue to query
    /// @return The Venue struct
    function getVenue(uint256 venueId) external view override returns (Venue memory) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        return _venues[venueId];
    }

    /// @notice Returns a specific enclosure
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure to query
    /// @return The Enclosure struct
    function getEnclosure(uint256 venueId, uint256 enclosureId) external view override returns (Enclosure memory) {
        if (_enclosures[venueId][enclosureId].enclosureId == 0) revert EnclosureNotFound(venueId, enclosureId);
        return _enclosures[venueId][enclosureId];
    }

    /// @notice Returns all enclosures for a venue
    /// @param venueId The venue to query
    /// @return Array of Enclosure structs
    function getEnclosures(uint256 venueId) external view override returns (Enclosure[] memory) {
        if (_venues[venueId].venueId == 0) revert VenueNotFound(venueId);
        uint256[] memory ids = _venueEnclosureIds[venueId];
        Enclosure[] memory result = new Enclosure[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _enclosures[venueId][ids[i]];
        }
        return result;
    }

    /// @notice Returns all rows for an enclosure
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure to query
    /// @return Array of Row structs
    function getRows(uint256 venueId, uint256 enclosureId) external view override returns (Row[] memory) {
        if (_enclosures[venueId][enclosureId].enclosureId == 0) revert EnclosureNotFound(venueId, enclosureId);
        return _enclosureRows[venueId][enclosureId];
    }

    /// @notice Returns the seat count for a specific row in an enclosure
    /// @param venueId The venue
    /// @param enclosureId The enclosure
    /// @param rowLabel The row label (e.g., 0x41 for 'A')
    /// @return The number of seats in that row (0 if row doesn't exist)
    function getRowSeatCount(uint256 venueId, uint256 enclosureId, bytes1 rowLabel) external view override returns (uint256) {
        return _rowSeatCount[venueId][enclosureId][rowLabel];
    }

    /// @notice Checks if a venue is active
    /// @param venueId The venue to check
    /// @return True if the venue exists and is active
    function isVenueActive(uint256 venueId) external view override returns (bool) {
        return _venues[venueId].venueId != 0 && _venues[venueId].isActive;
    }

    /// @notice Checks if an enclosure is active
    /// @param venueId The venue containing the enclosure
    /// @param enclosureId The enclosure to check
    /// @return True if the enclosure exists and is active
    function isEnclosureActive(uint256 venueId, uint256 enclosureId) external view override returns (bool) {
        return _enclosures[venueId][enclosureId].enclosureId != 0 && _enclosures[venueId][enclosureId].isActive;
    }
}
