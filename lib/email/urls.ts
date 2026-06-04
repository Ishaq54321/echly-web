// Centralized URL builders for email links (Phase 4).
//
// Session/ticket emails all need a link back into the app. The path shape
// (`/session/{id}` for a board, `/session/{id}?ticket={id}` for a ticket deep
// link) is NOT re-derived here — it comes from the neutral utils/sessionUrl.ts
// module, which is the single source of truth shared with the client copy-link
// builder (utils/getSessionLink.ts). This guarantees email links and in-app
// links can never drift (they previously did: email hardcoded a dead
// `/s/{id}#feedback-{id}` that 404'd and never opened the ticket).
//
// APP_URL mirrors how sendEmailWithPreferences.ts resolves it
// (NEXT_PUBLIC_APP_URL, falling back to the production origin) so links are
// consistent across every send path. It is passed to the pure builders as the
// origin (the client passes window.location.origin instead).

import { buildSessionUrl, buildTicketDeepLink } from "@/utils/sessionUrl";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

/** Public URL for a shared session (`{APP_URL}/session/{id}`). */
export function sessionUrl(sessionId: string): string {
  return buildSessionUrl(APP_URL, sessionId);
}

/** Deep link to a specific ticket within a session (`{APP_URL}/session/{id}?ticket={fid}`). */
export function ticketUrl(sessionId: string, feedbackId: string): string {
  return buildTicketDeepLink(APP_URL, sessionId, feedbackId);
}

/**
 * Chrome Web Store listing for the extension. Uses the same PLACEHOLDER id
 * the rest of the app uses (ExtensionStep / useSessionEntryCta / /docs); all
 * get the real id at once when the listing is published.
 */
// TODO: replace with real Chrome Web Store extension ID once published.
export const EXTENSION_INSTALL_URL =
  "https://chromewebstore.google.com/detail/echly/PLACEHOLDER";

/** The stubbed /docs page (Phase 3). */
export function docsUrl(): string {
  return `${APP_URL}/docs`;
}

/**
 * In-app activity feed — the digest email's primary CTA ("Open Annote").
 * Lands the user on the same activity surface the bell links to, so the email
 * and the in-app notifications stay consistent.
 */
export function activityUrl(): string {
  return `${APP_URL}/activity`;
}
