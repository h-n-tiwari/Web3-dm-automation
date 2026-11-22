import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ConnectAccounts from "@/components/connect-accounts";

export default async function ConnectPage() {
    const session = await auth.api.getSession({
        headers: await headers(),

    });

    if (!session) {
        redirect("/login");
    }

    const twitterAccount = await prisma.account.findFirst({
        where: { userId: session.user.id, providerId: "twitter" },
    })

    return (
        <div>
            <h1 className="mb-2 text-2xl font-bold">Connect Accounts</h1>
            <p className="mb-8 text-gray-400">
                Link your social accounts to enable automations.
            </p>

            <ConnectAccounts isTwitterConnected={!!twitterAccount} />


        </div>
    )



}