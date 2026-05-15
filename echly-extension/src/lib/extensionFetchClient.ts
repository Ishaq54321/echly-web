/**
 * Fetch client adapter for the DescriptionEditor (and its hooks) when used
 * inside the Chrome extension build. The dashboard build calls `fetch()`
 * directly against same-origin `/api/...` paths and relies on cookies. The
 * extension runs in `chrome-extension://` and must (a) prepend the API
 * base URL, and (b) attach `Authorization: Bearer <token>` via the
 * existing `authFetch` plumbing in `contentAuthFetch.ts`.
 *
 * `authFetch` already prepends API_BASE for relative paths, so this is a
 * thin re-export with a `(path, init) => Promise<Response>` signature that
 * matches what `useAiImprove` / `useVoiceRecording` expect.
 */
import { authFetch } from "../contentAuthFetch";

export function extensionFetchClient(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return authFetch(path, init);
}
