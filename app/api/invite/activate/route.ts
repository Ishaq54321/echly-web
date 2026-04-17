import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { redeemSessionInviteForUser } from "@/lib/server/sessionInviteRedemption.server";

type Body = { sessionId?: unknown };

/**
 * POST /api/invite/activate — one-shot, idempotent invite redemption for the authenticated user.
 * Does not run from the access path; call from the client when opening a session.
 */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
    });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing sessionId",
      status: 400,
    });
  }

  const result = await redeemSessionInviteForUser({
    sessionId,
    userId: user.uid,
  });

  if (result.outcome === "session_not_found") {
    return apiError({
      code: "NOT_FOUND",
      message: "Session not found",
      status: 404,
    });
  }

  return apiSuccess({
    outcome: result.outcome,
    wrote: result.wrote,
  });
}
