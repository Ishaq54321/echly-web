import { type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  LIST_SESSION_COMMENTS_PAGE_DEFAULT,
  listCommentsForSessionChronologicalRepo,
} from "@/lib/repositories/commentsRepository.server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

function serializeCommentRow(row: Record<string, unknown> & { id: string }): Record<string, unknown> {
  const createdAtRaw = row.createdAt;
  let createdAtOut: unknown = null;
  if (createdAtRaw && typeof createdAtRaw === "object") {
    const o = createdAtRaw as {
      seconds?: number;
      nanoseconds?: number;
      _seconds?: number;
      _nanoseconds?: number;
      toDate?: () => Date;
    };
    if (typeof o.seconds === "number") {
      createdAtOut = {
        seconds: o.seconds,
        nanoseconds: typeof o.nanoseconds === "number" ? o.nanoseconds : 0,
      };
    } else if (typeof o._seconds === "number") {
      createdAtOut = {
        seconds: o._seconds,
        nanoseconds: typeof o._nanoseconds === "number" ? o._nanoseconds : 0,
      };
    } else if (typeof o.toDate === "function") {
      try {
        const d = o.toDate();
        createdAtOut = {
          seconds: Math.floor(d.getTime() / 1000),
          nanoseconds: 0,
        };
      } catch {
        createdAtOut = null;
      }
    }
  }

  return {
    id: row.id,
    workspaceId: row.workspaceId,
    sessionId: row.sessionId,
    feedbackId: row.feedbackId,
    userId: row.userId,
    userName: row.userName,
    userAvatar: row.userAvatar,
    message: row.message,
    createdAt: createdAtOut,
    type: row.type,
    position: row.position,
    textRange: row.textRange,
    threadId: row.threadId ?? null,
    resolved: row.resolved,
    attachment: row.attachment,
  };
}

/** GET /api/comments/:sessionId — optional auth (share token / session viewer); server access = canView. */
export async function GET(req: Request, ctx: HandlerContext) {
  const id = await routeParamId(ctx);
  if (!id?.trim()) {
    return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
  }
  const url = new URL(req.url);
  const feedbackId = url.searchParams.get("feedbackId")?.trim() || "";
  const cursorParam =
    url.searchParams.get("cursor")?.trim() ||
    url.searchParams.get("before")?.trim() ||
    "";
  const limitRaw = url.searchParams.get("limit");
  let limit = LIST_SESSION_COMMENTS_PAGE_DEFAULT;
  if (limitRaw != null && limitRaw.trim() !== "") {
    const n = Number.parseInt(limitRaw, 10);
    if (Number.isFinite(n)) {
      limit = Math.min(100, Math.max(1, n));
    }
  }

  const sessionId = id.trim();
  const loaded = await getSessionByIdRepo(sessionId);
  if (!loaded) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  const context = await buildRequestContext({
    req,
    sessionId,
    session: loaded,
    optionalAuth: true,
  });

  if (!context.access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }

  const session = context.session;
  if (!session) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  const workspaceId =
    typeof session.workspaceId === "string" ? session.workspaceId.trim() : "";
  if (!workspaceId) {
    return apiError({ code: "INTERNAL_ERROR", message: "Session missing workspace", status: 500 });
  }

  try {
    const rows = await listCommentsForSessionChronologicalRepo(
      workspaceId,
      sessionId,
      feedbackId || undefined,
      {
        limit,
        ...(cursorParam ? { cursorCommentId: cursorParam } : {}),
      }
    );
    const comments = rows.map((r) => serializeCommentRow(r));
    const hasMore = rows.length >= limit;
    return apiSuccess({ comments, hasMore }, context.access);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVALID_CURSOR") {
      return apiError({
        code: "INVALID_INPUT",
        message: "Invalid cursor",
        status: 400,
      });
    }
    console.error("GET /api/comments/[sessionId]:", e);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}
