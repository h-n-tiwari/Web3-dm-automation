import { ethers } from "ethers";
import {
  SUBSCRIPTION_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "../subscription-contract";

// Use the provider for reads such as price(), isSubscribed(), and subscribedUntil().

export const getSubscriptionContract = (
  provider: ethers.BrowserProvider,
): ethers.Contract => {
  return new ethers.Contract(
    SUBSCRIPTION_CONTRACT_ADDRESS!,
    SUBSCRIPTION_ABI!,
    provider,
  );
};

// Use the signer for subscribe() and owner-only withdraw().
export function getSubscriptionContractWithSigner(
  signer: ethers.JsonRpcSigner,
): ethers.Contract {
  return new ethers.Contract(
    SUBSCRIPTION_CONTRACT_ADDRESS,
    SUBSCRIPTION_ABI,
    signer,
  );
}
