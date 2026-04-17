import "server-only";
// PERF R-002: batch resolve/unresolve endpoint — replaces N individual PATCH requests
// with a single request that updates all feedback docs and session counters in one
// Firestore transaction. Endpoint: POST /api/feedback/batch-resolve
import {
  batchResolveFeedbackRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { tryBuildRequestContext } from "@/lib/server/requestContext";

/**
 * POST /api/feedback/batch-resolve
 *
 * Body: { sessionId: string; feedbackIds: string[]; isResolved: boolean }
 *
 * Updates up to 200 feedback docs + session counters in one Firestore transaction.
 * Returns: { success: true, data: { applied: number, skipped: number } }
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    const res = toAuthorizationResponse(err);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
    });
  }

  let body: { sessionId?: unknown; feedbackIds?: unknown; isResolved?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return apiError({ code: "INVALID_INPUT", message: "Missing sessionId", status: 400 });
  }

  if (typeof body.isResolved !== "boolean") {
    return apiError({
      code: "INVALID_INPUT",
      message: "isResolved must be a boolean",
      status: 400,
    });
  }

  if (!Array.isArray(body.feedbackIds) || body.feedbackIds.length === 0) {
    return apiError({
      code: "INVALID_INPUT",
      message: "feedbackIds must be a non-empty array",
      status: 400,
    });
  }

  const feedbackIds: string[] = [];
  for (const id of body.feedbackIds) {
    if (typeof id === "string" && id.trim()) {
      feedbackIds.push(id.trim());
    }
  }
  if (feedbackIds.length === 0) {
    return apiError({
      code: "INVALID_INPUT",
      message: "feedbackIds contained no valid string IDs",
      status: 400,
    });
  }

  const toStatus = body.isResolved ? "resolved" : "open";

  try {
    const session = await getSessionByIdRepo(sessionId);
    if (!session) {
      return apiError({ code: "NOT_FOUND", message: "Session not found", status: 404 });
    }

    const built = await tryBuildRequestContext({
      req,
      authenticatedUser: user,
      sessionId,
      session,
    });
    if (!built.ok) {
      return built.response;
    }

    const { access } = built.ctx;
    if (!access?.capabilities.canView) {
      return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
    }
    if (!access.capabilities.canResolve) {
      return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
    }

    const actorId = user.uid.trim();
    if (!actorId) {
      return apiError({ code: "UNAUTHORIZED", message: "Missing user", status: 401 });
    }

    // PERF R-002: single transaction — N writes + 1 session counter update
    const result = await batchResolveFeedbackRepo(sessionId, feedbackIds, toStatus, actorId);

    return apiSuccess({ applied: result.applied, skipped: result.skipped }, access);
  } catch (err) {
    console.error("[API] POST /api/feedback/batch-resolve error:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}
