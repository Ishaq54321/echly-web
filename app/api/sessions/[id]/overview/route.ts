import { NextResponse } from "next/server";
import {
  withAuthorization,
  type HandlerContext,
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import { serializeSession } from "@/lib/server/serializeSession";
import type { Session } from "@/lib/domain/session";
import {
  getFeedbackByIdsRepo,
  getSessionFeedbackByResolvedRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { listRecentCommentsForSessionRepo } from "@/lib/repositories/commentsRepository.server";
import type { Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";

const PREVIEW_LIMIT = 3;
const RECENT_ACTIVITY_LIMIT = 10;

async function resolveSessionWorkspaceId(
  _req: Request,
  user: HandlerUser,
  ctx: HandlerContext,
  viewerWorkspaceId: string
) {
  const id = await routeParamId(ctx);
  const context = await buildRequestContext({
    userId: user.uid,
    userEmail: user.email,
    userWorkspaceId: viewerWorkspaceId,
    sessionId: id?.trim() || undefined,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    session: context.session,
  };
}

function feedbackToOverviewJson(item: Feedback): Record<string, unknown> {
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  const createdAtOut =
    createdAt != null && typeof createdAt.toDate === "function"
      ? createdAt.toDate().toISOString()
      : null;
  const rawStatus =
    typeof item.status === "string"
      ? item.status
      : item.isResolved
        ? "resolved"
        : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);
  return {
    id: item.id,
    sessionId: item.sessionId,
    title: item.title,
    instruction: item.instruction ?? item.description,
    description: item.description,
    type: item.type,
    suggestedTags: item.suggestedTags ?? undefined,
    createdAt: createdAtOut,
    status: normalizedStatus,
    isResolved: normalizedStatus === "resolved",
    commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
    screenshotUrl: item.screenshotUrl ?? null,
  };
}

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

/** GET /api/sessions/:id/overview — session summary + previews + recent activity (access via resolveAccess). */
export const GET = withAuthorization(
  "read_feedback",
  async (
    _req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const id = await routeParamId(ctx);
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const loaded = ctx.preloaded.session as Session | null;
    const context = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      sessionId: id,
      session: loaded,
    });
    if (!context.access) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!context.session) {
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

      return NextResponse.json({
        success: true,
        session: serializeSession(context.session),
        ...(context.access != null ? { access: context.access } : {}),
        statusPreview: {
          open: openPreview.map(feedbackToOverviewJson),
          resolved: resolvedPreview.map(feedbackToOverviewJson),
        },
        recentActivity,
      });
    } catch (e) {
      console.error("GET /api/sessions/[id]/overview:", e);
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);
