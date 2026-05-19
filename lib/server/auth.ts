import { jwtVerify, createRemoteJWKSet } from "jose";
import { FieldValue } from "firebase-admin/firestore";
import { apiError } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
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
  return apiError({
    code: "UNAUTHORIZED",
    message: "User is not authenticated",
    status: 401,
  });
}

const LAST_ACTIVE_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

/**
 * Per-process memo of the last time we wrote lastActiveAt for a uid. Lets a
 * hot endpoint skip even the Firestore READ between writes, not just the
 * write. Firestore remains the source of truth: on a cache miss (cold start,
 * new uid, evicted entry) we still read the doc before deciding. Unbounded in
 * theory, but bounded in practice by distinct active uids per process
 * lifetime; acceptable for an approximate "last seen" signal.
 */
const lastActiveWriteCache = new Map<string, number>();

/**
 * Best-effort, throttled write of users/{uid}.lastActiveAt. Called on every
 * successful auth. Throttled to once per hour per uid. Never throws — a
 * Firestore hiccup must not turn an authenticated request into a 500, and the
 * value is approximate by design (last-write-wins under concurrent requests).
 */
async function maybeUpdateLastActive(uid: string): Promise<void> {
  try {
    const now = Date.now();

    const memo = lastActiveWriteCache.get(uid);
    if (memo !== undefined && now - memo < LAST_ACTIVE_THROTTLE_MS) {
      return; // wrote recently in this process — skip read + write
    }

    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    const lastActive = snap.data()?.lastActiveAt;

    if (lastActive && typeof lastActive.toMillis === "function") {
      if (now - lastActive.toMillis() < LAST_ACTIVE_THROTTLE_MS) {
        // Persisted value is fresh; cache it so we skip the read next time too.
        lastActiveWriteCache.set(uid, lastActive.toMillis());
        return;
      }
    }

    await userRef.update({ lastActiveAt: FieldValue.serverTimestamp() });
    lastActiveWriteCache.set(uid, now);
  } catch (err) {
    // Swallow: lastActiveAt is non-critical telemetry, not part of auth.
    console.warn("[auth] maybeUpdateLastActive failed (non-fatal)", err);
  }
}

/**
 * Require authentication via Bearer token (Firebase ID token or extension token) or session cookie.
 * Returns a normalized user object { uid, email }. Do not rely on Firebase-specific fields.
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const authHeader = request.headers.get("Authorization");

  let user: AuthUser | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = await verifyIdToken(token);
      user = { uid: decoded.uid, email: decoded.email };
    } catch {
      const decoded = await verifyExtensionToken(token);
      if (decoded) {
        user = { uid: decoded.uid, email: decoded.email ?? undefined };
      } else {
        console.error("Token verification failed: invalid Firebase and extension token");
        throw unauthorized();
      }
    }
  } else {
    const sessionUser = await getSessionUser(request);
    if (sessionUser) {
      user = { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
    }
  }

  if (!user) {
    throw unauthorized();
  }

  // Fire-and-forget: must not block or fail the request. The helper throttles
  // itself (once/hour per uid) and never throws.
  void maybeUpdateLastActive(user.uid);

  return user;
}
