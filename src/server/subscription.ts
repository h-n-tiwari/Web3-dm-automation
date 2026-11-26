import { prisma } from "@/server/prisma";

export const FREE_AUTOMATION_LIMIT = 5;

export async function getVerifiedWallet(userId: string, sessionId: string) {
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
      userId,
      expiresAt: { gt: new Date() },
    },
    select: {
      walletVerifiedAddress: true,
      user: {
        select: {
          subscription: { select: { verifiedWalletAddress: true } },
        },
      },
    },
  });

  const wallet = session?.walletVerifiedAddress;

  return wallet && wallet === session.user.subscription?.verifiedWalletAddress
    ? wallet
    : null;
}

export async function getUserPlan(userId: string): Promise<"free" | "pro"> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (
    subscription?.verifiedWalletAddress &&
    subscription.plan === "pro" &&
    subscription.expiresAt &&
    subscription.expiresAt > new Date()
  ) {
    return "pro";
  }

  return "free";
}
