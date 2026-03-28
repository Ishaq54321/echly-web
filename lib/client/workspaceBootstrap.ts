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
