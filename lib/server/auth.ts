import { jwtVerify, createRemoteJWKSet } from "jose";
import { getSessionUser } from "@/lib/server/session";
import { verifyExtensionToken } from "./extensionAuth";

const PROJECT_ID = "echly-b74cc"; // use your real Firebase project id

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

const tokenCache = new Map<string, AuthUser>();

export interface DecodedIdToken {
  uid: string;
  email?: string;
  [key: string]: unknown;
}

/** Normalized user from requireAuth(); use only uid and email. */
export interface AuthUser {
  uid: string;
  email?: string;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
  const uid = (payload.sub ?? payload.user_id) as string;
  if (typeof uid !== "string" || !uid.trim()) {
    throw new Error("Invalid Firebase token: missing uid");
  }
  const email = (payload.email as string) ?? undefined;
  return { uid, email, ...payload };
}

function unauthorized(message: string): Response {
  return new Response(JSON.stringify({ error: message }), { status: 401 });
}

/**
 * Require authentication via Bearer token (Firebase ID token or extension token) or session cookie.
 * Returns a normalized user object { uid, email }. Do not rely on Firebase-specific fields.
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const t_require_auth_start = performance.now();
  const reqAny = request as any;
  if (reqAny.__cachedUser) {
    return reqAny.__cachedUser;
  }
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (tokenCache.has(token)) {
      const user = tokenCache.get(token);
      if (user) {
        reqAny.__cachedUser = user;
        console.log("[ECHLY PERF] requireAuth TOTAL (cached):", performance.now() - t_require_auth_start);
        return user;
      }
    }
    try {
      const t_verify_start = performance.now();
      const decoded = await verifyIdToken(token);
      console.log("[ECHLY PERF] requireAuth.verifyIdToken:", performance.now() - t_verify_start);
      const user: AuthUser = { uid: decoded.uid, email: decoded.email };
      tokenCache.set(token, user);
      setTimeout(() => {
        tokenCache.delete(token);
      }, 5 * 60 * 1000);
      console.log("Auth type:", "firebase");
      console.log("Authenticated user:", user);
      console.log("[ECHLY PERF] requireAuth TOTAL:", performance.now() - t_require_auth_start);
      reqAny.__cachedUser = user;
      return user;
    } catch {
      const t_ext_start = performance.now();
      const decoded = await verifyExtensionToken(token);
      console.log("[ECHLY PERF] requireAuth.verifyExtensionToken:", performance.now() - t_ext_start);
      if (decoded) {
        const user: AuthUser = { uid: decoded.uid, email: decoded.email ?? undefined };
        tokenCache.set(token, user);
        setTimeout(() => {
          tokenCache.delete(token);
        }, 5 * 60 * 1000);
        console.log("Auth type:", "extension");
        console.log("Authenticated user:", user);
        console.log("[ECHLY PERF] requireAuth TOTAL:", performance.now() - t_require_auth_start);
        reqAny.__cachedUser = user;
        return user;
      }
      console.error("Token verification failed: invalid Firebase and extension token");
      throw unauthorized("Unauthorized - Invalid token");
    }
  }

  const t_session_start = performance.now();
  const sessionUser = await getSessionUser(request);
  console.log("[ECHLY PERF] requireAuth.getSessionUser:", performance.now() - t_session_start);
  if (sessionUser) {
    const user: AuthUser = { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
    console.log("Authenticated user:", user);
    console.log("[ECHLY PERF] requireAuth TOTAL:", performance.now() - t_require_auth_start);
    reqAny.__cachedUser = user;
    return user;
  }

  throw unauthorized("Unauthorized - Missing token");
}
