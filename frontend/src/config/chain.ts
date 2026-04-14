import { defineChain } from "viem";

// ── WireFluid Testnet ──
export const wirefluid = defineChain({
  id: 92533,
  name: "WireFluid Testnet",
  nativeCurrency: { name: "WIRE", symbol: "WIRE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm.wirefluid.com"],
      webSocket: ["wss://ws.wirefluid.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "WireScan",
      url: "https://wirefluidscan.com",
    },
  },
  testnet: true,
});

// ── Active chain ──
export const activeChain = wirefluid;

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL || activeChain.blockExplorers.default.url;

export const FAUCET_URL: string | null =
  activeChain.testnet ? "https://faucet.wirefluid.com" : null;

export function getTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function getAddressUrl(address: string) {
  return `${EXPLORER_URL}/address/${address}`;
}
