import { NextResponse } from "next/server";
import { getSessionByIdRepo, recordSessionViewIfNewRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  authorize,
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { resolveShareToken } from "@/lib/server/shareTokenResolver";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { buildRequestContext } from "@/lib/server/requestContext";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let uid: string | null = null;
  let isShareAuthorized = false;
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
  } catch (err) {
    if (!shareToken) {
      return toAuthorizationResponse(err);
    }
  }

  if (!uid && shareToken) {
    const shareResolution = await resolveShareToken(shareToken);
    if (!shareResolution.valid || shareResolution.sessionId !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    isShareAuthorized = true;
  }

  if (uid && !isShareAuthorized) {
    const accessCtx = await buildRequestContext({
      userId: uid,
      sessionId: id,
    });
    if (!accessCtx.session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    if (!accessCtx.canAccess) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  } else {
    const session = await getSessionByIdRepo(id);
    if (!session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
  }

  if (uid && !isShareAuthorized) {
    try {
      await authorize({ uid, action: "read_feedback" });
    } catch (err) {
      return toAuthorizationResponse(err);
    }
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
