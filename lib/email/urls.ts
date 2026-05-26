// Centralized URL builders for email links (Phase 4).
//
// Session/ticket emails all need a link back into the app. Keeping the
// construction here means the path shape (`/s/{id}`, `#feedback-{id}`) lives
// in one place rather than being re-derived in each template/caller.
//
// APP_URL mirrors how sendEmailWithPreferences.ts resolves it
// (NEXT_PUBLIC_APP_URL, falling back to the production origin) so links are
// consistent across every send path.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://annote.ai";

/** Public URL for a shared session. */
export function sessionUrl(sessionId: string): string {
  return `${APP_URL}/s/${sessionId}`;
}

/** Deep link to a specific ticket within a session. */
export function ticketUrl(sessionId: string, feedbackId: string): string {
  return `${APP_URL}/s/${sessionId}#feedback-${feedbackId}`;
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
