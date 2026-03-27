import "server-only";
import { getAuth } from "firebase-admin/auth";
import { requireAuth as requireLegacyAuth } from "@/lib/server/auth";
import { logAuthDecision } from "@/lib/server/auth/logAuth";

export type Role = "viewer" | "commentator" | "resolver";
export type Action =
  | "read_feedback"
  | "create_feedback"
  | "comment"
  | "resolve_feedback"
  | "delete_feedback"
  | "update_session";

export const PERMISSIONS: Record<Action, Role[]> = {
  read_feedback: ["viewer", "commentator", "resolver"],
  create_feedback: ["commentator", "resolver"],
  comment: ["commentator", "resolver"],
  resolve_feedback: ["resolver"],
  delete_feedback: ["resolver"],
  update_session: ["resolver"],
};

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

export type AuthMeta = {
  usedFallback?: boolean;
};

export async function requireAuth(req: Request, meta?: AuthMeta): Promise<{ uid: string }> {
  const token = getBearerToken(req);
  if (token) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      const uid = typeof decoded.uid === "string" ? decoded.uid.trim() : "";
      if (!uid) {
        throw new AuthorizationError("Invalid ID token", 401, "NOT_AUTHENTICATED");
      }
      if (meta) meta.usedFallback = false;
      return { uid };
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
    return { uid: user.uid };
  } catch {
    throw new AuthorizationError("Not authenticated", 401, "NOT_AUTHENTICATED");
  }
}

export async function resolveUserScope(uid: string): Promise<string> {
  const userId = typeof uid === "string" ? uid.trim() : "";
  if (!userId) {
    throw new AuthorizationError("Invalid user", 401, "NOT_AUTHENTICATED");
  }
  return userId;
}

function normalizeRole(rawRole: unknown): Role {
  if (rawRole === "viewer" || rawRole === "commentator" || rawRole === "resolver") {
    return rawRole;
  }
  return "resolver";
}

export async function getUserRole(uid: string): Promise<Role> {
  void uid;
  // User-owned model: authenticated owner can perform all actions on owned resources.
  return normalizeRole("resolver");
}

export async function authorize(input: {
  uid: string;
  action: Action | null;
  route?: string;
}): Promise<{ role: Role }> {
  if (!process.env.SKIP_AUTH_GUARD && !input.action) {
    throw new Error("Authorization action missing");
  }
  if (!input.action) {
    await logAuthDecision({
      uid: input.uid,
      action: null,
      route: input.route,
      allowed: true,
      reason: "skipAuthorization",
    });
    return { role: "resolver" };
  }

  const allowedRoles = PERMISSIONS[input.action];
  if (!allowedRoles) {
    throw new AuthorizationError(`Unknown action: ${input.action}`, 500, "AUTH_CONFIG_ERROR");
  }

  const role = await getUserRole(input.uid);
  const allowed = allowedRoles.includes(role);
  if (!allowed) {
    await logAuthDecision({
      uid: input.uid,
      action: input.action,
      route: input.route,
      allowed: false,
      reason: "insufficient_permissions",
      role,
    });
    throw new AuthorizationError("Insufficient permissions", 403, "INSUFFICIENT_PERMISSIONS");
  }

  await logAuthDecision({
    uid: input.uid,
    action: input.action,
    route: input.route,
    allowed: true,
    role,
  });
  return { role };
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
  return Response.json(
    {
      success: false,
      error: "FORBIDDEN",
      message: "Forbidden",
    },
    { status: 403 }
  );
}
