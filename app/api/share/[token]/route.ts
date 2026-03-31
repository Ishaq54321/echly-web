import { requireGeneralAccess } from "@/lib/domain/session";
import {
  createShareLink,
  getShareLinkByToken,
} from "@/lib/repositories/shareLinksRepository";
import { getActiveShareLinkForSession } from "@/lib/repositories/shareLinkActiveBySession";
import {
  getSessionByIdRepo,
  updateSessionGeneralAccessRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { tryGetAuthUser } from "@/lib/server/auth/authorize";
import { buildRequestContext, tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

type LegacySharePermission = "VIEWER" | "RESOLVER";

function legacyPermissionFromRole(role: string): LegacySharePermission {
  return role === "VIEWER" ? "VIEWER" : "RESOLVER";
}

async function paramToken(
  params: Promise<{ token?: string }> | { token?: string }
): Promise<string> {
  const resolved =
    params && typeof (params as Promise<unknown>).then === "function"
      ? await (params as Promise<{ token?: string }>)
      : (params as { token?: string });
  return typeof resolved?.token === "string" ? resolved.token.trim() : "";
}

/**
 * GET /api/share/:param
 * - Authenticated + param is a session id: `{ link, generalAccess }` (server builds URL; no separate token field).
 * - Otherwise: resolve session via share token (legacy / anonymous).
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> | { token: string } }
) {
  const token = await paramToken(ctx.params);
  if (!token) {
    return apiError({ code: "NOT_FOUND", message: "Invalid link", status: 404 });
  }

  const authUser = await tryGetAuthUser(req);
  if (authUser) {
    const session = await getSessionByIdRepo(token);
    if (session && session.id.trim() === token) {
      const userWorkspaceId = await getUserWorkspaceIdRepo(authUser.uid);
      const context = await buildRequestContext({
        req,
        authenticatedUser: authUser,
        userWorkspaceId,
        sessionId: token,
        session,
      });
      if (!context.access?.capabilities.canComment) {
        return apiError({
          code: "FORBIDDEN",
          message: "You do not have access",
          status: 403,
        });
      }
      if (!context.session) {
        return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
      }

      let linkQuerySecret: string;
      try {
        const existing = await getActiveShareLinkForSession(token);
        if (existing) {
          linkQuerySecret = existing.token;
        } else {
          const created = await createShareLink(
            authUser.uid,
            token,
            "comment",
            authUser.uid
          );
          linkQuerySecret = created.token;
        }
      } catch (e) {
        console.error("GET /api/share/[token] (session link):", e);
        return apiError({
          code: "INTERNAL_ERROR",
          message: "Server error",
          status: 500,
        });
      }

      const origin = new URL(req.url).origin;
      const link = `${origin}/session/${encodeURIComponent(token)}?token=${encodeURIComponent(linkQuerySecret)}`;

      return apiSuccess(
        {
          link,
          generalAccess: context.session.generalAccess,
        },
        context.access
      );
    }
  }

  const linkRow = await getShareLinkByToken(token);
  if (!linkRow) {
    return apiError({ code: "NOT_FOUND", message: "Invalid link", status: 404 });
  }

  const sessionId = linkRow.sessionId.trim();
  if (!sessionId) {
    return apiError({ code: "NOT_FOUND", message: "Invalid link", status: 404 });
  }

  const built = await tryBuildRequestContext({
    req,
    authenticatedUser: null,
    sessionId,
    pathShareToken: token,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  const access = context.access;
  if (!access?.capabilities.canView) {
    return apiError({ code: "FORBIDDEN", message: "You do not have access", status: 403 });
  }

  const permission = legacyPermissionFromRole(access.role);

  return apiSuccess(
    {
      sessionId,
      token,
      permission,
    },
    access
  );
}

type PatchBody = { generalAccess?: string };

/**
 * PATCH /api/share/:sessionId — body `{ generalAccess: "restricted" | "link_view" }` (owner / delete capability).
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ token: string }> | { token: string } }
) {
  const id = await paramToken(ctx.params);
  if (!id) {
    return apiError({ code: "INVALID_INPUT", message: "Missing id", status: 400 });
  }

  const authUser = await tryGetAuthUser(req);
  if (!authUser) {
    return apiError({ code: "UNAUTHORIZED", message: "Not authenticated", status: 401 });
  }

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  const session = await getSessionByIdRepo(id);
  if (!session || session.id.trim() !== id) {
    return apiError({ code: "NOT_FOUND", message: "Not found", status: 404 });
  }

  const userWorkspaceId = await getUserWorkspaceIdRepo(authUser.uid);
  const context = await buildRequestContext({
    req,
    authenticatedUser: authUser,
    userWorkspaceId,
    sessionId: id,
    session,
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

  let generalAccess;
  try {
    generalAccess = requireGeneralAccess(body.generalAccess);
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid value", status: 400 });
  }

  await updateSessionGeneralAccessRepo(id, generalAccess);
  return apiSuccess({}, context.access);
}
