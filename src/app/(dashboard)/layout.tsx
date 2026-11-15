import type { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col gap-2 border-r border-gray-800 p-6">
        <p className="mb-6 text-lg font-bold">DM Add</p>

        <Link
          href="/dashboard"
          className="rounded px-3 py-2 transition hover:bg-gray-800"
        >
          Dashboard
        </Link>
        <Link
          href="/automations"
          className="rounded px-3 py-2 transition hover:bg-gray-800"
        >
          Automations
        </Link>
        <Link
          href="/connect"
          className="rounded px-3 py-2 transition hover:bg-gray-800"
        >
          Connect Accounts
        </Link>
        <Link
          href="/pricing"
          className="rounded px-3 py-2 transition hover:bg-gray-800"
        >
          Pricing
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
