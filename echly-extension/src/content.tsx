/**
 * Content script: ultra-thin UI layer. Injected on demand when user clicks extension icon (Loom-style).
 * Single mount, visibility controlled by background (ECHLY_VISIBILITY). No blocking overlays.
 * Auth is resolved silently by background session checks; login opens only on explicit user action.
 */
declare global {
  interface Window {
    __ECHLY_WIDGET_LOADED__?: boolean;
  }
}

import React from "react";
import { createRoot } from "react-dom/client";
import { apiFetch, API_BASE } from "./api";
import "./sessionRelay";
import { getSessionsCached, invalidateSessionsCache } from "./cachedSessions";
import { uploadScreenshot, generateFeedbackId, generateScreenshotId } from "./contentScreenshot";
import { getVisibleTextFromScreenshot } from "./ocr";
import CaptureWidget from "@/lib/capture-engine/core/CaptureWidget";
import type { StructuredFeedback, CaptureContext, FeedbackJob } from "@/lib/capture-engine/core/types";
import { ExtensionCaptureEnvironment } from "@/lib/capture-engine/ExtensionCaptureEnvironment";
import { ECHLY_DEBUG, log } from "@/lib/utils/logger";
import { echlyLog } from "@/lib/debug/echlyLogger";

let echlyEventDispatcher: ((type: string) => void) | null = null;

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((msg: { type?: string }) => {
    if (msg.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
      console.log("[ECHLY CONTENT] received ECHLY_OPEN_PREVIOUS_SESSIONS");
      if (echlyEventDispatcher) {
        echlyEventDispatcher("ECHLY_OPEN_PREVIOUS_SESSIONS");
      }
    }
  });
}

const ROOT_ID = "echly-root";
const SHADOW_HOST_ID = "echly-shadow-host";
const THEME_STORAGE_KEY = "widget-theme";
/** App origin for opening dashboard (same as API base). */
const APP_ORIGIN = API_BASE;

/** Error boundary to capture CaptureWidget render errors (OPEN_WIDGET crash trace). */
class EchlyWidgetErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ECHLY ERROR BOUNDARY]", error);
    console.error("[ECHLY ERROR BOUNDARY] componentStack:", errorInfo.componentStack);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      return <div data-echly-crashed>CRASHED</div>;
    }
    return this.props.children;
  }
}

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

function setHostVisibility(visible: boolean): void {
  console.log("[ECHLY CONTENT] tray visibility:", visible);
  const host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
  if (host) {
    host.style.display = visible ? "block" : "none";
    host.style.pointerEvents = visible ? "auto" : "none";
    host.style.visibility = visible ? "visible" : "hidden";
  }
}

/** Apply tray visibility from global state. Visibility follows global extension state on all tabs. */
function setHostVisibilityFromState(state: GlobalUIState): void {
  setHostVisibility(getShouldShowTray(state));
}

/** Tray remains visible when session is active or paused; hide only when session ends. */
function getShouldShowTray(state: GlobalUIState): boolean {
  return state.visible === true || state.sessionModeActive === true || state.sessionPaused === true;
}

type AuthUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };

type GlobalUIState = {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionModeActive: boolean;
  sessionPaused: boolean;
  sessionLoading: boolean;
  totalCount: number;
  openCount: number;
  skippedCount: number;
  resolvedCount: number;
  pointers: StructuredFeedback[];
  nextCursor: string | null;
  hasMore: boolean;
  isFetching: boolean;
  captureMode: "voice" | "text";
};

/** Prevent overwriting a valid pointer list with empty when session has not changed (Pause → Minimize → Resume). */
function mergeWithPointerProtection(
  prev: GlobalUIState | null | undefined,
  next: GlobalUIState
): GlobalUIState {
  if (
    prev?.sessionId != null &&
    prev.sessionId === next?.sessionId &&
    (prev?.pointers?.length ?? 0) > 0 &&
    (!next?.pointers || next.pointers.length === 0)
  ) {
    return { ...next, pointers: prev.pointers };
  }
  return next;
}

/** Generate a unique id for a feedback job (used for concurrent job queue). */
function createUniqueId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `job-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Auth guard: if user is not authenticated, open auth broker and return false; otherwise return true.
 * Use before Start Session or before opening Previous Sessions to unify Loom-style behavior.
 */
function ensureAuthenticated(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "GET_AUTH_STATE" },
      (r: { authenticated?: boolean; user?: { uid: string } } | undefined) => {
        if (!r?.authenticated || !r?.user?.uid) {
          resolve(false);
          return;
        }
        resolve(true);
      }
    );
  });
}

/** Notify background when content creates a ticket via apiFetch so globalUIState stays in sync. */
function notifyFeedbackCreated(
  ticket: { id: string; title: string; actionSteps?: string[]; type?: string },
  sessionId?: string | null
): void {
  chrome.runtime.sendMessage({
    type: "ECHLY_FEEDBACK_CREATED",
    sessionId: sessionId ?? undefined,
    ticket: {
      id: ticket.id,
      title: ticket.title,
      actionSteps: ticket.actionSteps ?? [],
      type: ticket.type ?? "Feedback",
    },
  }).catch(() => {});
}

function notifyFeedbackCountRefetch(sessionId?: string | null): void {
  if (!sessionId) return;
  chrome.runtime.sendMessage({
    type: "ECHLY_REFETCH_FEEDBACK_COUNT",
    sessionId,
  }).catch(() => {});
}

type ContentAppProps = {
  widgetRoot: HTMLElement;
  initialTheme: "dark" | "light";
};

function ContentApp({ widgetRoot, initialTheme }: ContentAppProps) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [authState, setAuthState] = React.useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [sessionMessage, setSessionMessage] = React.useState<string | null>(null);
  const [theme, setTheme] = React.useState<"dark" | "light">(initialTheme);
  const [globalState, setGlobalState] = React.useState<GlobalUIState>({
    visible: false,
    expanded: false,
    isRecording: false,
    sessionId: null,
    sessionTitle: null,
    sessionModeActive: false,
    sessionPaused: false,
    sessionLoading: false,
    totalCount: 0,
    openCount: 0,
    skippedCount: 0,
    resolvedCount: 0,
    pointers: [],
    nextCursor: null,
    hasMore: false,
    isFetching: false,
    captureMode: "voice",
  });
  const [widgetResetKey, setWidgetResetKey] = React.useState(0);
  const [hasPreviousSessions, setHasPreviousSessions] = React.useState(false);
  const [openResumeModalFromMessage, setOpenResumeModalFromMessage] = React.useState(false);
  /** When POST /api/sessions returns 403 PLAN_LIMIT_REACHED, show upgrade view in tray. */
  const [sessionLimitReached, setSessionLimitReached] = React.useState<{
    message: string;
    upgradePlan: unknown;
  } | null>(null);
  const effectiveSessionId = globalState.sessionId;
  const widgetToggleRef = React.useRef<(() => void) | null>(null);

  type ExtensionClarityPending = {
    tickets: Array<{ title?: string; description?: string; suggestedTags?: string[]; actionSteps?: string[] }>;
    screenshotUrl: string | null;
    screenshotId: string;
    uploadPromise: Promise<string | null>;
    transcript: string;
    screenshot: string | null;
    clarityScore: number;
    clarityIssues: string[];
    suggestedRewrite: string | null;
    confidence: number;
    callbacks: { onSuccess: (ticket: StructuredFeedback) => void; onError: () => void };
    context?: Record<string, unknown>;
  };
  const [extensionClarityPending, setExtensionClarityPending] = React.useState<ExtensionClarityPending | null>(null);
  const [showClarityAssistant, setShowClarityAssistant] = React.useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = React.useState(false);
  const [editedTranscript, setEditedTranscript] = React.useState("");
  const clarityTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const clarityAssistantSubmitLock = React.useRef(false);
  const [clarityAssistantSubmitting, setClarityAssistantSubmitting] = React.useState(false);
  const [isProcessingFeedback, setIsProcessingFeedback] = React.useState(false);
  /** Job queue for concurrent feedback captures; each job shows its own Processing/failed card in the tray. */
  const [feedbackJobs, setFeedbackJobs] = React.useState<FeedbackJob[]>([]);

  React.useEffect(() => {
    if (!isProcessingFeedback) return;
    const timeoutId = setTimeout(() => {
      setIsProcessingFeedback((current) => {
        if (current) {
          console.warn("[ECHLY FAILSAFE] Resetting stuck state");
          return false;
        }
        return current;
      });
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [isProcessingFeedback]);

  const getAssetUrl = React.useCallback((path: string) => {
    if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(path);
    }
    return `/${path.replace(/^assets\//, "")}`;
  }, []);

  const launcherLogoUrl = getAssetUrl("assets/Echly_logo_launcher.svg");

  React.useEffect(() => {
    console.log("[ECHLY DEBUG] ContentApp mounted");
  }, []);


  React.useEffect(() => {
    console.log("[ECHLY DEBUG] openResumeModal state:", openResumeModalFromMessage);
  }, [openResumeModalFromMessage]);

  React.useEffect(() => {
    console.log("[ECHLY DEBUG] hasPreviousSessions state:", hasPreviousSessions);
  }, [hasPreviousSessions]);

  React.useEffect(() => {
    echlyEventDispatcher = (type) => {
      if (type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
        setOpenResumeModalFromMessage(true);
      }
    };

    return () => {
      echlyEventDispatcher = null;
    };
  }, []);

  React.useEffect(() => {
    const toggleHandler = () => {
      widgetToggleRef.current?.();
    };

    window.addEventListener("ECHLY_TOGGLE_WIDGET", toggleHandler);

    return () => {
      window.removeEventListener("ECHLY_TOGGLE_WIDGET", toggleHandler);
    };
  }, []);

  React.useEffect(() => {
    const handler = () => {
      setGlobalState((prev) => ({ ...prev, expanded: false }));
      setWidgetResetKey((k) => k + 1);
    };
    window.addEventListener("ECHLY_RESET_WIDGET", handler as EventListener);
    return () => window.removeEventListener("ECHLY_RESET_WIDGET", handler as EventListener);
  }, []);

  /* Global UI state: derived only from background (ECHLY_GLOBAL_STATE). No local source of truth. */
  React.useEffect(() => {
    const applyGlobalState = (state: GlobalUIState) => {
      setHostVisibilityFromState(state);
      setGlobalState((prev) => mergeWithPointerProtection(prev, state));
    };
    (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__ = applyGlobalState;
    return () => {
      delete (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__;
    };
  }, []);

  /* Global UI state: always overwrite from background; protect pointers when session unchanged (Pause → Minimize → Resume). */
  React.useEffect(() => {
    const handler = (e: CustomEvent<{ state: GlobalUIState }>) => {
      const s = e.detail?.state;
      if (!s) return;
      echlyLog("CONTENT", "global state received", s);
      setHostVisibilityFromState(s);
      setGlobalState((prev) => mergeWithPointerProtection(prev, s));
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  }, []);

  /* Hydrate from background on mount so already-open tabs join active sessions; visibility is applied when state is received. */
  React.useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_GLOBAL_STATE" },
      (response: GlobalStateResponse) => {
        const state = response?.state;
        if (state) {
          setGlobalState((prev) => mergeWithPointerProtection(prev, state));
        }
      }
    );
  }, []);

  /* Hard resync when tab becomes visible so session end is never missed (background push is unreliable). */
  React.useEffect(() => {
    const handler = () => {
      if (document.hidden) return;
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_GLOBAL_STATE" },
        (response: GlobalStateResponse) => {
          if (response?.state) {
            const normalized = normalizeGlobalState(response.state);
            if (normalized) {
              setHostVisibilityFromState(normalized);
              setGlobalState((prev) => mergeWithPointerProtection(prev, normalized));
            }
          }
        }
      );
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  /* On widget open, use shared sessions cache so we don't duplicate GET /api/sessions with preload. */
  React.useEffect(() => {
    if (!globalState.visible) return;
    let cancelled = false;
    getSessionsCached(apiFetch).then((sessions) => {
      if (!cancelled) setHasPreviousSessions(sessions.length > 0);
    }).catch(() => {
      if (!cancelled) setHasPreviousSessions(false);
    });
    return () => {
      cancelled = true;
    };
  }, [globalState.visible]);

  const readApiResponseSafely = React.useCallback(
    async <T,>(response: Response): Promise<{ data: T | null; text: string | null }> => {
      let data: T | null = null;
      let text: string | null = null;

      try {
        text = await response.text();
        try {
          data = JSON.parse(text) as T;
        } catch {
          console.warn("[ECHLY WARN] Non-JSON response:", text);
        }
      } catch (err) {
        console.error("[ECHLY ERROR] Failed to read response:", err);
      }

      return { data, text };
    },
    []
  );

  const isAuthFailureResponse = React.useCallback((text: string | null): boolean => {
    return Boolean(
      text?.includes("Not authenticated") ||
      text?.includes("NOT_AUTHENTICATED")
    );
  }, []);

  const getExtensionToken = React.useCallback(async () => {
    const token = await new Promise<string | null>((resolve) => {
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_EXTENSION_TOKEN" },
        (response: { token?: string | null } | undefined) => {
          resolve(response?.token ?? null);
        }
      );
    });
    console.log("[ECHLY TOKEN] Retrieved:", token ? "YES" : "NO");
    return token;
  }, []);

  const resolveUploadedScreenshotId = React.useCallback(
    async (
      uploadPromise: Promise<string | null>,
      screenshotId: string
    ): Promise<string | undefined> => {
      try {
        const uploadedUrl = await uploadPromise;
        return uploadedUrl ? screenshotId : undefined;
      } catch (err) {
        console.warn("[ECHLY] Screenshot upload failed before feedback create:", err);
        return undefined;
      }
    },
    []
  );

  /* Extension: when background forwards ECHLY_START_SESSION to this tab, run start-session flow. */
  React.useEffect(() => {
    const handler = () => {
      createSession().then((result) => {
        if (result && "id" in result && result.id) {
          onActiveSessionChange(result.id);
          chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch(() => {});
          onExpandRequest();
          setSessionLimitReached(null);
        } else if (result && "limitReached" in result && result.limitReached) {
          setSessionLimitReached({ message: result.message, upgradePlan: result.upgradePlan });
          onExpandRequest();
        }
      });
    };
    window.addEventListener("ECHLY_START_SESSION_REQUEST", handler);
    return () => window.removeEventListener("ECHLY_START_SESSION_REQUEST", handler);
  }, [createSession, onActiveSessionChange, onExpandRequest]);

  /* Extension: when background forwards ECHLY_OPEN_PREVIOUS_SESSIONS to this tab, open the resume modal. */
  React.useEffect(() => {
    const handler = () => setOpenResumeModalFromMessage(true);
    window.addEventListener("ECHLY_OPEN_PREVIOUS_SESSIONS", handler);
    return () => window.removeEventListener("ECHLY_OPEN_PREVIOUS_SESSIONS", handler);
  }, []);

  /* Extension: open widget (icon or popup) → request expand so background keeps state in sync. */
  React.useEffect(() => {
    const handler = () => {
      console.log("[ECHLY CONTENT] OPEN_WIDGET event received in DOM");
      chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch(() => {});
    };
    window.addEventListener("ECHLY_OPEN_WIDGET", handler);
    return () => window.removeEventListener("ECHLY_OPEN_WIDGET", handler);
  }, []);

  const onRecordingChange = React.useCallback((recording: boolean) => {
    if (recording) {
      chrome.runtime.sendMessage(
        { type: "START_RECORDING" },
        (response: { ok?: boolean; error?: string } | undefined) => {
          if (chrome.runtime.lastError) {
            setSessionMessage(chrome.runtime.lastError.message || "Failed to start recording");
            return;
          }
          if (!response?.ok) {
            setSessionMessage(response?.error || "No active session selected.");
          }
        }
      );
    } else {
      chrome.runtime.sendMessage({ type: "STOP_RECORDING" }).catch(() => {});
    }
  }, []);

  function onExpandRequest() {
    chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch(() => {});
  }
  const onCollapseRequest = React.useCallback(() => {
    setSessionLimitReached(null);
    chrome.runtime.sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" }).catch(() => {});
  }, []);

  const onThemeToggle = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyThemeToRoot(widgetRoot, next);
  }, [theme, widgetRoot]);

  /* Auth only when widget is opened (Loom-style). Do NOT trigger auth on content script mount. */
  React.useEffect(() => {
    if (!globalState.visible) return;
    setAuthState("loading");
    chrome.runtime.sendMessage(
      { type: "GET_AUTH_STATE" },
      (response: { authenticated?: boolean; user?: AuthUser | null } | undefined) => {
        if (response?.authenticated && response.user?.uid) {
          setUser({
            uid: response.user.uid,
            name: response.user.name ?? null,
            email: response.user.email ?? null,
            photoURL: response.user.photoURL ?? null,
          });
          setAuthState("authenticated");
        } else {
          setUser(null);
          setAuthState("unauthenticated");
        }
      }
    );
  }, [globalState.visible]);

  const handleComplete = React.useCallback(
    async (
      transcript: string,
      screenshot: string | null,
      callbacks?: {
        onSuccess: (ticket: StructuredFeedback) => void;
        onError: () => void;
      },
      context?: {
        url?: string;
        scrollX?: number;
        scrollY?: number;
        viewportWidth?: number;
        viewportHeight?: number;
        devicePixelRatio?: number;
        domPath?: string | null;
        nearbyText?: string | null;
        subtreeText?: string | null;
        visibleText?: string | null;
        capturedAt?: number;
      } | null,
      options?: { sessionMode?: boolean }
    ): Promise<StructuredFeedback | undefined> => {
      echlyLog("PIPELINE", "start");
      if (!effectiveSessionId || !user) {
        echlyLog("PIPELINE", "error");
        callbacks?.onError?.();
        return undefined;
      }
      if (callbacks) {
        const jobId = createUniqueId();
        const job: FeedbackJob = {
          id: jobId,
          status: "processing",
          transcript,
          screenshot,
          createdAt: Date.now(),
        };
        setFeedbackJobs((prev) => [job, ...prev]);

        (async () => {
          const ctx = context as CaptureContext | null | undefined;
          const imageForOcr = ctx?.ocrImageDataUrl ?? screenshot ?? null;
          if (ctx?.ocrImageDataUrl) {
            if (ECHLY_DEBUG) console.log("[ECHLY] OCR running on selection image");
          }
          let ocrResult: string | null = null;
          try {
            console.log("[ECHLY OCR] Starting OCR");
            const ocrPromise = getVisibleTextFromScreenshot(imageForOcr);
            const timeout = new Promise<string | null>((resolve) =>
              setTimeout(() => resolve(null), 1500)
            );
            ocrResult = await Promise.race([ocrPromise, timeout]);
            console.log("[ECHLY OCR] Result or timeout:", ocrResult);
            if (ocrResult) {
              console.log("[ECHLY OCR] Success");
            } else {
              console.warn("[ECHLY OCR] Skipped (CSP or timeout)");
            }
          } catch (err) {
            console.error("[ECHLY OCR] Failed:", err);
            ocrResult = null;
          }
          const screenshotId = generateScreenshotId();
          const uploadPromise = screenshot
            ? uploadScreenshot(screenshot, effectiveSessionId, screenshotId)
            : Promise.resolve(null as string | null);
          const visibleTextFromScreenshot = ocrResult ?? "";
          if (ECHLY_DEBUG) console.log("[OCR] Extracted visibleText:", visibleTextFromScreenshot);
          if (imageForOcr) {
            if (ECHLY_DEBUG) console.log("[ECHLY] OCR result length:", visibleTextFromScreenshot?.length ?? 0);
          }
          const currentUrl = typeof window !== "undefined" ? window.location.href : "";
          const { ocrImageDataUrl: _ocrImg, ...contextForApi } = (context ?? {}) as Record<string, unknown>;
          const enrichedContext: CaptureContext = {
            ...(contextForApi as Omit<CaptureContext, "visibleText" | "url">),
            visibleText:
              (visibleTextFromScreenshot?.trim() && visibleTextFromScreenshot) ||
              (context as CaptureContext | null)?.visibleText ||
              null,
            url: (context as CaptureContext | null)?.url ?? currentUrl,
          };
          delete (enrichedContext as Record<string, unknown>).ocrImageDataUrl;
          if (ECHLY_DEBUG) console.log("[ECHLY] AI payload:", { transcript, context: enrichedContext });
          const structureBody = {
            transcript,
            context: enrichedContext,
            ocr: ocrResult,
            ocrText: ocrResult || null,
          };
          try {
            echlyLog("PIPELINE", "structure request");
            if (ECHLY_DEBUG) console.log("[VOICE] final transcript submitted", transcript);
            const res = await apiFetch("/api/structure-feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(structureBody),
            });
            const data = (await res.json()) as {
              success?: boolean;
              tickets?: Array<{ title?: string; description?: string; suggestedTags?: string[]; actionSteps?: string[] }>;
              error?: string;
              clarityScore?: number;
              clarityIssues?: string[];
              suggestedRewrite?: string | null;
              confidence?: number;
            };
            const tickets = Array.isArray(data.tickets) ? data.tickets : [];
            const clarityScore = typeof data.clarityScore === "number" ? data.clarityScore : (data.clarityScore != null ? Number(data.clarityScore) : 100);
            const clarityIssues = data.clarityIssues ?? [];
            const suggestedRewrite = data.suggestedRewrite ?? null;
            const confidence = data.confidence ?? 0.5;
            const isSessionMode = Boolean(options?.sessionMode);

            /* Session mode: never show clarity assistant; process silently. */
            if (!isSessionMode) {
              /* Intercept before any submission: pause and show clarity assistant when score <= 20 (even when tickets is empty). */
              if (data.success && clarityScore <= 20) {
                if (ECHLY_DEBUG) console.log("CLARITY GUARD TRIGGERED", clarityScore);
                setExtensionClarityPending({
                  tickets,
                  screenshotUrl: null,
                  screenshotId,
                  uploadPromise,
                  transcript,
                  screenshot,
                  clarityScore,
                  clarityIssues,
                  suggestedRewrite,
                  confidence,
                  callbacks,
                  context: enrichedContext,
                });
                setEditedTranscript(transcript);
                setIsEditingFeedback(false);
                clarityAssistantSubmitLock.current = false;
                setClarityAssistantSubmitting(false);
                setShowClarityAssistant(true);
                setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
                return;
              }

              /* Pipeline requested clarification (vague feedback or verification failed): show clarity assistant, do not create fallback ticket */
              const needsClarification = Boolean((data as { needsClarification?: boolean }).needsClarification);
              const verificationIssues = (data as { verificationIssues?: string[] }).verificationIssues ?? [];
              if (data.success && needsClarification && tickets.length === 0) {
                if (ECHLY_DEBUG) console.log("PIPELINE NEEDS CLARIFICATION", verificationIssues);
                setExtensionClarityPending({
                  tickets: [],
                  screenshotUrl: null,
                  screenshotId,
                  uploadPromise,
                  transcript,
                  screenshot,
                  clarityScore,
                  clarityIssues: verificationIssues.length > 0 ? verificationIssues : clarityIssues,
                  suggestedRewrite,
                  confidence,
                  callbacks,
                  context: enrichedContext,
                });
                setEditedTranscript(transcript);
                setIsEditingFeedback(false);
                clarityAssistantSubmitLock.current = false;
                setClarityAssistantSubmitting(false);
                setShowClarityAssistant(true);
                setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
                return;
              }
            }

            if (!data.success || tickets.length === 0) {
              const uploadedScreenshotId = await resolveUploadedScreenshotId(uploadPromise, screenshotId);
              chrome.runtime.sendMessage(
                {
                  type: "ECHLY_PROCESS_FEEDBACK",
                  payload: {
                    transcript,
                    screenshotUrl: null,
                    screenshotId: uploadedScreenshotId,
                    sessionId: effectiveSessionId,
                    context: enrichedContext,
                    ocr: ocrResult,
                    ocrText: ocrResult || null,
                  },
                },
                (response: { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] }; error?: string } | undefined) => {
                  if (chrome.runtime.lastError) {
                    echlyLog("PIPELINE", "error");
                    setFeedbackJobs((prev) =>
                      prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "AI processing failed." } : j))
                    );
                    callbacks.onError();
                    return;
                  }
                  if (response?.success && response.ticket) {
                    const ticketId = response.ticket.id;
                    const t = response.ticket;
                    const actionSteps = Array.isArray(t.actionSteps) ? t.actionSteps : (t.description ? t.description.split(/\n\s*\n/) : []);
                    echlyLog("PIPELINE", "ticket created", { ticketId });
                    setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
                    callbacks.onSuccess({
                      id: ticketId,
                      title: t.title,
                      actionSteps,
                      type: t.type ?? "Feedback",
                    });
                  } else {
                    echlyLog("PIPELINE", "error");
                    setFeedbackJobs((prev) =>
                      prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "AI processing failed." } : j))
                    );
                    callbacks.onError();
                  }
                }
              );
              return;
            }

            /* clarityScore > 20: continue with normal submission to /api/feedback */
            const clarityStatus = clarityScore >= 85 ? "clear" : clarityScore >= 60 ? "needs_improvement" : "unclear";
            const clarityMeta = { clarityScore, clarityIssues, clarityConfidence: confidence, clarityStatus };
            const uploadedScreenshotId = await resolveUploadedScreenshotId(uploadPromise, screenshotId);
            let firstCreated: StructuredFeedback | undefined;
            for (let i = 0; i < tickets.length; i++) {
              const t = tickets[i];
              const feedbackId = generateFeedbackId();
              const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
              const actionSteps = Array.isArray(t.actionSteps) ? t.actionSteps : [];
              const body = {
                sessionId: effectiveSessionId,
                feedbackId,
                title: t.title ?? "",
                description: desc,
                type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
                contextSummary: desc,
                actionSteps,
                suggestedTags: t.suggestedTags,
                screenshotUrl: null,
                screenshotId: i === 0 ? uploadedScreenshotId : undefined,
                metadata: { clientTimestamp: Date.now() },
                ...clarityMeta,
              };
              const token = await getExtensionToken();
              if (!token) {
                console.error("[ECHLY AUTH] No extension token available");
                setSessionMessage("Authentication expired. Please sign in again.");
                setIsProcessingFeedback(false);
                return;
              }
              console.log("[feedbackId generated]", feedbackId);
              console.log("[ECHLY DEBUG] Sending feedback with extension token:", token);
              const feedbackRes = await apiFetch("/api/feedback", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-extension-token": token,
                },
                body: JSON.stringify(body),
              });
              const { data: feedbackJson, text } = await readApiResponseSafely<{
                success?: boolean;
                ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
              }>(feedbackRes);
              if (!feedbackRes.ok) {
                console.error("[ECHLY ERROR] API failed:", feedbackRes.status, text);
                if (isAuthFailureResponse(text)) {
                  console.warn("[ECHLY AUTH] Extension not authenticated");
                  setFeedbackJobs((prev) =>
                    prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "Not authenticated." } : j))
                  );
                  callbacks.onError();
                  return;
                }
              }
              if (feedbackJson?.success && feedbackJson.ticket) {
                const tick = feedbackJson.ticket;
                const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
                if (!firstCreated)
                  firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
              }
            }
            if (firstCreated) {
              const ticketId = firstCreated.id;
              echlyLog("PIPELINE", "ticket created", { ticketId });
              setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
              notifyFeedbackCreated(firstCreated, effectiveSessionId);
              callbacks.onSuccess(firstCreated);
            } else {
              echlyLog("PIPELINE", "error");
              setFeedbackJobs((prev) =>
                prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "AI processing failed." } : j))
              );
              callbacks.onError();
            }
          } catch (err) {
            console.error("[ECHLY ERROR] Feedback pipeline failed:", err);
            console.error("[Echly] Structure or submit failed:", err);
            setFeedbackJobs((prev) =>
              prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "AI processing failed." } : j))
            );
            echlyLog("PIPELINE", "error");
            callbacks.onError();
          }
        })();
        return;
      }
      try {
      setIsProcessingFeedback(true);
      const ctx2 = context as CaptureContext | null | undefined;
      const imageForOcr = ctx2?.ocrImageDataUrl ?? screenshot ?? null;
      if (ctx2?.ocrImageDataUrl) {
        if (ECHLY_DEBUG) console.log("[ECHLY] OCR running on selection image");
      }
      let ocrResult: string | null = null;
      try {
        console.log("[ECHLY OCR] Starting OCR");
        const ocrPromise = getVisibleTextFromScreenshot(imageForOcr);
        const timeout = new Promise<string | null>((resolve) =>
          setTimeout(() => resolve(null), 1500)
        );
        ocrResult = await Promise.race([ocrPromise, timeout]);
        console.log("[ECHLY OCR] Result or timeout:", ocrResult);
        if (ocrResult) {
          console.log("[ECHLY OCR] Success");
        } else {
          console.warn("[ECHLY OCR] Skipped (CSP or timeout)");
        }
      } catch (err) {
        console.error("[ECHLY OCR] Failed:", err);
        ocrResult = null;
      }
      const screenshotId = generateScreenshotId();
      const uploadPromise = screenshot
        ? uploadScreenshot(screenshot, effectiveSessionId, screenshotId)
        : Promise.resolve(null as string | null);
      const visibleTextFromScreenshot = ocrResult ?? "";
      if (ECHLY_DEBUG) console.log("[OCR] Extracted visibleText:", visibleTextFromScreenshot);
      if (imageForOcr) {
        if (ECHLY_DEBUG) console.log("[ECHLY] OCR result length:", visibleTextFromScreenshot?.length ?? 0);
      }
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      const { ocrImageDataUrl: _ocrImg2, ...contextForApi2 } = (context ?? {}) as Record<string, unknown>;
      const enrichedContext: CaptureContext = {
        ...(contextForApi2 as Omit<CaptureContext, "visibleText" | "url">),
        visibleText:
          (visibleTextFromScreenshot?.trim() && visibleTextFromScreenshot) ||
          (context as CaptureContext | null)?.visibleText ||
          null,
        url: (context as CaptureContext | null)?.url ?? currentUrl,
      };
      delete (enrichedContext as Record<string, unknown>).ocrImageDataUrl;
      if (ECHLY_DEBUG) console.log("[ECHLY] AI payload:", { transcript, context: enrichedContext });
      const structureBody = {
        transcript,
        context: enrichedContext,
        ocr: ocrResult,
        ocrText: ocrResult || null,
      };
      echlyLog("PIPELINE", "structure request");
      if (ECHLY_DEBUG) console.log("[VOICE] final transcript submitted", transcript);
      const res = await apiFetch("/api/structure-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(structureBody),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tickets?: Array<{
          title?: string;
          description?: string;
          suggestedTags?: string[];
          actionSteps?: string[];
        }>;
        error?: string;
        clarityScore?: number;
        clarityIssues?: string[];
        suggestedRewrite?: string | null;
        confidence?: number;
      };
      const tickets = Array.isArray(data.tickets) ? data.tickets : [];
      const clarityScore = data.clarityScore ?? 100;
      const clarityIssues = data.clarityIssues ?? [];
      const suggestedRewrite = data.suggestedRewrite ?? null;
      const confidence = data.confidence ?? 0.5;

      if (!data.success || tickets.length === 0) return undefined;

      const clarityStatus = clarityScore >= 85 ? "clear" : clarityScore >= 60 ? "needs_improvement" : "unclear";
      const clarityMeta = { clarityScore, clarityIssues, clarityConfidence: confidence, clarityStatus };
      const uploadedScreenshotId = await resolveUploadedScreenshotId(uploadPromise, screenshotId);
      let firstCreated: StructuredFeedback | undefined;
      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        const feedbackId = generateFeedbackId();
        const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
        const body = {
          sessionId: effectiveSessionId,
          feedbackId,
          title: t.title ?? "",
          description: desc,
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: desc,
          actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
          suggestedTags: t.suggestedTags,
          screenshotUrl: null,
          screenshotId: i === 0 ? uploadedScreenshotId : undefined,
          metadata: { clientTimestamp: Date.now() },
          ...clarityMeta,
        };
        const token = await getExtensionToken();
        if (!token) {
          console.error("[ECHLY AUTH] No extension token available");
          setSessionMessage("Authentication expired. Please sign in again.");
          setIsProcessingFeedback(false);
          return undefined;
        }
        console.log("[feedbackId generated]", feedbackId);
        console.log("[ECHLY DEBUG] Sending feedback with extension token:", token);
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-extension-token": token,
          },
          body: JSON.stringify(body),
        });
        console.log("[ECHLY FLOW] API response received");
        const { data: feedbackJson, text } = await readApiResponseSafely<{
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
        }>(feedbackRes);
        if (!feedbackRes.ok) {
          console.error("[ECHLY ERROR] API failed:", feedbackRes.status, text);
          if (isAuthFailureResponse(text)) {
            console.warn("[ECHLY AUTH] Extension not authenticated");
            setIsProcessingFeedback(false);
            return undefined;
          }
        }
        if (feedbackJson?.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) {
        notifyFeedbackCreated(firstCreated, effectiveSessionId);
      }
      return firstCreated;
      } catch (err) {
        console.error("[ECHLY FLOW ERROR]", err);
        console.error("[ECHLY ERROR] Feedback pipeline failed:", err);
        setIsProcessingFeedback(false);
        throw err;
      } finally {
        console.log("[ECHLY FLOW] Ending processing state");
        setIsProcessingFeedback(false);
      }
    },
    [effectiveSessionId, user]
  );

  const handleDelete = React.useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/tickets/${id}`, { method: "DELETE" });
      notifyFeedbackCountRefetch(effectiveSessionId);
    } catch (err) {
      console.error("[Echly] Delete ticket failed:", err);
      throw err;
    }
  }, [effectiveSessionId]);

  const handleUpdate = React.useCallback(
    async (id: string, payload: { title: string; actionSteps: string[] }) => {
      const res = await apiFetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          description: payload.actionSteps?.join("\n") ?? "",
          actionSteps: payload.actionSteps ?? [],
        }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: { id: string; title: string; actionSteps?: string[]; type?: string } };
      if (res.ok && data.success && data.ticket) {
        const ticket = data.ticket;
        chrome.runtime.sendMessage({
          type: "ECHLY_TICKET_UPDATED",
          ticket: {
            id: ticket.id,
            title: ticket.title,
            actionSteps: ticket.actionSteps ?? [],
            type: ticket.type ?? "Feedback",
          },
        }).catch(() => {});
      }
    },
    []
  );

  const onSessionTitleChange = React.useCallback(
    async (newTitle: string) => {
      if (!effectiveSessionId) return;
      try {
        const res = await apiFetch(`/api/sessions/${effectiveSessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle.trim() || "Untitled Session" }),
        });
        const data = (await res.json()) as { success?: boolean };
        if (res.ok && data.success) {
          chrome.runtime.sendMessage({
            type: "ECHLY_SESSION_UPDATED",
            sessionId: effectiveSessionId,
            title: newTitle.trim() || "Untitled Session",
          }).catch(() => {});
        }
      } catch (err) {
        console.error("[Echly] Session title update failed:", err);
      }
    },
    [effectiveSessionId]
  );

  const fetchSessions = React.useCallback(async () => {
    const sessions = await getSessionsCached(apiFetch);
    if (ECHLY_DEBUG) console.log("[Echly] Sessions returned:", { count: sessions.length, sessions });
    return sessions;
  }, []);

  /* Optional preload: warm cache so Previous Sessions modal feels faster when opened. */
  React.useEffect(() => {
    fetchSessions?.();
  }, [fetchSessions]);

  async function createSession(): Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  > {
    if (ECHLY_DEBUG) console.log("[Echly] Creating session");
    try {
      const res = await apiFetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = (await res.json()) as {
        success?: boolean;
        session?: { id: string };
        error?: string;
        message?: string;
        upgradePlan?: unknown;
      };
      console.log("[ECHLY DEBUG] startSession response:", res.status, { ok: res.ok, success: data.success, sessionId: data.session?.id, error: data.error });
      if (res.status === 403 && data.error === "PLAN_LIMIT_REACHED") {
        console.log("[ECHLY DEBUG] session limit reached → returning limitReached for upgrade view");
        return {
          limitReached: true,
          message: data.message ?? "You've reached your session limit.",
          upgradePlan: data.upgradePlan,
        };
      }
      if (!res.ok || !data.success || !data.session?.id) return null;
      invalidateSessionsCache();
      return { id: data.session.id };
    } catch (err) {
      console.error("[Echly] Failed to create session:", err);
      return null;
    }
  }

  const environment = new ExtensionCaptureEnvironment({
    createSession,
    authenticatedFetch: apiFetch,
    notifyFeedbackCreated,
  });

  function onActiveSessionChange(newSessionId: string) {
    chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId }, () => {});
  }

  const onPreviousSessionSelect = React.useCallback(
    async (sessionId: string, _options?: { enterCaptureImmediately?: boolean }) => {
      chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId }, () => {});
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch(() => {});
      try {
        const sessionRes = await apiFetch(`/api/sessions/${sessionId}`);
        const sessionData = (await sessionRes.json()) as { session?: { url?: string } };
        if (sessionData?.session?.url) {
          chrome.runtime.sendMessage({
            type: "ECHLY_OPEN_TAB",
            url: sessionData.session.url,
          }).catch(() => {});
        }
      } catch {
        // Session URL optional; pointers loaded by background on ECHLY_SET_ACTIVE_SESSION
      }
    },
    []
  );

  const verifySessionBeforeSessions = React.useCallback(() => {
    return new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        { type: "ECHLY_VERIFY_DASHBOARD_SESSION" },
        (response: { valid?: boolean } | undefined) => {
          resolve(response?.valid === true);
        }
      );
    });
  }, []);

  const onTriggerLogin = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: "ECHLY_TRIGGER_LOGIN" }).catch(() => {});
  }, []);

  const submitPendingFeedback = React.useCallback(
    async (pending: ExtensionClarityPending) => {
      if (!effectiveSessionId) return;
      setIsProcessingFeedback(true);
      try {
      if (pending.tickets.length === 0) {
        const uploadedScreenshotId = await resolveUploadedScreenshotId(
          pending.uploadPromise,
          pending.screenshotId
        );
        chrome.runtime.sendMessage(
          {
            type: "ECHLY_PROCESS_FEEDBACK",
            payload: {
              transcript: pending.transcript,
              screenshotUrl: null,
              screenshotId: uploadedScreenshotId,
              sessionId: effectiveSessionId,
              context: pending.context ?? {},
              ocrText: null,
            },
          },
          (response: { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string }; error?: string } | undefined) => {
            setIsProcessingFeedback(false);
            if (chrome.runtime.lastError) {
              console.error("[Echly] Submit anyway failed:", chrome.runtime.lastError.message);
              echlyLog("PIPELINE", "error");
              pending.callbacks.onError();
              return;
            }
            if (response?.success && response.ticket) {
              const t = response.ticket as { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
              const ticketId = t.id;
              const actionSteps = Array.isArray(t.actionSteps) ? t.actionSteps : (t.description ? t.description.split(/\n\s*\n/) : []);
              pending.callbacks.onSuccess({
                id: ticketId,
                title: t.title,
                actionSteps,
                type: t.type ?? "Feedback",
              });
            } else {
              echlyLog("PIPELINE", "error");
              pending.callbacks.onError();
            }
          }
        );
        return;
      }

      const clarityMeta = {
        clarityScore: pending.clarityScore,
        clarityIssues: pending.clarityIssues,
        clarityConfidence: pending.confidence,
        clarityStatus: (pending.clarityScore >= 85 ? "clear" : pending.clarityScore >= 60 ? "needs_improvement" : "unclear") as "clear" | "needs_improvement" | "unclear",
      };
      const uploadedScreenshotId = await resolveUploadedScreenshotId(
        pending.uploadPromise,
        pending.screenshotId
      );
      let firstCreated: StructuredFeedback | undefined;
      for (let i = 0; i < pending.tickets.length; i++) {
        const t = pending.tickets[i];
        const feedbackId = generateFeedbackId();
        const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
        const body = {
          sessionId: effectiveSessionId,
          feedbackId,
          title: t.title ?? "",
          description: desc,
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: desc,
          actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
          suggestedTags: t.suggestedTags,
          screenshotUrl: null,
          screenshotId: i === 0 ? uploadedScreenshotId : undefined,
          metadata: { clientTimestamp: Date.now() },
          ...clarityMeta,
        };
        const token = await getExtensionToken();
        if (!token) {
          console.error("[ECHLY AUTH] No extension token available");
          setSessionMessage("Authentication expired. Please sign in again.");
          setIsProcessingFeedback(false);
          return;
        }
        console.log("[feedbackId generated]", feedbackId);
        console.log("[ECHLY DEBUG] Sending feedback with extension token:", token);
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-extension-token": token,
          },
          body: JSON.stringify(body),
        });
        console.log("[ECHLY FLOW] API response received");
        const { data: feedbackJson, text } = await readApiResponseSafely<{
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
        }>(feedbackRes);
        if (!feedbackRes.ok) {
          console.error("[ECHLY ERROR] API failed:", feedbackRes.status, text);
          if (isAuthFailureResponse(text)) {
            console.warn("[ECHLY AUTH] Extension not authenticated");
            setIsProcessingFeedback(false);
            return;
          }
        }
        if (feedbackJson?.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) {
        setIsProcessingFeedback(false);
        pending.callbacks.onSuccess(firstCreated);
      } else {
        echlyLog("PIPELINE", "error");
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
      }
      } catch (err) {
        console.error("[ECHLY FLOW ERROR]", err);
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
      } finally {
        console.log("[ECHLY FLOW] Ending processing state");
        setIsProcessingFeedback(false);
      }
    },
    [effectiveSessionId]
  );

  const submitEditedFeedback = React.useCallback(
    async (pending: ExtensionClarityPending, editedText: string) => {
      if (!effectiveSessionId) return;
      const trimmed = editedText.trim();
      try {
        const structureBody = { transcript: trimmed, context: pending.context ?? {} };
        const res = await apiFetch("/api/structure-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(structureBody),
        });
        const data = (await res.json()) as {
          success?: boolean;
          tickets?: Array<{ title?: string; description?: string; suggestedTags?: string[]; actionSteps?: string[] }>;
          clarityScore?: number;
          clarityIssues?: string[];
          confidence?: number;
        };
        const tickets = Array.isArray(data.tickets) ? data.tickets : [];
        const clarityScore = data.clarityScore ?? 100;
        const confidence = data.confidence ?? 0.5;
        const clarityStatus = (clarityScore >= 85 ? "clear" : clarityScore >= 60 ? "needs_improvement" : "unclear") as "clear" | "needs_improvement" | "unclear";
        const clarityMeta = { clarityScore, clarityIssues: data.clarityIssues ?? [], clarityConfidence: confidence, clarityStatus };

        if (tickets.length === 0) {
          const uploadedScreenshotId = await resolveUploadedScreenshotId(
            pending.uploadPromise,
            pending.screenshotId
          );
          chrome.runtime.sendMessage(
            {
              type: "ECHLY_PROCESS_FEEDBACK",
              payload: {
                transcript: trimmed,
                screenshotUrl: null,
                screenshotId: uploadedScreenshotId,
                sessionId: effectiveSessionId,
                context: pending.context ?? {},
                ocrText: null,
              },
            },
            (response: { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string } } | undefined) => {
              setIsProcessingFeedback(false);
              if (chrome.runtime.lastError) {
                console.error("[Echly] Submit edited feedback failed:", chrome.runtime.lastError.message);
                echlyLog("PIPELINE", "error");
                pending.callbacks.onError();
                return;
              }
              if (response?.success && response.ticket) {
                const t = response.ticket as { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
                const ticketId = t.id;
                const actionSteps = Array.isArray(t.actionSteps) ? t.actionSteps : (t.description ? t.description.split(/\n\s*\n/) : []);
                pending.callbacks.onSuccess({
                  id: ticketId,
                  title: t.title,
                  actionSteps,
                  type: t.type ?? "Feedback",
                });
              } else {
                echlyLog("PIPELINE", "error");
                pending.callbacks.onError();
              }
            }
          );
          return;
        }

        let firstCreated: StructuredFeedback | undefined;
        const uploadedScreenshotId = await resolveUploadedScreenshotId(
          pending.uploadPromise,
          pending.screenshotId
        );
        for (let i = 0; i < tickets.length; i++) {
          const t = tickets[i];
          const feedbackId = generateFeedbackId();
          const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
          const body = {
            sessionId: effectiveSessionId,
            feedbackId,
            title: t.title ?? "",
            description: desc,
            type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
            contextSummary: desc,
            actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
            suggestedTags: t.suggestedTags,
            screenshotUrl: null,
            screenshotId: i === 0 ? uploadedScreenshotId : undefined,
            metadata: { clientTimestamp: Date.now() },
            ...clarityMeta,
          };
          const token = await getExtensionToken();
          if (!token) {
            console.error("[ECHLY AUTH] No extension token available");
            setSessionMessage("Authentication expired. Please sign in again.");
            setIsProcessingFeedback(false);
            return;
          }
          console.log("[feedbackId generated]", feedbackId);
          console.log("[ECHLY DEBUG] Sending feedback with extension token:", token);
          const feedbackRes = await apiFetch("/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-extension-token": token,
            },
            body: JSON.stringify(body),
          });
          console.log("[ECHLY FLOW] API response received");
          const { data: feedbackJson, text } = await readApiResponseSafely<{
            success?: boolean;
            ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
          }>(feedbackRes);
          if (!feedbackRes.ok) {
            console.error("[ECHLY ERROR] API failed:", feedbackRes.status, text);
            if (isAuthFailureResponse(text)) {
              console.warn("[ECHLY AUTH] Extension not authenticated");
              setIsProcessingFeedback(false);
              return;
            }
          }
          if (feedbackJson?.success && feedbackJson.ticket) {
            const tick = feedbackJson.ticket;
            const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
            if (!firstCreated)
              firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
          }
        }
        if (firstCreated) {
          notifyFeedbackCreated(firstCreated, effectiveSessionId);
          setIsProcessingFeedback(false);
          pending.callbacks.onSuccess(firstCreated);
        } else {
          echlyLog("PIPELINE", "error");
          setIsProcessingFeedback(false);
          pending.callbacks.onError();
        }
      } catch (err) {
        console.error("[ECHLY FLOW ERROR]", err);
        console.error("[ECHLY ERROR] Feedback pipeline failed:", err);
        console.error("[Echly] Submit edited feedback failed:", err);
        echlyLog("PIPELINE", "error");
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
      } finally {
        console.log("[ECHLY FLOW] Ending processing state");
        setIsProcessingFeedback(false);
      }
    },
    [effectiveSessionId]
  );

  const handleExtensionClarityUseSuggestion = React.useCallback(async () => {
    const pending = extensionClarityPending;
    if (!pending?.suggestedRewrite?.trim() || !effectiveSessionId) return;
    setExtensionClarityPending(null);
    setIsProcessingFeedback(true);
    try {
      const res = await apiFetch("/api/structure-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: pending.suggestedRewrite!.trim() }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tickets?: Array<{ title?: string; description?: string; suggestedTags?: string[]; actionSteps?: string[] }>;
        clarityScore?: number;
        clarityIssues?: string[];
        confidence?: number;
      };
      const tickets = Array.isArray(data.tickets) ? data.tickets : [];
      const clarityScore = data.clarityScore ?? 100;
      const confidence = data.confidence ?? 0.5;
      const clarityStatus = (clarityScore >= 85 ? "clear" : clarityScore >= 60 ? "needs_improvement" : "unclear") as "clear" | "needs_improvement" | "unclear";
      const clarityMeta = { clarityScore, clarityIssues: data.clarityIssues ?? [], clarityConfidence: confidence, clarityStatus };
      const uploadedScreenshotId = await resolveUploadedScreenshotId(
        pending.uploadPromise,
        pending.screenshotId
      );
      let firstCreated: StructuredFeedback | undefined;
      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        const feedbackId = generateFeedbackId();
        const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
        const body = {
          sessionId: effectiveSessionId,
          feedbackId,
          title: t.title ?? "",
          description: desc,
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: desc,
          actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
          suggestedTags: t.suggestedTags,
          screenshotUrl: null,
          screenshotId: i === 0 ? uploadedScreenshotId : undefined,
          metadata: { clientTimestamp: Date.now() },
          ...clarityMeta,
        };
        const token = await getExtensionToken();
        if (!token) {
          console.error("[ECHLY AUTH] No extension token available");
          setSessionMessage("Authentication expired. Please sign in again.");
          setIsProcessingFeedback(false);
          return;
        }
        console.log("[feedbackId generated]", feedbackId);
        console.log("[ECHLY DEBUG] Sending feedback with extension token:", token);
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-extension-token": token,
          },
          body: JSON.stringify(body),
        });
        console.log("[ECHLY FLOW] API response received");
        const { data: feedbackJson, text } = await readApiResponseSafely<{
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
        }>(feedbackRes);
        if (!feedbackRes.ok) {
          console.error("[ECHLY ERROR] API failed:", feedbackRes.status, text);
          if (isAuthFailureResponse(text)) {
            console.warn("[ECHLY AUTH] Extension not authenticated");
            setIsProcessingFeedback(false);
            return;
          }
        }
        if (feedbackJson?.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) {
        notifyFeedbackCreated(firstCreated, effectiveSessionId);
        setIsProcessingFeedback(false);
        pending.callbacks.onSuccess(firstCreated);
      } else {
        echlyLog("PIPELINE", "error");
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
      }
    } catch (err) {
      console.error("[ECHLY FLOW ERROR]", err);
      console.error("[ECHLY ERROR] Feedback pipeline failed:", err);
      console.error("[Echly] Use suggestion failed:", err);
      echlyLog("PIPELINE", "error");
      setIsProcessingFeedback(false);
      pending.callbacks.onError();
    } finally {
      console.log("[ECHLY FLOW] Ending processing state");
      setIsProcessingFeedback(false);
    }
  }, [extensionClarityPending, effectiveSessionId]);

  React.useEffect(() => {
    if (isEditingFeedback && clarityTextareaRef.current) {
      clarityTextareaRef.current.focus();
    }
  }, [isEditingFeedback]);

  if (authState === "loading") {
    return (
      <div
        style={{
          minWidth: 280,
          padding: "16px",
          borderRadius: 12,
          border: "1px solid #E6F0FF",
          background: "#F8FBFF",
          color: "#374151",
          fontSize: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (authState === "unauthenticated" || !user) {
    return (
      <div
        style={{
          minWidth: 280,
          padding: "16px",
          borderRadius: 12,
          border: "1px solid #E6F0FF",
          background: "#F8FBFF",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
          Sign in to use Echly
        </div>
        <div style={{ fontSize: 13, color: "#4B5563", marginBottom: 12 }}>
          You are not signed in on the dashboard.
        </div>
        <button
          type="button"
          onClick={onTriggerLogin}
          style={{
            background: "#3B82F6",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    );
  }

  const pending = extensionClarityPending;

  const captureWidgetPropsForDebug = {
    onPreviousSessions: () => setOpenResumeModalFromMessage(true),
    onSetCaptureMode: (mode: "voice" | "text") =>
      chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode }).catch(() => {}),
    onOpenBilling: () => chrome.runtime.sendMessage({ type: "ECHLY_OPEN_BILLING" }).catch(() => {}),
    onOpenDashboard: () => environment.openDashboard(`${APP_ORIGIN}/dashboard`),
    getAssetUrl,
    environment,
  };

  try {
    console.log("[ECHLY DEBUG PROPS]", captureWidgetPropsForDebug);
    console.log("[ECHLY DEBUG ENV]", {
      hasEnv: !!environment,
      methods: {
        createSession: !!environment?.createSession,
        authenticatedFetch: !!environment?.authenticatedFetch,
        captureTabScreenshot: !!environment?.captureTabScreenshot,
        openDashboard: !!environment?.openDashboard,
      },
    });
  } catch (logErr) {
    console.error("[ECHLY DEBUG LOG FAILED]", logErr);
  }

  try {
    return (
    <>
      {showClarityAssistant && pending && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.15)",
            zIndex: 999999,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif',
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "90%",
              background: "#F8FBFF",
              pointerEvents: "auto",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
              border: "1px solid #E6F0FF",
              animation: "echly-clarity-card-in 150ms ease-out",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: "#111" }}>Quick suggestion</div>
            <div style={{ fontSize: 14, color: "#374151", marginBottom: 8 }}>
              Your feedback may be unclear.
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
              Try specifying what looks wrong and what change you want.
            </div>
            {pending.suggestedRewrite && (
              <div style={{ fontSize: 13, fontStyle: "italic", color: "#4b5563", marginBottom: 12, opacity: 0.9 }}>
                Example: &quot;{pending.suggestedRewrite}&quot;
              </div>
            )}
            <textarea
              ref={clarityTextareaRef}
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              disabled={!isEditingFeedback}
              rows={3}
              placeholder="Your feedback"
              aria-label="Feedback message"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #E6F0FF",
                fontSize: 14,
                resize: "vertical",
                minHeight: 72,
                marginBottom: 16,
                background: isEditingFeedback ? "#fff" : "#f3f4f6",
                color: "#111",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {isEditingFeedback ? (
                <button
                  type="button"
                  disabled={clarityAssistantSubmitting}
                  onClick={() => {
                    if (clarityAssistantSubmitLock.current) return;
                    if (!pending) return;
                    clarityAssistantSubmitLock.current = true;
                    setClarityAssistantSubmitting(true);
                    setShowClarityAssistant(false);
                    setExtensionClarityPending(null);
                    setIsEditingFeedback(false);
                    const snapshot = pending;
                    const text = editedTranscript;
                    submitEditedFeedback(snapshot, text)
                      .catch((err) => console.error("[Echly] Done submission failed:", err))
                      .finally(() => {
                        clarityAssistantSubmitLock.current = false;
                        setClarityAssistantSubmitting(false);
                      });
                  }}
                  style={{
                    background: "#3B82F6",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: clarityAssistantSubmitting ? "default" : "pointer",
                    opacity: clarityAssistantSubmitting ? 0.8 : 1,
                  }}
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={clarityAssistantSubmitting}
                    onClick={() => setIsEditingFeedback(true)}
                    style={{
                      background: "transparent",
                      border: "1px solid #E6F0FF",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 14,
                      color: "#374151",
                      cursor: clarityAssistantSubmitting ? "default" : "pointer",
                      opacity: clarityAssistantSubmitting ? 0.7 : 1,
                    }}
                  >
                    Edit feedback
                  </button>
                  <button
                    type="button"
                    disabled={clarityAssistantSubmitting}
                    onClick={() => {
                      if (clarityAssistantSubmitLock.current) return;
                      if (!pending) return;
                      clarityAssistantSubmitLock.current = true;
                      setClarityAssistantSubmitting(true);
                      setShowClarityAssistant(false);
                      setExtensionClarityPending(null);
                      setIsEditingFeedback(false);
                      const snapshot = pending;
                      submitPendingFeedback(snapshot)
                        .catch((err) => console.error("[Echly] Submit anyway failed:", err))
                        .finally(() => {
                          clarityAssistantSubmitLock.current = false;
                          setClarityAssistantSubmitting(false);
                        });
                    }}
                    style={{
                      background: "#3B82F6",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: clarityAssistantSubmitting ? "default" : "pointer",
                      opacity: clarityAssistantSubmitting ? 0.8 : 1,
                    }}
                  >
                    Submit anyway
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <EchlyWidgetErrorBoundary>
        <CaptureWidget
          key={widgetResetKey}
          sessionId={effectiveSessionId ?? ""}
          userId={user.uid}
          extensionMode={true}
          captureMode={globalState.captureMode ?? "voice"}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          widgetToggleRef={widgetToggleRef}
          onRecordingChange={onRecordingChange}
          expanded={globalState.expanded}
          onExpandRequest={onExpandRequest}
          onCollapseRequest={onCollapseRequest}
          captureDisabled={false}
          theme={theme}
          onThemeToggle={onThemeToggle}
          fetchSessions={fetchSessions}
          hasPreviousSessions={hasPreviousSessions}
          onPreviousSessionSelect={onPreviousSessionSelect}
          pointers={globalState.pointers ?? []}
          totalCount={globalState.totalCount ?? 0}
          openCount={globalState.openCount ?? 0}
          skippedCount={globalState.skippedCount ?? 0}
          resolvedCount={globalState.resolvedCount ?? 0}
          sessionLoading={globalState.sessionLoading ?? false}
          sessionTitleProp={globalState.sessionTitle ?? undefined}
          onSessionTitleChange={onSessionTitleChange}
          isProcessingFeedback={isProcessingFeedback}
          feedbackJobs={feedbackJobs}
          onSessionEnd={() => {}}
          onCreateSession={createSession}
          onActiveSessionChange={onActiveSessionChange}
          ensureAuthenticated={ensureAuthenticated}
          verifySessionBeforeSessions={verifySessionBeforeSessions}
          onTriggerLogin={onTriggerLogin}
          globalSessionModeActive={globalState.sessionModeActive ?? false}
          globalSessionPaused={globalState.sessionPaused ?? false}
          onSessionModeStart={() => chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch(() => {})}
          onSessionModePause={() => chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_PAUSE" }).catch(() => {})}
          onSessionModeResume={() => chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_RESUME" }).catch(() => {})}
          onSessionActivity={() => chrome.runtime.sendMessage({ type: "ECHLY_SESSION_ACTIVITY" }).catch(() => {})}
          onSessionModeEnd={() => {
            const sessionId = globalState.sessionId;
            (async () => {
              await new Promise<void>((resolve, reject) => {
                chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }, (response) => {
                  if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                  else resolve();
                });
              });
              await new Promise((r) => setTimeout(r, 50));
              if (sessionId) {
                const url = `${APP_ORIGIN}/dashboard/${sessionId}`;
                chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url }).catch(() => {});
              }
            })().catch(() => {});
          }}
          captureRootParent={widgetRoot}
          launcherLogoUrl={launcherLogoUrl}
          openResumeModal={openResumeModalFromMessage}
          onResumeModalClose={() => setOpenResumeModalFromMessage(false)}
          sessionLimitReached={sessionLimitReached}
          environment={environment}
          onPreviousSessions={() => {
            console.log("[ECHLY DEBUG] EXTENSION handler fired");
            setOpenResumeModalFromMessage(true);
            console.log("[ECHLY DEBUG] openResumeModal set TRUE");
          }}
          onSetCaptureMode={(mode) => chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode }).catch(() => {})}
          onOpenBilling={() => chrome.runtime.sendMessage({ type: "ECHLY_OPEN_BILLING" }).catch(() => {})}
          onOpenDashboard={() => environment.openDashboard(`${APP_ORIGIN}/dashboard`)}
          getAssetUrl={getAssetUrl}
        />
      </EchlyWidgetErrorBoundary>
    </>
  );
  } catch (e) {
    console.error("[ECHLY CRASH]", e);
    return <div data-echly-crashed>CRASHED</div>;
  }
}

/** Minimal CSS reset inside shadow root for style isolation. #echly-capture-root lives in shadow DOM; pointer-events: none so page scroll works. */
const SHADOW_RESET = `
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
  }
  #echly-root * { box-sizing: border-box; }
  #echly-capture-root { pointer-events: none !important; }
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

/** Inject minimal page-level styles only. Do NOT inject popup.css into document.head (would lock host page scroll). */
function injectPageStyles(): void {
  /* Restore host page scroll if any extension CSS ever set overflow: hidden (use auto, not visible, to preserve scroll container). */
  if (!document.getElementById("echly-page-scroll-restore")) {
    const scrollRestore = document.createElement("style");
    scrollRestore.id = "echly-page-scroll-restore";
    scrollRestore.textContent =
      "html, body { overflow: auto !important; }";
    document.head.appendChild(scrollRestore);
  }
}

/** Create shadow root, styles, container; mount React. Call only once per host. Popup styles live only in shadow DOM. */
function mountReactApp(host: HTMLDivElement): void {
  injectPageStyles();
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

  console.log("[ECHLY CONTENT] mounting widget root");
  const reactRoot = createRoot(container);
  reactRoot.render(<ContentApp widgetRoot={container} initialTheme={initialTheme} />);
}

type GlobalStateResponse = {
  state?: GlobalUIState;
} | undefined;

function normalizeGlobalState(state: GlobalUIState | undefined): GlobalUIState | null {
  if (!state) return null;
  return {
    visible: state.visible ?? false,
    expanded: state.expanded ?? false,
    isRecording: state.isRecording ?? false,
    sessionId: state.sessionId ?? null,
    sessionTitle: state.sessionTitle ?? null,
    sessionModeActive: state.sessionModeActive ?? false,
    sessionPaused: state.sessionPaused ?? false,
    sessionLoading: state.sessionLoading ?? false,
    totalCount: typeof state.totalCount === "number" ? state.totalCount : 0,
    openCount: typeof state.openCount === "number" ? state.openCount : 0,
    skippedCount: typeof state.skippedCount === "number" ? state.skippedCount : 0,
    resolvedCount: typeof state.resolvedCount === "number" ? state.resolvedCount : 0,
    pointers: Array.isArray(state.pointers) ? state.pointers : [],
    nextCursor: typeof state.nextCursor === "string" ? state.nextCursor : null,
    hasMore: state.hasMore === true,
    isFetching: state.isFetching === true,
    captureMode: state.captureMode === "text" ? "text" : "voice",
  };
}

function dispatchGlobalState(state: GlobalUIState): void {
  echlyLog("CONTENT", "dispatch event", { type: "ECHLY_GLOBAL_STATE" });
  window.dispatchEvent(
    new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } })
  );
}

/** Request initial global state from background; visibility is applied via setHostVisibilityFromState when state is received. */
function syncInitialGlobalState(host: HTMLDivElement): void {
  chrome.runtime.sendMessage(
    { type: "ECHLY_GET_GLOBAL_STATE" },
    (response: GlobalStateResponse) => {
      const normalized = normalizeGlobalState(response?.state);
      if (!normalized) return;
      dispatchGlobalState(normalized);
    }
  );
}

/** When tab becomes visible, refresh global state from background so we never rely on a missed broadcast. */
function ensureVisibilityStateRefresh(): void {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_GLOBAL_STATE" },
      (response: GlobalStateResponse) => {
        const normalized = normalizeGlobalState(response?.state);
        if (!normalized) return;
        setHostVisibilityFromState(normalized);
        dispatchGlobalState(normalized);
      }
    );
  });
}

/** Listen for global state; single listener. Background is source of truth. */
function ensureMessageListener(host: HTMLDivElement): void {
  const win = window as Window & { __ECHLY_MESSAGE_LISTENER__?: boolean };
  if (win.__ECHLY_MESSAGE_LISTENER__) return;
  win.__ECHLY_MESSAGE_LISTENER__ = true;
  chrome.runtime.onMessage.addListener((msg: { type?: string; state?: GlobalUIState; ticket?: { id: string; title: string; description: string; type?: string }; sessionId?: string }) => {
    console.log("[ECHLY CONTENT] message received:", msg.type);
    if (msg.type === "ECHLY_OPEN_WIDGET") console.log("[ECHLY CONTENT] OPEN_WIDGET (message)");
    if (msg.type === "ECHLY_GLOBAL_STATE") console.log("[ECHLY CONTENT] ECHLY_GLOBAL_STATE (message)");
    if (msg.type === "ECHLY_START_SESSION") console.log("[ECHLY CONTENT] ECHLY_START_SESSION (message)");
    if (msg.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") console.log("[ECHLY CONTENT] ECHLY_OPEN_PREVIOUS_SESSIONS (message)");
    if (msg.type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_FEEDBACK_CREATED" });
      window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED", { detail: { ticket: msg.ticket, sessionId: msg.sessionId } }));
      return;
    }
    if (msg.type === "ECHLY_OPEN_WIDGET") {
      console.log("[ECHLY CONTENT] OPEN_WIDGET event dispatching");
      setHostVisibility(true);
      window.dispatchEvent(new CustomEvent("ECHLY_OPEN_WIDGET"));
      return;
    }
    if (msg.type === "ECHLY_CLOSE_WIDGET") {
      setHostVisibility(false);
      return;
    }
    const h = document.getElementById(SHADOW_HOST_ID);
    if (!h) return;
    if (msg.type === "ECHLY_GLOBAL_STATE" && msg.state) {
      const state = msg.state;
      setHostVisibilityFromState(state);
      (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (s: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__?.(state);
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_GLOBAL_STATE" });
      window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } }));
    }
    if (msg.type === "ECHLY_TOGGLE") {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_TOGGLE_WIDGET" });
      window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"));
    }
    if (msg.type === "ECHLY_RESET_WIDGET") {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_RESET_WIDGET" });
      window.dispatchEvent(new CustomEvent("ECHLY_RESET_WIDGET"));
    }
    if (msg.type === "ECHLY_START_SESSION") {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_START_SESSION" });
      window.dispatchEvent(new CustomEvent("ECHLY_START_SESSION_REQUEST"));
    }
    if (msg.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
      chrome.runtime.sendMessage(
        { type: "GET_AUTH_STATE" },
        (r: { authenticated?: boolean; user?: { uid: string } } | undefined) => {
          if (!r?.authenticated || !r?.user?.uid) {
            return;
          }
          echlyLog("CONTENT", "dispatch event", { type: "ECHLY_OPEN_PREVIOUS_SESSIONS" });
          window.dispatchEvent(new CustomEvent("ECHLY_OPEN_PREVIOUS_SESSIONS"));
        }
      );
      return;
    }
    /* Tab activation resync: always fetch and apply state; never debounce or skip. */
    if (msg.type === "ECHLY_SESSION_STATE_SYNC") {
      chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, (response: GlobalStateResponse) => {
        if (response?.state) {
          const normalized = normalizeGlobalState(response.state);
          if (normalized) {
            setHostVisibilityFromState(normalized);
            (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (s: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__?.(normalized);
            window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } }));
          }
        }
      });
    }
  });
}

/** Debug: passive wheel + scroll listeners to verify events reach the page (never block scroll). */
function ensureScrollDebugListeners(): void {
  const win = window as Window & { __ECHLY_SCROLL_DEBUG__?: boolean };
  if (win.__ECHLY_SCROLL_DEBUG__) return;
  win.__ECHLY_SCROLL_DEBUG__ = true;
  window.addEventListener(
    "wheel",
    () => ECHLY_DEBUG && console.debug("ECHLY wheel event reached page"),
    { passive: true }
  );
  document.addEventListener(
    "scroll",
    () => ECHLY_DEBUG && console.debug("ECHLY scroll event detected"),
    { passive: true }
  );
}

function waitForBody(cb: () => void) {
  if (document.body) {
    cb();
    return;
  }

  const observer = new MutationObserver(() => {
    if (document.body) {
      observer.disconnect();
      cb();
    }
  });

  observer.observe(document.documentElement, { childList: true });
}

/**
 * Single mount: create host once, mount React once, default hidden.
 * Visibility via ECHLY_VISIBILITY from background. No re-mount, no injection logic.
 * Host is mounted only after document.body exists so the tray stays visible on all tabs.
 */
function injectWidgetUI(): void {
  console.log("[ECHLY INJECT] UI injected");
  if (window.__ECHLY_WIDGET_LOADED__) return;
  window.__ECHLY_WIDGET_LOADED__ = true;

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
    host.style.display = "none";
    host.style.pointerEvents = "none";
    host.style.visibility = "hidden";

    waitForBody(() => {
      document.body.appendChild(host!);
      mountReactApp(host!);
      ensureMessageListener(host!);
      /* Force state sync after mount so tray appears on every page when global state is visible. */
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_GLOBAL_STATE" },
        (response: GlobalStateResponse) => {
          const state = response?.state;
          if (!state) return;
          const normalized = normalizeGlobalState(state);
          if (!normalized) return;
          setHostVisibilityFromState(normalized);
          window.dispatchEvent(
            new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } })
          );
        }
      );
    });
  } else {
    ensureMessageListener(host);
    syncInitialGlobalState(host);
  }
  ensureVisibilityStateRefresh();
  ensureScrollDebugListeners();
}

function safeAutoInject() {
  if (document.readyState === "complete") {
    injectWidgetUI();
  } else {
    window.addEventListener("load", () => {
      setTimeout(() => {
        injectWidgetUI();
      }, 50); // small delay to allow hydration
    });
  }
}

safeAutoInject();
