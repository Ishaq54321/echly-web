import { NextResponse } from "next/server";
import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { getActiveShareLinkForSession } from "@/lib/repositories/shareLinkActiveBySession";
import { withAuthorization, type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { sessionWorkspaceId } from "@/lib/server/sessionWorkspaceScope";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";

export const dynamic = "force-dynamic";

/** POST /api/sessions/:id/share-link — return existing active token or create one (comment access). */
export const POST = withAuthorization(
  "update_session",
  async (req: Request, ctx: HandlerContext, { user, userWorkspaceId }) => {
    let body: { userId?: unknown } = {};
    try {
      body = (await req.json()) as { userId?: unknown };
    } catch {
      body = {};
    }
    const clientUid = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!clientUid || clientUid !== user.uid) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const id = await routeParamId(ctx);
    const sessionId = typeof id === "string" ? id.trim() : "";
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
    }

    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const session = ctx.preloaded.session as Session | null;
    if (!session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const accessCtx = await buildRequestContext({
      userId: user.uid,
      userWorkspaceId,
      sessionId,
      session,
    });
    if (!accessCtx.canAccess) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const workspaceId = sessionWorkspaceId(session) ?? "";
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    try {
      const existing = await getActiveShareLinkForSession(sessionId, workspaceId);
      if (existing) {
        return NextResponse.json({ success: true, token: existing.token });
      }
      const { token } = await createShareLink(user.uid, sessionId, "comment", user.uid);
      return NextResponse.json({ success: true, token });
    } catch (e) {
      console.error("POST /api/sessions/[id]/share-link:", e);
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
  },
  {
    resolveWorkspace: async (_req, user, ctx, viewerWorkspaceId) => {
      const sid = await routeParamId(ctx);
      const context = await buildRequestContext({
        userId: user.uid,
        userWorkspaceId: viewerWorkspaceId,
        sessionId: sid?.trim() || undefined,
      });
      return {
        workspaceId: context.sessionWorkspaceId ?? "",
        session: context.session,
      };
    },
  }
);
