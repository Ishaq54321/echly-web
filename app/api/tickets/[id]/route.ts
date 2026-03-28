import { NextResponse } from "next/server";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  getFeedbackByIdRepo,
  updateFeedbackRepo,
  updateFeedbackResolveAndSessionCountersRepo,
  deleteFeedbackWithSessionCountersRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo, updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository.server";
import { log } from "@/lib/utils/logger";
import { requireTicketActorPermission } from "@/lib/server/sessionActorPermissions";
import {
  withAuthorization,
  type HandlerContext,
} from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { sessionWorkspaceId, userWorkspaceMatchesSession } from "@/lib/server/sessionWorkspaceScope";

async function resolveTicketWorkspaceId(
  _req: Request,
  _user: { uid: string },
  ctx: HandlerContext
): Promise<string> {
  const id = await routeParamId(ctx);
  const ticket = id ? await getFeedbackByIdRepo(id) : null;
  const session = ticket ? await getSessionByIdRepo(ticket.sessionId) : null;
  return sessionWorkspaceId(session) ?? "";
}

/** GET /api/tickets/:id — return single ticket (feedback) from DB. */
export const GET = withAuthorization(
  "read_feedback",
  async (
  req: Request,
  ctx: HandlerContext,
  { user }: { user: { uid: string } }
) => {
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
    const ticket = await getFeedbackByIdRepo(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    const session = await getSessionByIdRepo(ticket.sessionId);
    const viewGate = await requireTicketActorPermission(user, ticket, session, "view");
    if (!viewGate.ok) {
      return NextResponse.json(
        { success: false, error: viewGate.message },
        { status: viewGate.status }
      );
    }
    if (!(await userWorkspaceMatchesSession(user.uid, session))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    log("[API] GET /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(ticket),
    });
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    log("[API] GET /api/tickets/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
},
  { resolveWorkspace: resolveTicketWorkspaceId }
);

/** PATCH /api/tickets/:id — update ticket; body: { title?, instruction?, actionSteps?, suggestedTags?, isResolved? }. */
export const PATCH = withAuthorization(
  "resolve_feedback",
  async (
  req: Request,
  ctx: HandlerContext,
  { user }: { user: { uid: string } }
) => {
  const start = Date.now();
  log("[API] PATCH /api/tickets/[id] start");
  const id = await routeParamId(ctx);
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing ticket id" },
      { status: 400 }
    );
  }
  let body: {
    title?: string;
    instruction?: string;
    description?: string;
    actionSteps?: string[];
    suggestedTags?: string[];
    isResolved?: boolean;
    status?: "open" | "resolved";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const existingForOwnership = await getFeedbackByIdRepo(id);
  if (!existingForOwnership) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
  const session = await getSessionByIdRepo(existingForOwnership.sessionId);
  const resolveGate = await requireTicketActorPermission(
    user,
    existingForOwnership,
    session,
    "resolve"
  );
  if (!resolveGate.ok) {
    return NextResponse.json(
      { success: false, error: resolveGate.message },
      { status: resolveGate.status }
    );
  }
  if (!(await userWorkspaceMatchesSession(user.uid, session))) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
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
      ticket: serializeTicket(existingForOwnership),
    });
  }

  try {
    if (patchStatus !== undefined) {
      await updateFeedbackResolveAndSessionCountersRepo(id, {
        ...contentUpdates,
        status: patchStatus,
      });
    } else {
      await updateFeedbackRepo(id, contentUpdates);
      await updateSessionUpdatedAtRepo(existingForOwnership.sessionId);
    }
    const updated = await getFeedbackByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    log("[API] PATCH /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(updated),
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
  { user }: { user: { uid: string } }
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
    const existingForOwnership = await getFeedbackByIdRepo(id);
    if (!existingForOwnership) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    const session = await getSessionByIdRepo(existingForOwnership.sessionId);
    const delGate = await requireTicketActorPermission(
      user,
      existingForOwnership,
      session,
      "resolve"
    );
    if (!delGate.ok) {
      return NextResponse.json(
        { success: false, error: delGate.message },
        { status: delGate.status }
      );
    }
    if (!(await userWorkspaceMatchesSession(user.uid, session))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
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
