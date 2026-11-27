"use client";

import axios from "axios";
import { isError } from "ethers";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { connectWallet } from "@/lib/utils/subscriptionFeatures";

export default function WalletConnect() {
  const router = useRouter();
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verifyWallet() {
    if (busy.current) return;

    busy.current = true;
    setLoading(true);
    setError("");

    try {
      const { signer, address: walletAddress } = await connectWallet();

      const { data } = await axios.get<{ message: string }>("/api/subscription", {
        params: { walletAddress },
      });

      if (typeof data?.message !== "string") {
        throw new Error("The wallet verification message is unavailable.");
      }

      const signature = await signer.signMessage(data.message);
      const { data: result } = await axios.post<{ verified: boolean }>(
        "/api/subscription",
        { action: "verifyWallet", walletAddress, signature },
      );

      if (result?.verified !== true) throw new Error("Wallet verification failed.");

      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      if (axios.isAxiosError<{ error?: string }>(cause)) {
        if (cause.response?.status === 401) router.replace("/login");
        setError(cause.response?.data?.error ?? "Could not verify your wallet.");
      } else if (isError(cause, "ACTION_REJECTED")) {
        setError("You declined the signature request.");
      } else {
        setError(cause instanceof Error ? cause.message : "Could not verify your wallet.");
      }
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gray-950 px-4 text-white">
      <div className="max-w-md space-y-4 rounded-xl border border-gray-800 p-6">
        <h1 className="text-xl font-semibold">Verify your wallet</h1>
        <p>Connect MetaMask on Sepolia and sign a message. The signature costs no gas.</p>

        <button
          type="button"
          onClick={verifyWallet}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Connect MetaMask"}
        </button>

        {error && <p role="alert" className="text-red-400">{error}</p>}
      </div>
    </main>
  );
}