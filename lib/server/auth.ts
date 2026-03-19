import { jwtVerify, createRemoteJWKSet } from "jose";
import { getSessionUser } from "@/lib/server/session";
import { verifyExtensionToken } from "./extensionAuth";

const PROJECT_ID = "echly-b74cc"; // use your real Firebase project id

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

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

function unauthorized(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "User is not authenticated",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Require authentication via Bearer token (Firebase ID token or extension token) or session cookie.
 * Returns a normalized user object { uid, email }. Do not rely on Firebase-specific fields.
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const t_require_auth_start = performance.now();
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const t_verify_start = performance.now();
      const decoded = await verifyIdToken(token);
      console.log("[ECHLY PERF] requireAuth.verifyIdToken:", performance.now() - t_verify_start);
      const user: AuthUser = { uid: decoded.uid, email: decoded.email };
      console.log("Auth type:", "firebase");
      console.log("Authenticated user:", user);
      console.log("[ECHLY PERF] requireAuth TOTAL:", performance.now() - t_require_auth_start);
      return user;
    } catch {
      const t_ext_start = performance.now();
      const decoded = await verifyExtensionToken(token);
      console.log("[ECHLY PERF] requireAuth.verifyExtensionToken:", performance.now() - t_ext_start);
      if (decoded) {
        const user: AuthUser = { uid: decoded.uid, email: decoded.email ?? undefined };
        console.log("Auth type:", "extension");
        console.log("Authenticated user:", user);
        console.log("[ECHLY PERF] requireAuth TOTAL:", performance.now() - t_require_auth_start);
        return user;
      }
      console.error("Token verification failed: invalid Firebase and extension token");
      throw unauthorized();
    }
  }

  const t_session_start = performance.now();
  const sessionUser = await getSessionUser(request);
  console.log("[ECHLY PERF] requireAuth.getSessionUser:", performance.now() - t_session_start);
  if (sessionUser) {
    const user: AuthUser = { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
    console.log("Authenticated user:", user);
    console.log("[ECHLY PERF] requireAuth TOTAL:", performance.now() - t_require_auth_start);
    return user;
  }

  throw unauthorized();
}
