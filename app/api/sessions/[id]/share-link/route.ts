import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { getActiveShareLinkForSession } from "@/lib/repositories/shareLinkActiveBySession";
import { withAuthorization, type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

/** POST /api/sessions/:id/share-link — return existing active token or create one (comment access). */
export const POST = withAuthorization(
  "update_session",
  async (req: Request, ctx: HandlerContext, { user, userWorkspaceId }) => {
    const id = await routeParamId(ctx);
    const sessionId = typeof id === "string" ? id.trim() : "";
    if (!sessionId) {
      return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
    }

    if (ctx.preloaded?.session === undefined) {
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
    const session = ctx.preloaded.session as Session | null;

    const accessCtx = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId,
      session,
    });
    if (!accessCtx.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!accessCtx.access?.capabilities.canComment) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!accessCtx.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    try {
      const existing = await getActiveShareLinkForSession(sessionId);
      if (existing) {
        return apiSuccess({ token: existing.token }, accessCtx.access!);
      }
      const { token } = await createShareLink(user.uid, sessionId, "comment", user.uid);
      return apiSuccess({ token }, accessCtx.access!);
    } catch (e) {
      console.error("POST /api/sessions/[id]/share-link:", e);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  {
    resolveWorkspace: async (req, user, ctx, viewerWorkspaceId) => {
      const sid = await routeParamId(ctx);
      const context = await buildRequestContext({
        req,
        authenticatedUser: user,
        userWorkspaceId: viewerWorkspaceId,
        sessionId: typeof sid === "string" ? sid.trim() : undefined,
      });
      return {
        workspaceId: context.sessionWorkspaceId ?? "",
        session: context.session,
      };
    },
  }
);
