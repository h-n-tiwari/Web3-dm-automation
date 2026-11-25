import { BrowserProvider, isAddress, isError } from "ethers";
import type { JsonRpcSigner } from "ethers";

const SEPOLIA_CHAIN_ID = 11155111n;

export interface MetaMaskConnection {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
}

export type SubscriptionPayment = {
  walletAddress: string;
  txHash: string;
};

function getMetaMask() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const wallet = window.ethereum;

  if (wallet && wallet.isMetaMask) {
    return wallet;
  }

  return undefined;
}

export function isMetaMaskInstalled(): boolean {
  return getMetaMask() !== undefined;
}

export async function isMetaMaskConnected(): Promise<boolean> {
  const wallet = getMetaMask();

  if (!wallet) {
    return false;
  }

  try {
    const accounts: unknown = await wallet.request({ method: "eth_accounts" });

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return false;
    }

    const address: unknown = accounts[0];
    return typeof address === "string" && isAddress(address);
  } catch (error: unknown) {
    console.error("Failed to check MetaMask Connection:", error);

    return false;
  }
}

export async function connectWallet(): Promise<MetaMaskConnection> {
  const wallet = getMetaMask();

  if (!wallet) {
    throw new Error("Open the app in a browser with MetaMask.");
  }

  const provider = new BrowserProvider(wallet);

  try {
    const network = await provider.getNetwork();

    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error("Switch MetaMask to Ethereum Sepolia.");
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (error) {
    if (isError(error, "ACTION_REJECTED")) {
      throw new Error("You declined the MetaMask connection request.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to connect MetaMask.");
  }
}