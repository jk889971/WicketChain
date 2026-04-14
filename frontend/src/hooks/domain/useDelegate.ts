"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";

interface UseDelegateOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for managing ticket delegates (entry rights for family/friends).
 * Encapsulates setDelegate + removeDelegate on TicketNFT.
 */
export function useDelegate(options?: UseDelegateOptions) {
  const contract = useContractWrite(options);

  const setDelegate = async (tokenId: bigint, delegate: `0x${string}`) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "setDelegate",
      args: [tokenId, delegate],
    });
  };

  const removeDelegate = async (tokenId: bigint) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "removeDelegate",
      args: [tokenId],
    });
  };

  return {
    setDelegate,
    removeDelegate,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
