const STORAGE_KEY = "echly_share_token";

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
