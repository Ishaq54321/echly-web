const WORKSPACE_HINT_KEY = "echly_workspace_hint_v1";

export interface WorkspaceHint {
  workspaceId: string;
  workspaceName: string | null;
  workspaceLogoUrl: string | null;
}

export function getWorkspaceHint(): WorkspaceHint | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(WORKSPACE_HINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Support old format (plain string) gracefully
    if (typeof parsed === "string") {
      return { workspaceId: parsed, workspaceName: null, workspaceLogoUrl: null };
    }
    if (parsed?.workspaceId) return parsed as WorkspaceHint;
    return null;
  } catch {
    return null;
  }
}

export function setWorkspaceHint(hint: WorkspaceHint): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(WORKSPACE_HINT_KEY, JSON.stringify(hint));
  } catch {}
}

export function clearWorkspaceHint(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(WORKSPACE_HINT_KEY);
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
