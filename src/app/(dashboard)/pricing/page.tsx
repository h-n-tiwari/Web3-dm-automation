import { Suspense } from "react";
import PricingCards from "@/components/pricing-cards";
import { getUserPlan } from "@/server/subscription";
import { requireWalletPage } from "@/server/utils/page-auth";

export default function PricingPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Pricing</h1>

      <Suspense fallback={<p role="status">Loading pricing…</p>}>
        <PricingContent />
      </Suspense>
    </div>
  );
}

async function PricingContent() {
  const session = await requireWalletPage();
  const userId = session.user.id;
  const plan = await getUserPlan(userId);

  return (
    <>
      <p className="mb-8 text-gray-400">
        You are currently on the{" "}
        <span className="font-semibold text-white capitalize">{plan}</span>{" "}
        plan.
      </p>

      <PricingCards currentPlan={plan} key={userId} userId={userId} />
    </>
  );
}