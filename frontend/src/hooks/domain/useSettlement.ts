"use client";

import { useContractWrite } from "@/hooks/useContractWrite";
import { CONTRACTS } from "@/config/contracts";
import { wicketChainVaultAbi, stadiumShopAbi } from "@/lib/contracts/generated";

interface UseSettlementOptions {
  onSuccess?: (hash: string) => void;
}

/**
 * Domain hook for admin vault settlement and shop fee management.
 * Encapsulates settleEvent, setShopFeeBps, pause/unpause, approveShop.
 */
export function useSettlement(options?: UseSettlementOptions) {
  const contract = useContractWrite(options);

  const settleEvent = async (
    eventId: bigint,
    platformPercent: bigint,
    eventManager: `0x${string}`
  ) => {
    return contract.execute({
      address: CONTRACTS.vault,
      abi: wicketChainVaultAbi,
      functionName: "settleEvent",
      args: [eventId, platformPercent, eventManager],
    });
  };

  const setShopFeeBps = async (bps: bigint) => {
    return contract.execute({
      address: CONTRACTS.vault,
      abi: wicketChainVaultAbi,
      functionName: "setShopFeeBps",
      args: [bps],
    });
  };

  const approveShop = async (shopId: bigint) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "approveShop",
      args: [shopId],
    });
  };

  const pauseMarketplace = async (reason: string) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "pause",
      args: [reason],
    });
  };

  const unpauseMarketplace = async () => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "unpause",
      args: [],
    });
  };

  const confirmOrders = async (orderIds: bigint[]) => {
    return contract.execute({
      address: CONTRACTS.stadiumShop,
      abi: stadiumShopAbi,
      functionName: "confirmOrders",
      args: [orderIds],
    });
  };

  return {
    settleEvent,
    setShopFeeBps,
    approveShop,
    pauseMarketplace,
    unpauseMarketplace,
    confirmOrders,
    step: contract.step,
    txHash: contract.txHash,
    errorMessage: contract.errorMessage,
    isLoading: contract.isLoading,
    reset: contract.reset,
  };
}
