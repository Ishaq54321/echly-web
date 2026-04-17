import { buildPublicScreenshotUrl } from "@/lib/client/publicScreenshotUrl";

/** Options for resolving a feedback screenshot to a browser-usable URL. */
export type ResolveScreenshotUrlOptions = {
  /** Same value as the feedback session id; required for public Storage URLs. */
  sessionId?: string;
};

/**
 * Returns the Firebase Storage JSON API public media URL for a screenshot, or null
 * if ids are missing or the bucket env is not configured.
 */
export function getScreenshotUrl(
  screenshotId: string | null | undefined,
  options?: ResolveScreenshotUrlOptions
): string | null {
  const id = typeof screenshotId === "string" ? screenshotId.trim() : "";
  const sessionId = options?.sessionId?.trim() ?? "";
  if (!id || !sessionId) return null;
  try {
    return buildPublicScreenshotUrl(sessionId, id);
  } catch {
    return null;
  }
}
