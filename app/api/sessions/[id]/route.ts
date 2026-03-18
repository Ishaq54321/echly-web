import type { Session } from "@/lib/domain/session";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  deleteSessionRepo,
  getSessionByIdRepo,
  updateSessionArchivedRepo,
  updateSessionTitleRepo,
} from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { serializeSession } from "@/lib/server/serializeSession";
import { log } from "@/lib/utils/logger";

type PatchBody = { title?: string; archived?: boolean };

const SESSION_GET_CACHE_TTL_MS = 5_000; // 5 seconds — tab switch feels instant, fewer Firestore reads
const sessionGetCache = new Map<string, { session: Session; at: number }>();

function getCachedSession(sessionId: string): Session | null {
  const entry = sessionGetCache.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.at > SESSION_GET_CACHE_TTL_MS) {
    sessionGetCache.delete(sessionId);
    return null;
  }
  return entry.session;
}

function setCachedSession(sessionId: string, session: Session): void {
  sessionGetCache.set(sessionId, { session, at: Date.now() });
}

export function invalidateSessionGetCache(sessionId: string): void {
  sessionGetCache.delete(sessionId);
}

/** GET /api/sessions/:id — lightweight single-session fetch (extension sync, title). No workspace resolve. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let uid = (req.headers.get("x-user-id") ?? "").trim();
  if (!uid) {
    try {
      uid = (await requireAuth(req)).uid;
    } catch (res) {
      return res as Response;
    }
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
  }
  let session: Session | null = getCachedSession(id);
  if (!session) {
    session = await getSessionByIdRepo(id);
    if (!session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    if (session.userId !== uid) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    setCachedSession(id, session);
  } else {
    if (session.userId !== uid) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
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
  let uid = (req.headers.get("x-user-id") ?? "").trim();
  if (!uid) {
    try {
      uid = (await requireAuth(req)).uid;
    } catch (res) {
      return res as Response;
    }
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
  if (existing.userId !== uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  const workspaceId = existing.workspaceId ?? existing.userId ?? (await getUserWorkspaceIdRepo(uid)) ?? uid;
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
      await updateSessionArchivedRepo(id, body.archived!, workspaceId);
    }
    const updated = await getSessionByIdRepo(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found after update" },
        { status: 404 }
      );
    }
    invalidateSessionGetCache(id);
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
  let uid = (req.headers.get("x-user-id") ?? "").trim();
  if (!uid) {
    try {
      uid = (await requireAuth(req)).uid;
    } catch (res) {
      return res as Response;
    }
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
  if (existing.userId !== uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }
  const workspaceId = existing.workspaceId ?? existing.userId ?? (await getUserWorkspaceIdRepo(uid)) ?? uid;
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
    invalidateSessionGetCache(id);
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
