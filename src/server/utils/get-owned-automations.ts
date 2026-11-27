import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";

export async function getOwnedAutomation(
  req: Request,
  userId: string
) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return {
      success: false as const,
      response: NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      ),
    };
  }

  const automation = await prisma.automation.findUnique({
    where: { id },
  });

  if (!automation || automation.userId !== userId) {
    return {
      success: false as const,
      response: NextResponse.json(
        { error: "Not Found" },
        { status: 404 }
      ),
    };
  }

  return {
    success: true as const,
    automation,
  };
}