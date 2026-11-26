import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getVerifiedWallet } from "@/server/subscription";

export async function requirePageSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  return session;
}

export async function requireWalletPage() {
  const session = await requirePageSession();
  const wallet = await getVerifiedWallet(session.user.id, session.session.id);

  if (!wallet) redirect("/wallet");

  return session;
}