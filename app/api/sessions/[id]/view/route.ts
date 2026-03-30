import { recordSessionViewIfNewRepo } from "@/lib/repositories/sessionsRepository.server";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
  }
  const rateKey = `session-view:${id}:${clientKeyFromRequest(req)}`;
  const rate = checkRateLimit({ key: rateKey, max: 60, windowMs: 60_000 });
  if (!rate.allowed) {
    return apiError({
      code: "FORBIDDEN",
      message: "Too Many Requests",
      status: 429,
    });
  }

  let body: { token?: unknown; shareToken?: unknown } = {};
  try {
    body = (await req.json()) as { token?: unknown; shareToken?: unknown };
  } catch {
    body = {};
  }

  const tokenFromBody =
    (typeof body.token === "string" ? body.token.trim() : "") ||
    (typeof body.shareToken === "string" ? body.shareToken.trim() : "");

  const built = await tryBuildRequestContext({
    req,
    sessionId: id,
    optionalAuth: true,
    bodyShareToken: tokenFromBody !== "" ? tokenFromBody : null,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (!context.access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }

  try {
    if (context.userId) {
      await recordSessionViewIfNewRepo(id, context.userId);
    }
    return apiSuccess({});
  } catch (err) {
    console.error("POST /api/sessions/[id]/view:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}
