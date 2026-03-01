import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import {
  getSessionByIdRepo,
  updateSessionTitleRepo,
} from "@/lib/repositories/sessionsRepository";

/** PATCH /api/sessions/:id — update session; body: { title?: string }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing session id" },
      { status: 400 }
    );
  }
  let body: { title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (typeof body.title !== "string" || body.title.trim() === "") {
    const existing = await getSessionByIdRepo(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      session: serializeSession(existing),
    });
  }

  try {
    await updateSessionTitleRepo(id, body.title.trim());
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

function serializeSession(session: Session): Record<string, unknown> {
  const out = { ...session } as Record<string, unknown>;
  const createdAt = session.createdAt as { toDate?: () => Date } | null | undefined;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = createdAt.toDate().toISOString();
  }
  return out;
}
