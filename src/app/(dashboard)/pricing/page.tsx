import { auth } from "@/server/auth";
import { getUserPlan } from "@/server/subscription";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PricingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const plan = await getUserPlan(session.user.id);

    return (
        <div>
            <h1 className="mb-2 text-2xl font-bold">Pricing</h1>
            <p className="mb-8 text-gray-400">You are currently on the{" "}
                <span className="font-semibold text-white capitalize">{plan}</span> plan.
            </p>

        </div>
    )


}