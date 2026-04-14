"use client";

import {
  useReadWicketChainVaultEventBalances,
  useReadWicketChainVaultShopBalances,
  useReadWicketChainVaultShopFeeBps,
} from "@/lib/contracts/generated";
import { CONTRACTS } from "@/config/contracts";

/**
 * Domain hook for reading vault balances — per-event and per-shop.
 * Used by admin settlement page and vendor dashboard.
 */
export function useVaultEventBalance(eventId: bigint | undefined) {
  const {
    data,
    refetch,
    isLoading,
  } = useReadWicketChainVaultEventBalances({
    address: CONTRACTS.vault,
    args: eventId !== undefined ? [eventId] : undefined,
    query: { enabled: eventId !== undefined, staleTime: 30_000 },
  });

  return {
    ticketRevenue: data?.[0] ?? 0n,
    ticketRefunds: data?.[1] ?? 0n,
    shopRevenue: data?.[2] ?? 0n,
    shopRefunds: data?.[3] ?? 0n,
    shopFees: data?.[4] ?? 0n,
    isSettled: data?.[5] ?? false,
    refetch,
    isLoading,
  };
}

/**
 * Domain hook for reading shop balance from the vault.
 * Returns pending, confirmed, withdrawable amounts.
 */
export function useVaultShopBalance(shopId: bigint | undefined) {
  const {
    data,
    refetch,
    isLoading,
  } = useReadWicketChainVaultShopBalances({
    address: CONTRACTS.vault,
    args: shopId !== undefined ? [shopId] : undefined,
    query: { enabled: shopId !== undefined, staleTime: 30_000 },
  });

  return {
    totalEarnings: data?.[0] ?? 0n,
    pendingEarnings: data?.[1] ?? 0n,
    confirmedEarnings: data?.[2] ?? 0n,
    feeDeducted: data?.[3] ?? 0n,
    withdrawnAmount: data?.[4] ?? 0n,
    refetch,
    isLoading,
  };
}

/**
 * Domain hook for reading the current shop fee BPS from the vault.
 */
export function useShopFeeBps() {
  const { data, refetch, isLoading } = useReadWicketChainVaultShopFeeBps({
    address: CONTRACTS.vault,
    query: { staleTime: 60_000 },
  });

  return {
    shopFeeBps: data ?? 0n,
    refetch,
    isLoading,
  };
}
