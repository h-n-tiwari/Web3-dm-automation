import { getUserPlan } from "@/server/subscription";
import PricingCards from "@/components/pricing-cards";
import { requireWalletPage } from "@/server/utils/page-auth";

export default async function PricingPage() {
  const session = await requireWalletPage();

  const plan = await getUserPlan(session.user.id);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Pricing</h1>
      <p className="mb-8 text-gray-400">
        You are currently on the{" "}
        <span className="font-semibold text-white capitalize">{plan}</span>{" "}
        plan.
      </p>

      <PricingCards
        currentPlan={plan}
        key={session.user.id}
        userId={session.user.id}
      />
    </div>
  );
}
