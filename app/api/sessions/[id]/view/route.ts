import { NextResponse } from "next/server";
import { recordSessionViewIfNewRepo } from "@/lib/repositories/sessionsRepository.server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let uid: string | null = null;
  let authEmail: string | undefined;
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
  const shareTokenFromHeader = req.headers.get("x-share-token")?.trim() ?? "";
  const shareTokenFromQuery = new URL(req.url).searchParams.get("shareToken")?.trim() ?? "";
  const shareToken = shareTokenFromBody || shareTokenFromHeader || shareTokenFromQuery;

  try {
    const user = await requireAuth(req);
    uid = user.uid;
    authEmail = user.email;
  } catch (err) {
    if (!shareToken) {
      return toAuthorizationResponse(err);
    }
  }

  const { access } = await getAccessContext({
    sessionId: id,
    user: uid ? { uid, email: authEmail } : null,
    tokenString: shareToken || undefined,
  });

  if (!access?.canView) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    if (uid) {
      await recordSessionViewIfNewRepo(id, uid);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/sessions/[id]/view:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
