import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StadiumShop
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const stadiumShopAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_vault', internalType: 'address', type: 'address' },
      { name: '_ticketNFT', internalType: 'address', type: 'address' },
      { name: '_userProfile', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'AlreadyEntered',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'required', internalType: 'uint256', type: 'uint256' },
      { name: 'sent', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientPayment',
  },
  {
    type: 'error',
    inputs: [
      { name: 'productId', internalType: 'uint256', type: 'uint256' },
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientStock',
  },
  { type: 'error', inputs: [], name: 'InvalidCartLength' },
  {
    type: 'error',
    inputs: [
      { name: 'orderId', internalType: 'uint256', type: 'uint256' },
      { name: 'caller', internalType: 'address', type: 'address' },
    ],
    name: 'NotOrderOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'caller', internalType: 'address', type: 'address' },
    ],
    name: 'NotShopOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'OrderNotActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'OrderNotConfirmed',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'OrderNotFound',
  },
  {
    type: 'error',
    inputs: [{ name: 'productId', internalType: 'uint256', type: 'uint256' }],
    name: 'ProductNotActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'productId', internalType: 'uint256', type: 'uint256' }],
    name: 'ProductNotFound',
  },
  {
    type: 'error',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'ProfileRequired',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'RefundWindowClosed',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'RefundWindowStillOpen',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ShopAlreadyRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'ShopNotActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'ShopNotApproved',
  },
  {
    type: 'error',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'ShopNotFound',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'ShopNotRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'ShopNotRejectable',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ShopOwnerBanned',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'caller', internalType: 'address', type: 'address' },
    ],
    name: 'TicketNotOwnedByCaller',
  },
  {
    type: 'error',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'VenueNotAssociatedWithShop',
  },
  {
    type: 'error',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'VenueNotInShop',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'MaxOrdersExceeded' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'orderCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalPaid',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CartCheckout',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'EmergencyPaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EmergencyUnpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'productId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newUnits',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'InventoryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ticketTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'productId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'quantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ItemPurchased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'refundAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'OrderCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'OrderCancelledByVendor',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'OrderCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'OrderConfirmed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'refundAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'OrderRefunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'productId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isActive', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ProductActiveToggled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'productId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProductAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'productId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProductUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isActive', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ShopActiveToggled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ShopApproved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isActive', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ShopPaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ShopRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ShopRejected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ShopVenueRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'location',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'VenueAddedToShop',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newLocation',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'VenueLocationUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_EXTENSION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BULK_PURCHASE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'QR_EXPIRY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SEAT_HOLD_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SHOP_FEE_DEFAULT_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SHOP_STAFF_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TICKET_CONTRACT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
      { name: 'priceInWei', internalType: 'uint256', type: 'uint256' },
      { name: 'availableUnits', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addProduct',
    outputs: [{ name: 'productId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'location', internalType: 'string', type: 'string' },
    ],
    name: 'addVenueToShop',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    name: 'adminToggleShop',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'approveShop',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'buyerOrders',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'confirmCollection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'orderIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'confirmOrders',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'buyer', internalType: 'address', type: 'address' }],
    name: 'getOrdersByBuyer',
    outputs: [
      {
        name: '',
        internalType: 'struct StadiumShop.Order[]',
        type: 'tuple[]',
        components: [
          { name: 'orderId', internalType: 'uint256', type: 'uint256' },
          { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'productId', internalType: 'uint256', type: 'uint256' },
          { name: 'shopId', internalType: 'uint256', type: 'uint256' },
          { name: 'venueId', internalType: 'uint256', type: 'uint256' },
          { name: 'eventId', internalType: 'uint256', type: 'uint256' },
          { name: 'quantity', internalType: 'uint256', type: 'uint256' },
          { name: 'totalPaid', internalType: 'uint256', type: 'uint256' },
          { name: 'buyer', internalType: 'address', type: 'address' },
          {
            name: 'status',
            internalType: 'enum StadiumShop.OrderStatus',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getOrdersByTicket',
    outputs: [
      {
        name: '',
        internalType: 'struct StadiumShop.Order[]',
        type: 'tuple[]',
        components: [
          { name: 'orderId', internalType: 'uint256', type: 'uint256' },
          { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'productId', internalType: 'uint256', type: 'uint256' },
          { name: 'shopId', internalType: 'uint256', type: 'uint256' },
          { name: 'venueId', internalType: 'uint256', type: 'uint256' },
          { name: 'eventId', internalType: 'uint256', type: 'uint256' },
          { name: 'quantity', internalType: 'uint256', type: 'uint256' },
          { name: 'totalPaid', internalType: 'uint256', type: 'uint256' },
          { name: 'buyer', internalType: 'address', type: 'address' },
          {
            name: 'status',
            internalType: 'enum StadiumShop.OrderStatus',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'getShopProducts',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'getShopVenues',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isBanned',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'orders',
    outputs: [
      { name: 'orderId', internalType: 'uint256', type: 'uint256' },
      { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'productId', internalType: 'uint256', type: 'uint256' },
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
      { name: 'totalPaid', internalType: 'uint256', type: 'uint256' },
      { name: 'buyer', internalType: 'address', type: 'address' },
      {
        name: 'status',
        internalType: 'enum StadiumShop.OrderStatus',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'ownerShopId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'reason', internalType: 'string', type: 'string' }],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'products',
    outputs: [
      { name: 'productId', internalType: 'uint256', type: 'uint256' },
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
      { name: 'priceInWei', internalType: 'uint256', type: 'uint256' },
      { name: 'availableUnits', internalType: 'uint256', type: 'uint256' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'items',
        internalType: 'struct StadiumShop.CartItemAllocation[]',
        type: 'tuple[]',
        components: [
          { name: 'productId', internalType: 'uint256', type: 'uint256' },
          { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'quantity', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'purchaseCart',
    outputs: [
      { name: 'orderIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'productId', internalType: 'uint256', type: 'uint256' },
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
      { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'purchaseSingleItem',
    outputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'ticketTokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'buyer', internalType: 'address', type: 'address' },
    ],
    name: 'refundLinkedItems',
    outputs: [
      { name: 'totalRefund', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
      { name: 'venueIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'locations', internalType: 'string[]', type: 'string[]' },
    ],
    name: 'registerShop',
    outputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'rejectShop',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'removeVenueFromShop',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'shopProductIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'shopVenueIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'shopVenues',
    outputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'locationInVenue', internalType: 'string', type: 'string' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'shops',
    outputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
      { name: 'isApproved', internalType: 'bool', type: 'bool' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ticketNFT',
    outputs: [
      { name: '', internalType: 'contract ITicketNFT', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ticketOrders',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'productId', internalType: 'uint256', type: 'uint256' }],
    name: 'toggleProductActive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'toggleShopActive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'productId', internalType: 'uint256', type: 'uint256' },
      { name: 'newUnits', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateInventory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'productId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
      { name: 'priceInWei', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateProduct',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
    ],
    name: 'updateShop',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'newLocation', internalType: 'string', type: 'string' },
    ],
    name: 'updateVenueLocation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'userProfile',
    outputs: [
      { name: '', internalType: 'contract IUserProfile', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderId', internalType: 'uint256', type: 'uint256' }],
    name: 'vendorCancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxOrdersPerTicket',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMax', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxOrdersPerTicket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TicketNFT
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ticketNftAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_vault', internalType: 'address', type: 'address' },
      { name: '_venueRegistry', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'AlreadyEntered',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'DelegateLocked',
  },
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'EnclosureNotActive',
  },
  {
    type: 'error',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'EnclosureRefundNotInitiated',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  {
    type: 'error',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'EventAlreadyCancelled',
  },
  {
    type: 'error',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'EventEnded',
  },
  {
    type: 'error',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'EventNotCancelled',
  },
  {
    type: 'error',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'EventNotFound',
  },
  {
    type: 'error',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'EventNotLive',
  },
  {
    type: 'error',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'EventVenueChangeLocked',
  },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'required', internalType: 'uint256', type: 'uint256' },
      { name: 'sent', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientPayment',
  },
  {
    type: 'error',
    inputs: [
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidEventTimes',
  },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
    ],
    name: 'InvalidRow',
  },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
      { name: 'seat', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidSeatNumber',
  },
  {
    type: 'error',
    inputs: [
      { name: 'price', internalType: 'uint256', type: 'uint256' },
      { name: 'minimum', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'MinimumPriceNotMet',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'caller', internalType: 'address', type: 'address' },
    ],
    name: 'NotTicketOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'PricingNotSet',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'RefundWindowClosed',
  },
  { type: 'error', inputs: [], name: 'RowSeatCountMismatch' },
  {
    type: 'error',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
      { name: 'seat', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SeatAlreadyBooked',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'SoulboundTransferBlocked',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'TicketAlreadyReturned',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'TicketNotFound',
  },
  {
    type: 'error',
    inputs: [
      { name: 'count', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TooManySeats',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'UseClaimCancellationRefund',
  },
  {
    type: 'error',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'VenueNotActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'WalkInNonRefundable',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'cursor',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalTokens',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CancellationBatchProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'refundAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CancellationRefundClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'DelegateRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'delegate',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DelegateSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'EmergencyPaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EmergencyUnpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EnclosureForceRefunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'entrant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EntryMarked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EventCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'matchTitle',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'eventManager',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'EventCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EventLive',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newStartTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newEndTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EventPostponed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'priceInWei',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EventPricingSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'status',
        internalType: 'enum TicketNFT.EventStatus',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'EventStatusChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newTitle',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'newVenueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EventUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinimumTicketPriceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rowLabel',
        internalType: 'bytes1',
        type: 'bytes1',
        indexed: false,
      },
      {
        name: 'seatNumber',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TicketPurchased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'refundAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TicketReturned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rowLabel',
        internalType: 'bytes1',
        type: 'bytes1',
        indexed: false,
      },
      {
        name: 'seatNumber',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'entryCodeHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'WalkInTicketMinted',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_EXTENSION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'EVENT_MANAGER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BULK_PURCHASE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'QR_EXPIRY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'QR_VERIFIER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SEAT_HOLD_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SHOP_FEE_DEFAULT_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WALK_IN_MANAGER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelEvent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'cancellationCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'claimCancellationRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'matchTitle', internalType: 'string', type: 'string' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createEvent',
    outputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'delegates',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'enclosureRefundCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'enclosureRefundInitiated',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'eventPricing',
    outputs: [
      { name: 'priceInWei', internalType: 'uint256', type: 'uint256' },
      { name: 'soldSeats', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'forceRefundEnclosure',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getDelegate',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEvent',
    outputs: [
      {
        name: '',
        internalType: 'struct TicketNFT.Event',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'uint256', type: 'uint256' },
          { name: 'venueId', internalType: 'uint256', type: 'uint256' },
          { name: 'matchTitle', internalType: 'string', type: 'string' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          {
            name: 'status',
            internalType: 'enum TicketNFT.EventStatus',
            type: 'uint8',
          },
          { name: 'eventManager', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEventManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEventStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEventVenueId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTicketData',
    outputs: [
      {
        name: 'data',
        internalType: 'struct TicketNFT.TicketData',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'uint256', type: 'uint256' },
          { name: 'purchasePrice', internalType: 'uint256', type: 'uint256' },
          { name: 'venueId', internalType: 'uint128', type: 'uint128' },
          { name: 'enclosureId', internalType: 'uint128', type: 'uint128' },
          { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
          { name: 'seatNumber', internalType: 'uint64', type: 'uint64' },
          { name: 'purchaseTimestamp', internalType: 'uint64', type: 'uint64' },
          { name: 'flags', internalType: 'uint8', type: 'uint8' },
          { name: 'walkInEntryCode', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTicketEventId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'isEntered',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'isTicketValid',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'markEntered',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minimumTicketPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'reason', internalType: 'string', type: 'string' }],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'newStartTime', internalType: 'uint256', type: 'uint256' },
      { name: 'newEndTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'postponeEvent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'maxTokens', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'processCancellationRefunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'maxTokens', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'processEnclosureRefunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabels', internalType: 'bytes1[]', type: 'bytes1[]' },
      { name: 'seatNumbers', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'purchaseMultipleTickets',
    outputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
      { name: 'seatNumber', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'purchaseTicket',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
      { name: 'seatNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'vaultAddress', internalType: 'address', type: 'address' },
      { name: 'secretNonce', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'purchaseWalkInTicket',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'entryCode', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'removeDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'returnTicket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes1', type: 'bytes1' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'seatBooked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'delegate', internalType: 'address', type: 'address' },
    ],
    name: 'setDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'setEventLive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'priceInWei', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setEventPricing',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_price', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinimumTicketPrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_shop', internalType: 'address', type: 'address' }],
    name: 'setStadiumShopAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stadiumShopAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'newTitle', internalType: 'string', type: 'string' },
      { name: 'newVenueId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateEvent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'newStatus',
        internalType: 'enum TicketNFT.EventStatus',
        type: 'uint8',
      },
    ],
    name: 'updateEventStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'venueRegistry',
    outputs: [
      { name: '', internalType: 'contract IVenueRegistry', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'entryCode', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'verifyWalkInCode',
    outputs: [{ name: 'valid', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UserProfile
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const userProfileAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'EmergencyPaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EmergencyUnpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'ProfileHashRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'profileHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'ProfileHashSet',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_EXTENSION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BULK_PURCHASE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'QR_EXPIRY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SEAT_HOLD_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SHOP_FEE_DEFAULT_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'hasCompleteProfile',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'profileHashes',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'removeProfileHash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'hash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'setProfileHash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VenueRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const venueRegistryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'EmptyRowLabels',
  },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'EnclosureNotFound',
  },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
    ],
    name: 'RowAlreadyExists',
  },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'RowNotFound',
  },
  { type: 'error', inputs: [], name: 'RowSeatCountMismatch' },
  {
    type: 'error',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
      { name: 'current', internalType: 'uint256', type: 'uint256' },
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SeatCountReductionNotAllowed',
  },
  {
    type: 'error',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'VenueNotActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'VenueNotFound',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'EmergencyPaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EmergencyUnpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'EnclosureAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isActive', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'EnclosureStatusChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'EnclosureUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rowIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'oldRowLabel',
        internalType: 'bytes1',
        type: 'bytes1',
        indexed: false,
      },
      {
        name: 'newRowLabel',
        internalType: 'bytes1',
        type: 'bytes1',
        indexed: false,
      },
      {
        name: 'newSeatCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RowUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enclosureId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rowCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RowsAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'VenueActivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      { name: 'city', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'VenueCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'VenueDeactivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'venueId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      { name: 'city', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'VenueUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_EXTENSION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BULK_PURCHASE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'QR_EXPIRY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SEAT_HOLD_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SHOP_FEE_DEFAULT_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'activateVenue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'rowLabels', internalType: 'bytes1[]', type: 'bytes1[]' },
      { name: 'seatCounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'addEnclosure',
    outputs: [
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabels', internalType: 'bytes1[]', type: 'bytes1[]' },
      { name: 'seatCounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'addRows',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'city', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
    ],
    name: 'createVenue',
    outputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'deactivateVenue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEnclosure',
    outputs: [
      {
        name: '',
        internalType: 'struct IVenueRegistry.Enclosure',
        type: 'tuple',
        components: [
          { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
          { name: 'venueId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'isActive', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEnclosures',
    outputs: [
      {
        name: '',
        internalType: 'struct IVenueRegistry.Enclosure[]',
        type: 'tuple[]',
        components: [
          { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
          { name: 'venueId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'isActive', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowLabel', internalType: 'bytes1', type: 'bytes1' },
    ],
    name: 'getRowSeatCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRows',
    outputs: [
      {
        name: '',
        internalType: 'struct IVenueRegistry.Row[]',
        type: 'tuple[]',
        components: [
          { name: 'label', internalType: 'bytes1', type: 'bytes1' },
          { name: 'seatCount', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'getVenue',
    outputs: [
      {
        name: '',
        internalType: 'struct IVenueRegistry.Venue',
        type: 'tuple',
        components: [
          { name: 'venueId', internalType: 'uint256', type: 'uint256' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'city', internalType: 'string', type: 'string' },
          { name: 'imageURI', internalType: 'string', type: 'string' },
          { name: 'isActive', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isEnclosureActive',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'venueId', internalType: 'uint256', type: 'uint256' }],
    name: 'isVenueActive',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    name: 'toggleEnclosureActive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
    ],
    name: 'updateEnclosure',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'enclosureId', internalType: 'uint256', type: 'uint256' },
      { name: 'rowIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'newRowLabel', internalType: 'bytes1', type: 'bytes1' },
      { name: 'newSeatCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateRow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'venueId', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'city', internalType: 'string', type: 'string' },
      { name: 'imageURI', internalType: 'string', type: 'string' },
    ],
    name: 'updateVenue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WicketChainVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const wicketChainVaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_platformTreasury', internalType: 'address', type: 'address' },
      { name: '_shopFeeBps', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'AlreadySettled',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'ContractNotAuthorized',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientConfirmedEarnings',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientVaultBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'percent', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidPlatformPercent',
  },
  {
    type: 'error',
    inputs: [
      { name: 'bps', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidShopFeeBps',
  },
  { type: 'error', inputs: [], name: 'InvalidWithdrawalAmount' },
  { type: 'error', inputs: [], name: 'NothingToClaim' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'category',
        internalType: 'enum IVault.VaultCategory',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'EmergencyPaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EmergencyUnpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'platformAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'eventManagerAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformPercent',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EventSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldTreasury',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'PlatformTreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'claimant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RefundClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RefundCredited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ShopEarningRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feeDeducted',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ShopEarningsConfirmed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ShopFeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ShopOwnerRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'eventId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ShopRefundCredited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'shopId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ShopWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_EXTENSION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ANTI_SNIPE_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AUTHORIZED_CONTRACT_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BULK_PURCHASE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'QR_EXPIRY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REFUND_WINDOW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SEAT_HOLD_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SHOP_FEE_DEFAULT_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contractAddr', internalType: 'address', type: 'address' },
    ],
    name: 'authorizeContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimRefunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'claimableRefunds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'confirmShopEarnings',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'creditRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'creditShopRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contractAddr', internalType: 'address', type: 'address' },
    ],
    name: 'deauthorizeContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'category',
        internalType: 'enum IVault.VaultCategory',
        type: 'uint8',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'eventBalances',
    outputs: [
      { name: 'ticketRevenue', internalType: 'uint256', type: 'uint256' },
      { name: 'ticketRefunds', internalType: 'uint256', type: 'uint256' },
      { name: 'shopRevenue', internalType: 'uint256', type: 'uint256' },
      { name: 'shopRefunds', internalType: 'uint256', type: 'uint256' },
      { name: 'shopFeesCollected', internalType: 'uint256', type: 'uint256' },
      { name: 'isSettled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getClaimableRefund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'eventId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEventBalance',
    outputs: [
      {
        name: '',
        internalType: 'struct WicketChainVault.EventBalance',
        type: 'tuple',
        components: [
          { name: 'ticketRevenue', internalType: 'uint256', type: 'uint256' },
          { name: 'ticketRefunds', internalType: 'uint256', type: 'uint256' },
          { name: 'shopRevenue', internalType: 'uint256', type: 'uint256' },
          { name: 'shopRefunds', internalType: 'uint256', type: 'uint256' },
          {
            name: 'shopFeesCollected',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'isSettled', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shopId', internalType: 'uint256', type: 'uint256' }],
    name: 'getShopBalance',
    outputs: [
      {
        name: '',
        internalType: 'struct WicketChainVault.ShopBalance',
        type: 'tuple',
        components: [
          { name: 'totalEarnings', internalType: 'uint256', type: 'uint256' },
          { name: 'pendingEarnings', internalType: 'uint256', type: 'uint256' },
          {
            name: 'confirmedEarnings',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'shopFeeDeducted', internalType: 'uint256', type: 'uint256' },
          { name: 'withdrawnAmount', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'reason', internalType: 'string', type: 'string' }],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'shopOwner', internalType: 'address', type: 'address' },
    ],
    name: 'recordShopEarning',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setPlatformTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBps', internalType: 'uint256', type: 'uint256' }],
    name: 'setShopFeeBps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'eventId', internalType: 'uint256', type: 'uint256' },
      { name: 'platformPercent', internalType: 'uint256', type: 'uint256' },
      { name: 'eventManager', internalType: 'address', type: 'address' },
    ],
    name: 'settleEvent',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'shopBalances',
    outputs: [
      { name: 'totalEarnings', internalType: 'uint256', type: 'uint256' },
      { name: 'pendingEarnings', internalType: 'uint256', type: 'uint256' },
      { name: 'confirmedEarnings', internalType: 'uint256', type: 'uint256' },
      { name: 'shopFeeDeducted', internalType: 'uint256', type: 'uint256' },
      { name: 'withdrawnAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'shopFeeBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'shopOwners',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shopId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawShopEarnings',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__
 */
export const useReadStadiumShop = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useReadStadiumShopAdminRole = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"ANTI_SNIPE_EXTENSION"`
 */
export const useReadStadiumShopAntiSnipeExtension =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'ANTI_SNIPE_EXTENSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"ANTI_SNIPE_WINDOW"`
 */
export const useReadStadiumShopAntiSnipeWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'ANTI_SNIPE_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadStadiumShopBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadStadiumShopDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"MAX_BULK_PURCHASE"`
 */
export const useReadStadiumShopMaxBulkPurchase =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'MAX_BULK_PURCHASE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"QR_EXPIRY"`
 */
export const useReadStadiumShopQrExpiry = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'QR_EXPIRY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"REFUND_BPS"`
 */
export const useReadStadiumShopRefundBps = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'REFUND_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"REFUND_WINDOW"`
 */
export const useReadStadiumShopRefundWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'REFUND_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"SEAT_HOLD_DURATION"`
 */
export const useReadStadiumShopSeatHoldDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'SEAT_HOLD_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"SHOP_FEE_DEFAULT_BPS"`
 */
export const useReadStadiumShopShopFeeDefaultBps =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'SHOP_FEE_DEFAULT_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"SHOP_STAFF_ROLE"`
 */
export const useReadStadiumShopShopStaffRole =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'SHOP_STAFF_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"TICKET_CONTRACT_ROLE"`
 */
export const useReadStadiumShopTicketContractRole =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'TICKET_CONTRACT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"buyerOrders"`
 */
export const useReadStadiumShopBuyerOrders =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'buyerOrders',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"getOrdersByBuyer"`
 */
export const useReadStadiumShopGetOrdersByBuyer =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'getOrdersByBuyer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"getOrdersByTicket"`
 */
export const useReadStadiumShopGetOrdersByTicket =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'getOrdersByTicket',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadStadiumShopGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"getShopProducts"`
 */
export const useReadStadiumShopGetShopProducts =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'getShopProducts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"getShopVenues"`
 */
export const useReadStadiumShopGetShopVenues =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'getShopVenues',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadStadiumShopHasRole = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"isBanned"`
 */
export const useReadStadiumShopIsBanned = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'isBanned',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"orders"`
 */
export const useReadStadiumShopOrders = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'orders',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"ownerShopId"`
 */
export const useReadStadiumShopOwnerShopId =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'ownerShopId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"paused"`
 */
export const useReadStadiumShopPaused = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"products"`
 */
export const useReadStadiumShopProducts = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'products',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"shopProductIds"`
 */
export const useReadStadiumShopShopProductIds =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'shopProductIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"shopVenueIds"`
 */
export const useReadStadiumShopShopVenueIds =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'shopVenueIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"shopVenues"`
 */
export const useReadStadiumShopShopVenues = /*#__PURE__*/ createUseReadContract(
  { abi: stadiumShopAbi, functionName: 'shopVenues' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"shops"`
 */
export const useReadStadiumShopShops = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'shops',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadStadiumShopSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"ticketNFT"`
 */
export const useReadStadiumShopTicketNft = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'ticketNFT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"ticketOrders"`
 */
export const useReadStadiumShopTicketOrders =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'ticketOrders',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"userProfile"`
 */
export const useReadStadiumShopUserProfile =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'userProfile',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"vault"`
 */
export const useReadStadiumShopVault = /*#__PURE__*/ createUseReadContract({
  abi: stadiumShopAbi,
  functionName: 'vault',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"maxOrdersPerTicket"`
 */
export const useReadStadiumShopMaxOrdersPerTicket =
  /*#__PURE__*/ createUseReadContract({
    abi: stadiumShopAbi,
    functionName: 'maxOrdersPerTicket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__
 */
export const useWriteStadiumShop = /*#__PURE__*/ createUseWriteContract({
  abi: stadiumShopAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"addProduct"`
 */
export const useWriteStadiumShopAddProduct =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'addProduct',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"addVenueToShop"`
 */
export const useWriteStadiumShopAddVenueToShop =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'addVenueToShop',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"adminToggleShop"`
 */
export const useWriteStadiumShopAdminToggleShop =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'adminToggleShop',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"approveShop"`
 */
export const useWriteStadiumShopApproveShop =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'approveShop',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"cancelOrder"`
 */
export const useWriteStadiumShopCancelOrder =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'cancelOrder',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"confirmCollection"`
 */
export const useWriteStadiumShopConfirmCollection =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'confirmCollection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"confirmOrders"`
 */
export const useWriteStadiumShopConfirmOrders =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'confirmOrders',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteStadiumShopGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteStadiumShopPause = /*#__PURE__*/ createUseWriteContract({
  abi: stadiumShopAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"purchaseCart"`
 */
export const useWriteStadiumShopPurchaseCart =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'purchaseCart',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"purchaseSingleItem"`
 */
export const useWriteStadiumShopPurchaseSingleItem =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'purchaseSingleItem',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"refundLinkedItems"`
 */
export const useWriteStadiumShopRefundLinkedItems =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'refundLinkedItems',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"registerShop"`
 */
export const useWriteStadiumShopRegisterShop =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'registerShop',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"rejectShop"`
 */
export const useWriteStadiumShopRejectShop =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'rejectShop',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"removeVenueFromShop"`
 */
export const useWriteStadiumShopRemoveVenueFromShop =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'removeVenueFromShop',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteStadiumShopRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteStadiumShopRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"toggleProductActive"`
 */
export const useWriteStadiumShopToggleProductActive =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'toggleProductActive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"toggleShopActive"`
 */
export const useWriteStadiumShopToggleShopActive =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'toggleShopActive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteStadiumShopUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: stadiumShopAbi,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"updateInventory"`
 */
export const useWriteStadiumShopUpdateInventory =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'updateInventory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"updateProduct"`
 */
export const useWriteStadiumShopUpdateProduct =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'updateProduct',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"updateVenueLocation"`
 */
export const useWriteStadiumShopUpdateVenueLocation =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'updateVenueLocation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"vendorCancelOrder"`
 */
export const useWriteStadiumShopVendorCancelOrder =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'vendorCancelOrder',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"setMaxOrdersPerTicket"`
 */
export const useWriteStadiumShopSetMaxOrdersPerTicket =
  /*#__PURE__*/ createUseWriteContract({
    abi: stadiumShopAbi,
    functionName: 'setMaxOrdersPerTicket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__
 */
export const useSimulateStadiumShop = /*#__PURE__*/ createUseSimulateContract({
  abi: stadiumShopAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"addProduct"`
 */
export const useSimulateStadiumShopAddProduct =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'addProduct',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"addVenueToShop"`
 */
export const useSimulateStadiumShopAddVenueToShop =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'addVenueToShop',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"adminToggleShop"`
 */
export const useSimulateStadiumShopAdminToggleShop =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'adminToggleShop',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"approveShop"`
 */
export const useSimulateStadiumShopApproveShop =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'approveShop',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"cancelOrder"`
 */
export const useSimulateStadiumShopCancelOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'cancelOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"confirmCollection"`
 */
export const useSimulateStadiumShopConfirmCollection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'confirmCollection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"confirmOrders"`
 */
export const useSimulateStadiumShopConfirmOrders =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'confirmOrders',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateStadiumShopGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateStadiumShopPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"purchaseCart"`
 */
export const useSimulateStadiumShopPurchaseCart =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'purchaseCart',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"purchaseSingleItem"`
 */
export const useSimulateStadiumShopPurchaseSingleItem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'purchaseSingleItem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"refundLinkedItems"`
 */
export const useSimulateStadiumShopRefundLinkedItems =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'refundLinkedItems',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"registerShop"`
 */
export const useSimulateStadiumShopRegisterShop =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'registerShop',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"rejectShop"`
 */
export const useSimulateStadiumShopRejectShop =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'rejectShop',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"removeVenueFromShop"`
 */
export const useSimulateStadiumShopRemoveVenueFromShop =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'removeVenueFromShop',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateStadiumShopRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateStadiumShopRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"toggleProductActive"`
 */
export const useSimulateStadiumShopToggleProductActive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'toggleProductActive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"toggleShopActive"`
 */
export const useSimulateStadiumShopToggleShopActive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'toggleShopActive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateStadiumShopUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"updateInventory"`
 */
export const useSimulateStadiumShopUpdateInventory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'updateInventory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"updateProduct"`
 */
export const useSimulateStadiumShopUpdateProduct =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'updateProduct',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"updateVenueLocation"`
 */
export const useSimulateStadiumShopUpdateVenueLocation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'updateVenueLocation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"vendorCancelOrder"`
 */
export const useSimulateStadiumShopVendorCancelOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'vendorCancelOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link stadiumShopAbi}__ and `functionName` set to `"setMaxOrdersPerTicket"`
 */
export const useSimulateStadiumShopSetMaxOrdersPerTicket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: stadiumShopAbi,
    functionName: 'setMaxOrdersPerTicket',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__
 */
export const useWatchStadiumShopEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: stadiumShopAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"CartCheckout"`
 */
export const useWatchStadiumShopCartCheckoutEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'CartCheckout',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"EmergencyPaused"`
 */
export const useWatchStadiumShopEmergencyPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'EmergencyPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"EmergencyUnpaused"`
 */
export const useWatchStadiumShopEmergencyUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'EmergencyUnpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"InventoryUpdated"`
 */
export const useWatchStadiumShopInventoryUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'InventoryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ItemPurchased"`
 */
export const useWatchStadiumShopItemPurchasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ItemPurchased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"OrderCancelled"`
 */
export const useWatchStadiumShopOrderCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'OrderCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"OrderCancelledByVendor"`
 */
export const useWatchStadiumShopOrderCancelledByVendorEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'OrderCancelledByVendor',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"OrderCollected"`
 */
export const useWatchStadiumShopOrderCollectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'OrderCollected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"OrderConfirmed"`
 */
export const useWatchStadiumShopOrderConfirmedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'OrderConfirmed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"OrderRefunded"`
 */
export const useWatchStadiumShopOrderRefundedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'OrderRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchStadiumShopPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ProductActiveToggled"`
 */
export const useWatchStadiumShopProductActiveToggledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ProductActiveToggled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ProductAdded"`
 */
export const useWatchStadiumShopProductAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ProductAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ProductUpdated"`
 */
export const useWatchStadiumShopProductUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ProductUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchStadiumShopRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchStadiumShopRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchStadiumShopRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ShopActiveToggled"`
 */
export const useWatchStadiumShopShopActiveToggledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ShopActiveToggled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ShopApproved"`
 */
export const useWatchStadiumShopShopApprovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ShopApproved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ShopPaused"`
 */
export const useWatchStadiumShopShopPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ShopPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ShopRegistered"`
 */
export const useWatchStadiumShopShopRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ShopRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ShopRejected"`
 */
export const useWatchStadiumShopShopRejectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ShopRejected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"ShopVenueRemoved"`
 */
export const useWatchStadiumShopShopVenueRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'ShopVenueRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchStadiumShopUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"VenueAddedToShop"`
 */
export const useWatchStadiumShopVenueAddedToShopEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'VenueAddedToShop',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link stadiumShopAbi}__ and `eventName` set to `"VenueLocationUpdated"`
 */
export const useWatchStadiumShopVenueLocationUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: stadiumShopAbi,
    eventName: 'VenueLocationUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__
 */
export const useReadTicketNft = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useReadTicketNftAdminRole = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"ANTI_SNIPE_EXTENSION"`
 */
export const useReadTicketNftAntiSnipeExtension =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'ANTI_SNIPE_EXTENSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"ANTI_SNIPE_WINDOW"`
 */
export const useReadTicketNftAntiSnipeWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'ANTI_SNIPE_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadTicketNftBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadTicketNftDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"EVENT_MANAGER_ROLE"`
 */
export const useReadTicketNftEventManagerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'EVENT_MANAGER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"MAX_BULK_PURCHASE"`
 */
export const useReadTicketNftMaxBulkPurchase =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'MAX_BULK_PURCHASE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"QR_EXPIRY"`
 */
export const useReadTicketNftQrExpiry = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'QR_EXPIRY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"QR_VERIFIER_ROLE"`
 */
export const useReadTicketNftQrVerifierRole =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'QR_VERIFIER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"REFUND_BPS"`
 */
export const useReadTicketNftRefundBps = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'REFUND_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"REFUND_WINDOW"`
 */
export const useReadTicketNftRefundWindow = /*#__PURE__*/ createUseReadContract(
  { abi: ticketNftAbi, functionName: 'REFUND_WINDOW' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"SEAT_HOLD_DURATION"`
 */
export const useReadTicketNftSeatHoldDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'SEAT_HOLD_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"SHOP_FEE_DEFAULT_BPS"`
 */
export const useReadTicketNftShopFeeDefaultBps =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'SHOP_FEE_DEFAULT_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"WALK_IN_MANAGER_ROLE"`
 */
export const useReadTicketNftWalkInManagerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'WALK_IN_MANAGER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadTicketNftBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"cancellationCursor"`
 */
export const useReadTicketNftCancellationCursor =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'cancellationCursor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"delegates"`
 */
export const useReadTicketNftDelegates = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'delegates',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"enclosureRefundCursor"`
 */
export const useReadTicketNftEnclosureRefundCursor =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'enclosureRefundCursor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"enclosureRefundInitiated"`
 */
export const useReadTicketNftEnclosureRefundInitiated =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'enclosureRefundInitiated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"eventPricing"`
 */
export const useReadTicketNftEventPricing = /*#__PURE__*/ createUseReadContract(
  { abi: ticketNftAbi, functionName: 'eventPricing' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadTicketNftGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getDelegate"`
 */
export const useReadTicketNftGetDelegate = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'getDelegate',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getEvent"`
 */
export const useReadTicketNftGetEvent = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'getEvent',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getEventManager"`
 */
export const useReadTicketNftGetEventManager =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'getEventManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getEventStartTime"`
 */
export const useReadTicketNftGetEventStartTime =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'getEventStartTime',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getEventVenueId"`
 */
export const useReadTicketNftGetEventVenueId =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'getEventVenueId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadTicketNftGetRoleAdmin = /*#__PURE__*/ createUseReadContract(
  { abi: ticketNftAbi, functionName: 'getRoleAdmin' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getTicketData"`
 */
export const useReadTicketNftGetTicketData =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'getTicketData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"getTicketEventId"`
 */
export const useReadTicketNftGetTicketEventId =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'getTicketEventId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadTicketNftHasRole = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadTicketNftIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"isEntered"`
 */
export const useReadTicketNftIsEntered = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'isEntered',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"isTicketValid"`
 */
export const useReadTicketNftIsTicketValid =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'isTicketValid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"minimumTicketPrice"`
 */
export const useReadTicketNftMinimumTicketPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'minimumTicketPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"name"`
 */
export const useReadTicketNftName = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadTicketNftOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"paused"`
 */
export const useReadTicketNftPaused = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"seatBooked"`
 */
export const useReadTicketNftSeatBooked = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'seatBooked',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"stadiumShopAddress"`
 */
export const useReadTicketNftStadiumShopAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'stadiumShopAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadTicketNftSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadTicketNftSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadTicketNftTokenByIndex = /*#__PURE__*/ createUseReadContract(
  { abi: ticketNftAbi, functionName: 'tokenByIndex' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadTicketNftTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadTicketNftTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadTicketNftTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"vault"`
 */
export const useReadTicketNftVault = /*#__PURE__*/ createUseReadContract({
  abi: ticketNftAbi,
  functionName: 'vault',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"venueRegistry"`
 */
export const useReadTicketNftVenueRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'venueRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"verifyWalkInCode"`
 */
export const useReadTicketNftVerifyWalkInCode =
  /*#__PURE__*/ createUseReadContract({
    abi: ticketNftAbi,
    functionName: 'verifyWalkInCode',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__
 */
export const useWriteTicketNft = /*#__PURE__*/ createUseWriteContract({
  abi: ticketNftAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteTicketNftApprove = /*#__PURE__*/ createUseWriteContract({
  abi: ticketNftAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"cancelEvent"`
 */
export const useWriteTicketNftCancelEvent =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'cancelEvent',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"claimCancellationRefund"`
 */
export const useWriteTicketNftClaimCancellationRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'claimCancellationRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"createEvent"`
 */
export const useWriteTicketNftCreateEvent =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'createEvent',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"forceRefundEnclosure"`
 */
export const useWriteTicketNftForceRefundEnclosure =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'forceRefundEnclosure',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteTicketNftGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: ticketNftAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"markEntered"`
 */
export const useWriteTicketNftMarkEntered =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'markEntered',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteTicketNftPause = /*#__PURE__*/ createUseWriteContract({
  abi: ticketNftAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"postponeEvent"`
 */
export const useWriteTicketNftPostponeEvent =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'postponeEvent',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"processCancellationRefunds"`
 */
export const useWriteTicketNftProcessCancellationRefunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'processCancellationRefunds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"processEnclosureRefunds"`
 */
export const useWriteTicketNftProcessEnclosureRefunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'processEnclosureRefunds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"purchaseMultipleTickets"`
 */
export const useWriteTicketNftPurchaseMultipleTickets =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'purchaseMultipleTickets',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"purchaseTicket"`
 */
export const useWriteTicketNftPurchaseTicket =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'purchaseTicket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"purchaseWalkInTicket"`
 */
export const useWriteTicketNftPurchaseWalkInTicket =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'purchaseWalkInTicket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"removeDelegate"`
 */
export const useWriteTicketNftRemoveDelegate =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'removeDelegate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteTicketNftRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"returnTicket"`
 */
export const useWriteTicketNftReturnTicket =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'returnTicket',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteTicketNftRevokeRole = /*#__PURE__*/ createUseWriteContract(
  { abi: ticketNftAbi, functionName: 'revokeRole' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteTicketNftSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteTicketNftSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setDelegate"`
 */
export const useWriteTicketNftSetDelegate =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'setDelegate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setEventLive"`
 */
export const useWriteTicketNftSetEventLive =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'setEventLive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setEventPricing"`
 */
export const useWriteTicketNftSetEventPricing =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'setEventPricing',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setMinimumTicketPrice"`
 */
export const useWriteTicketNftSetMinimumTicketPrice =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'setMinimumTicketPrice',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setStadiumShopAddress"`
 */
export const useWriteTicketNftSetStadiumShopAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'setStadiumShopAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteTicketNftTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteTicketNftUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: ticketNftAbi,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"updateEvent"`
 */
export const useWriteTicketNftUpdateEvent =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'updateEvent',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"updateEventStatus"`
 */
export const useWriteTicketNftUpdateEventStatus =
  /*#__PURE__*/ createUseWriteContract({
    abi: ticketNftAbi,
    functionName: 'updateEventStatus',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__
 */
export const useSimulateTicketNft = /*#__PURE__*/ createUseSimulateContract({
  abi: ticketNftAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateTicketNftApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"cancelEvent"`
 */
export const useSimulateTicketNftCancelEvent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'cancelEvent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"claimCancellationRefund"`
 */
export const useSimulateTicketNftClaimCancellationRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'claimCancellationRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"createEvent"`
 */
export const useSimulateTicketNftCreateEvent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'createEvent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"forceRefundEnclosure"`
 */
export const useSimulateTicketNftForceRefundEnclosure =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'forceRefundEnclosure',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateTicketNftGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"markEntered"`
 */
export const useSimulateTicketNftMarkEntered =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'markEntered',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateTicketNftPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"postponeEvent"`
 */
export const useSimulateTicketNftPostponeEvent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'postponeEvent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"processCancellationRefunds"`
 */
export const useSimulateTicketNftProcessCancellationRefunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'processCancellationRefunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"processEnclosureRefunds"`
 */
export const useSimulateTicketNftProcessEnclosureRefunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'processEnclosureRefunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"purchaseMultipleTickets"`
 */
export const useSimulateTicketNftPurchaseMultipleTickets =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'purchaseMultipleTickets',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"purchaseTicket"`
 */
export const useSimulateTicketNftPurchaseTicket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'purchaseTicket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"purchaseWalkInTicket"`
 */
export const useSimulateTicketNftPurchaseWalkInTicket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'purchaseWalkInTicket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"removeDelegate"`
 */
export const useSimulateTicketNftRemoveDelegate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'removeDelegate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateTicketNftRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"returnTicket"`
 */
export const useSimulateTicketNftReturnTicket =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'returnTicket',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateTicketNftRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateTicketNftSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateTicketNftSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setDelegate"`
 */
export const useSimulateTicketNftSetDelegate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'setDelegate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setEventLive"`
 */
export const useSimulateTicketNftSetEventLive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'setEventLive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setEventPricing"`
 */
export const useSimulateTicketNftSetEventPricing =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'setEventPricing',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setMinimumTicketPrice"`
 */
export const useSimulateTicketNftSetMinimumTicketPrice =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'setMinimumTicketPrice',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"setStadiumShopAddress"`
 */
export const useSimulateTicketNftSetStadiumShopAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'setStadiumShopAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateTicketNftTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateTicketNftUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"updateEvent"`
 */
export const useSimulateTicketNftUpdateEvent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'updateEvent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ticketNftAbi}__ and `functionName` set to `"updateEventStatus"`
 */
export const useSimulateTicketNftUpdateEventStatus =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ticketNftAbi,
    functionName: 'updateEventStatus',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__
 */
export const useWatchTicketNftEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: ticketNftAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchTicketNftApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchTicketNftApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"CancellationBatchProcessed"`
 */
export const useWatchTicketNftCancellationBatchProcessedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'CancellationBatchProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"CancellationRefundClaimed"`
 */
export const useWatchTicketNftCancellationRefundClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'CancellationRefundClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"DelegateRemoved"`
 */
export const useWatchTicketNftDelegateRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'DelegateRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"DelegateSet"`
 */
export const useWatchTicketNftDelegateSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'DelegateSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EmergencyPaused"`
 */
export const useWatchTicketNftEmergencyPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EmergencyPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EmergencyUnpaused"`
 */
export const useWatchTicketNftEmergencyUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EmergencyUnpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EnclosureForceRefunded"`
 */
export const useWatchTicketNftEnclosureForceRefundedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EnclosureForceRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EntryMarked"`
 */
export const useWatchTicketNftEntryMarkedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EntryMarked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventCancelled"`
 */
export const useWatchTicketNftEventCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventCreated"`
 */
export const useWatchTicketNftEventCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventLive"`
 */
export const useWatchTicketNftEventLiveEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventLive',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventPostponed"`
 */
export const useWatchTicketNftEventPostponedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventPostponed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventPricingSet"`
 */
export const useWatchTicketNftEventPricingSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventPricingSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventStatusChanged"`
 */
export const useWatchTicketNftEventStatusChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventStatusChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"EventUpdated"`
 */
export const useWatchTicketNftEventUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'EventUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"MinimumTicketPriceUpdated"`
 */
export const useWatchTicketNftMinimumTicketPriceUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'MinimumTicketPriceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchTicketNftPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchTicketNftRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchTicketNftRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchTicketNftRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"TicketPurchased"`
 */
export const useWatchTicketNftTicketPurchasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'TicketPurchased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"TicketReturned"`
 */
export const useWatchTicketNftTicketReturnedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'TicketReturned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchTicketNftTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchTicketNftUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ticketNftAbi}__ and `eventName` set to `"WalkInTicketMinted"`
 */
export const useWatchTicketNftWalkInTicketMintedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ticketNftAbi,
    eventName: 'WalkInTicketMinted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__
 */
export const useReadUserProfile = /*#__PURE__*/ createUseReadContract({
  abi: userProfileAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"ANTI_SNIPE_EXTENSION"`
 */
export const useReadUserProfileAntiSnipeExtension =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'ANTI_SNIPE_EXTENSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"ANTI_SNIPE_WINDOW"`
 */
export const useReadUserProfileAntiSnipeWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'ANTI_SNIPE_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadUserProfileBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"MAX_BULK_PURCHASE"`
 */
export const useReadUserProfileMaxBulkPurchase =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'MAX_BULK_PURCHASE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"QR_EXPIRY"`
 */
export const useReadUserProfileQrExpiry = /*#__PURE__*/ createUseReadContract({
  abi: userProfileAbi,
  functionName: 'QR_EXPIRY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"REFUND_BPS"`
 */
export const useReadUserProfileRefundBps = /*#__PURE__*/ createUseReadContract({
  abi: userProfileAbi,
  functionName: 'REFUND_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"REFUND_WINDOW"`
 */
export const useReadUserProfileRefundWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'REFUND_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"SEAT_HOLD_DURATION"`
 */
export const useReadUserProfileSeatHoldDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'SEAT_HOLD_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"SHOP_FEE_DEFAULT_BPS"`
 */
export const useReadUserProfileShopFeeDefaultBps =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'SHOP_FEE_DEFAULT_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"hasCompleteProfile"`
 */
export const useReadUserProfileHasCompleteProfile =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'hasCompleteProfile',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"profileHashes"`
 */
export const useReadUserProfileProfileHashes =
  /*#__PURE__*/ createUseReadContract({
    abi: userProfileAbi,
    functionName: 'profileHashes',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userProfileAbi}__
 */
export const useWriteUserProfile = /*#__PURE__*/ createUseWriteContract({
  abi: userProfileAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"removeProfileHash"`
 */
export const useWriteUserProfileRemoveProfileHash =
  /*#__PURE__*/ createUseWriteContract({
    abi: userProfileAbi,
    functionName: 'removeProfileHash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"setProfileHash"`
 */
export const useWriteUserProfileSetProfileHash =
  /*#__PURE__*/ createUseWriteContract({
    abi: userProfileAbi,
    functionName: 'setProfileHash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userProfileAbi}__
 */
export const useSimulateUserProfile = /*#__PURE__*/ createUseSimulateContract({
  abi: userProfileAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"removeProfileHash"`
 */
export const useSimulateUserProfileRemoveProfileHash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userProfileAbi,
    functionName: 'removeProfileHash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userProfileAbi}__ and `functionName` set to `"setProfileHash"`
 */
export const useSimulateUserProfileSetProfileHash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userProfileAbi,
    functionName: 'setProfileHash',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userProfileAbi}__
 */
export const useWatchUserProfileEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: userProfileAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userProfileAbi}__ and `eventName` set to `"EmergencyPaused"`
 */
export const useWatchUserProfileEmergencyPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userProfileAbi,
    eventName: 'EmergencyPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userProfileAbi}__ and `eventName` set to `"EmergencyUnpaused"`
 */
export const useWatchUserProfileEmergencyUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userProfileAbi,
    eventName: 'EmergencyUnpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userProfileAbi}__ and `eventName` set to `"ProfileHashRemoved"`
 */
export const useWatchUserProfileProfileHashRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userProfileAbi,
    eventName: 'ProfileHashRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userProfileAbi}__ and `eventName` set to `"ProfileHashSet"`
 */
export const useWatchUserProfileProfileHashSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userProfileAbi,
    eventName: 'ProfileHashSet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__
 */
export const useReadVenueRegistry = /*#__PURE__*/ createUseReadContract({
  abi: venueRegistryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useReadVenueRegistryAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"ANTI_SNIPE_EXTENSION"`
 */
export const useReadVenueRegistryAntiSnipeExtension =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'ANTI_SNIPE_EXTENSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"ANTI_SNIPE_WINDOW"`
 */
export const useReadVenueRegistryAntiSnipeWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'ANTI_SNIPE_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadVenueRegistryBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadVenueRegistryDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"MAX_BULK_PURCHASE"`
 */
export const useReadVenueRegistryMaxBulkPurchase =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'MAX_BULK_PURCHASE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"QR_EXPIRY"`
 */
export const useReadVenueRegistryQrExpiry = /*#__PURE__*/ createUseReadContract(
  { abi: venueRegistryAbi, functionName: 'QR_EXPIRY' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"REFUND_BPS"`
 */
export const useReadVenueRegistryRefundBps =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'REFUND_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"REFUND_WINDOW"`
 */
export const useReadVenueRegistryRefundWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'REFUND_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"SEAT_HOLD_DURATION"`
 */
export const useReadVenueRegistrySeatHoldDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'SEAT_HOLD_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"SHOP_FEE_DEFAULT_BPS"`
 */
export const useReadVenueRegistryShopFeeDefaultBps =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'SHOP_FEE_DEFAULT_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"getEnclosure"`
 */
export const useReadVenueRegistryGetEnclosure =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'getEnclosure',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"getEnclosures"`
 */
export const useReadVenueRegistryGetEnclosures =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'getEnclosures',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadVenueRegistryGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"getRowSeatCount"`
 */
export const useReadVenueRegistryGetRowSeatCount =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'getRowSeatCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"getRows"`
 */
export const useReadVenueRegistryGetRows = /*#__PURE__*/ createUseReadContract({
  abi: venueRegistryAbi,
  functionName: 'getRows',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"getVenue"`
 */
export const useReadVenueRegistryGetVenue = /*#__PURE__*/ createUseReadContract(
  { abi: venueRegistryAbi, functionName: 'getVenue' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadVenueRegistryHasRole = /*#__PURE__*/ createUseReadContract({
  abi: venueRegistryAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"isEnclosureActive"`
 */
export const useReadVenueRegistryIsEnclosureActive =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'isEnclosureActive',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"isVenueActive"`
 */
export const useReadVenueRegistryIsVenueActive =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'isVenueActive',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadVenueRegistrySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: venueRegistryAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__
 */
export const useWriteVenueRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: venueRegistryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"activateVenue"`
 */
export const useWriteVenueRegistryActivateVenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'activateVenue',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"addEnclosure"`
 */
export const useWriteVenueRegistryAddEnclosure =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'addEnclosure',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"addRows"`
 */
export const useWriteVenueRegistryAddRows =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'addRows',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"createVenue"`
 */
export const useWriteVenueRegistryCreateVenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'createVenue',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"deactivateVenue"`
 */
export const useWriteVenueRegistryDeactivateVenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'deactivateVenue',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteVenueRegistryGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteVenueRegistryRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteVenueRegistryRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"toggleEnclosureActive"`
 */
export const useWriteVenueRegistryToggleEnclosureActive =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'toggleEnclosureActive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"updateEnclosure"`
 */
export const useWriteVenueRegistryUpdateEnclosure =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'updateEnclosure',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"updateRow"`
 */
export const useWriteVenueRegistryUpdateRow =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'updateRow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"updateVenue"`
 */
export const useWriteVenueRegistryUpdateVenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: venueRegistryAbi,
    functionName: 'updateVenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__
 */
export const useSimulateVenueRegistry = /*#__PURE__*/ createUseSimulateContract(
  { abi: venueRegistryAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"activateVenue"`
 */
export const useSimulateVenueRegistryActivateVenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'activateVenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"addEnclosure"`
 */
export const useSimulateVenueRegistryAddEnclosure =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'addEnclosure',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"addRows"`
 */
export const useSimulateVenueRegistryAddRows =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'addRows',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"createVenue"`
 */
export const useSimulateVenueRegistryCreateVenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'createVenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"deactivateVenue"`
 */
export const useSimulateVenueRegistryDeactivateVenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'deactivateVenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateVenueRegistryGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateVenueRegistryRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateVenueRegistryRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"toggleEnclosureActive"`
 */
export const useSimulateVenueRegistryToggleEnclosureActive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'toggleEnclosureActive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"updateEnclosure"`
 */
export const useSimulateVenueRegistryUpdateEnclosure =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'updateEnclosure',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"updateRow"`
 */
export const useSimulateVenueRegistryUpdateRow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'updateRow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link venueRegistryAbi}__ and `functionName` set to `"updateVenue"`
 */
export const useSimulateVenueRegistryUpdateVenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: venueRegistryAbi,
    functionName: 'updateVenue',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__
 */
export const useWatchVenueRegistryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: venueRegistryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"EmergencyPaused"`
 */
export const useWatchVenueRegistryEmergencyPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'EmergencyPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"EmergencyUnpaused"`
 */
export const useWatchVenueRegistryEmergencyUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'EmergencyUnpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"EnclosureAdded"`
 */
export const useWatchVenueRegistryEnclosureAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'EnclosureAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"EnclosureStatusChanged"`
 */
export const useWatchVenueRegistryEnclosureStatusChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'EnclosureStatusChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"EnclosureUpdated"`
 */
export const useWatchVenueRegistryEnclosureUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'EnclosureUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchVenueRegistryRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchVenueRegistryRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchVenueRegistryRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"RowUpdated"`
 */
export const useWatchVenueRegistryRowUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'RowUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"RowsAdded"`
 */
export const useWatchVenueRegistryRowsAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'RowsAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"VenueActivated"`
 */
export const useWatchVenueRegistryVenueActivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'VenueActivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"VenueCreated"`
 */
export const useWatchVenueRegistryVenueCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'VenueCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"VenueDeactivated"`
 */
export const useWatchVenueRegistryVenueDeactivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'VenueDeactivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link venueRegistryAbi}__ and `eventName` set to `"VenueUpdated"`
 */
export const useWatchVenueRegistryVenueUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: venueRegistryAbi,
    eventName: 'VenueUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__
 */
export const useReadWicketChainVault = /*#__PURE__*/ createUseReadContract({
  abi: wicketChainVaultAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useReadWicketChainVaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"ANTI_SNIPE_EXTENSION"`
 */
export const useReadWicketChainVaultAntiSnipeExtension =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'ANTI_SNIPE_EXTENSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"ANTI_SNIPE_WINDOW"`
 */
export const useReadWicketChainVaultAntiSnipeWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'ANTI_SNIPE_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"AUTHORIZED_CONTRACT_ROLE"`
 */
export const useReadWicketChainVaultAuthorizedContractRole =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'AUTHORIZED_CONTRACT_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadWicketChainVaultBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadWicketChainVaultDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"MAX_BULK_PURCHASE"`
 */
export const useReadWicketChainVaultMaxBulkPurchase =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'MAX_BULK_PURCHASE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"QR_EXPIRY"`
 */
export const useReadWicketChainVaultQrExpiry =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'QR_EXPIRY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"REFUND_BPS"`
 */
export const useReadWicketChainVaultRefundBps =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'REFUND_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"REFUND_WINDOW"`
 */
export const useReadWicketChainVaultRefundWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'REFUND_WINDOW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"SEAT_HOLD_DURATION"`
 */
export const useReadWicketChainVaultSeatHoldDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'SEAT_HOLD_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"SHOP_FEE_DEFAULT_BPS"`
 */
export const useReadWicketChainVaultShopFeeDefaultBps =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'SHOP_FEE_DEFAULT_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"claimableRefunds"`
 */
export const useReadWicketChainVaultClaimableRefunds =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'claimableRefunds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"eventBalances"`
 */
export const useReadWicketChainVaultEventBalances =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'eventBalances',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"getClaimableRefund"`
 */
export const useReadWicketChainVaultGetClaimableRefund =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'getClaimableRefund',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"getEventBalance"`
 */
export const useReadWicketChainVaultGetEventBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'getEventBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadWicketChainVaultGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"getShopBalance"`
 */
export const useReadWicketChainVaultGetShopBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'getShopBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadWicketChainVaultHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadWicketChainVaultPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"platformTreasury"`
 */
export const useReadWicketChainVaultPlatformTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'platformTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"shopBalances"`
 */
export const useReadWicketChainVaultShopBalances =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'shopBalances',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"shopFeeBps"`
 */
export const useReadWicketChainVaultShopFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'shopFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"shopOwners"`
 */
export const useReadWicketChainVaultShopOwners =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'shopOwners',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadWicketChainVaultSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: wicketChainVaultAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__
 */
export const useWriteWicketChainVault = /*#__PURE__*/ createUseWriteContract({
  abi: wicketChainVaultAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"authorizeContract"`
 */
export const useWriteWicketChainVaultAuthorizeContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'authorizeContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"claimRefunds"`
 */
export const useWriteWicketChainVaultClaimRefunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'claimRefunds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"confirmShopEarnings"`
 */
export const useWriteWicketChainVaultConfirmShopEarnings =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'confirmShopEarnings',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"creditRefund"`
 */
export const useWriteWicketChainVaultCreditRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'creditRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"creditShopRefund"`
 */
export const useWriteWicketChainVaultCreditShopRefund =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'creditShopRefund',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"deauthorizeContract"`
 */
export const useWriteWicketChainVaultDeauthorizeContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'deauthorizeContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteWicketChainVaultDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteWicketChainVaultGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteWicketChainVaultPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"recordShopEarning"`
 */
export const useWriteWicketChainVaultRecordShopEarning =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'recordShopEarning',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteWicketChainVaultRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteWicketChainVaultRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"setPlatformTreasury"`
 */
export const useWriteWicketChainVaultSetPlatformTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'setPlatformTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"setShopFeeBps"`
 */
export const useWriteWicketChainVaultSetShopFeeBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'setShopFeeBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"settleEvent"`
 */
export const useWriteWicketChainVaultSettleEvent =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'settleEvent',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteWicketChainVaultUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"withdrawShopEarnings"`
 */
export const useWriteWicketChainVaultWithdrawShopEarnings =
  /*#__PURE__*/ createUseWriteContract({
    abi: wicketChainVaultAbi,
    functionName: 'withdrawShopEarnings',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__
 */
export const useSimulateWicketChainVault =
  /*#__PURE__*/ createUseSimulateContract({ abi: wicketChainVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"authorizeContract"`
 */
export const useSimulateWicketChainVaultAuthorizeContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'authorizeContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"claimRefunds"`
 */
export const useSimulateWicketChainVaultClaimRefunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'claimRefunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"confirmShopEarnings"`
 */
export const useSimulateWicketChainVaultConfirmShopEarnings =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'confirmShopEarnings',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"creditRefund"`
 */
export const useSimulateWicketChainVaultCreditRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'creditRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"creditShopRefund"`
 */
export const useSimulateWicketChainVaultCreditShopRefund =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'creditShopRefund',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"deauthorizeContract"`
 */
export const useSimulateWicketChainVaultDeauthorizeContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'deauthorizeContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateWicketChainVaultDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateWicketChainVaultGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateWicketChainVaultPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"recordShopEarning"`
 */
export const useSimulateWicketChainVaultRecordShopEarning =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'recordShopEarning',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateWicketChainVaultRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateWicketChainVaultRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"setPlatformTreasury"`
 */
export const useSimulateWicketChainVaultSetPlatformTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'setPlatformTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"setShopFeeBps"`
 */
export const useSimulateWicketChainVaultSetShopFeeBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'setShopFeeBps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"settleEvent"`
 */
export const useSimulateWicketChainVaultSettleEvent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'settleEvent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateWicketChainVaultUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `functionName` set to `"withdrawShopEarnings"`
 */
export const useSimulateWicketChainVaultWithdrawShopEarnings =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wicketChainVaultAbi,
    functionName: 'withdrawShopEarnings',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__
 */
export const useWatchWicketChainVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: wicketChainVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchWicketChainVaultDepositedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'Deposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"EmergencyPaused"`
 */
export const useWatchWicketChainVaultEmergencyPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'EmergencyPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"EmergencyUnpaused"`
 */
export const useWatchWicketChainVaultEmergencyUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'EmergencyUnpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"EventSettled"`
 */
export const useWatchWicketChainVaultEventSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'EventSettled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchWicketChainVaultPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"PlatformTreasuryUpdated"`
 */
export const useWatchWicketChainVaultPlatformTreasuryUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'PlatformTreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"RefundClaimed"`
 */
export const useWatchWicketChainVaultRefundClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'RefundClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"RefundCredited"`
 */
export const useWatchWicketChainVaultRefundCreditedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'RefundCredited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchWicketChainVaultRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchWicketChainVaultRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchWicketChainVaultRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"ShopEarningRecorded"`
 */
export const useWatchWicketChainVaultShopEarningRecordedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'ShopEarningRecorded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"ShopEarningsConfirmed"`
 */
export const useWatchWicketChainVaultShopEarningsConfirmedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'ShopEarningsConfirmed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"ShopFeeUpdated"`
 */
export const useWatchWicketChainVaultShopFeeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'ShopFeeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"ShopOwnerRegistered"`
 */
export const useWatchWicketChainVaultShopOwnerRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'ShopOwnerRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"ShopRefundCredited"`
 */
export const useWatchWicketChainVaultShopRefundCreditedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'ShopRefundCredited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"ShopWithdrawal"`
 */
export const useWatchWicketChainVaultShopWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'ShopWithdrawal',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wicketChainVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchWicketChainVaultUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wicketChainVaultAbi,
    eventName: 'Unpaused',
  })
