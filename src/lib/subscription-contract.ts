export const SUBSCRIPTION_CONTRACT_ADDRESS =
  "0x37d8BE886b8469064F5446d7CF53447150cd7fCc";

export const SUBSCRIPTION_ABI = [
  "function subscribe() payable",
  "function isSubscribed(address user) view returns (bool)",
  "function price() view returns (uint256)",
  "function subscribedUntil(address user) view returns (uint256)",
  "function owner() view returns (address)",
  "function withdraw()",
  "event Subscribed(address indexed user, uint256 expiresAt)",
] as const;