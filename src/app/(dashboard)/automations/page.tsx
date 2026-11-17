import { auth } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function AutomationPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const automations = await prisma.automation.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <h1 className="mb-8 text-2xl font-bold">Automations</h1>
        </div>
    )
}