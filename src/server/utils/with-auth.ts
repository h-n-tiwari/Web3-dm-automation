import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import { getVerifiedWallet } from "@/server/subscription";

type Session = typeof auth.$Infer.Session;

type AuthenticatedHandler = (
  req: Request,
  session: Session,
) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: Request): Promise<Response> => {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, session);
  };
}

export function withWalletAuth(handler: AuthenticatedHandler) {
  return withAuth(async (req, session) => {
    const wallet = await getVerifiedWallet(session.user.id, session.session.id);

    if (!wallet) {
      return NextResponse.json(
        { error: "Verify your wallet to continue.", code: "WALLET_REQUIRED" },
        { status: 403 },
      );
    }

    return handler(req, session);
  });
}
