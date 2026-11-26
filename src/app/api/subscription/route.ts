import { ethers } from "ethers";
import { NextResponse } from "next/server";
import {
  SUBSCRIPTION_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "@/lib/subscription-contract";
import { prisma } from "@/server/prisma";
import { getUserPlan, getVerifiedWallet } from "@/server/subscription";
import { withAuth } from "@/server/utils/with-auth";

const chainId = 11155111n;
const contractAddress = ethers.getAddress(SUBSCRIPTION_CONTRACT_ADDRESS).toLowerCase();
const abi = new ethers.Interface(SUBSCRIPTION_ABI);
const subscribeCall = abi.encodeFunctionData("subscribe");
const subscribedTopic = abi.getEvent("Subscribed")!.topicHash;

function failure(error: string, status: number, code?: string) {
  return NextResponse.json({ error, ...(code ? { code } : {}) }, { status });
}

function normalizeWallet(value: unknown) {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(value)) return null;

  try {
    return ethers.getAddress(value).toLowerCase();
  } catch {
    return null;
  }
}

function walletMessage(userId: string, sessionId: string, wallet: string) {
  const origin = new URL(process.env.BETTER_AUTH_URL!).origin;
  return [
    "Verify your wallet for this DM Add sign-in.",
    "Purpose: prove ownership of this wallet.",
    "App: " + origin,
    "Network: Ethereum Sepolia (11155111)",
    "Wallet: " + wallet,
    "Account: " + userId,
    "Session: " + sessionId,
  ].join("\n");
}

export const GET = withAuth(async (req, session) => {
  const userId = session.user.id;
  const sessionId = session.session.id;
  const requestedWallet = new URL(req.url).searchParams.get("walletAddress");
  const responseOptions = { headers: { "Cache-Control": "private, no-store" } };

  if (requestedWallet !== null) {
    const wallet = normalizeWallet(requestedWallet);
    if (!wallet) return failure("Invalid wallet address.", 400);

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (subscription?.verifiedWalletAddress && subscription.verifiedWalletAddress !== wallet) {
      return failure("Switch to the wallet already linked to your account.", 409);
    }

    return NextResponse.json(
      { message: walletMessage(userId, sessionId, wallet) },
      responseOptions,
    );
  }

  const walletAddress = await getVerifiedWallet(userId, sessionId);
  if (!walletAddress) return failure("Verify your wallet first.", 403, "WALLET_REQUIRED");

  const plan = await getUserPlan(userId);
  return NextResponse.json({ userId, walletAddress, plan }, responseOptions);
});

export const POST = withAuth(async (req, session) => {
  const body = await req.json().catch(() => null);
  const userId = session.user.id;
  const sessionId = session.session.id;

  if (body?.action === "verifyWallet") {
    const wallet = normalizeWallet(body.walletAddress);
    if (!wallet || typeof body.signature !== "string") {
      return failure("A valid wallet address and signature are required.", 400);
    }

    const message = walletMessage(userId, sessionId, wallet);
    let signer: string;
    try {
      signer = ethers.verifyMessage(message, body.signature).toLowerCase();
    } catch {
      return failure("Invalid wallet signature.", 400);
    }

    if (signer !== wallet) {
      return failure("Signature does not match the wallet for this sign-in.", 400);
    }

    try {
      const verified = await prisma.$transaction(async (db) => {
        await db.subscription.createMany({
          data: [{ userId }],
          skipDuplicates: true,
        });
        await db.subscription.updateMany({
          where: { userId, verifiedWalletAddress: null },
          data: {
            verifiedWalletAddress: wallet,
            walletAddress: wallet,
            plan: "free",
            txHash: null,
            expiresAt: null,
          },
        });

        const subscription = await db.subscription.findUnique({ where: { userId } });
        if (subscription?.verifiedWalletAddress !== wallet) return false;

        await db.session.update({
          where: { id: sessionId, userId, expiresAt: { gt: new Date() } },
          data: { walletVerifiedAddress: wallet },
        });
        return true;
      });

      if (!verified) {
        return failure("Switch to the wallet already linked to your account.", 409);
      }
      return NextResponse.json({ verified: true });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error) {
        if (error.code === "P2002") {
          return failure("This wallet is already linked to another account.", 409);
        }
        if (error.code === "P2025") {
          return failure("Your session expired. Sign in again.", 401);
        }
      }
      throw error;
    }
  }

  if (
    body?.action !== "confirmPayment" ||
    typeof body.txHash !== "string" ||
    !/^0x[0-9a-fA-F]{64}$/.test(body.txHash)
  ) {
    return failure("A valid payment transaction hash is required.", 400);
  }

  const wallet = await getVerifiedWallet(userId, sessionId);
  if (!wallet) return failure("Verify your wallet first.", 403, "WALLET_REQUIRED");

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) return failure("The Sepolia RPC is not configured.", 503);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const txHash = body.txHash.toLowerCase();
  const invalid = () =>
    failure("This transaction does not prove a subscription payment.", 422, "PAYMENT_INVALID");
  let expiresAt: Date;

  try {
    if ((await provider.getNetwork()).chainId !== chainId) {
      return failure("The payment RPC is not connected to Sepolia.", 503);
    }

    const [transaction, receipt] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash),
    ]);
    if (
      !transaction ||
      !receipt ||
      transaction.blockHash !== receipt.blockHash ||
      (await receipt.confirmations()) < 2
    ) {
      return failure("Waiting for two Sepolia confirmations.", 409, "PAYMENT_PENDING");
    }

    if (
      receipt.status !== 1 ||
      transaction.chainId !== chainId ||
      transaction.from.toLowerCase() !== wallet ||
      transaction.to?.toLowerCase() !== contractAddress ||
      transaction.data !== subscribeCall
    ) {
      return invalid();
    }

    const log = receipt.logs.find(
      (entry) =>
        entry.address.toLowerCase() === contractAddress &&
        entry.topics[0] === subscribedTopic,
    );
    const event = log && abi.parseLog(log);
    if (!event || String(event.args[0]).toLowerCase() !== wallet) return invalid();

    expiresAt = new Date(Number(event.args[1] * 1000n));
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) {
      return invalid();
    }
  } catch {
    return failure("Unable to check the Sepolia transaction. Retry with the same hash.", 503);
  } finally {
    provider.destroy();
  }

  const current = await prisma.$transaction(async (db) => {
    await db.subscription.updateMany({
      where: {
        userId,
        verifiedWalletAddress: wallet,
        OR: [{ expiresAt: null }, { expiresAt: { lt: expiresAt } }],
      },
      data: { plan: "pro", txHash, expiresAt },
    });
    return db.subscription.findUnique({ where: { userId } });
  });

  if (
    current?.verifiedWalletAddress !== wallet ||
    current.plan !== "pro" ||
    !current.expiresAt ||
    current.expiresAt <= new Date()
  ) {
    return invalid();
  }

  return NextResponse.json({ plan: "pro", expiresAt: current.expiresAt });
});
