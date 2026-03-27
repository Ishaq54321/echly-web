import { NextResponse } from "next/server";
import { getAllFeedbackForPublicShareBySessionIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { sanitizePublicFeedback, sanitizePublicSession } from "@/lib/server/publicShareSanitize";
import { resolvePublicPermissions } from "@/lib/permissions/publicSharePermissions";
import { resolveShareToken } from "@/lib/server/shareTokenResolver";
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

  const resolved = await resolveShareToken(rawToken);
  if (!resolved.valid) {
    if (resolved.reason === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (resolved.reason === "EXPIRED") {
      return NextResponse.json({ error: "Gone" }, { status: 410 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getSessionByIdRepo(resolved.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sessionWorkspaceId =
    typeof (session as { workspaceId?: unknown }).workspaceId === "string"
      ? ((session as { workspaceId?: string }).workspaceId ?? "").trim()
      : "";

  if (!sessionWorkspaceId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ownerMatchesToken = resolved.workspaceId === sessionWorkspaceId;
  if (!ownerMatchesToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const feedback = await getAllFeedbackForPublicShareBySessionIdRepo(
    resolved.sessionId,
    sessionWorkspaceId
  );

  return NextResponse.json({
    session: sanitizePublicSession(session),
    feedback: sanitizePublicFeedback(feedback),
    permissions: resolvePublicPermissions({
      generalAccess: resolved.generalAccess,
    }),
  });
}
