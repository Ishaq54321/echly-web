import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "onboarded";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

const DEV_SESSION_SECRET = "echly-dev-session-secret-min-32-chars";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(DEV_SESSION_SECRET);
  }
  throw new Error("SESSION_SECRET must be set and at least 32 characters");
}

export async function signOnboardedToken(uid: string): Promise<string> {
  return await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export interface OnboardedTokenPayload {
  uid: string;
  iat: number;
}

export async function verifyOnboardedToken(
  token: string | undefined
): Promise<OnboardedTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.uid !== "string" || !payload.uid) return null;
    if (typeof payload.iat !== "number") return null;
    return { uid: payload.uid, iat: payload.iat };
  } catch {
    return null;
  }
}

export function buildOnboardedCookieString(token: string): string {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
  ];
  if (process.env.NODE_ENV === "production") attrs.push("Secure");
  return attrs.join("; ");
}

export function buildOnboardedClearCookieString(): string {
  const attrs = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") attrs.push("Secure");
  return attrs.join("; ");
}

export const ONBOARDED_COOKIE_NAME = COOKIE_NAME;
