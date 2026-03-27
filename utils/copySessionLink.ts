import { auth } from "@/lib/firebase";
import { getOrCreateShareLink } from "@/lib/share/getOrCreateShareLink";

export type CopySessionLinkOptions = {
  /** Called around the network request (for button loading/success UX). */
  onBusy?: (busy: boolean) => void;
};

/** Copies the public share URL (`/s/[token]`) after get-or-create on the server. */
export async function copySessionLink(
  sessionId: string | undefined | null,
  options?: CopySessionLinkOptions
): Promise<boolean> {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return false;
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;

  const user = auth.currentUser;
  if (!user) return false;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  if (!origin) return false;

  options?.onBusy?.(true);
  try {
    const url = await getOrCreateShareLink({ sessionId: id, userId: user.uid, origin });
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  } finally {
    options?.onBusy?.(false);
  }
}
