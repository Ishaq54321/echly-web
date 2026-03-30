import { NextResponse } from "next/server";
import type { Session } from "@/lib/domain/session";
import { normalizeGeneralAccess, type SessionGeneralAccess } from "@/lib/domain/session";
import { updateSessionGeneralAccessRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  withAuthorization,
  type HandlerContext,
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import { buildRequestContext } from "@/lib/server/requestContext";
import { routeParamId } from "@/lib/server/routeParams";

async function resolveSessionWorkspaceId(
  req: Request,
  user: HandlerUser,
  ctx: HandlerContext,
  viewerWorkspaceId: string
) {
  const id = await routeParamId(ctx);
  const context = await buildRequestContext({
    req,
    authenticatedUser: user,
    userWorkspaceId: viewerWorkspaceId,
    sessionId: id?.trim() || undefined,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    session: context.session,
  };
}

/**
 * GET /api/sessions/:id/share-settings — general access mode (owner / delete capability only).
 */
export const GET = withAuthorization(
  "update_session",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const id = await routeParamId(ctx);
    if (!id) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.access?.capabilities.canDeleteTicket) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!context.session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      generalAccess: normalizeGeneralAccess(context.session.generalAccess),
    });
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);

type PatchBody = { generalAccess?: string };

/**
 * PATCH /api/sessions/:id/share-settings — body `{ generalAccess: "restricted" | "link_view" }`.
 */
export const PATCH = withAuthorization(
  "update_session",
  async (
    req: Request,
    ctx: HandlerContext,
    { user, userWorkspaceId }: { user: HandlerUser; userWorkspaceId: string }
  ) => {
    const id = await routeParamId(ctx);
    if (!id) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }
    let body: PatchBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
    });
    if (!context.access?.capabilities.canDeleteTicket) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!context.session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const raw = body.generalAccess;
    const generalAccess =
      typeof raw === "string" && ["restricted", "link_view"].includes(raw)
        ? (raw as SessionGeneralAccess)
        : null;
    if (!generalAccess) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    await updateSessionGeneralAccessRepo(id, generalAccess);
    return NextResponse.json({ success: true });
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);
