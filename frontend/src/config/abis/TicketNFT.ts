export const TicketNFTABI = [
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_vault",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_venueRegistry",
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
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "DelegateLocked",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ERC721EnumerableForbiddenBatchMint",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC721IncorrectOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "operator",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ERC721InsufficientApproval",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "approver",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC721InvalidApprover",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "operator",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC721InvalidOperator",
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
        "name":  "ERC721InvalidOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "receiver",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC721InvalidReceiver",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC721InvalidSender",
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
        "name":  "ERC721NonexistentToken",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "index",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ERC721OutOfBoundsIndex",
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
        "name":  "EnclosureNotActive",
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
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EnclosureRefundNotInitiated",
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
                       {
                           "internalType":  "uint256",
                           "name":  "eventId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EventAlreadyCancelled",
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
                           "name":  "endTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EventEnded",
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
        "name":  "EventNotCancelled",
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
        "name":  "EventNotFound",
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
        "name":  "EventNotLive",
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
        "name":  "EventVenueChangeLocked",
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
                           "name":  "startTime",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "endTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InvalidEventTimes",
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
        "name":  "InvalidRow",
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
                           "name":  "seat",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InvalidSeatNumber",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "price",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "minimum",
                           "type":  "uint256"
                       }
                   ],
        "name":  "MinimumPriceNotMet",
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
        "name":  "NotTicketOwner",
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
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "PricingNotSet",
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

                   ],
        "name":  "RowSeatCountMismatch",
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
                           "name":  "seat",
                           "type":  "uint256"
                       }
                   ],
        "name":  "SeatAlreadyBooked",
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
        "name":  "SoulboundTransferBlocked",
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
        "name":  "TicketAlreadyReturned",
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
        "name":  "TicketNotFound",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "count",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "max",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TooManySeats",
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
        "name":  "UseClaimCancellationRefund",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "WalkInNonRefundable",
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
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "approved",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Approval",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "operator",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "approved",
                           "type":  "bool"
                       }
                   ],
        "name":  "ApprovalForAll",
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
                           "name":  "cursor",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "totalTokens",
                           "type":  "uint256"
                       }
                   ],
        "name":  "CancellationBatchProcessed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
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
                           "name":  "refundAmount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "CancellationRefundClaimed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "DelegateRemoved",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "delegate",
                           "type":  "address"
                       }
                   ],
        "name":  "DelegateSet",
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
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EnclosureForceRefunded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "entrant",
                           "type":  "address"
                       }
                   ],
        "name":  "EntryMarked",
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
                       }
                   ],
        "name":  "EventCancelled",
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
                           "name":  "venueId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "matchTitle",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "eventManager",
                           "type":  "address"
                       }
                   ],
        "name":  "EventCreated",
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
                       }
                   ],
        "name":  "EventLive",
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
                           "name":  "newStartTime",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newEndTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EventPostponed",
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
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "priceInWei",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EventPricingSet",
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
                           "internalType":  "enum TicketNFT.EventStatus",
                           "name":  "status",
                           "type":  "uint8"
                       }
                   ],
        "name":  "EventStatusChanged",
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
                           "internalType":  "string",
                           "name":  "newTitle",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newVenueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "EventUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "oldPrice",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newPrice",
                           "type":  "uint256"
                       }
                   ],
        "name":  "MinimumTicketPriceUpdated",
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
                           "name":  "tokenId",
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
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes1",
                           "name":  "rowLabel",
                           "type":  "bytes1"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "seatNumber",
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
                           "name":  "price",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TicketPurchased",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
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
                           "name":  "refundAmount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TicketReturned",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Transfer",
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
                           "name":  "tokenId",
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
                           "internalType":  "bytes1",
                           "name":  "rowLabel",
                           "type":  "bytes1"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "seatNumber",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "entryCodeHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "WalkInTicketMinted",
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
        "name":  "EVENT_MANAGER_ROLE",
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
        "name":  "QR_VERIFIER_ROLE",
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
        "name":  "WALK_IN_MANAGER_ROLE",
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
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "approve",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "balanceOf",
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
        "name":  "cancelEvent",
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
        "name":  "cancellationCursor",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "claimCancellationRefund",
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
                           "name":  "matchTitle",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "startTime",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "endTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "createEvent",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "eventId",
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
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "delegates",
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
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "enclosureRefundCursor",
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
        "name":  "enclosureRefundInitiated",
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
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "eventPricing",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "priceInWei",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "soldSeats",
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
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "enclosureId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "forceRefundEnclosure",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getApproved",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getDelegate",
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
                       }
                   ],
        "name":  "getEvent",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "eventId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "venueId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "matchTitle",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "startTime",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "endTime",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "enum TicketNFT.EventStatus",
                                                   "name":  "status",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "eventManager",
                                                   "type":  "address"
                                               }
                                           ],
                            "internalType":  "struct TicketNFT.Event",
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
                           "name":  "eventId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getEventManager",
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
                       }
                   ],
        "name":  "getEventStartTime",
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
        "name":  "getEventVenueId",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getTicketData",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "eventId",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "purchasePrice",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint128",
                                                   "name":  "venueId",
                                                   "type":  "uint128"
                                               },
                                               {
                                                   "internalType":  "uint128",
                                                   "name":  "enclosureId",
                                                   "type":  "uint128"
                                               },
                                               {
                                                   "internalType":  "bytes1",
                                                   "name":  "rowLabel",
                                                   "type":  "bytes1"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "seatNumber",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "purchaseTimestamp",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint8",
                                                   "name":  "flags",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "bytes32",
                                                   "name":  "walkInEntryCode",
                                                   "type":  "bytes32"
                                               }
                                           ],
                            "internalType":  "struct TicketNFT.TicketData",
                            "name":  "data",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getTicketEventId",
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
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "operator",
                           "type":  "address"
                       }
                   ],
        "name":  "isApprovedForAll",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "isEntered",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "isTicketValid",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "markEntered",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "minimumTicketPrice",
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
        "name":  "name",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ownerOf",
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
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "newStartTime",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "newEndTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "postponeEvent",
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
                           "name":  "maxTokens",
                           "type":  "uint256"
                       }
                   ],
        "name":  "processCancellationRefunds",
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
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "maxTokens",
                           "type":  "uint256"
                       }
                   ],
        "name":  "processEnclosureRefunds",
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
                           "name":  "seatNumbers",
                           "type":  "uint256[]"
                       }
                   ],
        "name":  "purchaseMultipleTickets",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "tokenIds",
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
                           "name":  "eventId",
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
                           "name":  "seatNumber",
                           "type":  "uint256"
                       }
                   ],
        "name":  "purchaseTicket",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "tokenId",
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
                           "name":  "eventId",
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
                           "name":  "seatNumber",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "vaultAddress",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "secretNonce",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "purchaseWalkInTicket",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "tokenId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bytes32",
                            "name":  "entryCode",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "removeDelegate",
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
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "returnTicket",
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
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "safeTransferFrom",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes",
                           "name":  "data",
                           "type":  "bytes"
                       }
                   ],
        "name":  "safeTransferFrom",
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
                       },
                       {
                           "internalType":  "bytes1",
                           "name":  "",
                           "type":  "bytes1"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "seatBooked",
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
                           "name":  "operator",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "approved",
                           "type":  "bool"
                       }
                   ],
        "name":  "setApprovalForAll",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
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
                           "name":  "delegate",
                           "type":  "address"
                       }
                   ],
        "name":  "setDelegate",
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
                       }
                   ],
        "name":  "setEventLive",
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
                           "name":  "enclosureId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "priceInWei",
                           "type":  "uint256"
                       }
                   ],
        "name":  "setEventPricing",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_price",
                           "type":  "uint256"
                       }
                   ],
        "name":  "setMinimumTicketPrice",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_shop",
                           "type":  "address"
                       }
                   ],
        "name":  "setStadiumShopAddress",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "stadiumShopAddress",
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
        "name":  "symbol",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "index",
                           "type":  "uint256"
                       }
                   ],
        "name":  "tokenByIndex",
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
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "index",
                           "type":  "uint256"
                       }
                   ],
        "name":  "tokenOfOwnerByIndex",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "tokenURI",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalSupply",
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
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokenId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "transferFrom",
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
                           "name":  "eventId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "newTitle",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "newVenueId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "updateEvent",
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
                           "internalType":  "enum TicketNFT.EventStatus",
                           "name":  "newStatus",
                           "type":  "uint8"
                       }
                   ],
        "name":  "updateEventStatus",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
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

                   ],
        "name":  "venueRegistry",
        "outputs":  [
                        {
                            "internalType":  "contract IVenueRegistry",
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
                           "name":  "tokenId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "entryCode",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "verifyWalkInCode",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "valid",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    }
] as const;
