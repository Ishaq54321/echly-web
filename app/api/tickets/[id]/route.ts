import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  updateFeedbackRepo,
  updateFeedbackResolveAndSessionCountersRepo,
  deleteFeedbackWithSessionCountersRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository.server";
import { fireAndForget } from "@/lib/server/fireAndForget";
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
      } else {
        const typeIsChanging = "type" in contentUpdates;
        await updateFeedbackRepo(id, contentUpdates, { skipPreRead: !typeIsChanging });
        fireAndForget("PATCH-tickets-sessionUpdatedAt", () =>
          updateSessionUpdatedAtRepo(existingForOwnership.sessionId)
        );
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
