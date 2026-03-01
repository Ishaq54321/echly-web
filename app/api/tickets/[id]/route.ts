import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import {
  getFeedbackByIdRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";

/** GET /api/tickets/:id — return single ticket (feedback) from DB. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(ticket),
    });
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** PATCH /api/tickets/:id — update ticket; body: { title?, description?, actionItems? }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing ticket id" },
      { status: 400 }
    );
  }
  let body: { title?: string; description?: string; actionItems?: string[]; suggestedTags?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const updates: Parameters<typeof updateFeedbackRepo>[1] = {};
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.description === "string") updates.description = body.description;
  if (Array.isArray(body.actionItems)) updates.actionItems = body.actionItems;
  if (Array.isArray(body.suggestedTags)) updates.suggestedTags = body.suggestedTags;

  if (Object.keys(updates).length === 0) {
    const existing = await getFeedbackByIdRepo(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(existing),
    });
  }
  try {
    await updateFeedbackRepo(id, updates);
    const updated = await getFeedbackByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    // Update only this ticket's parent session last activity (no other sessions)
    await updateSessionUpdatedAtRepo(updated.sessionId);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(updated),
    });
  } catch (err) {
    console.error("PATCH /api/tickets/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** Make Firestore Timestamp JSON-serializable for API response. */
function serializeTicket(ticket: Feedback): Record<string, unknown> {
  const out = { ...ticket } as Record<string, unknown>;
  const createdAt = ticket.createdAt as { toDate?: () => Date } | null;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  return out;
}
