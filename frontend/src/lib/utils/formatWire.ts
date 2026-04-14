import { formatEther } from "viem";

/**
 * Converts a wei bigint value to a human-readable WIRE display string.
 * e.g. 5000000000000000n → "0.0050 WIRE"
 */
export function formatWire(wei: bigint): string {
  return `${parseFloat(formatEther(wei)).toFixed(6)} WIRE`;
}
