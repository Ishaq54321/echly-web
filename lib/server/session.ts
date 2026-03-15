import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "echly_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionUser {
  uid: string;
  email: string | null;
  name: string | null;
}

export interface SessionPayload {
  uid: string;
  email: string | null;
  name: string | null;
  iat?: number;
  exp?: number;
}

const DEV_SESSION_SECRET = "echly-dev-session-secret-min-32-chars"; // only used when NODE_ENV !== "production"

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(DEV_SESSION_SECRET);
  }
  throw new Error(
    "SESSION_SECRET must be set and at least 32 characters (use for session signing)"
  );
}

/**
 * Create a signed JWT for the session cookie.
 */
export async function signSessionPayload(payload: SessionPayload): Promise<string> {
  const secret = getSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret);
}

/**
 * Verify the session JWT and return the payload, or null if invalid.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      maxTokenAge: `${MAX_AGE_SECONDS}s`,
    });
    return {
      uid: payload.uid as string,
      email: (payload.email as string) ?? null,
      name: (payload.name as string) ?? null,
    };
  } catch {
    return null;
  }
}

function parseCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  return match ? match[1].trim() : null;
}

/**
 * Read echly_session cookie from the request, verify the JWT, and return user data.
 * Returns null if the cookie is missing or the token is invalid.
 */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get("cookie");
  const token = parseCookieHeader(cookieHeader);
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return {
    uid: payload.uid,
    email: payload.email ?? null,
    name: payload.name ?? null,
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
