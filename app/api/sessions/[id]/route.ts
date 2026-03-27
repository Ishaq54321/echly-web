import { NextResponse } from "next/server";
import {
  deleteSessionRepo,
  getSessionByIdRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
  updateSessionAccessLevelRepo,
} from "@/lib/repositories/sessionsRepository.server";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { parseAccessLevelStrict } from "@/lib/domain/accessLevel";
import { serializeSession } from "@/lib/server/serializeSession";
import { log } from "@/lib/utils/logger";
import {
  withAuthorization,
  type HandlerContext,
} from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { sessionWorkspaceId } from "@/lib/server/sessionWorkspaceScope";

type PatchBody = { title?: string; archived?: boolean; accessLevel?: string };

async function resolveSessionWorkspaceId(
  _req: Request,
  _user: { uid: string },
  ctx: HandlerContext
): Promise<string> {
  const id = await routeParamId(ctx);
  const session = id ? await getSessionByIdRepo(id) : null;
  return sessionWorkspaceId(session) ?? "";
}

/** GET /api/sessions/:id — return session metadata (e.g. title for Discussion context). */
export const GET = withAuthorization(
  "read_feedback",
  async (
  _req: Request,
  ctx: HandlerContext,
  { workspaceId }: { user: { uid: string }; workspaceId: string }
) => {
  const id = await routeParamId(ctx);
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }
  const session = await getSessionByIdRepo(id);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (session.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    success: true,
    session: serializeSession(session),
  });
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);

/** PATCH /api/sessions/:id — update session; body: { title?: string, archived?: boolean }. */
export const PATCH = withAuthorization(
  "update_session",
  async (
  req: Request,
  ctx: HandlerContext,
  { user, workspaceId }: { user: { uid: string }; workspaceId: string }
) => {
  const start = Date.now();
  log("[API] PATCH /api/sessions/[id] start");
  const id = await routeParamId(ctx);
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
  if (existing.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
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
      if (!existing.workspaceId) {
        throw new Error("Session missing workspaceId");
      }
      await updateSessionArchivedRepo(id, body.archived!, existing.workspaceId);
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
    console.error("PATCH /api/sessions/[id]:", err);
    log("[API] PATCH /api/sessions/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);

/** DELETE /api/sessions/:id — permanently delete session and all tickets/comments. */
export const DELETE = withAuthorization(
  "update_session",
  async (
  _req: Request,
  ctx: HandlerContext,
  { user, workspaceId }: { user: { uid: string }; workspaceId: string }
) => {
  const start = Date.now();
  log("[API] DELETE /api/sessions/[id] start");
  const id = await routeParamId(ctx);
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
  if (existing.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    await deleteSessionRepo(id);
    log("[API] DELETE /api/sessions/[id] duration:", Date.now() - start);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/sessions/[id]:", err);
    log("[API] DELETE /api/sessions/[id] duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);
