import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  getFeedbackByIdRepo,
  updateFeedbackRepo,
  updateFeedbackResolveAndSessionCountersRepo,
  deleteFeedbackWithSessionCountersRepo,
} from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo, updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { log } from "@/lib/utils/logger";
import { getCachedWorkspace } from "@/lib/server/cache/workspaceCache";

/** GET /api/tickets/:id — return single ticket (feedback) from DB. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  log("[API] GET /api/tickets/[id] start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
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
    if (ticket.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const session = await getSessionByIdRepo(ticket.sessionId);
    const workspaceId = session?.workspaceId ?? session?.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    try {
      await getCachedWorkspace(workspaceId, () => resolveWorkspaceById(workspaceId));
    } catch (err) {
      if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
        return NextResponse.json(
          { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
          { status: 403 }
        );
      }
      throw err;
    }
    log("[API] GET /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(ticket),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    console.error("GET /api/tickets/[id]:", err);
    log("[API] GET /api/tickets/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** PATCH /api/tickets/:id — update ticket; body: { title?, instruction?, actionSteps?, suggestedTags?, isResolved? }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  log("[API] PATCH /api/tickets/[id] start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
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
    isSkipped?: boolean;
    status?: "open" | "resolved" | "skipped";
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
  if (existingForOwnership.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  const session = await getSessionByIdRepo(existingForOwnership.sessionId);
  const workspaceId = session?.workspaceId ?? session?.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await getCachedWorkspace(workspaceId, () => resolveWorkspaceById(workspaceId));
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    throw err;
  }
  const updates: Parameters<typeof updateFeedbackRepo>[1] = {};
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.instruction === "string") updates.instruction = body.instruction;
  else if (typeof body.description === "string") updates.instruction = body.description;
  if (Array.isArray(body.actionSteps)) updates.actionSteps = body.actionSteps;
  if (Array.isArray(body.suggestedTags)) updates.suggestedTags = body.suggestedTags;
  if (typeof body.status === "string") {
    if (body.status === "resolved") {
      updates.isResolved = true;
      updates.isSkipped = false;
    } else if (body.status === "skipped") {
      updates.isResolved = false;
      updates.isSkipped = true;
    } else if (body.status === "open") {
      updates.isResolved = false;
      updates.isSkipped = false;
    }
  } else {
    if (typeof body.isResolved === "boolean") updates.isResolved = body.isResolved;
    if (typeof body.isSkipped === "boolean") updates.isSkipped = body.isSkipped;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(existingForOwnership),
    });
  }
  const statusChange =
    typeof updates.isResolved === "boolean" || typeof updates.isSkipped === "boolean";
  try {
    if (statusChange) {
      const targetResolved = updates.isResolved ?? existingForOwnership.isResolved;
      const targetSkipped = updates.isSkipped ?? existingForOwnership.isSkipped ?? false;
      await updateFeedbackResolveAndSessionCountersRepo(id, {
        ...updates,
        isResolved: targetSkipped ? false : targetResolved,
        isSkipped: targetSkipped,
      });
    } else {
      await updateFeedbackRepo(id, updates);
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
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    console.error("PATCH /api/tickets/[id]:", err);
    log("[API] PATCH /api/tickets/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** DELETE /api/tickets/:id — permanently delete ticket (feedback) from DB. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  log("[API] DELETE /api/tickets/[id] start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
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
    if (existingForOwnership.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    const session = await getSessionByIdRepo(existingForOwnership.sessionId);
    const workspaceId = session?.workspaceId ?? session?.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    try {
      await getCachedWorkspace(workspaceId, () => resolveWorkspaceById(workspaceId));
    } catch (err) {
      if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
        return NextResponse.json(
          { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
          { status: 403 }
        );
      }
      throw err;
    }

    await deleteFeedbackWithSessionCountersRepo(id);
    log("[API] DELETE /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    console.error("DELETE /api/tickets/[id]:", err);
    log("[API] DELETE /api/tickets/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
