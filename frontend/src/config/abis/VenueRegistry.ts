export const VenueRegistryABI = [
    {
        "inputs":  [

                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [

                   ],
        "name":  "AccessControlBadConfirmation",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "neededRole",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "AccessControlUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EmptyRowLabels",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EnclosureNotFound",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes1",
                           "name":  "rowLabel",
                           "type":  "bytes1"
                       }
                   ],
        "name":  "RowAlreadyExists",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "rowIndex",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RowNotFound",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "RowSeatCountMismatch",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes1",
                           "name":  "rowLabel",
                           "type":  "bytes1"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "current",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "requested",
                           "type":  "uint256"
                       }
                   ],
        "name":  "SeatCountReductionNotAllowed",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "VenueNotActive",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "VenueNotFound",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "by",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "reason",
                           "type":  "string"
                       }
                   ],
        "name":  "EmergencyPaused",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "by",
                           "type":  "address"
                       }
                   ],
        "name":  "EmergencyUnpaused",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       }
                   ],
        "name":  "EnclosureAdded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isActive",
                           "type":  "bool"
                       }
                   ],
        "name":  "EnclosureStatusChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       }
                   ],
        "name":  "EnclosureUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "previousAdminRole",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "newAdminRole",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "RoleAdminChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "RoleGranted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "RoleRevoked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "rowIndex",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes1",
                           "name":  "oldRowLabel",
                           "type":  "bytes1"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes1",
                           "name":  "newRowLabel",
                           "type":  "bytes1"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newSeatCount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RowUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "rowCount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RowsAdded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "VenueActivated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "city",
                           "type":  "string"
                       }
                   ],
        "name":  "VenueCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "VenueDeactivated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "city",
                           "type":  "string"
                       }
                   ],
        "name":  "VenueUpdated",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "ADMIN_ROLE",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "ANTI_SNIPE_EXTENSION",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "ANTI_SNIPE_WINDOW",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "BPS_DENOMINATOR",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "DEFAULT_ADMIN_ROLE",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "MAX_BULK_PURCHASE",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "QR_EXPIRY",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "REFUND_BPS",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "REFUND_WINDOW",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "SEAT_HOLD_DURATION",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "SHOP_FEE_DEFAULT_BPS",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "activateVenue",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes1[]",
                           "name":  "rowLabels",
                           "type":  "bytes1[]"
                       },
                       {
                           "internalType":  "uint256[]",
                           "name":  "seatCounts",
                           "type":  "uint256[]"
                       }
                   ],
        "name":  "addEnclosure",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "enclosureId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes1[]",
                           "name":  "rowLabels",
                           "type":  "bytes1[]"
                       },
                       {
                           "internalType":  "uint256[]",
                           "name":  "seatCounts",
                           "type":  "uint256[]"
                       }
                   ],
        "name":  "addRows",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "city",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       }
                   ],
        "name":  "createVenue",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "venueId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "deactivateVenue",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getEnclosure",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "enclosureId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "venueId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "name",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isActive",
                                                   "type":  "bool"
                                               }
                                           ],
                            "internalType":  "struct IVenueRegistry.Enclosure",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getEnclosures",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "enclosureId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "venueId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "name",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isActive",
                                                   "type":  "bool"
                                               }
                                           ],
                            "internalType":  "struct IVenueRegistry.Enclosure[]",
                            "name":  "",
                            "type":  "tuple[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "getRoleAdmin",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes1",
                           "name":  "rowLabel",
                           "type":  "bytes1"
                       }
                   ],
        "name":  "getRowSeatCount",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getRows",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "bytes1",
                                                   "name":  "label",
                                                   "type":  "bytes1"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "seatCount",
                                                   "type":  "uint256"
                                               }
                                           ],
                            "internalType":  "struct IVenueRegistry.Row[]",
                            "name":  "",
                            "type":  "tuple[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getVenue",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "venueId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "name",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "city",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "imageURI",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isActive",
                                                   "type":  "bool"
                                               }
                                           ],
                            "internalType":  "struct IVenueRegistry.Venue",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "grantRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "hasRole",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "isEnclosureActive",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "isVenueActive",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "callerConfirmation",
                           "type":  "address"
                       }
                   ],
        "name":  "renounceRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "revokeRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes4",
                           "name":  "interfaceId",
                           "type":  "bytes4"
                       }
                   ],
        "name":  "supportsInterface",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "active",
                           "type":  "bool"
                       }
                   ],
        "name":  "toggleEnclosureActive",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       }
                   ],
        "name":  "updateEnclosure",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "rowIndex",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes1",
                           "name":  "newRowLabel",
                           "type":  "bytes1"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "newSeatCount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "updateRow",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "city",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       }
                   ],
        "name":  "updateVenue",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;
