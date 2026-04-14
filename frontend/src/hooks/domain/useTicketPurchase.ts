"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";

interface UseTicketPurchaseOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for purchasing tickets (single + bulk).
 * Encapsulates TicketNFT contract write logic.
 * Components call purchaseSingle/purchaseMultiple — zero Web3 knowledge needed.
 */
export function useTicketPurchase(options?: UseTicketPurchaseOptions) {
  const contract = useContractWrite(options);

  const purchaseSingle = async (params: {
    eventId: bigint;
    enclosureId: bigint;
    rowLabel: `0x${string}`;
    seatNumber: bigint;
    value: bigint;
  }) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "purchaseTicket",
      args: [
        params.eventId,
        params.enclosureId,
        params.rowLabel,
        params.seatNumber,
      ],
      value: params.value,
    });
  };

  const purchaseMultiple = async (params: {
    eventId: bigint;
    enclosureId: bigint;
    rowLabels: `0x${string}`[];
    seatNumbers: bigint[];
    value: bigint;
  }) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "purchaseMultipleTickets",
      args: [
        params.eventId,
        params.enclosureId,
        params.rowLabels,
        params.seatNumbers,
      ],
      value: params.value,
    });
  };

  return {
    purchaseSingle,
    purchaseMultiple,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
