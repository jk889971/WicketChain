"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { stadiumShopAbi } from "@/lib/contracts/generated";

interface UseShopManagementOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for shop owner operations: registration, products, orders.
 * Encapsulates all StadiumShop write calls.
 */
export function useShopManagement(options?: UseShopManagementOptions) {
  const contract = useContractWrite(options);

  const registerShop = async (params: {
    name: string;
    description: string;
    imageURI: string;
    venueIds: bigint[];
    locations: string[];
  }) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "registerShop",
      args: [
        params.name,
        params.description,
        params.imageURI,
        params.venueIds,
        params.locations,
      ],
    });
  };

  const addProduct = async (params: {
    venueId: bigint;
    name: string;
    imageURI: string;
    priceWei: bigint;
    availableUnits: bigint;
  }) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "addProduct",
      args: [
        params.venueId,
        params.name,
        params.imageURI,
        params.priceWei,
        params.availableUnits,
      ],
    });
  };

  const updateProduct = async (params: {
    productId: bigint;
    name: string;
    imageURI: string;
    priceWei: bigint;
  }) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "updateProduct",
      args: [params.productId, params.name, params.imageURI, params.priceWei],
    });
  };

  const updateInventory = async (productId: bigint, newUnits: bigint) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "updateInventory",
      args: [productId, newUnits],
    });
  };

  const toggleProductActive = async (productId: bigint) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "toggleProductActive",
      args: [productId],
    });
  };

  const toggleShopActive = async () => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "toggleShopActive",
      args: [],
    });
  };

  const confirmCollection = async (orderId: bigint) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "confirmCollection",
      args: [orderId],
    });
  };

  const cancelOrder = async (orderId: bigint) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "cancelOrder",
      args: [orderId],
    });
  };

  const addVenueToShop = async (
    shopId: bigint,
    venueId: bigint,
    location: string
  ) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "addVenueToShop",
      args: [shopId, venueId, location],
    });
  };

  const updateVenueLocation = async (
    shopId: bigint,
    venueId: bigint,
    newLocation: string
  ) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "updateVenueLocation",
      args: [shopId, venueId, newLocation],
    });
  };

  return {
    registerShop,
    addProduct,
    updateProduct,
    updateInventory,
    toggleProductActive,
    toggleShopActive,
    confirmCollection,
    cancelOrder,
    addVenueToShop,
    updateVenueLocation,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
