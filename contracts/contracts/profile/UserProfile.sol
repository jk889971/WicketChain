// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import "../base/WicketChainBase.sol";
import "../errors/WicketChainErrors.sol";
import "../interfaces/IUserProfile.sol";

/// @title UserProfile — On-chain profile hash verification for WicketChain
/// @author WicketChain Team
/// @notice Stores keccak256 hash of user profile data on-chain. Rich data lives in Supabase with RLS.
/// @dev Minimal on-chain footprint. Only the hash is stored. Zero PII on-chain.
contract UserProfile is WicketChainBase, IUserProfile {
    /// @notice Mapping of wallet address to profile hash
    mapping(address => bytes32) public profileHashes;

    // ── Events ──
    event ProfileHashSet(address indexed user, bytes32 profileHash);
    event ProfileHashRemoved(address indexed user);

    /// @notice Sets or updates the profile hash for the caller
    /// @dev The hash should be keccak256(abi.encodePacked(name, email, phone, address))
    /// @param hash The keccak256 hash of the user's profile data
    function setProfileHash(bytes32 hash) external {
        profileHashes[msg.sender] = hash;
        emit ProfileHashSet(msg.sender, hash);
    }

    /// @notice Removes the profile hash for the caller
    function removeProfileHash() external {
        delete profileHashes[msg.sender];
        emit ProfileHashRemoved(msg.sender);
    }

    /// @notice Checks if a user has a complete profile
    /// @param user The address to check
    /// @return True if the user has set a profile hash
    function hasCompleteProfile(address user) external view override returns (bool) {
        return profileHashes[user] != bytes32(0);
    }
}
