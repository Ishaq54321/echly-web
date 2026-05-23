// Shared formatting helpers for Phase 4 event-driven email templates.

/**
 * Flatten TipTap mention markup (`@[Name](uid)`) down to a human-readable
 * `@Name`. Comment bodies are persisted with the uid embedded so the client
 * can resolve avatars/profiles, but emails must never show the raw uid.
 */
export function flattenMentionMarkup(text: string): string {
  return text.replace(/@\[([^\]]+)\]\([^)]*\)/g, "@$1");
}

/**
 * Convert a rich-text description (TipTap HTML) into a plain-text preview
 * suitable for email bodies / subject preheaders. Mention spans
 * (`<span data-type="mention" data-label="Name">@Name</span>`) are reduced to
 * `@Name`, block elements become newlines, other tags are stripped, and basic
 * HTML entities are decoded. Callers should still run `commentExcerpt()` on
 * the result to clamp length and collapse whitespace.
 */
export function descriptionToPlainText(html: string): string {
  if (!html) return "";
  let out = html.replace(
    /<span\b([^>]*?)\bdata-type\s*=\s*"mention"([^>]*)>([\s\S]*?)<\/span>/gi,
    (_match, before: string, after: string, _inner: string) => {
      const attrs = `${before}${after}`;
      const labelMatch = attrs.match(/\bdata-label\s*=\s*"([^"]*)"/i);
      const label = labelMatch?.[1]?.trim();
      return label ? `@${label}` : "";
    }
  );
  out = out.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  out = out.replace(/<\/(p|div|h[1-6]|li|blockquote)\s*>/gi, "\n");
  out = out.replace(/<[^>]+>/g, "");
  out = out
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
  return out;
}

/**
 * Truncate a comment body to a preview-friendly length. Collapses internal
 * whitespace (newlines, runs of spaces) to single spaces so it renders on one
 * line in a subject preheader / quoted block, and appends an ellipsis when
 * clipped. Also strips `@[Name](uid)` mention markup so the uid never leaks
 * into the email.
 */
export function commentExcerpt(text: string, maxLen: number = 120): string {
  const clean = flattenMentionMarkup(text).trim().replace(/\s+/g, " ");
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).trim() + "…";
}

/**
 * Resolve a human display name for a user, preferring the friendliest field
 * available. Falls back to the email local-part, then a generic "there" so a
 * template never renders an empty name even with a sparse user doc.
 *
 * Fields are typed loose (string | null | undefined) because UserDoc stores
 * firstName/email as `string | null`.
 */
export function displayName(user: {
  displayName?: string | null;
  firstName?: string | null;
  email?: string | null;
}): string {
  if (user.displayName) return user.displayName;
  if (user.firstName) return user.firstName;
  if (user.email) {
    const local = user.email.split("@")[0];
    if (local) return local;
  }
  return "there";
}

/**
 * First-name-style greeting target for founder-voice emails. Same precedence
 * as displayName but tuned for "Hey {x}," — prefers firstName over a full
 * display name, then email local-part, then "there".
 */
export function greetingName(user: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}): string {
  if (user.firstName) return user.firstName;
  if (user.displayName) return user.displayName;
  if (user.email) {
    const local = user.email.split("@")[0];
    if (local) return local;
  }
  return "there";
}
