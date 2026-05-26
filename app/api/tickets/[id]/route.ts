import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  updateFeedbackRepo,
  updateFeedbackResolveAndSessionCountersRepo,
  deleteFeedbackWithSessionCountersRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository.server";
import { fireAndForget } from "@/lib/server/fireAndForget";
import { dispatchNotifications } from "@/lib/server/notificationFanOut.server";
import {
  maybeWriteConsolidatedEvent,
  resolveActorForActivityEvent,
} from "@/lib/repositories/activityEventsRepository.server";
import { diffMentionSets } from "@/lib/server/descriptionMentions";
import { log } from "@/lib/utils/logger";
import {
  withAuthorization,
  type HandlerContext,
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import {
  buildRequestContext,
  tryBuildRequestContext,
  type RequestContext,
} from "@/lib/server/requestContext";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { composeFullName } from "@/lib/utils/nameSplit";

async function resolveTicketWorkspaceId(
  req: Request,
  user: HandlerUser,
  ctx: HandlerContext,
  viewerWorkspaceId: string
) {
  const id = await routeParamId(ctx);
  const context = await buildRequestContext({
    req,
    authenticatedUser: user,
    userWorkspaceId: viewerWorkspaceId,
    feedbackId: id?.trim() || undefined,
    preloadedUserProfile: ctx.viewerUserProfile,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    feedback: context.feedback,
    session: context.session,
    // Phase 28.X — thread the just-resolved access forward so the handler's
    // buildRequestContext reuses it instead of re-running getAccessContext.
    access: context.access,
    accessRequest: context.accessRequest,
    sessionWorkspaceId: context.sessionWorkspaceId,
    userId: context.userId,
  };
}

/** GET /api/tickets/:id — optional auth; same access as GET /api/sessions/:id + share token. */
export async function GET(req: Request, ctx: HandlerContext) {
  const start = Date.now();
  log("[API] GET /api/tickets/[id] start");
  const id = await routeParamId(ctx);
  if (!id) {
    return apiError({ code: "INVALID_INPUT", message: "Missing ticket id", status: 400 });
  }

  try {
    const feedbackRow = await getFeedbackByIdRepo(id);
    if (!feedbackRow) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }

    const built = await tryBuildRequestContext({
      req,
      feedbackId: id,
      feedback: feedbackRow,
      optionalAuth: true,
    });
    if (!built.ok) {
      return built.response;
    }
    const context = built.ctx;

    if (!context.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }

    const sid = String(feedbackRow.sessionId ?? "").trim();
    if (!sid) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }

    const ticketJson = serializeTicket(feedbackRow, context.access!);

    log("[API] GET /api/tickets/[id] duration:", Date.now() - start);
    return apiSuccess({ ticket: ticketJson }, context.access!);
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    log("[API] GET /api/tickets/[id] duration (error):", Date.now() - start);
    return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
  }
}

/** PATCH /api/tickets/:id — update ticket; body: { title?, description?, tags?, isResolved? }. */
export const PATCH = withAuthorization(
  "resolve_feedback",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const start = Date.now();
    log("[API] PATCH /api/tickets/[id] start");
    let body: {
      title?: string;
      description?: string;
      tags?: string[];
      isResolved?: boolean;
      status?: "open" | "resolved";
      screenshotId?: string;
      assigneeId?: string | null;
      assigneeName?: string | null;
      assigneeAvatarUrl?: string | null;
      priority?: "high" | "medium" | "low" | null;
      /** Optional note included on resolve; surfaced in the ticket-resolved email. */
      resolutionNote?: string;
    };
    let id: string;
    try {
      const [idResult, jsonBody] = await Promise.all([routeParamId(ctx), req.json()]);
      id = idResult;
      body = jsonBody as typeof body;
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
    }
    if (!id) {
      return apiError({ code: "INVALID_INPUT", message: "Missing ticket id", status: 400 });
    }
    const traceResolveFlow =
      typeof body.status === "string" || typeof body.isResolved === "boolean";
    if (traceResolveFlow) {
      console.log(
        "[Resolve] Order: after routeParamId + req.json",
        Date.now() - start,
        "ms"
      );
    }

    const pre = ctx.preloaded;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      feedbackId: id,
      preloadedUserProfile: ctx.viewerUserProfile,
      ...(pre && pre.feedback !== undefined
        ? {
            feedback: pre.feedback as Feedback | null,
            session: pre.session as Session | null,
          }
        : {}),
      // Phase 28.X — when resolveTicketWorkspaceId already resolved access
      // for this same feedbackId, reuse it (skips a full getAccessContext
      // fan-out). `access` is present (incl. null) only when threaded.
      ...(pre && "access" in pre
        ? {
            preloadedAccess: {
              access: pre.access as RequestContext["access"],
              accessRequest:
                pre.accessRequest as RequestContext["accessRequest"],
              sessionWorkspaceId: pre.sessionWorkspaceId,
              userId: pre.userId ?? null,
            },
          }
        : {}),
    });
    if (traceResolveFlow) {
      console.log("[Resolve] Order: after buildRequestContext", Date.now() - start, "ms");
    }

    if (!context.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.feedback) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }

    const existingForOwnership = context.feedback as Feedback;

    type TicketWriteStatus = "open" | "resolved";
    let patchStatus: TicketWriteStatus | undefined;
    if (typeof body.status === "string") {
      if (body.status !== "open" && body.status !== "resolved") {
        return apiError({
          code: "INVALID_INPUT",
          message: "Invalid status; allowed: open, resolved",
          status: 400,
        });
      }
      patchStatus = body.status;
    } else if (typeof body.isResolved === "boolean") {
      patchStatus = body.isResolved ? "resolved" : "open";
    }

    const previousDescription =
      typeof existingForOwnership.description === "string"
        ? existingForOwnership.description
        : null;

    const contentUpdates: Parameters<typeof updateFeedbackRepo>[1] = {};
    if (typeof body.title === "string") contentUpdates.title = body.title;
    if (typeof body.description === "string") {
      if (!context.access?.isWorkspaceMember) {
        return apiError({
          code: "FORBIDDEN",
          message: "Only workspace members can edit the description",
          status: 403,
        });
      }
      contentUpdates.description = body.description;
    }
    if (typeof body.screenshotId === "string" && body.screenshotId.trim()) {
      if (!context.access?.isWorkspaceMember) {
        return apiError({ code: "FORBIDDEN", message: "Only workspace members can update the screenshot", status: 403 });
      }
      contentUpdates.screenshotId = body.screenshotId.trim();
    }
    if (Array.isArray(body.tags)) contentUpdates.tags = body.tags;

    // Assign support
    if ("assigneeId" in body) {
      if (!context.access?.capabilities.canResolve || !context.access?.isWorkspaceMember) {
        return apiError({ code: "FORBIDDEN", message: "Only workspace members with resolve access can assign tickets", status: 403 });
      }
      if (body.assigneeId === null) {
        contentUpdates.assigneeId = null;
        contentUpdates.assigneeName = null;
        contentUpdates.assigneeAvatarUrl = null;
      } else if (typeof body.assigneeId === "string") {
        let resolvedName: string | null = null;
        let resolvedAvatar: string | null = null;
        if (body.assigneeName !== undefined) {
          resolvedName = body.assigneeName;
          resolvedAvatar = body.assigneeAvatarUrl ?? null;
        } else {
          const userSnap = await adminDb.doc(`users/${body.assigneeId}`).get();
          if (!userSnap.exists) {
            return apiError({ code: "NOT_FOUND", message: "Assignee not found", status: 404 });
          }
          const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
          const composed = composeFullName(
            typeof userData.firstName === "string" ? userData.firstName : null,
            typeof userData.lastName === "string" ? userData.lastName : null
          );
          const emailLocal =
            typeof userData.email === "string"
              ? userData.email.split("@")[0] ?? ""
              : "";
          resolvedName = composed || emailLocal || null;
          resolvedAvatar =
            typeof userData.avatarUrl === "string" ? userData.avatarUrl :
            typeof userData.photoURL === "string" ? userData.photoURL : null;
        }
        contentUpdates.assigneeId = body.assigneeId;
        contentUpdates.assigneeName = resolvedName;
        contentUpdates.assigneeAvatarUrl = resolvedAvatar;
      }
    }

    // Priority support
    if ("priority" in body) {
      if (!context.access?.isWorkspaceMember) {
        return apiError({ code: "FORBIDDEN", message: "Only workspace members can set priority", status: 403 });
      }
      const p = body.priority;
      if (p !== null && p !== "high" && p !== "medium" && p !== "low") {
        return apiError({ code: "INVALID_INPUT", message: "Invalid priority; allowed: high, medium, low, null", status: 400 });
      }
      contentUpdates.priority = p ?? null;
    }

    const hasContent = Object.keys(contentUpdates).length > 0;

    if (!hasContent && patchStatus === undefined) {
      return apiSuccess(
        { ticket: serializeTicket(existingForOwnership, context.access!) },
        context.access!
      );
    }

    if (hasContent && !context.access?.capabilities.canComment) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (patchStatus !== undefined && !context.access?.capabilities.canResolve) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }

    try {
      if (patchStatus !== undefined) {
        console.log(
          "[Resolve] API start (pre-repo elapsed:",
          Date.now() - start,
          "ms)"
        );
        const actorId = context.userId?.trim() ?? user.uid.trim();
        if (!actorId) {
          return apiError({
            code: "UNAUTHORIZED",
            message: "Missing user",
            status: 401,
          });
        }
        const { status: _s, ...nonStatusUpdates } = contentUpdates;
        const hasNonStatusUpdates = Object.keys(nonStatusUpdates).length > 0;
        const typeIsChanging = "type" in contentUpdates;
        if (hasNonStatusUpdates) {
          await updateFeedbackRepo(id, nonStatusUpdates, { skipPreRead: !typeIsChanging });
        }
        const resolveResult = await updateFeedbackResolveAndSessionCountersRepo(
          id,
          actorId,
          {
            ...contentUpdates,
            status: patchStatus,
          }
        );
        if (resolveResult.kind === "missing") {
          return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
        }
        console.log("[Resolve] Repo done:", Date.now() - start, "ms");

        // Ticket-resolved email. Fires only on open → resolved transitions
        // (not reopen) and only when the reporter is someone other than the
        // resolver. Fire-and-forget; never blocks the route response.
        const wasOpen = existingForOwnership.isResolved === false;
        if (patchStatus === "resolved" && wasOpen) {
          const reporterUid =
            typeof existingForOwnership.userId === "string"
              ? existingForOwnership.userId.trim()
              : "";
          if (reporterUid && reporterUid !== actorId) {
            const ticketTitleForEmail =
              (typeof existingForOwnership.title === "string"
                ? existingForOwnership.title.trim()
                : "") || "a ticket";
            const sessionNameForEmail =
              (typeof context.session?.title === "string"
                ? context.session.title.trim()
                : "") || "a session";
            const resolutionNote =
              typeof body.resolutionNote === "string" &&
              body.resolutionNote.trim()
                ? body.resolutionNote.trim()
                : undefined;
            const sessionId = existingForOwnership.sessionId;
            fireAndForget("notification:ticket-resolved-email", async () => {
              const actor = await resolveActorForActivityEvent(actorId);
              const { sendTicketResolvedEmail } = await import(
                "@/lib/email/notificationEmails"
              );
              const { ticketUrl } = await import("@/lib/email/urls");
              await sendTicketResolvedEmail({
                recipientUid: reporterUid,
                actorUid: actorId,
                ticketTitle: ticketTitleForEmail,
                sessionName: sessionNameForEmail,
                resolverName: actor.actorName,
                ticketUrl: ticketUrl(sessionId, id),
                resolutionNote,
              });
            });
          }
        }
      } else {
        const typeIsChanging = "type" in contentUpdates;
        await updateFeedbackRepo(id, contentUpdates, { skipPreRead: !typeIsChanging });
        fireAndForget("PATCH-tickets-sessionUpdatedAt", () =>
          updateSessionUpdatedAtRepo(existingForOwnership.sessionId)
        );
      }

      // Phase 26.1 — per-ticket activity timeline. Diff the tracked
      // fields against the before-state we already hold
      // (existingForOwnership), so this needs no extra Firestore read.
      // Status (resolve/reopen) is intentionally NOT written here — it
      // is already written by updateFeedbackResolveAndSessionCountersRepo
      // (feedbackRepository.server.ts:625). Writing it here too would
      // double-log every resolve.
      {
        const activityActorId = (context.userId ?? user.uid).trim();
        const activityWorkspaceId = (context.sessionWorkspaceId ?? "").trim();
        const activitySessionId = existingForOwnership.sessionId;

        const priorityChanged =
          "priority" in contentUpdates &&
          (contentUpdates.priority ?? null) !==
            (existingForOwnership.priority ?? null);
        const assignmentChanged =
          "assigneeId" in contentUpdates &&
          (contentUpdates.assigneeId ?? null) !==
            (existingForOwnership.assigneeId ?? null);

        if (
          activityActorId &&
          activityWorkspaceId &&
          activitySessionId &&
          (priorityChanged || assignmentChanged)
        ) {
          const beforePriority = existingForOwnership.priority ?? null;
          const afterPriority = contentUpdates.priority ?? null;
          const beforeAssigneeId = existingForOwnership.assigneeId ?? null;
          const beforeAssigneeName =
            existingForOwnership.assigneeName ?? null;
          const afterAssigneeId = contentUpdates.assigneeId ?? null;
          const afterAssigneeName = contentUpdates.assigneeName ?? null;

          fireAndForget("activity:ticket.field.changed", async () => {
            const actor = await resolveActorForActivityEvent(
              activityActorId
            );
            if (priorityChanged) {
              await maybeWriteConsolidatedEvent({
                workspaceId: activityWorkspaceId,
                sessionId: activitySessionId,
                feedbackId: id,
                eventType: "ticket.priority.changed",
                actorId: activityActorId,
                actorName: actor.actorName,
                actorPhotoURL: actor.actorPhotoURL,
                metadata: { from: beforePriority, to: afterPriority },
              });
            }
            if (assignmentChanged) {
              await maybeWriteConsolidatedEvent({
                workspaceId: activityWorkspaceId,
                sessionId: activitySessionId,
                feedbackId: id,
                eventType: "ticket.assignment.changed",
                actorId: activityActorId,
                actorName: actor.actorName,
                actorPhotoURL: actor.actorPhotoURL,
                metadata: {
                  from: beforeAssigneeId
                    ? { uid: beforeAssigneeId, name: beforeAssigneeName }
                    : null,
                  to: afterAssigneeId
                    ? { uid: afterAssigneeId, name: afterAssigneeName }
                    : null,
                },
              });

              // Phase 5: ticket-assigned email. Only on a real (re)assignment
              // to someone OTHER than the actor — self-assignment and
              // unassignment (afterAssigneeId === null) send nothing.
              // assignmentChanged already guarantees after !== before.
              if (
                typeof afterAssigneeId === "string" &&
                afterAssigneeId.trim() &&
                afterAssigneeId !== activityActorId
              ) {
                const ticketTitleForEmail =
                  (typeof existingForOwnership.title === "string"
                    ? existingForOwnership.title.trim()
                    : "") || "a ticket";
                const sessionNameForEmail =
                  (typeof context.session?.title === "string"
                    ? context.session.title.trim()
                    : "") || "a session";
                try {
                  const { sendTicketAssignedEmail } = await import(
                    "@/lib/email/notificationEmails"
                  );
                  // Cooldown note: ticketAssigned fires here (~line 491),
                  // BEFORE the description-mention email (~line 568). When the
                  // same PATCH both reassigns a ticket TO Daniel and mentions
                  // Daniel in the new description, ticketAssigned lands first
                  // and the cooldown layer (lib/email/cooldowns.ts) suppresses
                  // the subsequent mention email — assignment is action-
                  // required, mention is informational, so assignment wins.
                  await sendTicketAssignedEmail({
                    assigneeUid: afterAssigneeId,
                    actorUid: activityActorId,
                    assignerName: actor.actorName,
                    ticketTitle: ticketTitleForEmail,
                    sessionName: sessionNameForEmail,
                    sessionId: activitySessionId,
                    feedbackId: id,
                  });
                } catch (err) {
                  console.error("[ticket-assigned-email] failed:", err);
                }
              }
            }
          });
        }
      }

      // Description @mention notifications. Only fires for newly-added mentions
      // (diffed against the previous description) so editing an unchanged
      // mention does not re-notify the user. Matches the comment.mention flow.
      if (
        typeof contentUpdates.description === "string" &&
        contentUpdates.description !== previousDescription
      ) {
        const newlyMentionedIds = diffMentionSets(
          previousDescription,
          contentUpdates.description
        );
        const actorId = (context.userId ?? user.uid).trim();
        const recipientIds = newlyMentionedIds.filter(
          (uid) => uid && uid !== actorId
        );
        if (recipientIds.length > 0) {
          const workspaceId = (context.sessionWorkspaceId ?? "").trim();
          const sessionId = existingForOwnership.sessionId;
          const feedbackTitle =
            (typeof existingForOwnership.title === "string"
              ? existingForOwnership.title.trim()
              : "") || "a ticket";
          const sessionTitle = context.session?.title ?? null;
          if (workspaceId && sessionId) {
            fireAndForget("notification:description-mention", async () => {
              const actor = await resolveActorForActivityEvent(actorId);
              await dispatchNotifications({
                recipientIds,
                workspaceId,
                sessionId,
                sessionTitle,
                feedbackId: id,
                type: "description.mention",
                actor: {
                  id: actorId,
                  name: actor.actorName,
                  photoURL: actor.actorPhotoURL ?? null,
                },
                title: `${actor.actorName} mentioned you in the description of "${feedbackTitle}"`,
                entityTitle: feedbackTitle,
                body: null,
              });

              // Mirror the comment.mention email path so description mentions
              // also send the mention email (not just an in-app notification).
              // recipientIds already excludes the actor (self-mention guard
              // above). The description is rich-text HTML; convert it to plain
              // text so mention spans render as "@Name" and tags don't leak.
              const emailSessionName = sessionTitle || "a session";
              const { sendMentionEmail } = await import(
                "@/lib/email/notificationEmails"
              );
              const { descriptionToPlainText } = await import(
                "@/lib/email/helpers"
              );
              const descriptionPreview = descriptionToPlainText(
                contentUpdates.description ?? ""
              );
              await Promise.allSettled(
                recipientIds.map((uid) =>
                  sendMentionEmail({
                    recipientUid: uid,
                    actorUid: actorId,
                    mentionerName: actor.actorName,
                    ticketTitle: feedbackTitle,
                    sessionName: emailSessionName,
                    message: descriptionPreview,
                    sessionId,
                    feedbackId: id,
                  })
                )
              );
            });
          }
        }
      }

      const updated: Feedback = {
        ...existingForOwnership,
        ...contentUpdates,
        ...(patchStatus !== undefined ? { status: patchStatus } : {}),
        ...("assigneeId" in contentUpdates ? {
          assigneeId: contentUpdates.assigneeId ?? null,
          assigneeName: contentUpdates.assigneeName ?? null,
          assigneeAvatarUrl: contentUpdates.assigneeAvatarUrl ?? null,
        } : {}),
        ...("priority" in contentUpdates ? { priority: contentUpdates.priority ?? null } : {}),
      };
      if (traceResolveFlow) {
        console.log(
          "[Resolve] Order: merged ticket (no post-write fetch)",
          Date.now() - start,
          "ms"
        );
      }
      log("[API] PATCH /api/tickets/[id] duration:", Date.now() - start);
      if (patchStatus !== undefined) {
        console.log("[Resolve] Total API time:", Date.now() - start, "ms");
      }
      return apiSuccess(
        { ticket: serializeTicket(updated, context.access!) },
        context.access!
      );
    } catch (err) {
      console.error("PATCH /api/tickets/[id]:", err);
      log("[API] PATCH /api/tickets/[id] duration (error):", Date.now() - start);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  { resolveWorkspace: resolveTicketWorkspaceId }
);

/** DELETE /api/tickets/:id — permanently delete ticket (feedback) from DB. */
export const DELETE = withAuthorization(
  "delete_feedback",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const start = Date.now();
    log("[API] DELETE /api/tickets/[id] start");
    const id = await routeParamId(ctx);
    if (!id) {
      return apiError({ code: "INVALID_INPUT", message: "Missing ticket id", status: 400 });
    }

    try {
      const pre = ctx.preloaded;
      const context = await buildRequestContext({
        req,
        authenticatedUser: user,
        userWorkspaceId,
        feedbackId: id,
        preloadedUserProfile: ctx.viewerUserProfile,
        ...(pre && pre.feedback !== undefined
          ? {
              feedback: pre.feedback as Feedback | null,
              session: pre.session as Session | null,
            }
          : {}),
        ...(pre && "access" in pre
          ? {
              preloadedAccess: {
                access: pre.access as RequestContext["access"],
                accessRequest:
                  pre.accessRequest as RequestContext["accessRequest"],
                sessionWorkspaceId: pre.sessionWorkspaceId,
                userId: pre.userId ?? null,
              },
            }
          : {}),
      });
      if (!context.access?.capabilities.canView) {
        return apiError({
          code: "FORBIDDEN",
          message: "You do not have access",
          status: 403,
        });
      }
      if (!context.access?.capabilities.canDeleteTicket) {
        return apiError({
          code: "FORBIDDEN",
          message: "You do not have access",
          status: 403,
        });
      }
      if (!context.feedback) {
        return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
      }
      await deleteFeedbackWithSessionCountersRepo(id, {
        actorId: user.uid,
        sessionTitle: context.session?.title ?? null,
      });
      log("[API] DELETE /api/tickets/[id] duration:", Date.now() - start);
      return apiSuccess({}, context.access!);
    } catch (err) {
      console.error("DELETE /api/tickets/[id]:", err);
      log("[API] DELETE /api/tickets/[id] duration (error):", Date.now() - start);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  { resolveWorkspace: resolveTicketWorkspaceId }
);
