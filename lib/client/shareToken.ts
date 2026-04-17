const STORAGE_KEY = "echlyShareLinkToken";

/**
 * Single source for the active share link token on the client:
 * 1) URL query `?token=` / `?shareToken=`
 * 2) sessionStorage (see {@link setShareToken})
 * 3) null (SSR / missing)
 */
export function getActiveShareToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl =
      (sp.get("token")?.trim() ?? "") || (sp.get("shareToken")?.trim() ?? "");
    if (fromUrl) return fromUrl;
  } catch {
    /* ignore */
  }
  return getShareToken()?.trim() ?? null;
}

export function setShareToken(token: string): void {
  if (!token || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getShareToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearShareToken(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
