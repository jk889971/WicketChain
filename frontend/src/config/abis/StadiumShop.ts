export const StadiumShopABI = [
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_vault",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_ticketNFT",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_userProfile",
                           "type":  "address"
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "AlreadyEntered",
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
                           "name":  "required",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "sent",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InsufficientPayment",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       },
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
        "name":  "InsufficientStock",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "InvalidCartLength",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "caller",
                           "type":  "address"
                       }
                   ],
        "name":  "NotOrderOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "caller",
                           "type":  "address"
                       }
                   ],
        "name":  "NotShopOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderNotActive",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderNotConfirmed",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderNotFound",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ProductNotActive",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ProductNotFound",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "user",
                           "type":  "address"
                       }
                   ],
        "name":  "ProfileRequired",
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
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "startTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RefundWindowClosed",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RefundWindowStillOpen",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "ShopAlreadyRegistered",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopNotActive",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopNotApproved",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopNotFound",
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
        "name":  "ShopNotRegistered",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopNotRejectable",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "ShopOwnerBanned",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "caller",
                           "type":  "address"
                       }
                   ],
        "name":  "TicketNotOwnedByCaller",
        "type":  "error"
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
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "VenueNotAssociatedWithShop",
        "type":  "error"
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
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "VenueNotInShop",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ZeroAddress",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "MaxOrdersExceeded",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "orderCount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "totalPaid",
                           "type":  "uint256"
                       }
                   ],
        "name":  "CartCheckout",
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
                           "name":  "productId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newUnits",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InventoryUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "ticketTokenId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "quantity",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       }
                   ],
        "name":  "ItemPurchased",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "refundAmount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderCancelled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderCancelledByVendor",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderCollected",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderConfirmed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "refundAmount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OrderRefunded",
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
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isActive",
                           "type":  "bool"
                       }
                   ],
        "name":  "ProductActiveToggled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "productId",
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
                           "internalType":  "uint256",
                           "name":  "price",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ProductAdded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "productId",
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
                           "internalType":  "uint256",
                           "name":  "price",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ProductUpdated",
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
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isActive",
                           "type":  "bool"
                       }
                   ],
        "name":  "ShopActiveToggled",
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
                       }
                   ],
        "name":  "ShopApproved",
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
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "isActive",
                           "type":  "bool"
                       }
                   ],
        "name":  "ShopPaused",
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
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       }
                   ],
        "name":  "ShopRegistered",
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
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "reason",
                           "type":  "string"
                       }
                   ],
        "name":  "ShopRejected",
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
                           "name":  "venueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ShopVenueRemoved",
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
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "location",
                           "type":  "string"
                       }
                   ],
        "name":  "VenueAddedToShop",
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
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "newLocation",
                           "type":  "string"
                       }
                   ],
        "name":  "VenueLocationUpdated",
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

                   ],
        "name":  "SHOP_STAFF_ROLE",
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
        "name":  "TICKET_CONTRACT_ROLE",
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
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "priceInWei",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "availableUnits",
                           "type":  "uint256"
                       }
                   ],
        "name":  "addProduct",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "productId",
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
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "location",
                           "type":  "string"
                       }
                   ],
        "name":  "addVenueToShop",
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
                           "internalType":  "bool",
                           "name":  "active",
                           "type":  "bool"
                       }
                   ],
        "name":  "adminToggleShop",
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
                       }
                   ],
        "name":  "approveShop",
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
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "buyerOrders",
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
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "cancelOrder",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "confirmCollection",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256[]",
                           "name":  "orderIds",
                           "type":  "uint256[]"
                       }
                   ],
        "name":  "confirmOrders",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       }
                   ],
        "name":  "getOrdersByBuyer",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "orderId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "ticketTokenId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "productId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "shopId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "venueId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "eventId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "quantity",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "totalPaid",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "buyer",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "enum StadiumShop.OrderStatus",
                                                   "name":  "status",
                                                   "type":  "uint8"
                                               }
                                           ],
                            "internalType":  "struct StadiumShop.Order[]",
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
                           "name":  "ticketTokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getOrdersByTicket",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "orderId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "ticketTokenId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "productId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "shopId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "venueId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "eventId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "quantity",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "totalPaid",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "buyer",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "enum StadiumShop.OrderStatus",
                                                   "name":  "status",
                                                   "type":  "uint8"
                                               }
                                           ],
                            "internalType":  "struct StadiumShop.Order[]",
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
                           "name":  "shopId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getShopProducts",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "",
                            "type":  "uint256[]"
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
        "name":  "getShopVenues",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "",
                            "type":  "uint256[]"
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
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "isBanned",
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
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "orders",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "orderId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "ticketTokenId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "productId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "shopId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "venueId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "eventId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "quantity",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "totalPaid",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "buyer",
                            "type":  "address"
                        },
                        {
                            "internalType":  "enum StadiumShop.OrderStatus",
                            "name":  "status",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
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
        "name":  "ownerShopId",
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
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "products",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "productId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "shopId",
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
                            "internalType":  "string",
                            "name":  "imageURI",
                            "type":  "string"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "priceInWei",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "availableUnits",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isActive",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "components":  [
                                              {
                                                  "internalType":  "uint256",
                                                  "name":  "productId",
                                                  "type":  "uint256"
                                              },
                                              {
                                                  "internalType":  "uint256",
                                                  "name":  "ticketTokenId",
                                                  "type":  "uint256"
                                              },
                                              {
                                                  "internalType":  "uint256",
                                                  "name":  "quantity",
                                                  "type":  "uint256"
                                              }
                                          ],
                           "internalType":  "struct StadiumShop.CartItemAllocation[]",
                           "name":  "items",
                           "type":  "tuple[]"
                       }
                   ],
        "name":  "purchaseCart",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "orderIds",
                            "type":  "uint256[]"
                        }
                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "quantity",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "ticketTokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "purchaseSingleItem",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "orderId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "ticketTokenId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       }
                   ],
        "name":  "refundLinkedItems",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "totalRefund",
                            "type":  "uint256"
                        }
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
                           "name":  "description",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256[]",
                           "name":  "venueIds",
                           "type":  "uint256[]"
                       },
                       {
                           "internalType":  "string[]",
                           "name":  "locations",
                           "type":  "string[]"
                       }
                   ],
        "name":  "registerShop",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "shopId",
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
                           "name":  "shopId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "reason",
                           "type":  "string"
                       }
                   ],
        "name":  "rejectShop",
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
                       }
                   ],
        "name":  "removeVenueFromShop",
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
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "shopProductIds",
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
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "shopVenueIds",
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
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "shopVenues",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "venueId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "string",
                            "name":  "locationInVenue",
                            "type":  "string"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isActive",
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
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "shops",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "shopId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "owner",
                            "type":  "address"
                        },
                        {
                            "internalType":  "string",
                            "name":  "name",
                            "type":  "string"
                        },
                        {
                            "internalType":  "string",
                            "name":  "description",
                            "type":  "string"
                        },
                        {
                            "internalType":  "string",
                            "name":  "imageURI",
                            "type":  "string"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isApproved",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isActive",
                            "type":  "bool"
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
        "name":  "ticketNFT",
        "outputs":  [
                        {
                            "internalType":  "contract ITicketNFT",
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
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ticketOrders",
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
                           "name":  "productId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "toggleProductActive",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "toggleShopActive",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
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
                           "name":  "productId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "newUnits",
                           "type":  "uint256"
                       }
                   ],
        "name":  "updateInventory",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "productId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "priceInWei",
                           "type":  "uint256"
                       }
                   ],
        "name":  "updateProduct",
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
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "newLocation",
                           "type":  "string"
                       }
                   ],
        "name":  "updateVenueLocation",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "userProfile",
        "outputs":  [
                        {
                            "internalType":  "contract IUserProfile",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "vault",
        "outputs":  [
                        {
                            "internalType":  "contract IVault",
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
                           "name":  "orderId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "vendorCancelOrder",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "maxOrdersPerTicket",
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
                           "name":  "newMax",
                           "type":  "uint256"
                       }
                   ],
        "name":  "setMaxOrdersPerTicket",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
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
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "name",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "description",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       }
                   ],
        "name":  "ShopUpdated",
        "type":  "event"
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
                           "name":  "description",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "imageURI",
                           "type":  "string"
                       }
                   ],
        "name":  "updateShop",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;
