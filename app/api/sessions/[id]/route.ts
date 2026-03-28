import { NextResponse } from "next/server";
import {
  deleteSessionRepo,
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
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";

type PatchBody = { title?: string; archived?: boolean; accessLevel?: string };

async function resolveSessionWorkspaceId(
  _req: Request,
  user: { uid: string },
  ctx: HandlerContext,
  viewerWorkspaceId: string
) {
  const id = await routeParamId(ctx);
  const context = await buildRequestContext({
    userId: user.uid,
    userWorkspaceId: viewerWorkspaceId,
    sessionId: id?.trim() || undefined,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    session: context.session,
  };
}

/** GET /api/sessions/:id — return session metadata (e.g. title for Discussion context). */
export const GET = withAuthorization(
  "read_feedback",
  async (
    _req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: { uid: string }; userWorkspaceId: string }
  ) => {
    const id = await routeParamId(ctx);
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const loaded = ctx.preloaded.session as Session | null;
    if (!loaded) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    const context = await buildRequestContext({
      userId: user.uid,
      userWorkspaceId,
      sessionId: id,
      session: loaded,
    });
    if (!context.canAccess) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({
      success: true,
      session: serializeSession(loaded),
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
    { user, userWorkspaceId }: { user: { uid: string }; userWorkspaceId: string }
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

    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    const context = await buildRequestContext({
      userId: user.uid,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.canAccess) {
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
      const tasks: Promise<void>[] = [];
      if (hasTitle) {
        tasks.push(updateSessionTitleRepo(id, body.title!.trim()));
      }
      if (hasArchived) {
        if (!existing.workspaceId) {
          throw new Error("Session missing workspaceId");
        }
        tasks.push(updateSessionArchivedRepo(id, body.archived!, existing.workspaceId));
      }
      if (validAccessLevel != null) {
        tasks.push(updateSessionAccessLevelRepo(id, validAccessLevel));
      }
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }
      const updated: Session = {
        ...existing,
        ...(hasTitle ? { title: body.title!.trim() } : {}),
        ...(hasArchived ? { archived: body.archived!, isArchived: body.archived! } : {}),
        ...(validAccessLevel != null ? { accessLevel: validAccessLevel } : {}),
        ...(tasks.length > 0 ? { updatedAt: new Date() } : {}),
      };
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
    { user, userWorkspaceId }: { user: { uid: string }; userWorkspaceId: string }
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
    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }
    const context = await buildRequestContext({
      userId: user.uid,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.canAccess) {
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
