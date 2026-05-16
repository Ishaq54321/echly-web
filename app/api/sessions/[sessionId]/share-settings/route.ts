import type { Session } from "@/lib/domain/session";
import { requireGeneralAccess, type SessionGeneralAccess } from "@/lib/domain/session";
import { updateSessionGeneralAccessRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  withAuthorization,
  type HandlerContext,
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import {
  buildRequestContext,
  type RequestContext,
} from "@/lib/server/requestContext";
import { routeParamId } from "@/lib/server/routeParams";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

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
    preloadedUserProfile: ctx.viewerUserProfile,
  });
  return {
    workspaceId: context.sessionWorkspaceId ?? "",
    session: context.session,
    // Phase 28.X — thread the just-resolved access forward so the handler's
    // buildRequestContext reuses it instead of re-running getAccessContext
    // (same pattern as resolveTicketWorkspaceId in /api/tickets/[id]).
    access: context.access,
    accessRequest: context.accessRequest,
    sessionWorkspaceId: context.sessionWorkspaceId,
    userId: context.userId,
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
      return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    const pre = ctx.preloaded;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
      preloadedUserProfile: ctx.viewerUserProfile,
      // Phase 28.X — reuse the access resolveSessionWorkspaceId already
      // resolved for this same session; skips a second getAccessContext
      // fan-out. `access` is present (incl. null) only when threaded.
      ...(pre && "access" in pre
        ? {
            preloadedAccess: {
              access: pre.access as RequestContext["access"],
              accessRequest:
                pre.accessRequest as RequestContext["accessRequest"],
              sessionWorkspaceId: pre.sessionWorkspaceId,
              userId: pre.userId ?? null,
            },
          }
        : {}),
    });
    if (!context.access?.capabilities.canDeleteTicket) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    console.log(
      "[PERF] share-settings: using preloaded access — skipped getAccessContext"
    );
    return apiSuccess(
      {
        generalAccess: context.session.generalAccess,
      },
      context.access!
    );
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
      return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
    }
    let body: PatchBody;
    try {
      body = await req.json();
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
    const existing = ctx.preloaded.session as Session | null;
    const pre = ctx.preloaded;
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
      preloadedUserProfile: ctx.viewerUserProfile,
      // Phase 28.X — reuse the access resolveSessionWorkspaceId already
      // resolved for this same session; skips a second getAccessContext
      // fan-out. `access` is present (incl. null) only when threaded.
      ...(pre && "access" in pre
        ? {
            preloadedAccess: {
              access: pre.access as RequestContext["access"],
              accessRequest:
                pre.accessRequest as RequestContext["accessRequest"],
              sessionWorkspaceId: pre.sessionWorkspaceId,
              userId: pre.userId ?? null,
            },
          }
        : {}),
    });
    if (!context.access?.capabilities.canDeleteTicket) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
    console.log(
      "[PERF] share-settings: using preloaded access — skipped getAccessContext"
    );

    const raw = body.generalAccess;
    let generalAccess: SessionGeneralAccess;
    try {
      generalAccess = requireGeneralAccess(raw);
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid value", status: 400 });
    }

    if (generalAccess === context.session.generalAccess) {
      return apiSuccess(
        { changedFields: [] as ("generalAccess")[] },
        context.access!
      );
    }

    await updateSessionGeneralAccessRepo(id, generalAccess);
    return apiSuccess(
      { changedFields: ["generalAccess"] as const },
      context.access!
    );
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);
