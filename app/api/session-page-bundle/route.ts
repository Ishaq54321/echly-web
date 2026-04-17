import type { NextRequest } from "next/server";
import { getSessionFeedbackPageForUserWithStringCursorRepo } from "@/lib/repositories/feedbackRepository.server";
import {
  getSessionByIdRepo,
  recordSessionViewIfNewRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import { serializeSession } from "@/lib/server/serializeSession";
import { corsHeaders } from "@/lib/server/cors";
import { fireAndForget } from "@/lib/server/fireAndForget";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

const BUNDLE_FEEDBACK_LIMIT = 50;

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/session-page-bundle?sessionId=...&token=...|shareToken=...
 *
 * Single {@link tryBuildRequestContext} (share token via query/Bearer same as /api/feedback),
 * then first page of session feedback (limit 50).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionIdRaw = searchParams.get("sessionId");
  const trimmedSid = sessionIdRaw?.trim() ?? "";

  if (trimmedSid === "") {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const sessionRow = await getSessionByIdRepo(trimmedSid);

    const built = await tryBuildRequestContext({
      req,
      sessionId: trimmedSid,
      optionalAuth: true,
      session: sessionRow,
    });
    if (!built.ok) {
      return new Response(built.response.body, {
        status: built.response.status,
        statusText: built.response.statusText,
        headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
      });
    }

    const ctx = built.ctx;
    const access = ctx.access;
    if (!access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }

    const session = ctx.session;
    if (!session) {
      return apiError({
        code: "NOT_FOUND",
        message: "Not found",
        status: 404,
        init: { headers: corsHeaders(req) },
      });
    }

    /** Same semantics as POST /api/sessions/:id/view: Loom-style count once per viewer; no second context build on the client. */
    const uid = ctx.userId;
    if (uid) {
      const rateKey = `session-view:${trimmedSid}:${clientKeyFromRequest(req)}`;
      const rate = checkRateLimit({ key: rateKey, max: 60, windowMs: 60_000 });
      if (rate.allowed) {
        fireAndForget("session-page-bundle recordSessionView", () =>
          recordSessionViewIfNewRepo(trimmedSid, uid)
        );
      }
    }

    const pageResult = await getSessionFeedbackPageForUserWithStringCursorRepo({
      sessionId: trimmedSid,
      limit: BUNDLE_FEEDBACK_LIMIT,
      cursor: undefined,
    });
    const { feedback, nextCursor, hasMore } = pageResult;

    const sessionJson = serializeSession(session, access);
    const feedbackPayload = feedback.map((f) => serializeFeedback(f, access));
    const requestPayload = ctx.accessRequest ?? ({ pendingResolve: false } as const);

    return apiSuccess(
      {
        session: sessionJson,
        feedback: feedbackPayload,
        nextCursor,
        hasMore,
        request: requestPayload,
        access: ctx.access,
        user:
          ctx.userId != null
            ? { uid: ctx.userId, workspaceId: ctx.workspaceId }
            : null,
      },
      access,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/session-page-bundle:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
