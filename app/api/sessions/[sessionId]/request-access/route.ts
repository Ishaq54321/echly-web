import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { adminDb } from "@/lib/server/firebaseAdmin";
import {
  createAccessRequest,
  getRequestByUser,
} from "@/lib/repositories/accessRequestsRepository.server";
import { getSessionMember } from "@/lib/repositories/sessionMembersRepository.server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdRaw } = await params;
  const sessionId = typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (context.identityType !== "USER" || !context.userId?.trim()) {
    return apiError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  }

  const userId = context.userId.trim();

  if (!context.access?.capabilities.canView) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have access to this session",
      status: 403,
    });
  }

  if (context.access.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You already have resolve access",
      status: 403,
    });
  }

  const existing = await getRequestByUser(sessionId, userId);
  if (existing?.status === "pending") {
    return apiSuccess({
      type: "already_requested" as const,
    });
  }

  if (existing?.status === "approved") {
    const member = await getSessionMember(sessionId, userId);
    if (member?.access === "resolve") {
      return apiError({
        code: "INVALID_INPUT",
        message: "An approved access request already exists for this user",
        status: 400,
      });
    }
  }

  const userSnap = await adminDb.doc(`users/${userId}`).get();
  const requesterEmail =
    typeof userSnap.data()?.email === "string"
      ? userSnap.data()!.email.trim()
      : "";
  if (!requesterEmail) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing email on user profile",
      status: 400,
    });
  }

  try {
    await createAccessRequest({
      sessionId,
      requesterUserId: userId,
      requesterEmail,
      requestedAccess: "resolve",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("already_requested") ||
      msg.includes("already pending")
    ) {
      return apiSuccess({
        type: "already_requested" as const,
      });
    }
    throw e;
  }

  return apiSuccess({
    type: "request_created" as const,
  });
}
