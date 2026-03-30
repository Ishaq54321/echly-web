import { getShareLinkByToken } from "@/lib/repositories/shareLinksRepository";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
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
 * GET /api/share/:token — resolve session via share token; access-only decisions live in
 * {@link buildRequestContext} → {@link getAccessContext} → {@link resolveAccess}.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> | { token: string } }
) {
  const token = await paramToken(ctx.params);
  if (!token) {
    return apiError({ code: "NOT_FOUND", message: "Invalid link", status: 404 });
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
