"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { activeChain } from "@/config/chain";

/**
 * Wallet onboarding hook — handles:
 * - No wallet detection
 * - Wrong network auto-switch
 * - Connection state
 */
export function useWalletOnboarding() {
  const { address, isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chain?.id !== activeChain.id;

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: activeChain.id });
    }
  };

  const ensureConnected = (): boolean => {
    if (!isConnected) {
      openConnectModal?.();
      return false;
    }
    if (isWrongNetwork) {
      handleSwitchNetwork();
      return false;
    }
    return true;
  };

  return {
    address,
    isConnected,
    isWrongNetwork,
    chain,
    expectedChain: activeChain,
    openConnectModal,
    switchNetwork: handleSwitchNetwork,
    ensureConnected,
  };
}
