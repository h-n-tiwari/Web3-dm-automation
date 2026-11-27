import { Suspense } from "react";
import ConnectAccounts from "@/components/connect-accounts";
import { prisma } from "@/server/prisma";
import { requirePageSession } from "@/server/utils/page-auth";

export default function ConnectPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Connect Accounts</h1>
      <p className="mb-8 text-gray-400">
        Link your social accounts to enable automations.
      </p>

      <Suspense fallback={<p role="status">Checking connected accounts…</p>}>
        <ConnectedAccountsPanel />
      </Suspense>
    </div>
  );
}

async function ConnectedAccountsPanel() {
  const session = await requirePageSession();
  const twitterAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "twitter" },
  });

  return <ConnectAccounts isTwitterConnected={!!twitterAccount} />;
}