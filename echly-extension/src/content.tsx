/**
 * Content script: ultra-thin UI layer. Auto-injected via manifest on all URLs.
 * Single mount, visibility controlled by background (ECHLY_VISIBILITY). No blocking overlays.
 * Auth in popup only; unauthenticated = minimal disabled state with "Sign in from extension" tooltip.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { createApiClient } from "./content/contentAuth";
import { createContentState, type GlobalUIState } from "./content/contentState";
import { setupContentEventBridge } from "./content/contentEvents";
import { createSessionController } from "./content/contentSession";
import {
  createFeedbackPipeline,
  type ExtensionClarityPending,
} from "./content/contentPipeline";
import { uploadScreenshot, generateFeedbackId, generateScreenshotId } from "./contentScreenshot";
import { getVisibleTextFromScreenshot } from "./ocr";
import CaptureWidget from "@/components/CaptureWidget";

const ROOT_ID = "echly-root";
const SHADOW_HOST_ID = "echly-shadow-host";
const THEME_STORAGE_KEY = "widget-theme";

const apiClient = createApiClient();
const contentState = createContentState({ shadowHostId: SHADOW_HOST_ID });

function getPreferredTheme(): "dark" | "light" {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "dark";
  }
}

function applyThemeToRoot(root: HTMLElement, theme: "dark" | "light"): void {
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

type AuthUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };

function requestOpenPopup(): void {
  chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" }).catch(() => {});
}

type ContentAppProps = { widgetRoot: HTMLElement; initialTheme: "dark" | "light" };

function ContentApp({ widgetRoot, initialTheme }: ContentAppProps) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [sessionMessage, setSessionMessage] = React.useState<string | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [theme, setTheme] = React.useState<"dark" | "light">(initialTheme);
  const [globalState, setGlobalState] = React.useState<GlobalUIState>(contentState.getInitialState());
  const [sessionIdOverride, setSessionIdOverride] = React.useState<string | null>(null);
  const [loadSessionWithPointers, setLoadSessionWithPointers] = React.useState<{
    sessionId: string;
    pointers: Array<{ id: string; title: string; description: string; type: string }>;
  } | null>(null);
  const effectiveSessionId = sessionIdOverride ?? globalState.sessionId;
  const widgetToggleRef = React.useRef<(() => void) | null>(null);
  const submissionLockRef = React.useRef(false);
  const clarityAssistantSubmitLockRef = React.useRef(false);
  const clarityTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [extensionClarityPending, setExtensionClarityPending] = React.useState<ExtensionClarityPending | null>(null);
  const [showClarityAssistant, setShowClarityAssistant] = React.useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = React.useState(false);
  const [editedTranscript, setEditedTranscript] = React.useState("");
  const [clarityAssistantSubmitting, setClarityAssistantSubmitting] = React.useState(false);

  const logoUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("assets/Echly_logo.svg")
      : "/Echly_logo.svg";

  React.useEffect(() => {
    const toggleHandler = () => widgetToggleRef.current?.();
    window.addEventListener("ECHLY_TOGGLE_WIDGET", toggleHandler);
    return () => window.removeEventListener("ECHLY_TOGGLE_WIDGET", toggleHandler);
  }, []);

  React.useEffect(() => contentState.subscribeGlobalState(setGlobalState), []);

  React.useEffect(() => {
    chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, (response: { state?: GlobalUIState } | undefined) => {
      if (response?.state) {
        contentState.setHostVisibility(response.state.visible ?? false);
        setGlobalState(response.state);
      }
    });
  }, []);

  React.useEffect(() => {
    if (!globalState.sessionModeActive || !globalState.sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.apiFetch(
          `/api/feedback?sessionId=${encodeURIComponent(globalState.sessionId!)}&limit=50`
        );
        if (cancelled) return;
        const json = (await res.json()) as { feedback?: Array<{ id: string; title: string; description: string; type?: string }> };
        const list = json.feedback ?? [];
        const pointers = list.map((f) => ({ id: f.id, title: f.title ?? "", description: f.description ?? "", type: f.type ?? "Feedback" }));
        if (cancelled) return;
        setLoadSessionWithPointers({ sessionId: globalState.sessionId!, pointers });
      } catch (err) {
        if (!cancelled) {
          console.error("[Echly] Failed to load session feedback for markers:", err);
          setLoadSessionWithPointers({ sessionId: globalState.sessionId!, pointers: [] });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [globalState.sessionModeActive, globalState.sessionId]);

  React.useEffect(() => {
    const sendActiveSessionIfDashboard = () => {
      const origin = window.location.origin;
      const isAppOrigin = origin === "https://echly-web.vercel.app" || origin === "http://localhost:3000";
      if (!isAppOrigin) return;
      const segments = window.location.pathname.split("/").filter(Boolean);
      if (segments[0] === "dashboard" && segments[1]) {
        chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: segments[1] }, () => {});
      }
    };
    sendActiveSessionIfDashboard();
    window.addEventListener("popstate", sendActiveSessionIfDashboard);
    const interval = setInterval(sendActiveSessionIfDashboard, 2000);
    return () => {
      window.removeEventListener("popstate", sendActiveSessionIfDashboard);
      clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_AUTH_STATE" },
      (response: { authenticated?: boolean; user?: AuthUser | null } | undefined) => {
        if (response?.authenticated && response.user?.uid) {
          setUser({ uid: response.user.uid, name: response.user.name ?? null, email: response.user.email ?? null, photoURL: response.user.photoURL ?? null });
        } else setUser(null);
        setAuthChecked(true);
      }
    );
  }, []);

  React.useEffect(() => {
    if (isEditingFeedback && clarityTextareaRef.current) clarityTextareaRef.current.focus();
  }, [isEditingFeedback]);

  const sessionController = React.useMemo(
    () =>
      createSessionController({
        apiFetch: apiClient.apiFetch,
        setSessionIdOverride,
        setLoadSessionWithPointers,
      }),
    []
  );

  const feedbackPipeline = React.useMemo(
    () =>
      createFeedbackPipeline({
        effectiveSessionId,
        user,
        apiFetch: apiClient.apiFetch,
        getVisibleTextFromScreenshot,
        uploadScreenshot,
        generateFeedbackId,
        generateScreenshotId,
        submissionLockRef,
        clarityAssistantSubmitLockRef,
        setExtensionClarityPending,
        setEditedTranscript,
        setIsEditingFeedback,
        setClarityAssistantSubmitting,
        setShowClarityAssistant,
      }),
    [effectiveSessionId, user]
  );

  const onRecordingChange = React.useCallback((recording: boolean) => {
    if (recording) {
      chrome.runtime.sendMessage({ type: "START_RECORDING" }, (response: { ok?: boolean; error?: string } | undefined) => {
        if (chrome.runtime.lastError) setSessionMessage(chrome.runtime.lastError.message || "Failed to start recording");
        else if (!response?.ok) setSessionMessage(response?.error || "No active session selected.");
      });
    } else chrome.runtime.sendMessage({ type: "STOP_RECORDING" }).catch(() => {});
  }, []);

  const onExpandRequest = React.useCallback(() => chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch(() => {}), []);
  const onCollapseRequest = React.useCallback(() => chrome.runtime.sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" }).catch(() => {}), []);
  const onThemeToggle = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyThemeToRoot(widgetRoot, next);
  }, [theme, widgetRoot]);

  const fetchSessions = React.useCallback(async () => {
    const res = await apiClient.apiFetch("/api/sessions");
    const json = (await res.json()) as { success?: boolean; sessions?: Array<{ id: string; title: string; updatedAt?: string; openCount?: number; resolvedCount?: number; feedbackCount?: number }> };
    const sessions = json.sessions ?? [];
    console.log("[Echly] Sessions returned:", { ok: res.ok, status: res.status, success: json.success, count: sessions.length, sessions });
    if (!res.ok || !json.success) return [];
    return sessions;
  }, []);

  const handleDelete = React.useCallback(async (_id: string) => {}, []);

  if (!authChecked) return null;

  if (!user) {
    return (
      <div style={{ pointerEvents: "auto" }}>
        <button
          type="button"
          title="Sign in from extension"
          onClick={requestOpenPopup}
          style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "10px 20px", borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#6b7280", fontSize: "14px",
            fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <img src={logoUrl} alt="" width={22} height={22} style={{ display: "block" }} />
          Sign in from extension
        </button>
      </div>
    );
  }

  const pending = extensionClarityPending;

  return (
    <>
      {showClarityAssistant && pending && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", zIndex: 999999, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif' }}>
          <div style={{ maxWidth: 420, width: "90%", background: "#F8FBFF", borderRadius: 12, padding: 20, boxShadow: "0 12px 32px rgba(0,0,0,0.12)", border: "1px solid #E6F0FF", animation: "echly-clarity-card-in 150ms ease-out" }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: "#111" }}>Quick suggestion</div>
            <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>Your feedback may be unclear.</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>Try specifying what looks wrong and what change you want.</div>
            {pending.suggestedRewrite && <div style={{ fontSize: 13, fontStyle: "italic", color: "#4b5563", marginBottom: 12, opacity: 0.9 }}>Example: &quot;{pending.suggestedRewrite}&quot;</div>}
            <textarea
              ref={clarityTextareaRef}
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              disabled={!isEditingFeedback}
              rows={3}
              placeholder="Your feedback"
              aria-label="Feedback message"
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #E6F0FF", fontSize: 14, resize: "vertical", minHeight: 72, marginBottom: 16, background: isEditingFeedback ? "#fff" : "#f3f4f6", color: "#111" }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {isEditingFeedback ? (
                <button
                  type="button"
                  disabled={clarityAssistantSubmitting}
                  onClick={() => {
                    if (clarityAssistantSubmitLockRef.current || !pending) return;
                    clarityAssistantSubmitLockRef.current = true;
                    setClarityAssistantSubmitting(true);
                    setShowClarityAssistant(false);
                    setExtensionClarityPending(null);
                    setIsEditingFeedback(false);
                    feedbackPipeline.submitEditedFeedback(pending, editedTranscript).catch((err) => console.error("[Echly] Done submission failed:", err)).finally(() => { clarityAssistantSubmitLockRef.current = false; setClarityAssistantSubmitting(false); });
                  }}
                  style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: clarityAssistantSubmitting ? "default" : "pointer", opacity: clarityAssistantSubmitting ? 0.8 : 1 }}
                >Done</button>
              ) : (
                <>
                  <button type="button" disabled={clarityAssistantSubmitting} onClick={() => setIsEditingFeedback(true)} style={{ background: "transparent", border: "1px solid #E6F0FF", borderRadius: 8, padding: "8px 14px", fontSize: 14, color: "#374151", cursor: clarityAssistantSubmitting ? "default" : "pointer", opacity: clarityAssistantSubmitting ? 0.7 : 1 }}>Edit feedback</button>
                  <button
                    type="button"
                    disabled={clarityAssistantSubmitting}
                    onClick={() => {
                      if (clarityAssistantSubmitLockRef.current || !pending) return;
                      clarityAssistantSubmitLockRef.current = true;
                      setClarityAssistantSubmitting(true);
                      setShowClarityAssistant(false);
                      setExtensionClarityPending(null);
                      setIsEditingFeedback(false);
                      feedbackPipeline.submitPendingFeedback(pending).catch((err) => console.error("[Echly] Submit anyway failed:", err)).finally(() => { clarityAssistantSubmitLockRef.current = false; setClarityAssistantSubmitting(false); });
                    }}
                    style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 500, cursor: clarityAssistantSubmitting ? "default" : "pointer", opacity: clarityAssistantSubmitting ? 0.8 : 1 }}
                  >Submit anyway</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <CaptureWidget
        sessionId={effectiveSessionId ?? ""}
        userId={user.uid}
        extensionMode={true}
        onComplete={feedbackPipeline.handleComplete}
        onDelete={handleDelete}
        widgetToggleRef={widgetToggleRef}
        onRecordingChange={onRecordingChange}
        expanded={globalState.expanded}
        onExpandRequest={onExpandRequest}
        onCollapseRequest={onCollapseRequest}
        captureDisabled={false}
        theme={theme}
        onThemeToggle={onThemeToggle}
        fetchSessions={fetchSessions}
        onResumeSessionSelect={sessionController.onResumeSessionSelect}
        loadSessionWithPointers={loadSessionWithPointers}
        onSessionLoaded={() => setLoadSessionWithPointers(null)}
        onSessionEnd={() => setSessionIdOverride(null)}
        onCreateSession={sessionController.createSession}
        onActiveSessionChange={sessionController.onActiveSessionChange}
        globalSessionModeActive={globalState.sessionModeActive ?? false}
        globalSessionPaused={globalState.sessionPaused ?? false}
        onSessionModeStart={sessionController.onSessionModeStart}
        onSessionModePause={sessionController.onSessionModePause}
        onSessionModeResume={sessionController.onSessionModeResume}
        onSessionModeEnd={sessionController.onSessionModeEnd}
      />
    </>
  );
}

const SHADOW_RESET = `
  :host { all: initial; }
  #echly-root { all: initial; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif; }
  #echly-root * { box-sizing: border-box; }
`;

function injectShadowStyles(shadowRoot: ShadowRoot): void {
  if (shadowRoot.querySelector("#echly-styles")) return;
  const link = document.createElement("link");
  link.id = "echly-styles";
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("popup.css");
  shadowRoot.appendChild(link);
  const reset = document.createElement("style");
  reset.id = "echly-reset";
  reset.textContent = SHADOW_RESET;
  shadowRoot.appendChild(reset);
}

function mountReactApp(host: HTMLDivElement): void {
  const shadowRoot = host.attachShadow({ mode: "open" });
  injectShadowStyles(shadowRoot);
  const container = document.createElement("div");
  container.id = ROOT_ID;
  container.setAttribute("data-echly-ui", "true");
  container.style.all = "initial";
  container.style.boxSizing = "border-box";
  container.style.pointerEvents = "auto";
  container.style.width = "auto";
  container.style.height = "auto";
  const initialTheme = getPreferredTheme();
  container.setAttribute("data-theme", initialTheme);
  shadowRoot.appendChild(container);
  const reactRoot = createRoot(container);
  reactRoot.render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />);
}

function main(): void {
  let host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = SHADOW_HOST_ID;
    host.setAttribute("data-echly-ui", "true");
    host.style.position = "fixed";
    host.style.bottom = "24px";
    host.style.right = "24px";
    host.style.width = "auto";
    host.style.height = "auto";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "auto";
    host.style.display = "none";
    document.documentElement.appendChild(host);
    mountReactApp(host);
  }
  setupContentEventBridge(host);
  contentState.syncInitialGlobalState(host);
  contentState.ensureVisibilityStateRefresh();
}

main();
