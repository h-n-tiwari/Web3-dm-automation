"use client"

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ConnectAccounts({
  isTwitterConnected,
}: {
  isTwitterConnected: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleConnectTwitter() {
    setLoading(true);
    setError("");

    try {
      const { error: linkError } = await authClient.linkSocial({
        provider: "twitter",
        callbackURL: "/connect",
      });

      if (linkError) {
        setError(linkError.message || "Failed to connect Twitter. Try again.");
        setLoading(false);
      }
    } catch {
      setError("Failed to connect Twitter: Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center justify-between">
        {/* Account Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 font-bold">
            X
          </div>
          <div>
            <p className="font-medium">Twitter / X</p>
            <p className="text-sm text-gray-400">
              {isTwitterConnected
                ? "Your account is connected"
                : "Not connected yet"}
            </p>
          </div>
        </div>

        {/* Action */}
        {isTwitterConnected ? (
          <span className="rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
            Connected
          </span>
        ) : (
          <button
            onClick={handleConnectTwitter}
            disabled={loading}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 transition disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect Twitter"}
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
