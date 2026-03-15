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
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = await verifyIdToken(token);
      const user: AuthUser = { uid: decoded.uid, email: decoded.email };
      console.log("Auth type:", "firebase");
      console.log("Authenticated user:", user);
      return user;
    } catch {
      const decoded = await verifyExtensionToken(token);
      if (decoded) {
        const user: AuthUser = { uid: decoded.uid, email: decoded.email ?? undefined };
        console.log("Auth type:", "extension");
        console.log("Authenticated user:", user);
        return user;
      }
      console.error("Token verification failed: invalid Firebase and extension token");
      throw unauthorized("Unauthorized - Invalid token");
    }
  }

  const sessionUser = await getSessionUser(request);
  if (sessionUser) {
    const user: AuthUser = { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
    console.log("Authenticated user:", user);
    return user;
  }

  throw unauthorized("Unauthorized - Missing token");
}
