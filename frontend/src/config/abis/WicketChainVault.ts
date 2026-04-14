export const WicketChainVaultABI = [
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_platformTreasury",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "_shopFeeBps",
                           "type":  "uint256"
                       }
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
                           "name":  "eventId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "AlreadySettled",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "caller",
                           "type":  "address"
                       }
                   ],
        "name":  "ContractNotAuthorized",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "EnforcedPause",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ExpectedPause",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "requested",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "available",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InsufficientConfirmedEarnings",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "requested",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "available",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InsufficientVaultBalance",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "percent",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InvalidPlatformPercent",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "bps",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "max",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InvalidShopFeeBps",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "InvalidWithdrawalAmount",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NothingToClaim",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ReentrancyGuardReentrantCall",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "TransferFailed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ZeroAddress",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum IVault.VaultCategory",
                           "name":  "category",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Deposited",
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
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "platformAmount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "eventManagerAmount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "platformPercent",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EventSettled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "Paused",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "oldTreasury",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "newTreasury",
                           "type":  "address"
                       }
                   ],
        "name":  "PlatformTreasuryUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "claimant",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RefundClaimed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RefundCredited",
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
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopEarningRecorded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "feeDeducted",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopEarningsConfirmed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "oldBps",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newBps",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopFeeUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "ShopOwnerRegistered",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopRefundCredited",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopWithdrawal",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "Unpaused",
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
        "name":  "AUTHORIZED_CONTRACT_ROLE",
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
                           "internalType":  "address",
                           "name":  "contractAddr",
                           "type":  "address"
                       }
                   ],
        "name":  "authorizeContract",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "claimRefunds",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "claimableRefunds",
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
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256[]",
                           "name":  "amounts",
                           "type":  "uint256[]"
                       }
                   ],
        "name":  "confirmShopEarnings",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "creditRefund",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "creditShopRefund",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "contractAddr",
                           "type":  "address"
                       }
                   ],
        "name":  "deauthorizeContract",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "enum IVault.VaultCategory",
                           "name":  "category",
                           "type":  "uint8"
                       }
                   ],
        "name":  "deposit",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "eventBalances",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "ticketRevenue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "ticketRefunds",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "shopRevenue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "shopRefunds",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "shopFeesCollected",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isSettled",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "user",
                           "type":  "address"
                       }
                   ],
        "name":  "getClaimableRefund",
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
                           "name":  "eventId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getEventBalance",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "ticketRevenue",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "ticketRefunds",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "shopRevenue",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "shopRefunds",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "shopFeesCollected",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "isSettled",
                                                   "type":  "bool"
                                               }
                                           ],
                            "internalType":  "struct WicketChainVault.EventBalance",
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
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getShopBalance",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "totalEarnings",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "pendingEarnings",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "confirmedEarnings",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "shopFeeDeducted",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "withdrawnAmount",
                                                   "type":  "uint256"
                                               }
                                           ],
                            "internalType":  "struct WicketChainVault.ShopBalance",
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
                           "internalType":  "string",
                           "name":  "reason",
                           "type":  "string"
                       }
                   ],
        "name":  "pause",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "paused",
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

                   ],
        "name":  "platformTreasury",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "shopOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "recordShopEarning",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
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
                           "internalType":  "address",
                           "name":  "newTreasury",
                           "type":  "address"
                       }
                   ],
        "name":  "setPlatformTreasury",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "newBps",
                           "type":  "uint256"
                       }
                   ],
        "name":  "setShopFeeBps",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "platformPercent",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "eventManager",
                           "type":  "address"
                       }
                   ],
        "name":  "settleEvent",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "shopBalances",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "totalEarnings",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "pendingEarnings",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "confirmedEarnings",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "shopFeeDeducted",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "withdrawnAmount",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "shopFeeBps",
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
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "shopOwners",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
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

                   ],
        "name":  "unpause",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "withdrawShopEarnings",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "stateMutability":  "payable",
        "type":  "receive"
    }
] as const;
