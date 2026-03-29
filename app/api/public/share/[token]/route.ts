import { NextResponse } from "next/server";
import { toShareSurfacePermissions } from "@/lib/access/resolveAccess";
import { getAccessContextForPublicShareToken } from "@/lib/access/getAccessContext";
import { getAllFeedbackForPublicShareBySessionIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { sanitizePublicFeedback, sanitizePublicSession } from "@/lib/server/publicShareSanitize";
import { updateShareLinkLastAccessedAt } from "@/lib/repositories/shareLinksRepository";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";

/**
 * GET /api/public/share/:token — token-only public read for a shared session.
 * No auth, Firestore client subscriptions, or reuse of /api/feedback.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: paramToken } = await params;
  const rawToken = typeof paramToken === "string" ? paramToken.trim() : "";
  if (!rawToken) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const rate = checkRateLimit({
    key: `public-share:${rawToken}:${clientKeyFromRequest(req)}`,
    max: 120,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { session, access, tokenCtx } = await getAccessContextForPublicShareToken(rawToken);

  if (!access?.canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tokenCtx.ok && tokenCtx.isActive) {
    void updateShareLinkLastAccessedAt(tokenCtx.linkDocId).catch(() => {});
  }

  const feedback = await getAllFeedbackForPublicShareBySessionIdRepo(session.id);

  return NextResponse.json({
    session: sanitizePublicSession(session),
    feedback: sanitizePublicFeedback(feedback),
    permissions: toShareSurfacePermissions(access),
  });
}
