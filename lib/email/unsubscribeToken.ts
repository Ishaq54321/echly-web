import "server-only";
import crypto from "node:crypto";
import type { OptOutCategory } from "./preferences";

/**
 * Signed one-click unsubscribe tokens (Phase 3).
 *
 * The unsubscribe page has NO auth — anyone with the link can act on it. The
 * token is what makes that safe: it is an HMAC over `uid:category:timestamp`
 * keyed with UNSUBSCRIBE_SECRET, so a recipient can only unsubscribe the exact
 * uid/category the email was sent for, and cannot forge a token for someone
 * else. There is no expiry check — an unsubscribe link should keep working
 * (the timestamp is in the payload only so identical tokens differ over time).
 */

const DEV_SECRET_FALLBACK = "dev-only-secret-change-in-production";
const SECRET = process.env.UNSUBSCRIBE_SECRET ?? DEV_SECRET_FALLBACK;

// Safety net: warn loudly at module load when production is running with the
// dev fallback. The secret has been confirmed set in Vercel, but if it ever
// regresses (env var rename, missing env in a preview deploy promoted to
// prod, etc.) every unsubscribe token would be forgeable. This does NOT
// change behavior — we keep the fallback so local dev still works without
// configuring the env var.
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.UNSUBSCRIBE_SECRET || SECRET === DEV_SECRET_FALLBACK)
) {
  console.error(
    "[unsubscribeToken] UNSUBSCRIBE_SECRET is missing in production — " +
      "unsubscribe tokens are being signed with the dev fallback and are " +
      "forgeable. Set UNSUBSCRIBE_SECRET in the production environment."
  );
}

/** "all" unsubscribes every opt-out category at once (footer "Unsubscribe"). */
export type UnsubscribeCategory = OptOutCategory | "all";

const VALID_CATEGORIES: ReadonlySet<string> = new Set<UnsubscribeCategory>([
  "lifecycle",
  "notifications",
  "all",
]);

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
}

export function makeUnsubscribeToken(
  uid: string,
  category: UnsubscribeCategory
): string {
  const payload = `${uid}:${category}:${Date.now()}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString("base64url");
}

export type VerifyResult =
  | { ok: true; uid: string; category: UnsubscribeCategory }
  | { ok: false; reason: string };

/**
 * Constant-time signature compare. crypto.timingSafeEqual throws if the two
 * buffers differ in length, so length-mismatch is treated as "not equal"
 * rather than letting it throw.
 */
function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyUnsubscribeToken(token: string): VerifyResult {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return { ok: false, reason: "malformed" };

    const [uid, category, ts, sig] = parts;
    if (!uid) return { ok: false, reason: "malformed" };
    if (!VALID_CATEGORIES.has(category)) {
      return { ok: false, reason: "unknown_category" };
    }

    const expected = sign(`${uid}:${category}:${ts}`);
    if (!safeEqualHex(sig, expected)) {
      return { ok: false, reason: "invalid_signature" };
    }

    return { ok: true, uid, category: category as UnsubscribeCategory };
  } catch {
    return { ok: false, reason: "decode_failed" };
  }
}
