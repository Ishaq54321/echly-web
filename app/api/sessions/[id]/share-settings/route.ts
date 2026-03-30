import type { Session } from "@/lib/domain/session";
import { requireGeneralAccess, type SessionGeneralAccess } from "@/lib/domain/session";
import { updateSessionGeneralAccessRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  withAuthorization,
  type HandlerContext,
  type HandlerUser,
} from "@/lib/server/auth/withAuthorization";
import { buildRequestContext } from "@/lib/server/requestContext";
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
      return apiError({ code: "INVALID_INPUT", message: "Missing session id", status: 400 });
    }
    if (ctx.preloaded?.session === undefined) {
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
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
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
      });
    }
    if (!context.session) {
      return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
    }
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
    const context = await buildRequestContext({
      req,
      authenticatedUser: user,
      userWorkspaceId,
      sessionId: id,
      session: existing,
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

    const raw = body.generalAccess;
    let generalAccess: SessionGeneralAccess;
    try {
      generalAccess = requireGeneralAccess(raw);
    } catch {
      return apiError({ code: "INVALID_INPUT", message: "Invalid value", status: 400 });
    }

    await updateSessionGeneralAccessRepo(id, generalAccess);
    return apiSuccess({}, context.access!);
  },
  { resolveWorkspace: resolveSessionWorkspaceId }
);
