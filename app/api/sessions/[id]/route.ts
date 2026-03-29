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
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";

type PatchBody = { title?: string; archived?: boolean; accessLevel?: string };

async function resolveSessionWorkspaceId(
  _req: Request,
  user: HandlerUser,
  ctx: HandlerContext,
  viewerWorkspaceId: string
) {
  const id = await routeParamId(ctx);
  const context = await buildRequestContext({
    userId: user.uid,
    userEmail: user.email,
    userWorkspaceId: viewerWorkspaceId,
    sessionId: id?.trim() || undefined,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    session: context.session,
  };
}

function shareTokenFromSessionRequest(req: Request): string | undefined {
  const q = new URL(req.url).searchParams.get("shareToken")?.trim() ?? "";
  const h = req.headers.get("x-share-token")?.trim() ?? "";
  const raw = q || h;
  return raw !== "" ? raw : undefined;
}

/** GET /api/sessions/:id — return session metadata (e.g. title for Discussion context). */
export const GET = withAuthorization(
  "read_feedback",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const id = await routeParamId(ctx);
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const loaded = ctx.preloaded.session as Session | null;
    const context = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      sessionId: id,
      session: loaded,
      tokenString: shareTokenFromSessionRequest(req),
    });
    if (!context.access) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!context.session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      session: serializeSession(context.session),
      ...(context.access != null ? { access: context.access } : {}),
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
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
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
    const context = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    const sess = context.session;

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

    if (validAccessLevel != null && !context.access?.canResolve) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if ((hasTitle || hasArchived) && !context.access?.canComment) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (!hasTitle && !hasArchived && validAccessLevel === null) {
      return NextResponse.json({
        success: true,
        session: serializeSession(sess),
      });
    }

    try {
      const tasks: Promise<void>[] = [];
      if (hasTitle) {
        tasks.push(updateSessionTitleRepo(id, body.title!.trim()));
      }
      if (hasArchived) {
        const wid =
          typeof sess.workspaceId === "string" ? sess.workspaceId.trim() : "";
        tasks.push(updateSessionArchivedRepo(id, body.archived!, wid));
      }
      if (validAccessLevel != null) {
        tasks.push(updateSessionAccessLevelRepo(id, validAccessLevel));
      }
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }
      const updated: Session = {
        ...sess,
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
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
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
    const context = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.access?.canResolve) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!context.session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
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
