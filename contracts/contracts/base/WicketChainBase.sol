// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title WicketChain Base Contract
/// @notice Shared constants, modifiers, and events inherited by all WicketChain contracts
/// @dev All contracts inherit this for code reuse and single source of truth
abstract contract WicketChainBase {
    // ── Constants (stored in bytecode, zero gas to read) ──
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant REFUND_BPS = 8000; // 80% refund

    uint256 public constant REFUND_WINDOW = 3 hours;
    uint256 public constant SEAT_HOLD_DURATION = 10 minutes;
    uint256 public constant QR_EXPIRY = 30 seconds;
    uint256 public constant MAX_BULK_PURCHASE = 10;
    uint256 public constant SHOP_FEE_DEFAULT_BPS = 500; // 5%
    uint256 public constant ANTI_SNIPE_WINDOW = 5 minutes;
    uint256 public constant ANTI_SNIPE_EXTENSION = 5 minutes;

    // ── Shared Events ──
    event EmergencyPaused(address indexed by, string reason);
    event EmergencyUnpaused(address indexed by);
}
