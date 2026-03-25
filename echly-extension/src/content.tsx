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
import { apiFetch, API_BASE, throwIfHttpError } from "./api";
import "./sessionRelay";
import { getSessionsCached, invalidateSessionsCache } from "./cachedSessions";
import { uploadScreenshot, generateFeedbackId } from "./contentScreenshot";
import { getVisibleTextFromScreenshot } from "./ocr";
import CaptureWidget from "@/lib/capture-engine/core/CaptureWidget";
import type { StructuredFeedback, CaptureContext, FeedbackJob } from "@/lib/capture-engine/core/types";
import { ExtensionCaptureEnvironment } from "@/lib/capture-engine/ExtensionCaptureEnvironment";
import { ECHLY_DEBUG } from "@/lib/utils/logger";
import { echlyLog } from "@/lib/debug/echlyLogger";
import { ECHLY_STRICT_MODE } from "@/lib/guardrails";
import { logger } from "@/lib/logger";

logger.debug("extension", "content_script_loaded", { href: window.location.href });

/** Log promise rejections from chrome.runtime.sendMessage (no silent failures). */
function logSendMessageRejection(context: string, err: unknown): void {
  console.error(`[ECHLY] ${context}`, err);
}

function logRuntimeLastError(context: string): void {
  const err = chrome.runtime.lastError;
  if (err) {
    console.error(`[ECHLY] ${context}`, err.message ?? String(err));
  }
}

let echlyEventDispatcher: ((type: string) => void) | null = null;

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((msg: { type?: string }) => {
    if (msg.type === "ECHLY_OPEN_PREVIOUS_SESSIONS") {
      logger.debug("extension", "open_previous_sessions_requested");
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
const inFlightFeedbackIds = new Set<string>();

const detectElementType = (el: HTMLElement | null): string | null => {
  if (!el) return null;

  const tag = el.tagName.toLowerCase();

  if (tag === "button") return "button";
  if (tag === "img") return "image";
  if (tag === "svg") return "icon";

  if (tag === "h1" || tag === "h2" || tag === "h3") return "heading";

  if (tag === "a") return "link";

  return null;
};

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
    logger.error("error", "content_error_boundary", error);
    logger.error("error", "content_error_boundary_component_stack", errorInfo.componentStack);
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
  } catch (e) {
    console.error("[ECHLY] getPreferredTheme failed", e);
    return "dark";
  }
}

function applyThemeToRoot(root: HTMLElement, theme: "dark" | "light"): void {
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error("[ECHLY] applyThemeToRoot persistence failed", e);
  }
}

function setHostVisibility(visible: boolean): void {
  logger.debug("extension", "tray_visibility_changed", { visible });
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
  return state.visible === true || state.session.status !== "idle";
}

type AuthUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };

type GlobalUIState = {
  visible: boolean;
  expanded: boolean;
  isRecording: boolean;
  session: {
    id: string | null;
    status: "idle" | "active" | "paused";
  };
  sessionTitle: string | null;
  sessionLoading: boolean;
  feedback: {
    items: StructuredFeedback[];
    nextCursor: string | null;
    hasMore: boolean;
    isFetching: boolean;
    recovering: boolean;
    recoveryAttempts: number;
  };
  counts: {
    total: number;
  };
  captureMode: "voice" | "text";
  openCount: number;
  resolvedCount: number;
};

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
        logRuntimeLastError("GET_AUTH_STATE (ensureAuthenticated)");
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
  }).catch((err) => logSendMessageRejection("ECHLY_FEEDBACK_CREATED", err));
}

function notifyFeedbackCountRefetch(sessionId?: string | null): void {
  if (!sessionId) return;
  chrome.runtime.sendMessage({
    type: "ECHLY_REFETCH_FEEDBACK_COUNT",
    sessionId,
  }).catch((err) => logSendMessageRejection("ECHLY_REFETCH_FEEDBACK_COUNT", err));
}

type ContentAppProps = {
  widgetRoot: HTMLElement;
  initialTheme: "dark" | "light";
};

function ContentApp({ widgetRoot, initialTheme }: ContentAppProps) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [authState, setAuthState] = React.useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [theme, setTheme] = React.useState<"dark" | "light">(initialTheme);
  /** Null until first confirmed state from background (ECHLY_GET_GLOBAL_STATE or ECHLY_GLOBAL_STATE). No placeholder “last known” UI. */
  const [globalState, setGlobalState] = React.useState<GlobalUIState | null>(null);
  const [widgetResetKey, setWidgetResetKey] = React.useState(0);
  const [hasPreviousSessions, setHasPreviousSessions] = React.useState(false);
  const [openResumeModalFromMessage, setOpenResumeModalFromMessage] = React.useState(false);
  /** When POST /api/sessions returns 403 PLAN_LIMIT_REACHED, show upgrade view in tray. */
  const [sessionLimitReached, setSessionLimitReached] = React.useState<{
    message: string;
    upgradePlan: unknown;
  } | null>(null);
  /** When background or DOM triggers start session and POST fails (distinct from hook startSession errors). */
  const [sessionStartErrorBanner, setSessionStartErrorBanner] = React.useState<string | null>(null);
  const effectiveSessionId = globalState?.session.id ?? null;
  const widgetToggleRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (effectiveSessionId) setSessionStartErrorBanner(null);
  }, [effectiveSessionId]);

  const [isProcessingFeedback, setIsProcessingFeedback] = React.useState(false);
  /** Job queue for concurrent feedback captures; each job shows its own Processing/failed card in the tray. */
  const [feedbackJobs, setFeedbackJobs] = React.useState<FeedbackJob[]>([]);

  React.useEffect(() => {
    if (!isProcessingFeedback) return;
    const timeoutId = setTimeout(() => {
      setIsProcessingFeedback((current) => {
        if (current) {
          logger.warn("extension", "failsafe_reset_stuck_state");
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
    logger.debug("extension", "content_app_mounted");
  }, []);


  React.useEffect(() => {
    logger.debug("extension", "resume_modal_state", { openResumeModalFromMessage });
  }, [openResumeModalFromMessage]);

  React.useEffect(() => {
    logger.debug("extension", "previous_sessions_state", { hasPreviousSessions });
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
      setWidgetResetKey((k) => k + 1);
    };
    window.addEventListener("ECHLY_RESET_WIDGET", handler as EventListener);
    return () => window.removeEventListener("ECHLY_RESET_WIDGET", handler as EventListener);
  }, []);

  /* Global UI state: derived only from background (ECHLY_GLOBAL_STATE). No local source of truth. */
  React.useEffect(() => {
    const applyGlobalState = (state: GlobalUIState) => {
      const normalized = normalizeGlobalState(state);
      if (!normalized) return;
      setHostVisibilityFromState(normalized);
      setGlobalState(normalized);
    };
    (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__ = applyGlobalState;
    return () => {
      delete (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__;
    };
  }, []);

  /* Global UI state: always overwrite from background (full replacement model). */
  React.useEffect(() => {
    const handler = (e: CustomEvent<{ state: GlobalUIState }>) => {
      const s = e.detail?.state;
      if (!s) return;
      echlyLog("CONTENT", "global state received", s);
      const normalized = normalizeGlobalState(s);
      if (!normalized) return;
      setHostVisibilityFromState(normalized);
      setGlobalState(normalized);
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  }, []);

  /* Hydrate from background on mount so already-open tabs join active sessions; visibility is applied when state is received. */
  React.useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_GLOBAL_STATE" },
      (response: GlobalStateResponse) => {
        logRuntimeLastError("ECHLY_GET_GLOBAL_STATE (mount)");
        const state = response?.state;
        if (!state) {
          console.error("[ECHLY] ECHLY_GET_GLOBAL_STATE returned no state");
          return;
        }
        const normalized = normalizeGlobalState(state);
        if (!normalized) {
          console.error("[ECHLY] ECHLY_GET_GLOBAL_STATE returned invalid state");
          return;
        }
        setHostVisibilityFromState(normalized);
        setGlobalState(normalized);
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
          logRuntimeLastError("ECHLY_GET_GLOBAL_STATE (visibilitychange)");
          if (!response?.state) {
            console.error("[ECHLY] ECHLY_GET_GLOBAL_STATE (visibilitychange) returned no state");
            return;
          }
          const normalized = normalizeGlobalState(response.state);
          if (!normalized) {
            console.error("[ECHLY] ECHLY_GET_GLOBAL_STATE (visibilitychange) invalid state");
            return;
          }
          setHostVisibilityFromState(normalized);
          setGlobalState(normalized);
        }
      );
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  /* On widget open, use shared sessions cache so we don't duplicate GET /api/sessions with preload. */
  React.useEffect(() => {
    if (!globalState?.visible) return;
    let cancelled = false;
    getSessionsCached(apiFetch).then((sessions) => {
      if (!cancelled) setHasPreviousSessions(sessions.length > 0);
    }).catch((err) => {
      console.error("[ECHLY] getSessionsCached failed", err);
    });
    return () => {
      cancelled = true;
    };
  }, [globalState?.visible]);

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
          logRuntimeLastError("ECHLY_GET_EXTENSION_TOKEN");
          resolve(response?.token ?? null);
        }
      );
    });
    logger.debug("extension", "token_retrieved", { hasToken: !!token });
    return token;
  }, []);

  /* Extension: when background forwards ECHLY_START_SESSION to this tab, run start-session flow. */
  React.useEffect(() => {
    const handler = () => {
      setSessionStartErrorBanner(null);
      createSession()
        .then((result) => {
          if (result && "id" in result && result.id) {
            onActiveSessionChange(result.id);
            chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch((err) =>
              logSendMessageRejection("ECHLY_SESSION_MODE_START (ECHLY_START_SESSION_REQUEST)", err)
            );
            onExpandRequest();
            setSessionLimitReached(null);
          } else if (result && "limitReached" in result && result.limitReached) {
            setSessionLimitReached({ message: result.message, upgradePlan: result.upgradePlan });
            onExpandRequest();
          }
        })
        .catch((err) => {
          console.error("[ECHLY] ECHLY_START_SESSION_REQUEST createSession failed", err);
          setSessionStartErrorBanner("Could not start session. Try again.");
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
      logger.debug("extension", "open_widget_dom_event_received");
      chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch((err) =>
        logSendMessageRejection("ECHLY_EXPAND_WIDGET (ECHLY_OPEN_WIDGET)", err)
      );
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
            logRuntimeLastError("START_RECORDING");
            return;
          }
          if (!response?.ok) {
            console.error("[ECHLY] START_RECORDING rejected", response?.error ?? "unknown");
          }
        }
      );
    } else {
      chrome.runtime.sendMessage({ type: "STOP_RECORDING" }).catch((err) =>
        logSendMessageRejection("STOP_RECORDING", err)
      );
    }
  }, []);

  function onExpandRequest() {
    chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch((err) =>
      logSendMessageRejection("ECHLY_EXPAND_WIDGET (onExpandRequest)", err)
    );
  }
  const onCollapseRequest = React.useCallback(() => {
    setSessionLimitReached(null);
    chrome.runtime.sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" }).catch((err) =>
      logSendMessageRejection("ECHLY_COLLAPSE_WIDGET", err)
    );
  }, []);

  const onThemeToggle = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyThemeToRoot(widgetRoot, next);
  }, [theme, widgetRoot]);

  /* Auth only when widget is opened (Loom-style). Do NOT trigger auth on content script mount. */
  React.useEffect(() => {
    if (!globalState?.visible) return;
    setAuthState("loading");
    chrome.runtime.sendMessage(
      { type: "GET_AUTH_STATE" },
      (response: { authenticated?: boolean; user?: AuthUser | null } | undefined) => {
        logRuntimeLastError("GET_AUTH_STATE");
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
  }, [globalState?.visible]);

  const processFeedbackPipeline = React.useCallback(
    async ({
      transcript,
      screenshot,
      context,
      callbacks,
      sessionMode: _sessionMode,
    }: {
      transcript: string;
      screenshot: string | null;
      context?: CaptureContext | null;
      callbacks?: {
        onSuccess: (ticket: StructuredFeedback) => void;
        onError: () => void;
      };
      sessionMode?: boolean;
    }): Promise<StructuredFeedback> => {
      if (!effectiveSessionId || !user) {
        throw new Error("Missing session or user");
      }

      const ctx = context as CaptureContext | null | undefined;
      const imageForOcr = ctx?.ocrImageDataUrl ?? screenshot ?? null;
      let extractedVisibleText = "";
      try {
        const result = await Promise.race([
          getVisibleTextFromScreenshot(imageForOcr),
          new Promise<string>((resolve) => setTimeout(() => resolve(""), 1500)),
        ]);
        extractedVisibleText = result ?? "";
      } catch (e) {
        console.error("[ECHLY] OCR failed", e);
        extractedVisibleText = "";
      }

      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      let selectedElement: HTMLElement | null = null;
      if (context?.domPath && typeof document !== "undefined") {
        try {
          selectedElement = document.querySelector(context.domPath) as HTMLElement | null;
        } catch (e) {
          console.error("[ECHLY] domPath querySelector failed", e);
          selectedElement = null;
        }
      }
      const elementType = detectElementType(selectedElement);
      const { ocrImageDataUrl: _ocrImg, ...contextForApi } = (context ?? {}) as Record<string, unknown>;
      const enrichedContext: CaptureContext = {
        ...(contextForApi as Omit<CaptureContext, "visibleText" | "url">),
        visibleText:
          (extractedVisibleText?.trim() && extractedVisibleText) ||
          (context as CaptureContext | null)?.visibleText ||
          null,
        url: (context as CaptureContext | null)?.url ?? currentUrl,
        elementType: elementType || null,
      };
      delete (enrichedContext as Record<string, unknown>).ocrImageDataUrl;

      type StructureTicket = {
        title?: string;
        suggestedTags?: string[];
        actionSteps?: string[];
      };
      let structured:
        | {
            success?: boolean;
            tickets?: StructureTicket[];
            error?: string;
          }
        | null = null;
      try {
        const res = await apiFetch("/api/structure-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            context: enrichedContext,
          }),
        });
        throwIfHttpError(res, "structure-feedback");
        structured = (await res.json()) as {
          success?: boolean;
          tickets?: StructureTicket[];
          error?: string;
        };
      } catch (e) {
        console.error("[ECHLY] structure-feedback request failed", e);
        throw e;
      }

      if (!structured?.success || !structured.tickets?.length) {
        throw new Error(structured?.error ?? "Structure feedback did not return a ticket");
      }
      const normalized = structured.tickets[0];

      try {
        if (!screenshot) {
          throw new Error("Screenshot is required.");
        }

        const uploadResult = await uploadScreenshot(screenshot, effectiveSessionId);
        const finalScreenshotId = uploadResult.screenshotId;
        if (ECHLY_STRICT_MODE && !finalScreenshotId) {
          throw new Error("Attempted create without screenshot");
        }

        const token = await getExtensionToken();
        if (!token) {
          throw new Error("No extension token available");
        }

        const feedbackId = generateFeedbackId();
        if (inFlightFeedbackIds.has(feedbackId)) {
          throw new Error(`Duplicate feedback prevented (in-flight): ${feedbackId}`);
        }
        inFlightFeedbackIds.add(feedbackId);

        let feedbackResponse:
          | {
              success?: boolean;
              data?: {
                success?: boolean;
                ticket?: { id: string; title: string; instruction?: string; description?: string; type?: string; actionSteps?: string[] };
              };
              error?: string;
            }
          | undefined;
        try {
          feedbackResponse = (await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                type: "ECHLY_CREATE_FEEDBACK",
                payload: {
                  sessionId: effectiveSessionId,
                  feedbackId,
                  ticket: {
                    title: normalized.title,
                    suggestedTags: normalized.suggestedTags ?? [],
                    actionSteps: normalized.actionSteps ?? [],
                  },
                  screenshotId: finalScreenshotId,
                },
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                  return;
                }
                if (!response?.success) {
                  reject(new Error(response?.error || "Failed to create feedback"));
                  return;
                }
                resolve(response);
              }
            );
          })) as {
            success?: boolean;
            data?: {
              success?: boolean;
              ticket?: { id: string; title: string; instruction?: string; description?: string; type?: string; actionSteps?: string[] };
            };
            error?: string;
          };
        } finally {
          inFlightFeedbackIds.delete(feedbackId);
        }

        const feedbackJson = feedbackResponse?.data;
        const text = feedbackResponse?.error ?? "";
        if (!feedbackResponse?.success && isAuthFailureResponse(text)) {
          throw new Error("Not authenticated.");
        }
        if (feedbackJson?.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const created: StructuredFeedback = {
            id: tick.id,
            title: tick.title,
            actionSteps:
              tick.actionSteps ??
              (tick.instruction
                ? tick.instruction.split(/\n\s*\n/)
                : tick.description
                  ? tick.description.split(/\n\s*\n/)
                  : []),
            type: tick.type ?? "Feedback",
          };
          notifyFeedbackCreated(created, effectiveSessionId);
          return created;
        }

        throw new Error("Feedback creation returned no ticket.");
      } catch (e) {
        logger.error("error", "feedback_create_failed", e);
        throw e;
      }
    },
    [effectiveSessionId, getExtensionToken, isAuthFailureResponse, user]
  );

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
    ): Promise<StructuredFeedback> => {
      const jobId = callbacks ? createUniqueId() : null;
      if (jobId) {
        const job: FeedbackJob = {
          id: jobId,
          status: "processing",
          transcript,
          screenshot,
          createdAt: Date.now(),
        };
        setFeedbackJobs((prev) => [job, ...prev]);
      }

      try {
        setIsProcessingFeedback(true);
        const ticket = await processFeedbackPipeline({
          transcript,
          screenshot,
          context: (context as CaptureContext | null | undefined) ?? null,
          callbacks,
          sessionMode: options?.sessionMode,
        });
        if (jobId) setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
        callbacks?.onSuccess?.(ticket);
        return ticket;
      } catch (err) {
        logger.error("error", "feedback_pipeline_failed", err);
        if (jobId) {
          const failMsg =
            err instanceof Error
              ? err.message.startsWith("API_ERROR_")
                ? "Could not reach the server. Try again."
                : err.message
              : "AI processing failed.";
          setFeedbackJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: failMsg } : j))
          );
        }
        callbacks?.onError?.();
        throw err;
      } finally {
        setIsProcessingFeedback(false);
      }
    },
    [processFeedbackPipeline]
  );

  const handleDelete = React.useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/tickets/${id}`, { method: "DELETE" });
      throwIfHttpError(res, "DELETE ticket");
      notifyFeedbackCountRefetch(effectiveSessionId);
    } catch (err) {
      logger.error("error", "delete_ticket_failed", err);
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
          instruction: payload.actionSteps?.join("\n") ?? "",
          actionSteps: payload.actionSteps ?? [],
        }),
      });
      throwIfHttpError(res, "PATCH ticket");
      const data = (await res.json()) as { success?: boolean; ticket?: { id: string; title: string; actionSteps?: string[]; type?: string } };
      if (data.success && data.ticket) {
        const ticket = data.ticket;
        chrome.runtime.sendMessage({
          type: "ECHLY_TICKET_UPDATED",
          ticket: {
            id: ticket.id,
            title: ticket.title,
            actionSteps: ticket.actionSteps ?? [],
            type: ticket.type ?? "Feedback",
          },
        }).catch((err) => logSendMessageRejection("ECHLY_TICKET_UPDATED", err));
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
        throwIfHttpError(res, "PATCH session title");
        const data = (await res.json()) as { success?: boolean };
        if (data.success) {
          chrome.runtime.sendMessage({
            type: "ECHLY_SESSION_UPDATED",
            sessionId: effectiveSessionId,
            title: newTitle.trim() || "Untitled Session",
          }).catch((err) => logSendMessageRejection("ECHLY_SESSION_UPDATED", err));
        }
      } catch (err) {
        logger.error("error", "session_title_update_failed", err);
      }
    },
    [effectiveSessionId]
  );

  const fetchSessions = React.useCallback(async () => {
    const sessions = await getSessionsCached(apiFetch);
    if (ECHLY_DEBUG) logger.debug("extension", "sessions_returned", { count: sessions.length });
    return sessions;
  }, []);

  /* Optional preload: warm cache so Previous Sessions modal feels faster when opened. */
  React.useEffect(() => {
    fetchSessions?.();
  }, [fetchSessions]);

  async function createSession(): Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  > {
    if (ECHLY_DEBUG) logger.debug("extension", "session_create_started");
    const res = await apiFetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const data = (await res.json()) as {
      success?: boolean;
      session?: { id: string };
      error?: string;
      message?: string;
      upgradePlan?: unknown;
    };
    logger.debug("extension", "session_create_response", {
      status: res.status,
      ok: res.ok,
      success: data.success,
      sessionId: data.session?.id,
      error: data.error,
    });
    if (res.status === 403 && data.error === "PLAN_LIMIT_REACHED") {
      logger.debug("extension", "session_limit_reached");
      return {
        limitReached: true,
        message: data.message ?? "You've reached your session limit.",
        upgradePlan: data.upgradePlan,
      };
    }
    if (!res.ok || !data.success || !data.session?.id) {
      throw new Error("API_ERROR_" + res.status);
    }
    invalidateSessionsCache();
    return { id: data.session.id };
  }

  const environment = new ExtensionCaptureEnvironment({
    createSession,
    authenticatedFetch: apiFetch,
    notifyFeedbackCreated,
  });

  function onActiveSessionChange(newSessionId: string) {
    chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId }, () => {
      logRuntimeLastError("ECHLY_SET_ACTIVE_SESSION (onActiveSessionChange)");
    });
  }

  const onPreviousSessionSelect = React.useCallback(
    async (sessionId: string, _options?: { enterCaptureImmediately?: boolean }) => {
      chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId }, () => {
        logRuntimeLastError("ECHLY_SET_ACTIVE_SESSION (onPreviousSessionSelect)");
      });
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch((err) =>
        logSendMessageRejection("ECHLY_SESSION_MODE_START (onPreviousSessionSelect)", err)
      );
      try {
        const sessionRes = await apiFetch(`/api/sessions/${sessionId}`);
        throwIfHttpError(sessionRes, "GET session for resume");
        const sessionData = (await sessionRes.json()) as { session?: { url?: string } };
        if (sessionData?.session?.url) {
          chrome.runtime.sendMessage({
            type: "ECHLY_OPEN_TAB",
            url: sessionData.session.url,
          }).catch((err) => logSendMessageRejection("ECHLY_OPEN_TAB (resume session)", err));
        }
      } catch (e) {
        console.error("[ECHLY] session URL fetch failed (optional tab open)", e);
      }
    },
    []
  );

  const verifySessionBeforeSessions = React.useCallback(() => {
    return new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        { type: "ECHLY_VERIFY_DASHBOARD_SESSION" },
        (response: { valid?: boolean } | undefined) => {
          logRuntimeLastError("ECHLY_VERIFY_DASHBOARD_SESSION");
          resolve(response?.valid === true);
        }
      );
    });
  }, []);

  const onTriggerLogin = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: "ECHLY_TRIGGER_LOGIN" }).catch((err) =>
      logSendMessageRejection("ECHLY_TRIGGER_LOGIN", err)
    );
  }, []);

  if (globalState === null) {
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
        Syncing extension state…
      </div>
    );
  }

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

  const captureWidgetPropsForDebug = {
    onPreviousSessions: () => setOpenResumeModalFromMessage(true),
    onSetCaptureMode: (mode: "voice" | "text") =>
      chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode }).catch((err) =>
        logSendMessageRejection("ECHLY_SET_CAPTURE_MODE (debug props)", err)
      ),
    onOpenBilling: () =>
      chrome.runtime.sendMessage({ type: "ECHLY_OPEN_BILLING" }).catch((err) =>
        logSendMessageRejection("ECHLY_OPEN_BILLING (debug props)", err)
      ),
    onOpenDashboard: () => environment.openDashboard(`${APP_ORIGIN}/dashboard`),
    getAssetUrl,
    environment,
  };

  try {
    logger.debug("extension", "capture_widget_props", {
      props: captureWidgetPropsForDebug,
      hasEnv: !!environment,
      methods: {
        createSession: !!environment?.createSession,
        authenticatedFetch: !!environment?.authenticatedFetch,
        captureTabScreenshot: !!environment?.captureTabScreenshot,
        openDashboard: !!environment?.openDashboard,
      },
    });
  } catch (logErr) {
    logger.error("error", "debug_log_failed", logErr);
  }

  try {
    return (
    <>
      <EchlyWidgetErrorBoundary>
        <CaptureWidget
          key={widgetResetKey}
          sessionId={effectiveSessionId ?? ""}
          userId={user.uid}
          extensionMode={true}
          captureMode={globalState.captureMode}
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
          pointers={globalState.feedback.items}
          feedbackRecovering={globalState.feedback.recovering === true}
          feedbackRecoveryAttempts={globalState.feedback.recoveryAttempts}
          feedbackFetchFailed={globalState.feedback.recovering !== true && globalState.feedback.recoveryAttempts > 0}
          totalCount={globalState.counts.total}
          openCount={globalState.openCount}
          resolvedCount={globalState.resolvedCount}
          sessionLoading={globalState.sessionLoading}
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
          globalSessionModeActive={globalState.session.status !== "idle"}
          globalSessionPaused={globalState.session.status === "paused"}
          onSessionModeStart={() =>
            chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch((err) =>
              logSendMessageRejection("ECHLY_SESSION_MODE_START", err)
            )
          }
          onSessionModePause={() =>
            chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_PAUSE" }).catch((err) =>
              logSendMessageRejection("ECHLY_SESSION_MODE_PAUSE", err)
            )
          }
          onSessionModeResume={() =>
            chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_RESUME" }).catch((err) =>
              logSendMessageRejection("ECHLY_SESSION_MODE_RESUME", err)
            )
          }
          onSessionActivity={() =>
            chrome.runtime.sendMessage({ type: "ECHLY_SESSION_ACTIVITY" }).catch((err) =>
              logSendMessageRejection("ECHLY_SESSION_ACTIVITY", err)
            )
          }
          onSessionModeEnd={() => {
            const sessionId = globalState.session.id;
            (async () => {
              await new Promise<void>((resolve, reject) => {
                chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }, () => {
                  if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                  else resolve();
                });
              });
              await new Promise((r) => setTimeout(r, 50));
              if (sessionId) {
                const url = `${APP_ORIGIN}/dashboard/${sessionId}`;
                chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url }).catch((err) =>
                  logSendMessageRejection("ECHLY_OPEN_TAB (session mode end)", err)
                );
              }
            })().catch((err) => logSendMessageRejection("ECHLY_SESSION_MODE_END chain", err));
          }}
          captureRootParent={widgetRoot}
          launcherLogoUrl={launcherLogoUrl}
          openResumeModal={openResumeModalFromMessage}
          onResumeModalClose={() => setOpenResumeModalFromMessage(false)}
          sessionLimitReached={sessionLimitReached}
          sessionStartErrorBanner={sessionStartErrorBanner}
          onSessionStartErrorDismiss={() => setSessionStartErrorBanner(null)}
          environment={environment}
          onPreviousSessions={() => {
            logger.debug("extension", "previous_sessions_handler_fired");
            setOpenResumeModalFromMessage(true);
            logger.debug("extension", "resume_modal_opened");
          }}
          onSetCaptureMode={(mode) =>
            chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode }).catch((err) =>
              logSendMessageRejection("ECHLY_SET_CAPTURE_MODE", err)
            )
          }
          onOpenBilling={() =>
            chrome.runtime.sendMessage({ type: "ECHLY_OPEN_BILLING" }).catch((err) =>
              logSendMessageRejection("ECHLY_OPEN_BILLING", err)
            )
          }
          onOpenDashboard={() => environment.openDashboard(`${APP_ORIGIN}/dashboard`)}
          getAssetUrl={getAssetUrl}
        />
      </EchlyWidgetErrorBoundary>
    </>
  );
  } catch (e) {
    logger.error("error", "extension_crash", e);
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

  logger.debug("extension", "mounting_widget_root");
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
    session: {
      id: state.session?.id ?? null,
      status:
        state.session?.status === "active" || state.session?.status === "paused"
          ? state.session.status
          : "idle",
    },
    sessionTitle: state.sessionTitle ?? null,
    sessionLoading: state.sessionLoading ?? false,
    feedback: {
      items: Array.isArray(state.feedback?.items) ? state.feedback.items : [],
      nextCursor: typeof state.feedback?.nextCursor === "string" ? state.feedback.nextCursor : null,
      hasMore: state.feedback?.hasMore === true,
      isFetching: state.feedback?.isFetching === true,
      recovering: state.feedback?.recovering === true,
      recoveryAttempts: typeof state.feedback?.recoveryAttempts === "number" ? state.feedback.recoveryAttempts : 0,
    },
    counts: {
      total: typeof state.counts?.total === "number" ? state.counts.total : 0,
    },
    openCount: typeof state.openCount === "number" ? state.openCount : 0,
    resolvedCount: typeof state.resolvedCount === "number" ? state.resolvedCount : 0,
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
function syncInitialGlobalState(): void {
  chrome.runtime.sendMessage(
    { type: "ECHLY_GET_GLOBAL_STATE" },
    (response: GlobalStateResponse) => {
      logRuntimeLastError("ECHLY_GET_GLOBAL_STATE (syncInitialGlobalState)");
      const normalized = normalizeGlobalState(response?.state);
      if (!normalized) {
        console.error("[ECHLY] syncInitialGlobalState: no valid state");
        return;
      }
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
        logRuntimeLastError("ECHLY_GET_GLOBAL_STATE (ensureVisibilityStateRefresh)");
        const normalized = normalizeGlobalState(response?.state);
        if (!normalized) {
          console.error("[ECHLY] ensureVisibilityStateRefresh: no valid state");
          return;
        }
        setHostVisibilityFromState(normalized);
        dispatchGlobalState(normalized);
      }
    );
  });
}

/** Listen for global state; single listener. Background is source of truth. */
function ensureMessageListener(): void {
  const win = window as Window & { __ECHLY_MESSAGE_LISTENER__?: boolean };
  if (win.__ECHLY_MESSAGE_LISTENER__) return;
  win.__ECHLY_MESSAGE_LISTENER__ = true;
  chrome.runtime.onMessage.addListener((msg: { type?: string; state?: GlobalUIState; ticket?: { id: string; title: string; instruction?: string; description?: string; type?: string }; sessionId?: string }) => {
    logger.debug("extension", "runtime_message_received", { type: msg.type });
    if (msg.type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_FEEDBACK_CREATED" });
      window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED", { detail: { ticket: msg.ticket, sessionId: msg.sessionId } }));
      return;
    }
    if (msg.type === "ECHLY_OPEN_WIDGET") {
      logger.debug("extension", "open_widget_event_dispatching");
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
      const normalized = normalizeGlobalState(msg.state);
      if (!normalized) {
        console.error("[ECHLY] ECHLY_GLOBAL_STATE runtime message had invalid state");
        return;
      }
      setHostVisibilityFromState(normalized);
      (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (s: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__?.(normalized);
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_GLOBAL_STATE" });
      window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } }));
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
          logRuntimeLastError("GET_AUTH_STATE (ECHLY_OPEN_PREVIOUS_SESSIONS)");
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
        logRuntimeLastError("ECHLY_GET_GLOBAL_STATE (ECHLY_SESSION_STATE_SYNC)");
        if (!response?.state) {
          console.error("[ECHLY] ECHLY_SESSION_STATE_SYNC: GET_GLOBAL_STATE returned no state");
          return;
        }
        const normalized = normalizeGlobalState(response.state);
        if (!normalized) {
          console.error("[ECHLY] ECHLY_SESSION_STATE_SYNC: invalid global state");
          return;
        }
        setHostVisibilityFromState(normalized);
        (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (s: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__?.(normalized);
        window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } }));
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
  logger.debug("extension", "ui_injected");
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
      ensureMessageListener();
      /* Force state sync after mount so tray appears on every page when global state is visible. */
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_GLOBAL_STATE" },
        (response: GlobalStateResponse) => {
          logRuntimeLastError("ECHLY_GET_GLOBAL_STATE (injectWidgetUI)");
          const state = response?.state;
          if (!state) {
            console.error("[ECHLY] injectWidgetUI: GET_GLOBAL_STATE returned no state");
            return;
          }
          const normalized = normalizeGlobalState(state);
          if (!normalized) {
            console.error("[ECHLY] injectWidgetUI: invalid global state");
            return;
          }
          setHostVisibilityFromState(normalized);
          window.dispatchEvent(
            new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: normalized } })
          );
        }
      );
    });
  } else {
    ensureMessageListener();
    syncInitialGlobalState();
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
