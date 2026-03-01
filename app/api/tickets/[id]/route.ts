import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { requireAuth } from "@/lib/server/auth";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  getFeedbackByIdRepo,
  updateFeedbackRepo,
} from "@/lib/repositories/feedbackRepository";
import { updateSessionUpdatedAtRepo } from "@/lib/repositories/sessionsRepository";

/** GET /api/tickets/:id — return single ticket (feedback) from DB. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  console.log("[API] GET /api/tickets/[id] start");
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
    console.log("[API] GET /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(ticket),
    });
  } catch (err) {
    console.error("GET /api/tickets/[id]:", err);
    console.log("[API] GET /api/tickets/[id] duration (error):", Date.now() - start);
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
  const start = Date.now();
  console.log("[API] PATCH /api/tickets/[id] start");
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
  let body: { title?: string; description?: string; actionItems?: string[]; suggestedTags?: string[]; isResolved?: boolean };
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
  const updates: Parameters<typeof updateFeedbackRepo>[1] = {};
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.description === "string") updates.description = body.description;
  if (Array.isArray(body.actionItems)) updates.actionItems = body.actionItems;
  if (Array.isArray(body.suggestedTags)) updates.suggestedTags = body.suggestedTags;
  if (typeof body.isResolved === "boolean") updates.isResolved = body.isResolved;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(existingForOwnership),
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
    await updateSessionUpdatedAtRepo(updated.sessionId);
    console.log("[API] PATCH /api/tickets/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(updated),
    });
  } catch (err) {
    console.error("PATCH /api/tickets/[id]:", err);
    console.log("[API] PATCH /api/tickets/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
