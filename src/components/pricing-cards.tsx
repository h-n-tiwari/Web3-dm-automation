
"use client";

import { useState } from "react";
import axios from "axios";

export default function PricingCards({
  currentPlan,
}: {
  currentPlan: "free" | "pro";
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  async function handleCryptoPay() {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      
      const walletAddress = "0xYourWalletAddress";
      const txHash = "0xPlaceholderTxHash";

      await axios.post("/api/subscription", { walletAddress, txHash });

      setSuccess(true);
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6 max-w-3xl">
      {/* Free tier */}
      <div className={`rounded-xl border p-6 flex flex-col gap-4 ${
        currentPlan === "free"
          ? "border-indigo-500 bg-indigo-500/5"
          : "border-gray-800 bg-gray-900"
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

      {/* Pro tier */}
      <div className={`rounded-xl border p-6 flex flex-col gap-4 ${
        currentPlan === "pro"
          ? "border-indigo-500 bg-indigo-500/5"
          : "border-gray-800 bg-gray-900"
      }`}>
        <div>
          <p className="text-lg font-bold">Pro</p>
          <p className="mt-1 text-3xl font-bold">
            $10 <span className="text-sm font-normal text-gray-400">/ month</span>
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-gray-300">
          <li>Unlimited automations</li>
          <li>Twitter / X support</li>
          <li>Keyword triggers</li>
          <li>Priority DM sending</li>
          <li>Analytics</li>
        </ul>

        {currentPlan === "pro" ? (
          <span className="self-start rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            Current Plan
          </span>
        ) : (
          <button
            onClick={handleCryptoPay}
            disabled={loading}
            className="self-start rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay with Crypto"}
          </button>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-green-400">
            Upgraded to Pro! Refresh to see your new plan.
          </p>
        )}
      </div>
    </div>
  );
}
