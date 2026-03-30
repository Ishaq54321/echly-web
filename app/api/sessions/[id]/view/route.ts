import { NextResponse } from "next/server";
import { recordSessionViewIfNewRepo } from "@/lib/repositories/sessionsRepository.server";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { resolveOptionalSessionViewer } from "@/lib/server/requestContext";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }
  const rateKey = `session-view:${id}:${clientKeyFromRequest(req)}`;
  const rate = checkRateLimit({ key: rateKey, max: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: "Too Many Requests" }, { status: 429 });
  }

  let body: { shareToken?: unknown } = {};
  try {
    body = (await req.json()) as { shareToken?: unknown };
  } catch {
    body = {};
  }

  const shareTokenFromBody =
    typeof body.shareToken === "string" ? body.shareToken.trim() : "";

  const { viewerUser, tokenString } = await resolveOptionalSessionViewer(req, {
    bodyShareToken: shareTokenFromBody,
  });

  const { access } = await getAccessContext({
    sessionId: id,
    user: viewerUser,
    tokenString,
  });

  if (!access?.capabilities.canView) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    if (viewerUser) {
      await recordSessionViewIfNewRepo(id, viewerUser.uid);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/sessions/[id]/view:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
