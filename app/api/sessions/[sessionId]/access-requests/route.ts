import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import {
  getAccessRequest,
  listPendingAccessRequests,
  updateAccessRequestStatus,
} from "@/lib/repositories/accessRequestsRepository.server";
import { addSessionMember } from "@/lib/repositories/sessionMembersRepository.server";
import {
  createActivityEvent,
  resolveActorForActivityEvent,
  sessionTitleFromSessionRow,
} from "@/lib/repositories/activityEventsRepository.server";
import { sendAccessRequestResultEmail } from "@/lib/email/workspaceEmails";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import { fireAndForget } from "@/lib/server/fireAndForget";
import { dispatchNotifications } from "@/lib/server/notificationFanOut.server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";

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

  const isWorkspaceMemberAR = context.access?.isWorkspaceMember === true;
  const isOwnerAR = context.access?.capabilities.canDeleteTicket === true;
  if (!context.access?.capabilities.canResolve || (!isWorkspaceMemberAR && !isOwnerAR)) {
    return apiError({
      code: "FORBIDDEN",
      message: "Only workspace members can manage access requests",
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

  let body: { requestId?: unknown; action?: unknown; access?: unknown };
  try {
    body = (await req.json()) as { requestId?: unknown; action?: unknown; access?: unknown };
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
  const accessLevel =
    body.access === "view" || body.access === "resolve"
      ? body.access
      : null;

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
    const workspaceId =
      typeof context.session.workspaceId === "string"
        ? context.session.workspaceId.trim()
        : "";
    if (workspaceId) {
      let rejectedRequesterName: string | null = null;
      if (accessRequest.requesterUserId) {
        try {
          const requesterUser = await getUserByIdRepo(accessRequest.requesterUserId);
          rejectedRequesterName =
            requesterUser?.name?.trim() ||
            accessRequest.requesterEmail?.split("@")[0]?.trim() ||
            null;
        } catch {
          rejectedRequesterName = accessRequest.requesterEmail?.split("@")[0] ?? null;
        }
      }

      const actor = await resolveActorForActivityEvent(approverId);
      const sessionTitle = sessionTitleFromSessionRow(context.session);
      await createActivityEvent({
        workspaceId,
        sessionId,
        eventType: "access_request.rejected",
        actorId: approverId,
        actorName: actor.actorName,
        actorPhotoURL: actor.actorPhotoURL,
        metadata: {
          sessionTitle,
          requesterEmail: accessRequest.requesterEmail ?? null,
          requesterUserId: accessRequest.requesterUserId ?? null,
          requesterName: rejectedRequesterName ?? null,
        },
      });

      const rejectedRequesterId =
        typeof accessRequest.requesterUserId === "string"
          ? accessRequest.requesterUserId.trim()
          : "";
      if (rejectedRequesterId && rejectedRequesterId !== approverId) {
        fireAndForget("notification:access_request.rejected", async () => {
          await dispatchNotifications({
            recipientIds: [rejectedRequesterId],
            workspaceId,
            sessionId,
            sessionTitle: sessionTitle || null,
            type: "access_request.rejected",
            actor: {
              id: approverId,
              name: actor.actorName,
              photoURL: actor.actorPhotoURL ?? null,
            },
            title: `Your access request for "${sessionTitle || "a session"}" was declined`,
            entityTitle: sessionTitle || null,
            body: null,
          });
        });
      }
      void sendAccessRequestResultEmail({
        to: accessRequest.requesterEmail,
        approved: false,
        sessionName: sessionTitle,
        sessionUrl: `${APP_URL}/dashboard/${sessionId}`,
        workspaceName: workspaceId,
      }).catch(() => {});
    }
    return apiSuccess({
      type: "rejected" as const,
    });
  }

  try {
    await addSessionMember({
      sessionId,
      workspaceId: context.session.workspaceId.trim(),
      userId: accessRequest.requesterUserId.trim(),
      email: accessRequest.requesterEmail.trim(),
      access: accessLevel ?? accessRequest.requestedAccess ?? "resolve",
      actorId: approverId,
      source: "access_request",
    });
  } catch (err) {
    console.error("[access-requests] addSessionMember failed (request left pending)", err);
    throw err;
  }

  await updateAccessRequestStatus({
    sessionId,
    requestId: accessRequest.id,
    status: "approved",
  });

  const workspaceId =
    typeof context.session.workspaceId === "string"
      ? context.session.workspaceId.trim()
      : "";
  if (workspaceId) {
    let approvedRequesterName: string | null = null;
    if (accessRequest.requesterUserId) {
      try {
        const requesterUser = await getUserByIdRepo(accessRequest.requesterUserId);
        approvedRequesterName =
          requesterUser?.name?.trim() ||
          accessRequest.requesterEmail?.split("@")[0]?.trim() ||
          null;
      } catch {
        approvedRequesterName = accessRequest.requesterEmail?.split("@")[0] ?? null;
      }
    }

    const actor = await resolveActorForActivityEvent(approverId);
    const sessionTitle = sessionTitleFromSessionRow(context.session);
    await createActivityEvent({
      workspaceId,
      sessionId,
      eventType: "access_request.approved",
      actorId: approverId,
      actorName: actor.actorName,
      actorPhotoURL: actor.actorPhotoURL,
      metadata: {
        sessionTitle,
        requesterEmail: accessRequest.requesterEmail ?? null,
        requesterUserId: accessRequest.requesterUserId ?? null,
        requesterName: approvedRequesterName ?? null,
        accessLevel: accessLevel ?? null,
      },
    });

    const approvedRequesterId =
      typeof accessRequest.requesterUserId === "string"
        ? accessRequest.requesterUserId.trim()
        : "";
    if (approvedRequesterId && approvedRequesterId !== approverId) {
      fireAndForget("notification:access_request.approved", async () => {
        await dispatchNotifications({
          recipientIds: [approvedRequesterId],
          workspaceId,
          sessionId,
          sessionTitle: sessionTitle || null,
          type: "access_request.approved",
          actor: {
            id: approverId,
            name: actor.actorName,
            photoURL: actor.actorPhotoURL ?? null,
          },
          title: `Your access to "${sessionTitle || "a session"}" was approved`,
          entityTitle: sessionTitle || null,
          body: null,
        });
      });
    }
    void sendAccessRequestResultEmail({
      to: accessRequest.requesterEmail,
      approved: true,
      sessionName: sessionTitle,
      sessionUrl: `${APP_URL}/dashboard/${sessionId}`,
      workspaceName: workspaceId,
    }).catch(() => {});
  }

  return apiSuccess({
    type: "approved" as const,
  });
}
