// Single source of truth for the public session-board URL shape.
//
// Both the client copy-link builder (utils/getSessionLink.ts, "use client")
// and the server-side email builder (lib/email/urls.ts) consume this module so
// the path + deep-link convention can never drift between them again. Before
// this existed, the email builder hardcoded a dead `/s/{id}#feedback-{id}`
// scheme while the app shipped `/session/{id}?ticket={id}`, so every email link
// 404'd and no ticket deep-link opened.
//
// IMPORTANT: keep this module pure. It must be importable from BOTH a
// "use client" file and server email code, so it may contain ONLY plain string
// constants and pure functions. Do NOT add `window.*`, `process.env`, React,
// or any client-only / server-only import here — origin is always passed in by
// the caller (window.location.origin on the client, APP_URL on the server).

/** Canonical path for the public session feedback board (`/session/:sessionId`). */
export const SESSION_FEEDBACK_PATH = "/session";

/**
 * Query param the session page reads to open a specific ticket.
 * Verified in app/(app)/dashboard/[sessionId]/SessionPageClient.tsx
 * (`searchParams.get("ticket")` at L396) — the public route
 * app/(public)/session/[sessionId]/page.tsx renders the same component, so both
 * honor `?ticket=`. There is NO hash (`#feedback-`) parsing anywhere in the
 * session page; the legacy email anchor was dead. Matches the app-wide
 * convention used in DiscussionConversation.tsx and ActivityItem.tsx.
 */
export const SESSION_TICKET_PARAM = "ticket";

/** Path (no origin) to a session board, e.g. `/session/abc`. */
export function buildSessionPath(sessionId: string): string {
  return `${SESSION_FEEDBACK_PATH}/${sessionId}`;
}

/**
 * Absolute session-board URL. `origin` is supplied by the caller
 * (window.location.origin on the client, APP_URL on the server) so this stays
 * environment-agnostic.
 */
export function buildSessionUrl(origin: string, sessionId: string): string {
  return `${origin}${buildSessionPath(sessionId)}`;
}

/**
 * Absolute deep link to a specific ticket within a session, using the
 * `?ticket=` query param the session page actually reads (NOT a hash anchor).
 */
export function buildTicketDeepLink(
  origin: string,
  sessionId: string,
  feedbackId: string
): string {
  return `${buildSessionUrl(origin, sessionId)}?${SESSION_TICKET_PARAM}=${feedbackId}`;
}
