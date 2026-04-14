// VenueRegistry — Event ABI fragments only
export const VenueRegistryEvents = [
  "event VenueCreated(uint256 indexed venueId, string name, string city)",
  "event VenueUpdated(uint256 indexed venueId, string name, string city)",
  "event VenueDeactivated(uint256 indexed venueId)",
  "event VenueActivated(uint256 indexed venueId)",
  "event EnclosureAdded(uint256 indexed venueId, uint256 indexed enclosureId, string name)",
  "event EnclosureUpdated(uint256 indexed venueId, uint256 indexed enclosureId, string name)",
  "event EnclosureStatusChanged(uint256 indexed venueId, uint256 indexed enclosureId, bool isActive)",
  "event RowsAdded(uint256 indexed venueId, uint256 indexed enclosureId, uint256 rowCount)",
  "event RowUpdated(uint256 indexed venueId, uint256 indexed enclosureId, uint256 rowIndex, bytes1 oldRowLabel, bytes1 newRowLabel, uint256 newSeatCount)",
] as const;
