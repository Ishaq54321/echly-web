import "server-only";
import {
  authorize,
  AuthorizationError,
  type Action,
  type AuthorizedRequestUser,
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiError } from "@/lib/server/apiResponse";
import { isAdminUser } from "@/lib/server/adminAuth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

/** Data already loaded while resolving workspace (e.g. ticket + session); handlers must not re-fetch the same docs. */
export type PreloadedTicketContext = {
  feedback?: unknown;
  session?: unknown;
  comment?: unknown;
};

export type HandlerContext = {
  params?: Promise<Record<string, string>> | Record<string, string>;
  preloaded?: PreloadedTicketContext;
};

/** `resolveWorkspace` may return a plain workspace id or an object that includes preloaded entities. */
export type ResolvedWorkspace =
  | string
  | {
      workspaceId: string;
      feedback?: unknown;
      session?: unknown;
      comment?: unknown;
    };

export type HandlerUser = AuthorizedRequestUser;

export type AuthorizedHandlerArgs = {
  user: HandlerUser;
  userId: string;
  /** Resource workspace id from `resolveWorkspace` (session scope); access is enforced in handlers via `getAccessContext` / `resolveAccess`. */
  workspaceId: string;
  /** Viewer workspace from `users/{uid}.workspaceId` — empty when unset. */
  userWorkspaceId: string;
  isAdmin: boolean;
};

type WithAuthorizationOptions = {
  skipAuthorization?: boolean;
  isAdmin?: boolean;
  allowNonAdmin?: boolean;
  resolveUserId?: (
    req: Request,
    user: HandlerUser,
    ctx: HandlerContext
  ) => Promise<string>;
  /**
   * Required. Return the resource session workspace id for routing/preload (never user.uid), or a sentinel for non-session admin routes.
   * `viewerWorkspaceId` is the caller's `users/{uid}.workspaceId` (possibly empty). Access is enforced in handlers via `resolveAccess`, not here.
   */
  resolveWorkspace: (
    req: Request,
    user: HandlerUser,
    ctx: HandlerContext,
    viewerWorkspaceId: string
  ) => Promise<ResolvedWorkspace>;
};

export function withAuthorization(
  action: Action | null,
  handler: (req: Request, ctx: HandlerContext, auth: AuthorizedHandlerArgs) => Promise<Response>,
  options: WithAuthorizationOptions
) {
  return async (req: Request, ctx: HandlerContext = {}) => {
    try {
      const user = await requireAuth(req);

      const userId = options?.resolveUserId
        ? await options.resolveUserId(req, user, ctx)
        : user.uid;
      const normalizedUserId = userId.trim();
      if (!normalizedUserId) {
        return apiError({ code: "FORBIDDEN", message: "Forbidden", status: 403 });
      }

      const viewerWorkspaceIdRaw = await getUserWorkspaceIdRepo(user.uid);
      const viewerWorkspaceId =
        typeof viewerWorkspaceIdRaw === "string" ? viewerWorkspaceIdRaw.trim() : "";

      const resolvedWorkspace = await options.resolveWorkspace(
        req,
        user,
        ctx,
        viewerWorkspaceId
      );
      const handlerCtx: HandlerContext = { ...ctx };
      let normalizedWorkspaceId: string;
      if (typeof resolvedWorkspace === "string") {
        normalizedWorkspaceId = resolvedWorkspace.trim();
      } else {
        const w =
          typeof resolvedWorkspace.workspaceId === "string"
            ? resolvedWorkspace.workspaceId
            : "";
        normalizedWorkspaceId = w.trim();
        handlerCtx.preloaded = {
          feedback: resolvedWorkspace.feedback,
          session: resolvedWorkspace.session,
          comment: resolvedWorkspace.comment,
        };
      }

      const isAdmin = options?.isAdmin === true ? await isAdminUser(user.uid) : false;
      if (options?.isAdmin === true && !isAdmin && !options.allowNonAdmin) {
        return apiError({ code: "FORBIDDEN", message: "Admin access required", status: 403 });
      }

      if (!options?.skipAuthorization) {
        await authorize({
          uid: user.uid,
          action,
          route: req.url,
        });
      }

      return await handler(req, handlerCtx, {
        user,
        userId: normalizedUserId,
        workspaceId: normalizedWorkspaceId,
        userWorkspaceId: viewerWorkspaceId,
        isAdmin,
      });
    } catch (err) {
      return toAuthorizationResponse(err);
    }
  };
}
