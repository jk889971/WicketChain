/**
 * Shortens an Ethereum address or tx hash for display.
 * e.g. "0x1234567890abcdef..." → "0x1234...cdef"
 */
export function truncateAddress(address: string, leading = 6, trailing = 4): string {
  if (!address || address.length <= leading + trailing) return address;
  return `${address.slice(0, leading)}...${address.slice(-trailing)}`;
}
