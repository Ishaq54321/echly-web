/**
 * Session controller: create session, active session change, resume session.
 * Message calls: ECHLY_SET_ACTIVE_SESSION, ECHLY_SESSION_MODE_*.
 */

type SessionPointer = { id: string; title: string; description: string; type: string };
type SetLoadSessionWithPointers = (value: { sessionId: string; pointers: SessionPointer[] } | null) => void;
type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;

export function createSessionController(deps: {
  apiFetch: ApiFetch;
  setSessionIdOverride: (id: string | null) => void;
  setLoadSessionWithPointers: SetLoadSessionWithPointers;
}): {
  createSession: () => Promise<{ id: string } | null>;
  onActiveSessionChange: (newSessionId: string) => void;
  onResumeSessionSelect: (sessionId: string) => Promise<void>;
  onSessionModeStart: () => void;
  onSessionModePause: () => void;
  onSessionModeResume: () => void;
  onSessionModeEnd: () => void;
} {
  const { apiFetch, setSessionIdOverride, setLoadSessionWithPointers } = deps;

  async function createSession(): Promise<{ id: string } | null> {
    console.log("[Echly] Creating session");
    try {
      const res = await apiFetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = (await res.json()) as { success?: boolean; session?: { id: string } };
      console.log("[Echly] Create session response:", {
        ok: res.ok,
        status: res.status,
        success: json.success,
        sessionId: json.session?.id,
      });
      if (!res.ok || !json.success || !json.session?.id) return null;
      return { id: json.session.id };
    } catch (err) {
      console.error("[Echly] Failed to create session:", err);
      return null;
    }
  }

  function onActiveSessionChange(newSessionId: string): void {
    chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId }, () => {});
    setSessionIdOverride(newSessionId);
  }

  async function onResumeSessionSelect(sessionId: string): Promise<void> {
    chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId }, () => {
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_RESUME" }).catch(() => {});
    });
    setSessionIdOverride(sessionId);
    try {
      const res = await apiFetch(`/api/feedback?sessionId=${encodeURIComponent(sessionId)}&limit=50`);
      const json = (await res.json()) as {
        feedback?: Array<{ id: string; title: string; description: string; type?: string }>;
      };
      const list = json.feedback ?? [];
      const pointers = list.map((f) => ({
        id: f.id,
        title: f.title ?? "",
        description: f.description ?? "",
        type: f.type ?? "Feedback",
      }));
      setLoadSessionWithPointers({ sessionId, pointers });
    } catch (err) {
      console.error("[Echly] Failed to load session feedback:", err);
      setLoadSessionWithPointers({ sessionId, pointers: [] });
    }
  }

  function onSessionModeStart(): void {
    chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch(() => {});
  }
  function onSessionModePause(): void {
    chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_PAUSE" }).catch(() => {});
  }
  function onSessionModeResume(): void {
    chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_RESUME" }).catch(() => {});
  }
  function onSessionModeEnd(): void {
    chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }).catch(() => {});
  }

  return {
    createSession,
    onActiveSessionChange,
    onResumeSessionSelect,
    onSessionModeStart,
    onSessionModePause,
    onSessionModeResume,
    onSessionModeEnd,
  };
}
