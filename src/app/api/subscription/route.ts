import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/server/utils/with-auth";

interface SubscriptionBody {
    walletAddress: string;
    txHash: string;
}

export const POST = withAuth(
    async (req, session): Promise<Response> => {
        const body: Partial<SubscriptionBody> =  await req.json();
        const { walletAddress, txHash } = body;

        if (!walletAddress || !txHash) {
            return NextResponse.json(
                { error: "Missing walletAddress or txHash" },
                { status: 400 }
            );
        }

        const subscription = await prisma.subscription.upsert({
            where: { userId: session.user.id },
            update: {
                plan: "pro",
                walletAddress,
                txHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

            }, 
            create: {
                userId: session.user.id,
                plan: "pro",
                walletAddress,
                txHash,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        return NextResponse.json(subscription);

    }
);