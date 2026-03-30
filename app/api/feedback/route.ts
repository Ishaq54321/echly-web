import type { NextRequest } from "next/server";
import {
  getDiscussionInboxFeedbackForUserRepo,
  getSessionFeedbackPageForUserWithStringCursorRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import type { AccessContext } from "@/lib/access/resolveAccess";
import { corsHeaders } from "@/lib/server/cors";
import { tryGetAuthUser } from "@/lib/server/auth/authorize";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20&status=open|resolved
 *
 * Session-scoped and inbox: `buildRequestContext` → `access.capabilities`.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionIdRaw = searchParams.get("sessionId");
  const cursor = searchParams.get("cursor") ?? "";
  const limitParam = searchParams.get("limit");
  const statusParam = searchParams.get("status")?.trim().toLowerCase();
  const statusFilter =
    statusParam === "open" || statusParam === "resolved"
      ? statusParam
      : undefined;
  const DEFAULT_LIMIT = 20;
  const requestedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
  const normalizedRequestedLimit = Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : DEFAULT_LIMIT;
  const safeLimit = Math.min(normalizedRequestedLimit, 50);

  const trimmedSid = sessionIdRaw?.trim() ?? "";

  if (trimmedSid === "") {
    const user = await tryGetAuthUser(req);
    if (!user) {
      return apiError({
        code: "UNAUTHORIZED",
        message: "User is not authenticated",
        status: 401,
        init: { headers: corsHeaders(req) },
      });
    }

    try {
      const feedback = await getDiscussionInboxFeedbackForUserRepo({
        userId: user.uid,
        limit: safeLimit,
      });

      const sessionIds = [...new Set(feedback.map((f) => f.sessionId).filter(Boolean))];
      const titleBySessionId = new Map<string, string>();
      const accessBySessionId = new Map<string, AccessContext>();

      await Promise.all(
        sessionIds.map(async (sid) => {
          const row = await getSessionByIdRepo(sid);
          if (!row) {
            return;
          }
          titleBySessionId.set(sid, row.title);
          const built = await tryBuildRequestContext({
            req,
            authenticatedUser: user,
            sessionId: sid,
            session: row,
          });
          if (!built.ok) {
            return;
          }
          const rowCtx = built.ctx;
          if (rowCtx.access?.capabilities.canView) {
            accessBySessionId.set(sid, rowCtx.access);
          }
        })
      );

      const payload = feedback
        .filter((f) => accessBySessionId.has(f.sessionId))
        .map((f) => {
          const sid = f.sessionId;
          const name = titleBySessionId.get(sid);
          return {
            ...serializeFeedback(f, accessBySessionId.get(sid)!),
            sessionName: name === undefined ? "" : name,
          };
        });

      return apiSuccess({ feedback: payload, nextCursor: null, hasMore: false }, null, {
        headers: corsHeaders(req),
      });
    } catch (err) {
      console.error("GET /api/feedback (all):", err);
      return apiError({
        code: "INTERNAL_ERROR",
        message: "Server error",
        status: 500,
        init: { headers: corsHeaders(req) },
      });
    }
  }

  try {
    const built = await tryBuildRequestContext({
      req,
      sessionId: trimmedSid,
      optionalAuth: true,
    });
    if (!built.ok) {
      return new Response(built.response.body, {
        status: built.response.status,
        statusText: built.response.statusText,
        headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
      });
    }
    const context = built.ctx;
    const access = context.access;
    if (!access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }

    const isFirstPage = !cursor || cursor.trim() === "";

    const pageResult = await getSessionFeedbackPageForUserWithStringCursorRepo({
      sessionId: trimmedSid,
      limit: safeLimit,
      cursor: isFirstPage ? undefined : cursor,
      ...(statusFilter ? { statusFilter } : {}),
    });
    const { feedback, nextCursor, hasMore } = pageResult;

    return apiSuccess(
      {
        feedback: feedback.map((f) => serializeFeedback(f, access)),
        nextCursor,
        hasMore,
      },
      access,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/feedback:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}

export async function POST(req: NextRequest) {
  const mod = await import("./post");
  return mod.POST(req);
}
