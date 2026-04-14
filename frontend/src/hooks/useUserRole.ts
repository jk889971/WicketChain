"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { TicketNFTABI } from "@/config/abis";
import { keccak256, toHex } from "viem";

// Role hashes matching the smart contract
// ADMIN_ROLE = DEFAULT_ADMIN_ROLE = bytes32(0) — checked via isDefaultAdmin
const EVENT_MANAGER_ROLE = keccak256(toHex("EVENT_MANAGER_ROLE"));
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

export function useUserRole() {
  const { address, isConnected } = useAccount();

  const { data: isDefaultAdmin } = useReadContract({
    address: CONTRACTS.ticketNFT,
    abi: TicketNFTABI,
    functionName: "hasRole",
    args: [DEFAULT_ADMIN_ROLE, address!],
    query: { enabled: isConnected && !!address },
  });

  const { data: isEventManager } = useReadContract({
    address: CONTRACTS.ticketNFT,
    abi: TicketNFTABI,
    functionName: "hasRole",
    args: [EVENT_MANAGER_ROLE, address!],
    query: { enabled: isConnected && !!address },
  });

  // Full admin access: DEFAULT_ADMIN_ROLE (bytes32(0)) only
  const hasAdminAccess = !!isDefaultAdmin;
  // Any admin-area access: also includes event managers (for /admin/matches only)
  const hasAnyAdminAccess = !!(isDefaultAdmin || isEventManager);

  return {
    isDefaultAdmin: !!isDefaultAdmin,
    isEventManager: !!isEventManager,
    hasAdminAccess,
    hasAnyAdminAccess,
    isConnected,
    address,
  };
}
