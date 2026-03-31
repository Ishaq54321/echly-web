import { type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import { serializeSession } from "@/lib/server/serializeSession";
import { buildRequestContext } from "@/lib/server/requestContext";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  getFeedbackByIdsRepo,
  getSessionFeedbackByResolvedRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { listRecentCommentsForSessionRepo } from "@/lib/repositories/commentsRepository.server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

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
    return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
  }

  const loaded = await getSessionByIdRepo(id);
  if (!loaded) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }
  const context = await buildRequestContext({
    req,
    sessionId: id,
    session: loaded,
    optionalAuth: true,
  });
  const { session, access } = context;

  if (!access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }
  if (!session) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  const sid = id.trim();
  const workspaceId =
    typeof session.workspaceId === "string" ? session.workspaceId.trim() : "";
  if (!workspaceId) {
    return apiError({ code: "INTERNAL_ERROR", message: "Session missing workspace", status: 500 });
  }
  try {
    const [openPreview, resolvedPreview, recentComments] = await Promise.all([
      getSessionFeedbackByResolvedRepo(sid, false, PREVIEW_LIMIT),
      getSessionFeedbackByResolvedRepo(sid, true, PREVIEW_LIMIT),
      listRecentCommentsForSessionRepo(workspaceId, sid, RECENT_ACTIVITY_LIMIT),
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

    return apiSuccess(
      {
        session: sessionJson,
        statusPreview: {
          open: openPreview.map((item) => serializeFeedback(item, access)),
          resolved: resolvedPreview.map((item) => serializeFeedback(item, access)),
        },
        recentActivity,
      },
      access
    );
  } catch (e) {
    console.error("GET /api/sessions/[sessionId]/overview:", e);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}
