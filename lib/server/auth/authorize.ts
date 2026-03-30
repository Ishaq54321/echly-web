import "server-only";
import { getAuth } from "firebase-admin/auth";
import { requireAuth as requireLegacyAuth } from "@/lib/server/auth";
import { logAuthDecision } from "@/lib/server/auth/logAuth";

export type Action =
  | "read_feedback"
  | "create_feedback"
  | "comment"
  | "resolve_feedback"
  | "delete_feedback"
  | "update_session";

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export class AuthorizationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 403, code = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
    this.code = code;
  }
}

/** No Bearer/session user and no share token — API handlers that require an identity should map this to 401. */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type AuthMeta = {
  usedFallback?: boolean;
};

export type AuthorizedRequestUser = { uid: string; email?: string };

export async function requireAuth(
  req: Request,
  meta?: AuthMeta
): Promise<AuthorizedRequestUser> {
  const token = getBearerToken(req);
  if (token) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      const uid = typeof decoded.uid === "string" ? decoded.uid.trim() : "";
      if (!uid) {
        throw new AuthorizationError("Invalid ID token", 401, "NOT_AUTHENTICATED");
      }
      if (meta) meta.usedFallback = false;
      const email =
        typeof decoded.email === "string" && decoded.email.trim() !== ""
          ? decoded.email.trim()
          : undefined;
      return { uid, email };
    } catch (err) {
      if (err instanceof AuthorizationError) {
        throw err;
      }
      throw new AuthorizationError("Invalid ID token", 401, "NOT_AUTHENTICATED");
    }
  }

  // Fallback keeps existing extension/session-cookie behavior.
  try {
    const user = await requireLegacyAuth(req);
    if (!user?.uid) {
      throw new AuthorizationError("Not authenticated", 401, "NOT_AUTHENTICATED");
    }
    if (meta) meta.usedFallback = true;
    console.warn("[SECURITY] Fallback auth path triggered", {
      route: req.url,
      uid: user.uid,
    });
    return {
      uid: user.uid,
      email:
        typeof user.email === "string" && user.email.trim() !== ""
          ? user.email.trim()
          : undefined,
    };
  } catch {
    throw new AuthorizationError("Not authenticated", 401, "NOT_AUTHENTICATED");
  }
}

/** Same verification as {@link requireAuth} but never throws — used for optional-auth and unified access resolution. */
export async function tryGetAuthUser(req: Request): Promise<AuthorizedRequestUser | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}

export async function resolveUserScope(uid: string): Promise<string> {
  const userId = typeof uid === "string" ? uid.trim() : "";
  if (!userId) {
    throw new AuthorizationError("Invalid user", 401, "NOT_AUTHENTICATED");
  }
  return userId;
}

/**
 * Identity is already enforced by `requireAuth` / route handlers.
 * Resource access is enforced only via `getAccessContext` → `access.capabilities` in handlers.
 * Logs only — must not throw or block the request.
 */
export async function authorize(input: {
  uid: string;
  action: Action | null;
  route?: string;
}): Promise<void> {
  if (!input.action) {
    await logAuthDecision({
      uid: input.uid,
      action: null,
      route: input.route,
      allowed: true,
      reason: "skipAuthorization",
    });
    return;
  }

  await logAuthDecision({
    uid: input.uid,
    action: input.action,
    route: input.route,
    allowed: true,
    reason: "accessDelegatedToResolveAccess",
  });
}

export function toAuthorizationResponse(err: unknown): Response {
  if (err instanceof AuthorizationError) {
    return Response.json(
      {
        success: false,
        error: err.code,
        message: err.message,
      },
      { status: err.status }
    );
  }
  if (err instanceof UnauthorizedError) {
    return Response.json(
      {
        success: false,
        error: "NOT_AUTHENTICATED",
        message: err.message,
      },
      { status: 401 }
    );
  }
  return Response.json(
    {
      success: false,
      error: "FORBIDDEN",
      message: "Forbidden",
    },
    { status: 403 }
  );
}
