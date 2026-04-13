// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

/// @title IUserProfile — Interface for user profile verification
interface IUserProfile {
    function hasCompleteProfile(address user) external view returns (bool);
}
