import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import {
  getAccessRequest,
  listPendingAccessRequests,
  updateAccessRequestStatus,
} from "@/lib/repositories/accessRequestsRepository.server";
import { addSessionMember } from "@/lib/repositories/sessionMembersRepository.server";

export const dynamic = "force-dynamic";

export async function GET(
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

  if (!context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have permission to list access requests",
      status: 403,
    });
  }

  const pending = await listPendingAccessRequests(sessionId);

  return apiSuccess({
    requests: pending.map((r) => ({
      id: r.id,
      requesterUserId: r.requesterUserId,
      requesterEmail: r.requesterEmail,
      requestedAccess: r.requestedAccess,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });
}

export async function PATCH(
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

  if (!context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have permission to manage access requests",
      status: 403,
    });
  }

  if (!context.session || !context.userId?.trim()) {
    return apiError({
      code: "NOT_FOUND",
      message: "Not found",
      status: 404,
    });
  }

  let body: { requestId?: unknown; action?: unknown };
  try {
    body = (await req.json()) as { requestId?: unknown; action?: unknown };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
    });
  }

  const requestId =
    typeof body.requestId === "string" ? body.requestId.trim() : "";
  const action = typeof body.action === "string" ? body.action.trim() : "";

  if (!requestId || (action !== "approve" && action !== "reject")) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid requestId or action",
      status: 400,
    });
  }

  const accessRequest = await getAccessRequest(sessionId, requestId);
  if (!accessRequest) {
    return apiError({
      code: "NOT_FOUND",
      message: "Access request not found",
      status: 404,
    });
  }

  if (accessRequest.status !== "pending") {
    return apiError({
      code: "INVALID_INPUT",
      message: "Access request is not pending",
      status: 400,
    });
  }

  const approverId = context.userId.trim();

  if (action === "reject") {
    await updateAccessRequestStatus({
      sessionId,
      requestId: accessRequest.id,
      status: "rejected",
    });
    return apiSuccess({
      type: "rejected" as const,
    });
  }

  await updateAccessRequestStatus({
    sessionId,
    requestId: accessRequest.id,
    status: "approved",
  });

  await addSessionMember({
    sessionId,
    userId: accessRequest.requesterUserId.trim(),
    email: accessRequest.requesterEmail.trim(),
    access: "resolve",
    addedBy: approverId,
  });

  return apiSuccess({
    type: "approved" as const,
  });
}
