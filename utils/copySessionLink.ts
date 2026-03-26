import { getSessionLink } from "./getSessionLink";

/** Copies the canonical session URL to the clipboard. Returns whether a write was attempted and succeeded. */
export async function copySessionLink(sessionId: string | undefined | null): Promise<boolean> {
  const link = getSessionLink(sessionId);
  if (!link) return false;
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    return false;
  }
}
