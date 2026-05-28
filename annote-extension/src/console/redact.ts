/**
 * Capture-time PII / secret redaction.
 *
 * Applied in the MAIN world to every console message and stringified arg
 * before it enters the ring buffer. The bar is "permissive over-redaction":
 * if a string looks even vaguely like a credential, we replace it. We never
 * Luhn-check credit cards or otherwise narrow with semantic checks — those
 * give false negatives we cannot afford.
 *
 * Every regex is linear-time (no nested quantifiers, no exponential
 * backtracking shapes) and we wrap the whole pipeline in a per-input
 * performance guard: if any single redaction call exceeds 5ms wall-clock,
 * the entry is replaced with a fixed sentinel.
 */

type ReplacerFn = (match: string, ...args: string[]) => string;

interface RedactionPattern {
  readonly name: string;
  readonly pattern: RegExp;
  readonly replacement: string | ReplacerFn;
}

// JWT — three base64url segments separated by dots, prefix anchored on the
// usual "eyJ" header.
const JWT_PATTERN: RedactionPattern = {
  name: "jwt",
  pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  replacement: "<jwt>",
};

// Email — permissive RFC-ish match; intentionally over-matches on weird TLDs.
const EMAIL_PATTERN: RedactionPattern = {
  name: "email",
  pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  replacement: "<email>",
};

// Credit card — 13-19 digits with optional space/hyphen separators between
// groups. No Luhn validation by design (per spec). The lookarounds prevent
// matching the middle of a longer digit run (e.g. a 32-digit hash).
const CREDIT_CARD_PATTERN: RedactionPattern = {
  name: "card",
  pattern: /(?<![0-9])(?:[0-9]{4}[-\s]?){3}[0-9]{1,7}(?![0-9])/g,
  replacement: "<card>",
};

// Phone — E.164 and common US/international groupings. Conservative to avoid
// turning every short numeric ID into <phone>.
const PHONE_PATTERN: RedactionPattern = {
  name: "phone",
  pattern: /(?<![0-9])(?:\+?[1-9][0-9]{0,2}[-\s.]?)?\(?[0-9]{3}\)?[-\s.][0-9]{3}[-\s.][0-9]{4}(?![0-9])/g,
  replacement: "<phone>",
};

// E.164 standalone (no separators): + then 8-15 digits.
const PHONE_E164_PATTERN: RedactionPattern = {
  name: "phone-e164",
  pattern: /(?<![0-9])\+[1-9][0-9]{7,14}(?![0-9])/g,
  replacement: "<phone>",
};

// API key prefixes (Stripe, GitHub, Slack). Greedy on the alphanumeric tail.
const API_KEY_PATTERN: RedactionPattern = {
  name: "api-key",
  pattern: /\b(?:sk_live_|sk_test_|pk_live_|pk_test_|ghp_|gho_|ghu_|ghs_|xox[bpa]-)[A-Za-z0-9_-]+/g,
  replacement: "<key>",
};

// Authorization header (e.g. "Authorization: Bearer eyJ..."). Match the whole
// header value to end-of-line — the spec's `\S+` form would only match the
// scheme ("Bearer") and leave the token exposed, which defeats the point.
// Behavior matches Cookie / Set-Cookie below for consistency.
const AUTH_HEADER_PATTERN: RedactionPattern = {
  name: "auth-header",
  pattern: /Authorization:\s*[^\r\n]+/gi,
  replacement: "Authorization: <auth>",
};

// Cookie request header. Negative lookbehind for "Set-" so it doesn't
// double-process a Set-Cookie line.
const COOKIE_HEADER_PATTERN: RedactionPattern = {
  name: "cookie-header",
  pattern: /(?<!Set-)Cookie:\s*[^\r\n]+/gi,
  replacement: "Cookie: <cookie>",
};

// Set-Cookie response header.
const SET_COOKIE_HEADER_PATTERN: RedactionPattern = {
  name: "set-cookie-header",
  pattern: /Set-Cookie:\s*[^\r\n]+/gi,
  replacement: "Set-Cookie: <cookie>",
};

// Sensitive query-string values: preserves the key, masks the value.
// Keys: token, key, secret, api_key, access_token, password, auth, apikey.
// Linear-time: the value class excludes `&`, `#`, whitespace, and quote chars
// so it can't backtrack across delimiters.
const SENSITIVE_QUERY_PATTERN: RedactionPattern = {
  name: "sensitive-query",
  pattern: /([?&;])(token|key|secret|api_key|access_token|password|auth|apikey)=([^&#\s"'<>]+)/gi,
  replacement: ((_match, prefix, paramName) => `${prefix}${paramName}=<redacted>`) as ReplacerFn,
};

const PATTERNS: readonly RedactionPattern[] = Object.freeze([
  JWT_PATTERN,
  EMAIL_PATTERN,
  CREDIT_CARD_PATTERN,
  PHONE_PATTERN,
  PHONE_E164_PATTERN,
  API_KEY_PATTERN,
  AUTH_HEADER_PATTERN,
  COOKIE_HEADER_PATTERN,
  SET_COOKIE_HEADER_PATTERN,
  SENSITIVE_QUERY_PATTERN,
]);

const REDACTION_TIMEOUT_MS = 5;
const REDACTION_TIMEOUT_SENTINEL = "<redacted by Annote: redaction timeout>";

function nowMs(): number {
  // performance is available in MAIN world, isolated world, and Node ≥16
  // (which the test runner needs). Fall back to Date.now() if absent.
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

export function redact(input: string): string {
  if (!input) return input;
  const start = nowMs();
  try {
    let out = input;
    for (const { pattern, replacement } of PATTERNS) {
      // Defensive: regex literals with the /g flag carry lastIndex state,
      // but each `replace` call resets lastIndex itself, so we don't need to.
      out = typeof replacement === "string"
        ? out.replace(pattern, replacement)
        : out.replace(pattern, replacement);
      if (nowMs() - start > REDACTION_TIMEOUT_MS) {
        return REDACTION_TIMEOUT_SENTINEL;
      }
    }
    return out;
  } catch {
    return REDACTION_TIMEOUT_SENTINEL;
  }
}

// Exposed for tests only — lets the test suite iterate every pattern by name.
export const __test_only_patterns: readonly RedactionPattern[] = PATTERNS;
