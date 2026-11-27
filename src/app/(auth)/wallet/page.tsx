import { Suspense } from "react";
import { redirect } from "next/navigation";
import WalletConnect from "@/components/wallet-connect";
import { getVerifiedWallet } from "@/server/subscription";
import { requirePageSession } from "@/server/utils/page-auth";

export default function WalletPage() {
  return (
    <Suspense fallback={null}>
      <WalletGate />
    </Suspense>
  );
}

async function WalletGate() {
  const session = await requirePageSession();
  const wallet = await getVerifiedWallet(session.user.id, session.session.id);

  if (wallet) redirect("/dashboard");

  return <WalletConnect />;
}