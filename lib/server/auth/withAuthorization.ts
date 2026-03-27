import "server-only";
import {
  authorize,
  AuthorizationError,
  type Action,
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { isAdminUser } from "@/lib/server/adminAuth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

export type HandlerContext = {
  params?: Promise<Record<string, string>> | Record<string, string>;
};

type HandlerUser = { uid: string };

type HandlerArgs = {
  user: HandlerUser;
  userId: string;
  workspaceId: string;
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
  /** Required. Must return the workspace id for the resource being accessed (never user.uid). */
  resolveWorkspace: (
    req: Request,
    user: HandlerUser,
    ctx: HandlerContext
  ) => Promise<string>;
};

export function withAuthorization(
  action: Action | null,
  handler: (req: Request, ctx: HandlerContext, auth: HandlerArgs) => Promise<Response>,
  options: WithAuthorizationOptions
) {
  return async (req: Request, ctx: HandlerContext = {}) => {
    const authMeta = { usedFallback: false };
    try {
      const user = await requireAuth(req, authMeta);
      if (authMeta.usedFallback) {
        console.warn("[SECURITY] Fallback auth used", {
          route: req.url,
          uid: user?.uid,
        });
      }

      const userId = options?.resolveUserId
        ? await options.resolveUserId(req, user, ctx)
        : user.uid;
      const normalizedUserId = userId.trim();
      if (!normalizedUserId) {
        return Response.json(
          { success: false, error: "FORBIDDEN", message: "Forbidden" },
          { status: 403 }
        );
      }

      const resolvedWorkspace = await options.resolveWorkspace(req, user, ctx);
      const normalizedWorkspaceId = (typeof resolvedWorkspace === "string" ? resolvedWorkspace : "").trim();
      if (!normalizedWorkspaceId) {
        throw new AuthorizationError("Missing workspaceId", 403, "FORBIDDEN");
      }

      const userWorkspaceId = await getUserWorkspaceIdRepo(user.uid);
      if (userWorkspaceId !== normalizedWorkspaceId) {
        return Response.json(
          { success: false, error: "FORBIDDEN", message: "Forbidden" },
          { status: 403 }
        );
      }

      const isAdmin = options?.isAdmin === true ? await isAdminUser(user.uid) : false;
      if (options?.isAdmin === true && !isAdmin && !options.allowNonAdmin) {
        return Response.json(
          { success: false, error: "FORBIDDEN", message: "Admin access required" },
          { status: 403 }
        );
      }

      if (!options?.skipAuthorization) {
        await authorize({
          uid: user.uid,
          action,
          route: req.url,
        });
      }

      return await handler(req, ctx, {
        user,
        userId: normalizedUserId,
        workspaceId: normalizedWorkspaceId,
        isAdmin,
      });
    } catch (err) {
      return toAuthorizationResponse(err);
    }
  };
}
