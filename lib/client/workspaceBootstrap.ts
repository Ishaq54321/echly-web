const KEY = "echly_workspace_hint_v1";

export function getWorkspaceHint(): string | null {
  try {
    const value = localStorage.getItem(KEY);
    if (!value) return null;

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  } catch {
    return null;
  }
}

export function setWorkspaceHint(workspaceId: string | null) {
  try {
    if (!workspaceId) {
      localStorage.removeItem(KEY);
      return;
    }

    localStorage.setItem(KEY, workspaceId.trim());
  } catch {
    // silent
  }
}

export function clearWorkspaceHint() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

const UID_HINT_KEY = "echly_uid_hint_v1";

export function getUidHint(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(UID_HINT_KEY);
  } catch {
    return null;
  }
}

export function setUidHint(uid: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UID_HINT_KEY, uid);
  } catch {}
}

export function clearUidHint(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(UID_HINT_KEY);
  } catch {}
}
