/**
 * Network-surface redaction.
 *
 * Wraps the Phase 1 console redaction module (`../console/redact.ts`) and
 * applies it to network-specific surfaces — URLs, header maps, request and
 * response bodies. We deliberately do not modify `redact.ts`; this module
 * is purely additive.
 *
 * Header redaction is name-aware: the names themselves are always preserved
 * (engineers need to know that an Authorization header was sent) but the
 * values are masked for any sensitive name. Remaining header values are
 * still passed through `redact()` so an inline JWT or email in a custom
 * header still gets caught.
 */

import { redact } from "../console/redact";

const HEADER_VALUE_REDACTED = "<redacted>";

// Case-insensitive exact-name match for fully sensitive headers.
const SENSITIVE_HEADER_NAMES: ReadonlySet<string> = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
  "x-access-token",
]);

// Catches custom variants like x-stripe-token, x-foo-secret, x-myapp-api-key.
// Linear-time: bounded character class, no nested quantifiers.
const SENSITIVE_HEADER_NAME_PATTERN = /^x-.*-(?:token|key|secret|auth)$/i;

export function redactUrl(url: string): string {
  if (!url) return url;
  // The console redact() already strips sensitive query params (token, key,
  // secret, api_key, access_token, password, auth, apikey) and any embedded
  // JWTs/emails — exactly the surface we want for URLs.
  return redact(url);
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name in headers) {
    if (!Object.prototype.hasOwnProperty.call(headers, name)) continue;
    const value = headers[name];
    const lower = name.toLowerCase();
    if (SENSITIVE_HEADER_NAMES.has(lower) || SENSITIVE_HEADER_NAME_PATTERN.test(name)) {
      out[name] = HEADER_VALUE_REDACTED;
      continue;
    }
    // Pass the value through console redact() to catch inline JWTs / emails /
    // API key prefixes that customers stuff into custom headers.
    out[name] = typeof value === "string" ? redact(value) : value;
  }
  return out;
}

export function redactBody(body: string | null, _contentType: string | null): string | null {
  if (body === null) return null;
  if (body === "") return "";
  // Plain regex scan via the existing pipeline — faster and safer than trying
  // to JSON.parse arbitrary payloads for field-aware redaction. The 5ms
  // per-call performance guard inside redact() applies.
  return redact(body);
}
