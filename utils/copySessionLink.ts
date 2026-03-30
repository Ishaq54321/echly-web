import { getSessionLink } from "@/utils/getSessionLink";

export type CopySessionLinkOptions = {
  /** Reserved for UX parity (copy is synchronous; no network). */
  onBusy?: (busy: boolean) => void;
};

/** Copies the canonical session board URL (`/session/:id`); no share-link API call. */
export async function copySessionLink(
  sessionId: string | undefined | null,
  userId: string | null | undefined,
  options?: CopySessionLinkOptions
): Promise<boolean> {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return false;
  const uid = typeof userId === "string" ? userId.trim() : "";
  if (!uid) return false;
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;

  const url = getSessionLink(id);
  if (!url) return false;

  options?.onBusy?.(true);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  } finally {
    options?.onBusy?.(false);
  }
}
