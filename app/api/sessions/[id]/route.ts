import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  deleteSessionRepo,
  getSessionByIdRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
  updateSessionAccessLevelRepo,
} from "@/lib/repositories/sessionsRepository";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { parseAccessLevelStrict } from "@/lib/domain/accessLevel";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { serializeSession } from "@/lib/server/serializeSession";
import { log } from "@/lib/utils/logger";

type PatchBody = { title?: string; archived?: boolean; accessLevel?: string };

/** GET /api/sessions/:id — return session metadata (e.g. title for Discussion context). */
export async function GET(
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
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }
  const session = await getSessionByIdRepo(id);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (session.userId !== user.uid) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceById(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    throw err;
  }
  return NextResponse.json({
    success: true,
    session: serializeSession(session),
  });
}

/** PATCH /api/sessions/:id — update session; body: { title?: string, archived?: boolean }. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  log("[API] PATCH /api/sessions/[id] start");
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
  const workspaceId = existing.workspaceId ?? existing.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceById(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    throw err;
  }

  const hasTitle = typeof body.title === "string" && body.title.trim() !== "";
  const hasArchived = typeof body.archived === "boolean";
  const rawAccess = body.accessLevel;
  const hasAccessLevel = rawAccess !== undefined;
  const validAccessLevel: AccessLevel | null = hasAccessLevel
    ? parseAccessLevelStrict(typeof rawAccess === "string" ? rawAccess.trim() : rawAccess)
    : null;

  if (hasAccessLevel && validAccessLevel === null) {
    return NextResponse.json({ success: false, error: "Invalid accessLevel" }, { status: 400 });
  }

  if (!hasTitle && !hasArchived && validAccessLevel === null) {
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
      await updateSessionArchivedRepo(id, body.archived!, workspaceId);
    }
    if (validAccessLevel != null) {
      await updateSessionAccessLevelRepo(id, validAccessLevel);
    }
    const updated = await getSessionByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    log("[API] PATCH /api/sessions/[id] duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      session: serializeSession(updated),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    console.error("PATCH /api/sessions/[id]:", err);
    log("[API] PATCH /api/sessions/[id] duration (error):", Date.now() - start);
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
  const start = Date.now();
  log("[API] DELETE /api/sessions/[id] start");
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
  const workspaceId = existing.workspaceId ?? existing.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await resolveWorkspaceById(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    throw err;
  }
  try {
    await deleteSessionRepo(id);
    log("[API] DELETE /api/sessions/[id] duration:", Date.now() - start);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(
        { success: false, ...WORKSPACE_SUSPENDED_RESPONSE },
        { status: 403 }
      );
    }
    console.error("DELETE /api/sessions/[id]:", err);
    log("[API] DELETE /api/sessions/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
