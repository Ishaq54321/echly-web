import { createShareLink } from "@/lib/repositories/shareLinksRepository";
import { getActiveShareLinkByAccessForSession } from "@/lib/repositories/shareLinkActiveBySession";
import { withAuthorization, type HandlerContext } from "@/lib/server/auth/withAuthorization";
import { routeParamId } from "@/lib/server/routeParams";
import { buildRequestContext } from "@/lib/server/requestContext";
import type { Session } from "@/lib/domain/session";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

/** POST /api/sessions/:id/share-link — return existing active token or create one.
 *  Body: { access?: "view" | "resolve" } — defaults to "view". */
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
      return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
    }
    if (!accessCtx.access?.capabilities.canComment) {
      return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
    }
    if (!accessCtx.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }

    let body: { access?: unknown } = {};
    try {
      body = (await req.json()) as { access?: unknown };
    } catch {
      // no body is fine — defaults to "view"
    }
    const rawAccess = body.access;
    const access: "view" | "resolve" =
      rawAccess === "resolve" ? "resolve" : "view";

    if (access === "resolve" && !accessCtx.access.capabilities.canResolve) {
      return apiError({
        code: "FORBIDDEN",
        message: "Only resolvers can create resolve-level links",
        status: 403,
      });
    }

    try {
      const existing = await getActiveShareLinkByAccessForSession(sessionId, access);
      if (existing) {
        return apiSuccess({ token: existing.token }, accessCtx.access!);
      }
      const { token } = await createShareLink(user.uid, sessionId, access, user.uid);
      return apiSuccess({ token }, accessCtx.access!);
    } catch (e) {
      console.error("POST /api/sessions/[sessionId]/share-link:", e);
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
