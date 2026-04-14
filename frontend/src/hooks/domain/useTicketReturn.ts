"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";

interface UseTicketReturnOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for returning tickets (80% refund) and claiming cancellation refunds (100%).
 * Handles the TicketNFT returnTicket + claimCancellationRefund flows.
 */
export function useTicketReturn(options?: UseTicketReturnOptions) {
  const contract = useContractWrite(options);

  const returnTicket = async (tokenId: bigint) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "returnTicket",
      args: [tokenId],
    });
  };

  const claimCancellationRefund = async (tokenId: bigint) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "claimCancellationRefund",
      args: [tokenId],
    });
  };

  return {
    returnTicket,
    claimCancellationRefund,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
