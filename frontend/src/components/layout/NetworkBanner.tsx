"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { AlertTriangle, Wifi, WifiOff, Droplets } from "lucide-react";
import { activeChain, FAUCET_URL } from "@/config/chain";

export function NetworkBanner() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  // No wallet installed
  if (typeof window !== "undefined" && !window.ethereum && !isConnected) {
    return (
      <div className="bg-[#56a963] text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2">
        <WifiOff size={14} />
        <span>
          No wallet detected.{" "}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-white/90"
          >
            Install MetaMask
          </a>{" "}
          to get started.
        </span>
      </div>
    );
  }

  // Wrong network
  if (isConnected && chain?.id !== activeChain.id) {
    return (
      <div className="bg-yellow-500/90 text-black text-center text-sm py-2 px-4 flex items-center justify-center gap-2">
        <AlertTriangle size={14} />
        <span>
          Wrong network detected.{" "}
          <button
            onClick={() => switchChain?.({ chainId: activeChain.id })}
            className="underline font-semibold hover:text-black/80 cursor-pointer"
          >
            Switch to {activeChain.name}
          </button>
        </span>
      </div>
    );
  }

  // Connected to correct network — show faucet link on testnet
  if (isConnected) {
    if (FAUCET_URL) {
      return (
        <div className="bg-[#56a963]/10 text-white/50 text-center text-xs py-1.5 px-4 flex items-center justify-center gap-1.5">
          <Droplets size={12} className="text-[#56a963]" />
          <span>
            Running on {activeChain.name}.{" "}
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium text-[#a5fcad] hover:text-[#56a963]"
            >
              Get free testnet WIRE
            </a>
          </span>
        </div>
      );
    }
    return null;
  }

  // Not connected at all
  return (
    <div className="bg-white/5 text-white/50 text-center text-xs py-1.5 px-4 flex items-center justify-center gap-1.5">
      <Wifi size={12} />
      <span>Connect your wallet to access all features</span>
    </div>
  );
}
