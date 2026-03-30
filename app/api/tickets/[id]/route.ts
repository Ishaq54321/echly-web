import { NextResponse } from "next/server";
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
  resolveOptionalSessionViewer,
} from "@/lib/server/requestContext";
import type { Feedback } from "@/lib/domain/feedback";
import type { Session } from "@/lib/domain/session";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { accessContextToResponseBody } from "@/lib/access/resolveAccess";
import { getFeedbackByIdRepo } from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";

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
    return NextResponse.json(
      { success: false, error: "Missing ticket id" },
      { status: 400 }
    );
  }

  try {
    const { viewerUser, tokenString } = await resolveOptionalSessionViewer(req);
    const feedbackRow = await getFeedbackByIdRepo(id);
    const sid = String(feedbackRow?.sessionId ?? "").trim();
    const loadedSession = sid ? await getSessionByIdRepo(sid) : null;
    const { access } = await getAccessContext({
      sessionId: sid,
      user: viewerUser,
      session: loadedSession,
      tokenString,
    });

    if (!access?.capabilities.canView) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!feedbackRow) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    if (!sid) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const ticketJson = serializeTicket(feedbackRow, access);
    const accessJson = accessContextToResponseBody(access);

    log("[API] GET /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: ticketJson,
      access: accessJson,
    });
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    log("[API] GET /api/tickets/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** PATCH /api/tickets/:id — update ticket; body: { title?, instruction?, actionSteps?, suggestedTags?, isResolved? }. */
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
      instruction?: string;
      description?: string;
      actionSteps?: string[];
      suggestedTags?: string[];
      isResolved?: boolean;
      status?: "open" | "resolved";
    };
    let id: string;
    try {
      const [idResult, jsonBody] = await Promise.all([
        routeParamId(ctx),
        req.json(),
      ]);
      id = idResult;
      body = jsonBody as typeof body;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing ticket id" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    if (!context.feedback) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    const existingForOwnership = context.feedback as Feedback;

    type TicketWriteStatus = "open" | "resolved";
    let patchStatus: TicketWriteStatus | undefined;
    if (typeof body.status === "string") {
      if (body.status !== "open" && body.status !== "resolved") {
        return NextResponse.json(
          { success: false, error: "Invalid status; allowed: open, resolved" },
          { status: 400 }
        );
      }
      patchStatus = body.status;
    } else if (typeof body.isResolved === "boolean") {
      patchStatus = body.isResolved ? "resolved" : "open";
    }

    const contentUpdates: Parameters<typeof updateFeedbackRepo>[1] = {};
    if (typeof body.title === "string") contentUpdates.title = body.title;
    if (typeof body.instruction === "string") contentUpdates.instruction = body.instruction;
    else if (typeof body.description === "string") contentUpdates.instruction = body.description;
    if (Array.isArray(body.actionSteps)) contentUpdates.actionSteps = body.actionSteps;
    if (Array.isArray(body.suggestedTags)) contentUpdates.suggestedTags = body.suggestedTags;

    const hasContent = Object.keys(contentUpdates).length > 0;

    if (!hasContent && patchStatus === undefined) {
      return NextResponse.json({
        success: true,
        ticket: serializeTicket(existingForOwnership, context.access!),
      });
    }

    if (hasContent && !context.access?.capabilities.canComment) {
      return NextResponse.json(
        { success: false, error: "Insufficient permission" },
        { status: 403 }
      );
    }
    if (patchStatus !== undefined && !context.access?.capabilities.canResolve) {
      return NextResponse.json(
        { success: false, error: "Insufficient permission" },
        { status: 403 }
      );
    }

    try {
      if (patchStatus !== undefined) {
        console.log(
          "[Resolve] API start (pre-repo elapsed:",
          Date.now() - start,
          "ms)"
        );
        const resolveResult = await updateFeedbackResolveAndSessionCountersRepo(id, {
          ...contentUpdates,
          status: patchStatus,
        });
        if (resolveResult.kind === "missing") {
          return NextResponse.json(
            { success: false, error: "Not found" },
            { status: 404 }
          );
        }
        console.log("[Resolve] Repo done:", Date.now() - start, "ms");
      } else {
        await updateFeedbackRepo(id, contentUpdates);
        fireAndForget("PATCH-tickets-sessionUpdatedAt", () =>
          updateSessionUpdatedAtRepo(existingForOwnership.sessionId)
        );
      }
      const updated: Feedback = {
        ...existingForOwnership,
        ...contentUpdates,
        ...(patchStatus !== undefined ? { status: patchStatus } : {}),
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
      return NextResponse.json({
        success: true,
        ticket: serializeTicket(updated, context.access!),
      });
    } catch (err) {
      console.error("PATCH /api/tickets/[id]:", err);
      log("[API] PATCH /api/tickets/[id] duration (error):", Date.now() - start);
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 }
      );
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
      return NextResponse.json(
        { success: false, error: "Missing ticket id" },
        { status: 400 }
      );
    }

    try {
      const pre = ctx.preloaded;
      const context = await buildRequestContext({
        req,
        authenticatedUser: user,
        userWorkspaceId,
        feedbackId: id,
        ...(pre && pre.feedback !== undefined
          ? {
              feedback: pre.feedback as Feedback | null,
              session: pre.session as Session | null,
            }
          : {}),
      });
      if (!context.access?.capabilities.canView) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }
      if (!context.access?.capabilities.canDeleteTicket) {
        return NextResponse.json(
          { success: false, error: "Insufficient permission" },
          { status: 403 }
        );
      }
      if (!context.feedback) {
        return NextResponse.json(
          { success: false, error: "Not found" },
          { status: 404 }
        );
      }
      await deleteFeedbackWithSessionCountersRepo(id);
      log("[API] DELETE /api/tickets/[id] duration:", Date.now() - start);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("DELETE /api/tickets/[id]:", err);
      log("[API] DELETE /api/tickets/[id] duration (error):", Date.now() - start);
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 }
      );
    }
  },
  { resolveWorkspace: resolveTicketWorkspaceId }
);
