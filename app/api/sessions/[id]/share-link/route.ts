import { NextResponse } from "next/server";
import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { getActiveShareLinkForSession } from "@/lib/repositories/shareLinkActiveBySession";
import { withAuthorization, type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";

export const dynamic = "force-dynamic";

/** POST /api/sessions/:id/share-link — return existing active token or create one (comment access). */
export const POST = withAuthorization(
  "update_session",
  async (_req: Request, ctx: HandlerContext, { user, userWorkspaceId }) => {
    const id = await routeParamId(ctx);
    const sessionId = typeof id === "string" ? id.trim() : "";
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing session id" }, { status: 400 });
    }

    if (ctx.preloaded?.session === undefined) {
      return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
    const session = ctx.preloaded.session as Session | null;

    const accessCtx = await buildRequestContext({
      userId: user.uid,
      userEmail: user.email,
      userWorkspaceId,
      sessionId,
      session,
    });
    if (!accessCtx.access?.canComment) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (!accessCtx.session) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    try {
      const existing = await getActiveShareLinkForSession(sessionId);
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
        userEmail: user.email,
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
