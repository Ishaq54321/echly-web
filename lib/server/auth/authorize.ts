import "server-only";
import { getAuth } from "firebase-admin/auth";
import { verifyIdToken as verifyIdTokenJose } from "@/lib/server/auth";
import type { ApiErrorCode } from "@/lib/server/apiResponse";
import { apiError } from "@/lib/server/apiResponse";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { getSessionUser } from "@/lib/server/session";
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

function base64UrlDecodeToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function peekJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecodeToString(parts[1] ?? "");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function userFromBearerToken(token: string): Promise<AuthorizedRequestUser | null> {
  try {
    const decoded = await verifyIdTokenJose(token);
    const uid = typeof decoded.uid === "string" ? decoded.uid.trim() : "";
    if (!uid) return null;
    const email =
      typeof decoded.email === "string" && decoded.email.trim() !== ""
        ? decoded.email.trim()
        : undefined;
    return { uid, email };
  } catch {
    const payload = peekJwtPayload(token);
    if (payload?.type === "extension") {
      const decoded = await verifyExtensionToken(token);
      if (!decoded) return null;
      return {
        uid: decoded.uid,
        email: decoded.email ?? undefined,
      };
    }
    try {
      const d = await getAuth().verifyIdToken(token);
      const uid = typeof d.uid === "string" ? d.uid.trim() : "";
      if (!uid) return null;
      const email =
        typeof d.email === "string" && d.email.trim() !== "" ? d.email.trim() : undefined;
      return { uid, email };
    } catch {
      return null;
    }
  }
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

export type AuthorizedRequestUser = { uid: string; email?: string };

export async function requireAuth(req: Request): Promise<AuthorizedRequestUser> {
  const extensionToken = req.headers.get("x-extension-token")?.trim() ?? "";
  const origin = req.headers.get("origin")?.toLowerCase() ?? "";
  const isExtensionRequest = origin.startsWith("chrome-extension://");
  if (isExtensionRequest && !extensionToken) {
    throw new AuthorizationError("Extension token required", 401, "UNAUTHORIZED");
  }

  const user = await tryGetAuthUser(req);
  if (!user) {
    throw new AuthorizationError("Not authenticated", 401, "UNAUTHORIZED");
  }
  return user;
}

/**
 * Single identity resolution for API routes: extension header, Bearer (Firebase / extension JWT / Admin),
 * then session cookie. Used by {@link buildRequestContext} / optional-auth flows.
 */
export async function tryGetAuthUser(req: Request): Promise<AuthorizedRequestUser | null> {
  const extensionToken = req.headers.get("x-extension-token")?.trim() ?? "";
  const origin = req.headers.get("origin")?.toLowerCase() ?? "";
  const isExtensionRequest = origin.startsWith("chrome-extension://");
  if (isExtensionRequest && !extensionToken) {
    return null;
  }
  if (extensionToken) {
    const decoded = await verifyExtensionToken(extensionToken);
    if (!decoded) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? undefined,
    };
  }

  const bearer = getBearerToken(req);
  if (bearer) {
    return userFromBearerToken(bearer);
  }

  const sessionUser = await getSessionUser(req);
  if (sessionUser?.uid) {
    return {
      uid: sessionUser.uid,
      email:
        typeof sessionUser.email === "string" && sessionUser.email.trim() !== ""
          ? sessionUser.email.trim()
          : undefined,
    };
  }
  return null;
}

export async function resolveUserScope(uid: string): Promise<string> {
  const userId = typeof uid === "string" ? uid.trim() : "";
  if (!userId) {
    throw new AuthorizationError("Invalid user", 401, "UNAUTHORIZED");
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

const API_ERROR_CODES = new Set<ApiErrorCode>([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "INVALID_INPUT",
  "INTERNAL_ERROR",
]);

function normalizeApiErrorCode(code: string, status: number): ApiErrorCode {
  if (API_ERROR_CODES.has(code as ApiErrorCode)) {
    return code as ApiErrorCode;
  }
  if (status === 401) return "UNAUTHORIZED";
  if (status === 404) return "NOT_FOUND";
  if (status === 400) return "INVALID_INPUT";
  if (status >= 500) return "INTERNAL_ERROR";
  return "FORBIDDEN";
}

export function toAuthorizationResponse(err: unknown): Response {
  if (err instanceof AuthorizationError) {
    const code = normalizeApiErrorCode(err.code, err.status);
    return apiError({ code, message: err.message, status: err.status });
  }
  if (err instanceof UnauthorizedError) {
    return apiError({ code: "UNAUTHORIZED", message: err.message, status: 401 });
  }
  return apiError({ code: "FORBIDDEN", message: "Forbidden", status: 403 });
}
