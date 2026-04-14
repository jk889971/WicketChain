"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { ticketNftAbi } from "@/lib/contracts/generated";

interface UseEventManagementOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for admin event lifecycle operations.
 * Encapsulates event creation, status changes, pricing, and walk-in tickets.
 */
export function useEventManagement(options?: UseEventManagementOptions) {
  const contract = useContractWrite(options);

  const createEvent = async (params: {
    venueId: bigint;
    matchTitle: string;
    startTime: bigint;
    endTime: bigint;
  }) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "createEvent",
      args: [
        params.venueId,
        params.matchTitle,
        params.startTime,
        params.endTime,
      ],
    });
  };

  const setEventLive = async (eventId: bigint) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "setEventLive",
      args: [eventId],
    });
  };

  const updateEventStatus = async (eventId: bigint, status: number) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "updateEventStatus",
      args: [eventId, status],
    });
  };

  const cancelEvent = async (eventId: bigint) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "cancelEvent",
      args: [eventId],
    });
  };

  const postponeEvent = async (
    eventId: bigint,
    newStart: bigint,
    newEnd: bigint
  ) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "postponeEvent",
      args: [eventId, newStart, newEnd],
    });
  };

  const setEventPricing = async (
    eventId: bigint,
    enclosureId: bigint,
    priceWei: bigint
  ) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "setEventPricing",
      args: [eventId, enclosureId, priceWei],
    });
  };

  const purchaseWalkInTicket = async (params: {
    eventId: bigint;
    enclosureId: bigint;
    rowLabel: `0x${string}`;
    seatNumber: bigint;
    vaultAddress: `0x${string}`;
  }) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "purchaseWalkInTicket",
      args: [
        params.eventId,
        params.enclosureId,
        params.rowLabel,
        params.seatNumber,
        params.vaultAddress,
      ],
    });
  };

  const forceRefundEnclosure = async (
    eventId: bigint,
    enclosureId: bigint
  ) => {
    return contract.execute({
      address: CONTRACTS.ticketNFT,
      abi: ticketNftAbi,
      functionName: "forceRefundEnclosure",
      args: [eventId, enclosureId],
    });
  };

  return {
    createEvent,
    setEventLive,
    updateEventStatus,
    cancelEvent,
    postponeEvent,
    setEventPricing,
    purchaseWalkInTicket,
    forceRefundEnclosure,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
