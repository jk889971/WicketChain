"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { useReadWicketChainVaultClaimableRefunds } from "@/lib/contracts/generated";
import { CONTRACTS } from "@/config/contracts";
import { wicketChainVaultAbi } from "@/lib/contracts/generated";

interface UseRefundClaimOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for claiming refunds from the WicketChainVault.
 * Reads claimable balance + executes pull-based refund withdrawal.
 */
export function useRefundClaim(
  walletAddress: `0x${string}` | undefined,
  options?: UseRefundClaimOptions
) {
  const contract = useContractWrite(options);

  const {
    data: claimableWei,
    refetch: refetchClaimable,
    isLoading: isBalanceLoading,
  } = useReadWicketChainVaultClaimableRefunds({
    address: CONTRACTS.vault,
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress },
  });

  const claimRefunds = async () => {
    return contract.execute({
      address: CONTRACTS.vault,
      abi: wicketChainVaultAbi,
      functionName: "claimRefunds",
      args: [],
    });
  };

  return {
    claimRefunds,
    claimableWei: claimableWei ?? 0n,
    refetchClaimable,
    isBalanceLoading,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
