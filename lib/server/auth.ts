import { jwtVerify, createRemoteJWKSet } from "jose";
import { getSessionUser } from "@/lib/server/session";
import { verifyExtensionToken } from "./extensionAuth";

const PROJECT_ID = "echly-b74cc"; // use your real Firebase project id

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

const tokenCache = new Map<string, { uid: string; expiresAt: number }>();

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
      const cached = tokenCache.get(token);
      if (cached && cached.expiresAt > Date.now()) {
        return { uid: cached.uid };
      }

      const decoded = await verifyIdToken(token);

      // Prevent unbounded growth in long-lived processes.
      if (tokenCache.size > 1000) {
        tokenCache.clear();
      }

      // Cache result for 5 minutes.
      tokenCache.set(token, {
        uid: decoded.uid,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

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
