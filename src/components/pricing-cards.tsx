"use client";

import axios from "axios";
import { isError } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SUBSCRIPTION_CONTRACT_ADDRESS } from "@/lib/subscription-contract";
import { getSubscriptionContractWithSigner } from "@/lib/utils/subscription";
import { connectWallet } from "@/lib/utils/subscriptionFeatures";

const SEPOLIA_CHAIN_ID = 11155111n;

function readPendingHash(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function PricingCards({
  currentPlan,
  userId,
}: {
  currentPlan: "free" | "pro";
  userId: string;
}) {
  const router = useRouter();
  const busy = useRef(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [pendingHash, setPendingHash] = useState<string | null>(null);
  const storageKey = `dm-add:checkout:${userId}:${SEPOLIA_CHAIN_ID}:${SUBSCRIPTION_CONTRACT_ADDRESS}`;

  useEffect(() => {
    setPendingHash(readPendingHash(storageKey));
  }, [storageKey]);

  function savePendingHash(hash: string | null) {
    setPendingHash(hash);
    try {
      if (hash) localStorage.setItem(storageKey, hash);
      else localStorage.removeItem(storageKey);
    } catch {
      // The hash stays available while this page is open.
    }
  }

  async function checkout() {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data: account } = await axios.get<{ userId: string; walletAddress: string }>(
        "/api/subscription",
      );
      if (account?.userId !== userId || typeof account.walletAddress !== "string") {
        throw new Error("Your sign-in changed. Reload Pricing to continue.");
      }

      let txHash = readPendingHash(storageKey) ?? pendingHash;

      if (!txHash) {
        const { provider, signer, address } = await connectWallet();
        if (address.toLowerCase() !== account.walletAddress.toLowerCase()) {
          throw new Error("Switch MetaMask to the wallet linked to this DM Add account.");
        }

        const contract = getSubscriptionContractWithSigner(signer);
        const price: bigint = await contract.price();
        if ((await provider.getNetwork()).chainId !== SEPOLIA_CHAIN_ID) {
          throw new Error("Switch MetaMask to Ethereum Sepolia.");
        }

        const tx = await contract.subscribe({ value: price, chainId: SEPOLIA_CHAIN_ID });
        txHash = tx.hash;
        savePendingHash(txHash);

        try {
          await tx.wait(2, 120_000);
        } catch (cause) {
          if (!isError(cause, "TRANSACTION_REPLACED")) throw cause;
          if (cause.cancelled) {
            savePendingHash(null);
            throw new Error("The subscription payment was canceled or replaced.");
          }
          txHash = cause.replacement.hash;
          savePendingHash(txHash);
        }
      }

      const { data } = await axios.post<{ plan: string }>("/api/subscription", {
        action: "confirmPayment",
        txHash,
      });
      if (data?.plan !== "pro") throw new Error("Subscription activation is pending.");

      savePendingHash(null);
      setSuccess(true);
      router.refresh();
    } catch (cause) {
      if (axios.isAxiosError<{ error?: string; code?: string }>(cause)) {
        if (cause.response?.status === 401) router.replace("/login");
        if (cause.response?.data?.code === "WALLET_REQUIRED") router.replace("/wallet");
        if (cause.response?.data?.code === "PAYMENT_INVALID") savePendingHash(null);
        setError(cause.response?.data?.error ?? "Could not check the subscription. Try again.");
      } else if (isError(cause, "TIMEOUT")) {
        setError("Confirmation timed out. Use Retry activation to check the payment again.");
      } else if (isError(cause, "ACTION_REJECTED")) {
        setError("You declined the MetaMask request.");
      } else {
        setError(cause instanceof Error ? cause.message : "Checkout failed.");
      }
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6 max-w-3xl">
      <div className={`flex flex-col gap-4 rounded-xl border p-6 ${
        currentPlan === "free" ? "border-indigo-500 bg-indigo-500/5" : "border-gray-800 bg-gray-900"
      }`}>
        <div>
          <p className="text-lg font-bold">Free</p>
          <p className="mt-1 text-3xl font-bold">
            $0 <span className="text-sm font-normal text-gray-400">/ month</span>
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-gray-300">
          <li>Up to 5 automations</li>
          <li>Twitter / X support</li>
          <li>Keyword triggers</li>
          <li className="text-gray-600">✗ Priority DM sending</li>
          <li className="text-gray-600">✗ Analytics</li>
        </ul>
        {currentPlan === "free" && (
          <span className="self-start rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            Current Plan
          </span>
        )}
      </div>

      <div className={`flex flex-col gap-4 rounded-xl border p-6 ${
        currentPlan === "pro" ? "border-indigo-500 bg-indigo-500/5" : "border-gray-800 bg-gray-900"
      }`}>
        <div>
          <p className="text-lg font-bold">Pro</p>
          <p className="mt-1 text-3xl font-bold">
            0.05 Sepolia ETH <span className="text-sm font-normal text-gray-400">/ 30 days</span>
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-gray-300">
          <li>Unlimited automations</li>
          <li>Twitter / X support</li>
          <li>Keyword triggers</li>
          <li>Priority DM sending</li>
          <li>Analytics</li>
        </ul>
        {currentPlan === "pro" && (
          <span className="self-start rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            Current Plan
          </span>
        )}
        <button
          type="button"
          onClick={checkout}
          disabled={loading}
          className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading
            ? "Processing…"
            : pendingHash
              ? "Retry activation"
              : currentPlan === "pro"
                ? "Renew with Crypto"
                : "Pay with Crypto"}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {success && <p role="status" className="text-sm text-green-400">Pro subscription confirmed.</p>}
      </div>
    </div>
  );
}
