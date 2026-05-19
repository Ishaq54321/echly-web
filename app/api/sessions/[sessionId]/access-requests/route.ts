import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { adminDb } from "@/lib/server/firebaseAdmin";
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
import { composeFullName } from "@/lib/utils/nameSplit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

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
            composeFullName(
              typeof requesterUser?.firstName === "string" ? requesterUser.firstName : null,
              typeof requesterUser?.lastName === "string" ? requesterUser.lastName : null
            ) ||
            accessRequest.requesterEmail?.split("@")[0]?.trim() ||
            null;
        } catch {
          rejectedRequesterName = accessRequest.requesterEmail?.split("@")[0] ?? null;
        }
      }

      const actor = await resolveActorForActivityEvent(approverId);
      const sessionTitle = sessionTitleFromSessionRow(context.session);
      // Phase 28.X — request status is already committed (awaited above); the
      // response does not depend on the activity event. Offload the write so
      // reject returns immediately; the activity log catches up via the
      // realtime listener. (Notification/email below are already off-path.)
      fireAndForget("access_request.rejected:activityEvent", async () => {
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

      fireAndForget("cleanup:access_request_notifications", async () => {
        try {
          const { resolveAccessRequestNotifications } = await import(
            "@/lib/repositories/notificationsRepository.server"
          );
          await resolveAccessRequestNotifications({
            accessRequestId: requestId,
            sessionId,
            actorUserId: approverId,
            newStatus: "rejected",
            resolvedByName: actor.actorName || "Someone",
          });
        } catch (err) {
          console.error("[NOTIFICATION] access request cleanup failed:", err);
        }
      });

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

  const grantedAccess: "view" | "resolve" =
    accessLevel ?? accessRequest.requestedAccess ?? "resolve";

  try {
    await addSessionMember({
      sessionId,
      workspaceId: context.session.workspaceId.trim(),
      userId: accessRequest.requesterUserId.trim(),
      email: accessRequest.requesterEmail.trim(),
      access: grantedAccess,
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
          composeFullName(
            typeof requesterUser?.firstName === "string" ? requesterUser.firstName : null,
            typeof requesterUser?.lastName === "string" ? requesterUser.lastName : null
          ) ||
          accessRequest.requesterEmail?.split("@")[0]?.trim() ||
          null;
      } catch {
        approvedRequesterName = accessRequest.requesterEmail?.split("@")[0] ?? null;
      }
    }

    const actor = await resolveActorForActivityEvent(approverId);
    const sessionTitle = sessionTitleFromSessionRow(context.session);
    // Phase 28.X — the member add + request status are already committed
    // (awaited above); the canonical-item response does not depend on the
    // activity event. Offload the write so approve returns immediately; the
    // activity log catches up via the realtime listener.
    fireAndForget("access_request.approved:activityEvent", async () => {
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

    fireAndForget("cleanup:access_request_notifications", async () => {
      try {
        const { resolveAccessRequestNotifications } = await import(
          "@/lib/repositories/notificationsRepository.server"
        );
        await resolveAccessRequestNotifications({
          accessRequestId: requestId,
          sessionId,
          actorUserId: approverId,
          newStatus: "approved",
          resolvedByName: actor.actorName || "Someone",
        });
      } catch (err) {
        console.error("[NOTIFICATION] access request cleanup failed:", err);
      }
    });

    void sendAccessRequestResultEmail({
      to: accessRequest.requesterEmail,
      approved: true,
      sessionName: sessionTitle,
      sessionUrl: `${APP_URL}/dashboard/${sessionId}`,
      workspaceName: workspaceId,
    }).catch(() => {});
  }

  // Canonical member row — same shape GET /members produces per item, so the
  // client can reconcile its optimistic row in place without a re-fetch.
  const requesterUid = accessRequest.requesterUserId.trim();
  const approvedUserSnap = await adminDb.doc(`users/${requesterUid}`).get();
  const approvedUserData = approvedUserSnap.exists
    ? approvedUserSnap.data()
    : null;
  const approvedAvatarUrl =
    (approvedUserData?.avatarUrl as string | null | undefined) ??
    (approvedUserData?.photoURL as string | null | undefined) ??
    null;

  return apiSuccess({
    type: "approved" as const,
    item: {
      type: "member" as const,
      id: requesterUid,
      email: accessRequest.requesterEmail.trim(),
      access: grantedAccess,
      status: "active" as const,
      avatarUrl: approvedAvatarUrl,
    },
  });
}
