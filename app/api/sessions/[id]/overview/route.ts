import { NextResponse } from "next/server";
import { type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import { serializeSession } from "@/lib/server/serializeSession";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { accessContextToResponseBody } from "@/lib/access/resolveAccess";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { resolveOptionalSessionViewer } from "@/lib/server/requestContext";
import {
  getFeedbackByIdsRepo,
  getSessionFeedbackByResolvedRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { listRecentCommentsForSessionRepo } from "@/lib/repositories/commentsRepository.server";
const PREVIEW_LIMIT = 3;
const RECENT_ACTIVITY_LIMIT = 10;

function commentTimestampToIso(createdAt: unknown): string | null {
  if (!createdAt || typeof createdAt !== "object") return null;
  const o = createdAt as { toDate?: () => Date; seconds?: number };
  if (typeof o.toDate === "function") {
    try {
      return o.toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (typeof o.seconds === "number") {
    return new Date(o.seconds * 1000).toISOString();
  }
  return null;
}

/** GET /api/sessions/:id/overview — optional auth; same access as GET /api/sessions/:id. */
export async function GET(req: Request, ctx: HandlerContext) {
  const id = await routeParamId(ctx);
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }

  const { viewerUser, tokenString } = await resolveOptionalSessionViewer(req);
  const loaded = await getSessionByIdRepo(id);
  const { session, access } = await getAccessContext({
    sessionId: id,
    user: viewerUser,
    session: loaded,
    tokenString,
  });

  if (!access?.capabilities.canView) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const sid = id.trim();
  try {
    const [openPreview, resolvedPreview, recentComments] = await Promise.all([
      getSessionFeedbackByResolvedRepo(sid, false, PREVIEW_LIMIT),
      getSessionFeedbackByResolvedRepo(sid, true, PREVIEW_LIMIT),
      listRecentCommentsForSessionRepo(sid, RECENT_ACTIVITY_LIMIT),
    ]);
    const feedbackIds = [
      ...new Set(
        recentComments
          .map((c) => (typeof c.feedbackId === "string" ? c.feedbackId : ""))
          .filter(Boolean)
      ),
    ].slice(0, 10);
    const feedbackList = await getFeedbackByIdsRepo(feedbackIds, 10);
    const titleByFeedbackId = new Map(feedbackList.map((f) => [f.id, f.title]));

    const recentActivity = recentComments.map((c) => ({
      actorName: typeof c.userName === "string" ? c.userName : "Someone",
      action: "Commented",
      targetTitle: (typeof c.feedbackId === "string" ? titleByFeedbackId.get(c.feedbackId) : null) ?? "",
      timestamp: commentTimestampToIso(c.createdAt),
    }));

    const sessionJson = serializeSession(session, access);
    const accessJson = accessContextToResponseBody(access);

    return NextResponse.json({
      success: true,
      session: sessionJson,
      access: accessJson,
      statusPreview: {
        open: openPreview.map((item) => serializeFeedback(item, access)),
        resolved: resolvedPreview.map((item) => serializeFeedback(item, access)),
      },
      recentActivity,
    });
  } catch (e) {
    console.error("GET /api/sessions/[id]/overview:", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
