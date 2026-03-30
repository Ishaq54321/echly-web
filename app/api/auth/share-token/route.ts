import { NextResponse } from "next/server";
import { buildRequestContext } from "@/lib/server/requestContext";
import { createShareAuthToken } from "@/lib/server/firebase/createCustomToken";
import { UnauthorizedError } from "@/lib/server/auth/authorize";
import { extractShareToken } from "@/lib/server/shareTokenFromRequest";

export async function POST(req: Request) {
  let sessionId = "";
  try {
    const body = (await req.json()) as { sessionId?: unknown };
    if (typeof body?.sessionId === "string") {
      sessionId = body.sessionId.trim();
    }
  } catch {
    /* body optional for callers that only send headers */
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  let context;
  try {
    context = await buildRequestContext({ req, sessionId });
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }

  const { access } = context;

  if (!extractShareToken(req)) {
    return NextResponse.json({ error: "Share token required" }, { status: 400 });
  }

  if (!access || !access.capabilities.canView) {
    return NextResponse.json({ error: "Invalid share context" }, { status: 403 });
  }

  const role = access.role === "RESOLVER" ? "RESOLVER" : "VIEWER";

  const token = await createShareAuthToken({
    sessionId: access.sessionId,
    role,
  });

  return NextResponse.json({ token });
}
