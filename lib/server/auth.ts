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
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = await verifyIdToken(token);
      return { uid: decoded.uid, email: decoded.email };
    } catch {
      const decoded = await verifyExtensionToken(token);
      if (decoded) {
        return { uid: decoded.uid, email: decoded.email ?? undefined };
      }
      console.error("Token verification failed: invalid Firebase and extension token");
      throw unauthorized();
    }
  }

  const sessionUser = await getSessionUser(request);
  if (sessionUser) {
    return { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
  }

  throw unauthorized();
}
