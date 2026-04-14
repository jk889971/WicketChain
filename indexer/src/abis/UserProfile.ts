// UserProfile — Event ABI fragments only
export const UserProfileEvents = [
  "event ProfileHashSet(address indexed user, bytes32 profileHash)",
  "event ProfileHashRemoved(address indexed user)",
] as const;
