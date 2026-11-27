import AutomationsList from "@/components/automations-list";
import { prisma } from "@/server/prisma";
import { requireWalletPage } from "@/server/utils/page-auth";


export default async function AutomationPage() {

    const session = await requireWalletPage();

    const automations = await prisma.automation.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <h1 className="mb-8 text-2xl font-bold">Automations</h1>
            <AutomationsList initialAutomations={automations} />
        </div>
    )
}