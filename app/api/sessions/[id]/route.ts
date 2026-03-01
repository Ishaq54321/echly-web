import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { requireAuth } from "@/lib/server/auth";
import {
  deleteSessionRepo,
  getSessionByIdRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
} from "@/lib/repositories/sessionsRepository";

type PatchBody = { title?: string; archived?: boolean };

/** PATCH /api/sessions/:id — update session; body: { title?: string, archived?: boolean }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing session id" },
      { status: 400 }
    );
  }
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const existing = await getSessionByIdRepo(id);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
  if (existing.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const hasTitle = typeof body.title === "string" && body.title.trim() !== "";
  const hasArchived = typeof body.archived === "boolean";

  if (!hasTitle && !hasArchived) {
    return NextResponse.json({
      success: true,
      session: serializeSession(existing),
    });
  }

  try {
    if (hasTitle) {
      await updateSessionTitleRepo(id, body.title!.trim());
    }
    if (hasArchived) {
      await updateSessionArchivedRepo(id, body.archived!);
    }
    const updated = await getSessionByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      session: serializeSession(updated),
    });
  } catch (err) {
    console.error("PATCH /api/sessions/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** DELETE /api/sessions/:id — permanently delete session and all tickets/comments. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing session id" },
      { status: 400 }
    );
  }
  const existing = await getSessionByIdRepo(id);
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }
  if (existing.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  try {
    await deleteSessionRepo(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/sessions/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  const updatedAt = session.updatedAt as { toDate?: () => Date } | null | undefined;
  if (updatedAt != null && typeof updatedAt.toDate === "function") {
    out.updatedAt = updatedAt.toDate().toISOString();
  }
  return out;
}
