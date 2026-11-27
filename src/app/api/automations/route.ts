import { withWalletAuth } from "@/server/utils/with-auth";
import { prisma } from "@/server/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { getUserPlan, FREE_AUTOMATION_LIMIT } from "@/server/subscription";
import { getOwnedAutomation } from "@/server/utils/get-owned-automations";

type CreateAutomationBody = Pick<
  Prisma.AutomationCreateInput,
  "name" | "platform" | "trigger" | "dmMessage"
>;

export const GET = withWalletAuth(
  async (_req, session): Promise<Response> => {
    const automations = await prisma.automation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(automations);
  }
);

export const POST = withWalletAuth(
  async (req, session): Promise<Response> => {

    const plan = await getUserPlan(session.user.id);

    if (plan === "free") {
      const count = await prisma.automation.count({ where: { userId: session.user.id } });

      if (count >= FREE_AUTOMATION_LIMIT) {
        return NextResponse.json({ error: `Free plan allows a maximum of ${FREE_AUTOMATION_LIMIT} automations.` }, { status: 403 });
      }
      
    }

    const body: Partial<CreateAutomationBody> = await req.json();
    const { name, platform, trigger, dmMessage } = body;

    if (!name || !platform || !trigger || !dmMessage) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "twitter" },
  });

  if (!account?.accessToken) {
    return NextResponse.json({ error: "Twitter account not connected" }, { status: 400 });
  }

    const automation = await prisma.automation.create({
      data: {
        userId: session.user.id,
        name,
        platform,
        trigger,
        dmMessage,
      },
    });

    return NextResponse.json(automation, { status: 201 });
  }
);

export const DELETE = withWalletAuth(
  async (req, session): Promise<Response> => {
    try {
      const result = await getOwnedAutomation(
        req,
        session.user.id
      );

      if (!result.success) {
        return result.response;
      }

      await prisma.automation.delete({
        where: { id: result.automation.id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE automation error:", error);

      return NextResponse.json(
        { error: "Failed to delete automation" },
        { status: 500 }
      );
    }
  }
);


export const PATCH = withWalletAuth(
  async (req, session): Promise<Response> => {
    try {
      const result = await getOwnedAutomation(
        req,
        session.user.id
      );

      if (!result.success) {
        return result.response;
      }

      const updated = await prisma.automation.update({
        where: { id: result.automation.id },
        data: {
          isActive: !result.automation.isActive,
        },
      });

      return NextResponse.json(updated);
    } catch (error) {
      console.error("PATCH automation error:", error);

      return NextResponse.json(
        { error: "Failed to update automation" },
        { status: 500 }
      );
    }
  }
);