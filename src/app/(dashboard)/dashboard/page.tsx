import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { getUserPlan } from "@/server/subscription";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get Session - redirect to login if not authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all the stats we need in parallel
  const [totalAutomations, activeAutomations, twitterAccount, plan] =
    await Promise.all([
      prisma.automation.count({ where: { userId } }),
      prisma.automation.count({ where: { userId, isActive: true } }),
      prisma.account.findFirst({ where: { userId, providerId: "twitter" } }),
      getUserPlan(userId),
    ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">Total Automations</p>
          <p className="mt-2 text-3xl font-bold">{totalAutomations}</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">Active Automations</p>
          <p className="mt-2 text-3xl font-bold">{activeAutomations}</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">Current Plan</p>
          <p className="mt-2 text-3xl font-bold capitalize">{plan}</p>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Connected Accounts</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-bold">
              X
            </div>
            <div>
              <p className="font-medium">Twitter / X</p>
              <p className="text-sm text-gray-400">
                {twitterAccount ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>

          {twitterAccount ? (
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
              ✓ Active
            </span>
          ) : (
            <a
              href="/connect"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 transition"
            >
              Connect
            </a>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 flex gap-4">
        <a
          href="/automations"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 transition"
        >
          New Automation
        </a>
        <a
          href="/pricing"
          className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition"
        >
          Upgrade Plan
        </a>
      </div>
    </div>
  );
}
