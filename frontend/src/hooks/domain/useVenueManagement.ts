"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { venueRegistryAbi } from "@/lib/contracts/generated";

interface UseVenueManagementOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for venue and enclosure management.
 * Encapsulates all VenueRegistry write operations.
 */
export function useVenueManagement(options?: UseVenueManagementOptions) {
  const contract = useContractWrite(options);

  const createVenue = async (name: string, city: string, imageURI: string) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "createVenue",
      args: [name, city, imageURI],
    });
  };

  const updateVenue = async (
    venueId: bigint,
    name: string,
    city: string,
    imageURI: string
  ) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "updateVenue",
      args: [venueId, name, city, imageURI],
    });
  };

  const deactivateVenue = async (venueId: bigint) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "deactivateVenue",
      args: [venueId],
    });
  };

  const activateVenue = async (venueId: bigint) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "activateVenue",
      args: [venueId],
    });
  };

  const addEnclosure = async (params: {
    venueId: bigint;
    name: string;
    rowLabels: `0x${string}`[];
    seatCounts: bigint[];
  }) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "addEnclosure",
      args: [params.venueId, params.name, params.rowLabels, params.seatCounts],
    });
  };

  const updateEnclosure = async (
    venueId: bigint,
    enclosureId: bigint,
    name: string
  ) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "updateEnclosure",
      args: [venueId, enclosureId, name],
    });
  };

  const addRows = async (params: {
    venueId: bigint;
    enclosureId: bigint;
    rowLabels: `0x${string}`[];
    seatCounts: bigint[];
  }) => {
    return contract.execute({
      address: CONTRACTS.venueRegistry,
      abi: venueRegistryAbi,
      functionName: "addRows",
      args: [
        params.venueId,
        params.enclosureId,
        params.rowLabels,
        params.seatCounts,
      ],
    });
  };

  return {
    createVenue,
    updateVenue,
    deactivateVenue,
    activateVenue,
    addEnclosure,
    updateEnclosure,
    addRows,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
