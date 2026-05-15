/**
 * Widget script: lazy-loaded by bootstrap.ts via <script src="widget.js"> when the user opens
 * the widget (or when a session is already active on page load). Owns React mount, shadow DOM,
 * session/feedback flows. All incoming chrome.runtime messages arrive via window CustomEvents
 * dispatched by bootstrap; outgoing chrome.runtime.sendMessage calls remain direct.
 */
declare global {
  interface Window {
    __ECHLY_WIDGET_LOADED__?: boolean;
    __ECHLY_BOOTSTRAP_LOADED__?: boolean;
    __ECHLY_ENSURE_KEEPALIVE__?: () => void;
    __ECHLY_DISCONNECT_KEEPALIVE__?: () => void;
  }
}

import React from "react";
import { createRoot } from "react-dom/client";
import { apiFetch, API_BASE, throwIfHttpError } from "./api";
import { getSessionsCached, invalidateSessionsCache } from "./cachedSessions";
import { uploadScreenshot, generateFeedbackId } from "./contentScreenshot";
import CaptureWidget from "@/lib/capture-engine/core/CaptureWidget";
import type { StructuredFeedback, CaptureContext, FeedbackJob } from "@/lib/capture-engine/core/types";
import { ExtensionCaptureEnvironment } from "@/lib/capture-engine/ExtensionCaptureEnvironment";
import { extensionFetchClient } from "./lib/extensionFetchClient";
import { ECHLY_DEBUG } from "@/lib/utils/logger";
import { echlyLog } from "@/lib/debug/echlyLogger";
import { ECHLY_STRICT_MODE } from "@/lib/guardrails";
import { logger } from "@/lib/logger";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";

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

const ROOT_ID = "echly-root";
const SHADOW_HOST_ID = "echly-shadow-host";
const THEME_STORAGE_KEY = "widget-theme";
/** App origin for opening dashboard (same as API base). */
const APP_ORIGIN = API_BASE;
const inFlightFeedbackIds = new Set<string>();

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
  feedbackLimitReached?: boolean;
  feedbackLimitMessage?: string | null;
  feedbackUpgradePlan?: string | null;
  feedbackJobs?: Array<{ id: string; status: string; createdAt: number; errorMessage?: string }>;
  editPauseTooltipVisible?: boolean;
};

/** Generate a unique id for a feedback job (used for concurrent job queue). */
function createUniqueId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `job-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function generateSessionTitle(): string {
  const raw = document.title?.trim() || "";
  const hostname = window.location.hostname.replace(/^www\./, "");
  const domainName = hostname.split(".")[0] || "";

  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;

  function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  const cleanDomain = capitalizeWords(domainName);

  if (!raw || raw === hostname || raw === window.location.href || raw.toLowerCase() === "localhost") {
    return `${cleanDomain} · ${dateStr}`;
  }

  const separators = /\s*[|–—·:\-]\s*/;
  const segments = raw.split(separators).map(s => s.trim()).filter(Boolean);

  let pageTitle = "";

  if (segments.length === 1) {
    pageTitle = segments[0];
  } else {
    const firstLower = segments[0].toLowerCase().replace(/\s+/g, "");
    const domainLower = domainName.toLowerCase();

    if (firstLower === domainLower || firstLower.includes(domainLower) || domainLower.includes(firstLower)) {
      pageTitle = segments[1] || segments[0];
    } else {
      const lastLower = segments[segments.length - 1].toLowerCase().replace(/\s+/g, "");
      if (lastLower === domainLower || lastLower.includes(domainLower) || domainLower.includes(lastLower)) {
        pageTitle = segments[0];
      } else {
        pageTitle = segments[0];
      }
    }
  }

  pageTitle = pageTitle.trim();
  if (pageTitle.length > 50) {
    pageTitle = pageTitle.substring(0, 47) + "…";
  }

  pageTitle = capitalizeWords(pageTitle);

  const pageLower = pageTitle.toLowerCase().replace(/\s+/g, "");
  const domainLower = domainName.toLowerCase();
  if (pageLower === domainLower || (pageLower.includes(domainLower) && pageLower.length < domainLower.length + 3)) {
    return `${cleanDomain} · ${dateStr}`;
  }

  return `${cleanDomain} · ${pageTitle} · ${dateStr}`;
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
  ticket: { id: string; title: string; description?: string; type?: string; screenshotId?: string | null; tags?: string[]; pageArea?: string | null; userAgent?: string | null; viewportWidth?: number | null; viewportHeight?: number | null; devicePixelRatio?: number | null; createdAt?: string | number | null },
  sessionId?: string | null
): void {
  chrome.runtime.sendMessage({
    type: "ECHLY_FEEDBACK_CREATED",
    sessionId: sessionId ?? undefined,
    ticket: {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description ?? "",
      type: ticket.type ?? "Feedback",
      screenshotId: ticket.screenshotId ?? null,
      tags: ticket.tags ?? [],
      pageArea: ticket.pageArea ?? null,
      userAgent: ticket.userAgent ?? null,
      viewportWidth: ticket.viewportWidth ?? null,
      viewportHeight: ticket.viewportHeight ?? null,
      devicePixelRatio: ticket.devicePixelRatio ?? null,
      createdAt: ticket.createdAt ?? null,
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

function notifyTicketDeleted(ticketId: string): void {
  chrome.runtime
    .sendMessage({ type: "ECHLY_TICKET_DELETED", ticketId })
    .catch((err) => logSendMessageRejection("ECHLY_TICKET_DELETED", err));
}

function mergeGlobalFeedbackIntoLocal(
  prev: StructuredFeedback[] | null,
  serverItems: StructuredFeedback[],
  pendingDeletes: ReadonlySet<string>
): StructuredFeedback[] {
  const filteredServer = serverItems.filter((p) => !pendingDeletes.has(p.id));
  const serverIds = new Set(serverItems.map((i) => i.id));
  const merged = filteredServer.map(serverItem => {
    const localItem = prev?.find(p => p.id === serverItem.id);
    if (localItem) {
      return {
        ...serverItem,
        screenshotId: serverItem.screenshotId ?? localItem.screenshotId ?? null,
        tags: serverItem.tags?.length ? serverItem.tags : (localItem.tags ?? []),
      };
    }
    return serverItem;
  });
  for (const p of prev ?? []) {
    if (pendingDeletes.has(p.id)) continue;
    if (!serverIds.has(p.id)) merged.push(p);
  }
  return merged;
}

const BOOTSTRAP_GLOBAL_UI: GlobalUIState = {
  visible: false,
  expanded: false,
  isRecording: false,
  session: { id: null, status: "idle" },
  sessionTitle: null,
  sessionLoading: false,
  feedback: {
    items: [],
    nextCursor: null,
    hasMore: false,
    isFetching: true,
    recovering: false,
    recoveryAttempts: 0,
  },
  counts: { total: 0 },
  openCount: 0,
  resolvedCount: 0,
  captureMode: "voice",
  feedbackJobs: [],
  editPauseTooltipVisible: false,
};

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
  const pendingDeletesRef = React.useRef<Set<string>>(new Set());
  const deleteSnapshotsRef = React.useRef<Map<string, StructuredFeedback>>(new Map());
  const editRollbackRef = React.useRef<Map<string, StructuredFeedback>>(new Map());
  const prevSessionIdForLocalRef = React.useRef<string | null>(null);
  const prevServerTotalRef = React.useRef<number | null>(null);

  const [localFeedbackItems, setLocalFeedbackItems] = React.useState<StructuredFeedback[] | null>(null);
  const [countsDelta, setCountsDelta] = React.useState(0);
  const [localSessionTitle, setLocalSessionTitle] = React.useState<string | null>(null);

  const localPendingOpsRef = React.useRef(0);
  const [localPendingBump, setLocalPendingBump] = React.useState(0);
  const startLocalOp = React.useCallback(() => {
    localPendingOpsRef.current += 1;
    setLocalPendingBump((n) => n + 1);
  }, []);
  const endLocalOp = React.useCallback(() => {
    localPendingOpsRef.current = Math.max(0, localPendingOpsRef.current - 1);
    setLocalPendingBump((n) => n + 1);
  }, []);

  const [extensionSavingSignals, setExtensionSavingSignals] = React.useState({
    sessionFeedbackSaving: false,
    pausePending: false,
    endPending: false,
  });
  const onExtensionSavingSignalsChange = React.useCallback(
    (signals: {
      sessionFeedbackSaving: boolean;
      pausePending: boolean;
      endPending: boolean;
    }) => {
      setExtensionSavingSignals((prev) =>
        prev.sessionFeedbackSaving === signals.sessionFeedbackSaving &&
          prev.pausePending === signals.pausePending &&
          prev.endPending === signals.endPending
          ? prev
          : signals
      );
    },
    []
  );

  const isSaving = React.useMemo(
    () =>
      Boolean(extensionSavingSignals.sessionFeedbackSaving) ||
      Boolean(extensionSavingSignals.pausePending) ||
      Boolean(extensionSavingSignals.endPending) ||
      localPendingOpsRef.current > 0,
    [extensionSavingSignals, localPendingBump]
  );

  React.useEffect(() => {
    if (effectiveSessionId) setSessionStartErrorBanner(null);
  }, [effectiveSessionId]);

  React.useEffect(() => {
    if (!globalState) return;
    const sid = globalState.session.id;
    if (sid !== prevSessionIdForLocalRef.current) {
      prevSessionIdForLocalRef.current = sid;
      pendingDeletesRef.current.clear();
      editRollbackRef.current.clear();
      setCountsDelta(0);
      setLocalFeedbackItems(globalState.feedback.items);
      setLocalSessionTitle(null);
      return;
    }
    setLocalFeedbackItems((prev) =>
      mergeGlobalFeedbackIntoLocal(prev, globalState.feedback.items, pendingDeletesRef.current)
    );
  }, [globalState]);

  React.useEffect(() => {
    if (!globalState) return;
    const t = globalState.counts.total;
    if (prevServerTotalRef.current !== null && prevServerTotalRef.current !== t) {
      setCountsDelta(0);
    }
    prevServerTotalRef.current = t;
  }, [globalState?.counts.total, globalState]);

  const [isProcessingFeedback, setIsProcessingFeedback] = React.useState(false);
  /** Job queue for concurrent feedback captures; each job shows its own Processing/failed card in the tray. */
  const [feedbackJobs, setFeedbackJobs] = React.useState<FeedbackJob[]>([]);
  /** When POST /api/feedback returns 403 PLAN_LIMIT_REACHED (ticket limit), show upgrade screens. */
  const [feedbackLimitReached, setFeedbackLimitReached] = React.useState<{
    message: string;
    upgradePlan: string;
  } | null>(null);
  const [feedbackUsage, setFeedbackUsage] = React.useState<number | null>(null);
  const [feedbackLimit, setFeedbackLimit] = React.useState<number | null>(null);

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

  const globalFeedbackJobs = globalState?.feedbackJobs ?? null;
  const mergedFeedbackJobs = React.useMemo<FeedbackJob[]>(() => {
    const merged = new Map<string, FeedbackJob>();
    for (const g of globalFeedbackJobs ?? []) {
      merged.set(g.id, {
        id: g.id,
        status: g.status === "failed" ? "failed" : "processing",
        transcript: "",
        screenshot: null,
        createdAt: g.createdAt,
        errorMessage: g.errorMessage,
      });
    }
    for (const j of feedbackJobs) {
      merged.set(j.id, j);
    }
    return Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [globalFeedbackJobs, feedbackJobs]);

  const getAssetUrl = React.useCallback((path: string) => {
    if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(path);
    }
    return `/${path.replace(/^assets\//, "")}`;
  }, []);

  const launcherLogoUrl = getAssetUrl("assets/annote-logo-icon.svg");

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

  /* Global UI state: bootstrap pushes state via __ECHLY_APPLY_GLOBAL_STATE__ and ECHLY_GLOBAL_STATE event. */
  React.useEffect(() => {
    const applyGlobalState = (state: GlobalUIState) => {
      const normalized = normalizeGlobalState(state);
      if (!normalized) return;
      setGlobalState(normalized);
    };
    (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__ = applyGlobalState;
    return () => {
      delete (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__;
    };
  }, []);

  /* Global UI state: always overwrite from background (full replacement model). Bootstrap dispatches with detail.state. */
  React.useEffect(() => {
    const handler = (e: CustomEvent<{ state: GlobalUIState }>) => {
      const s = e.detail?.state;
      if (!s) return;
      echlyLog("CONTENT", "global state received", s);
      const normalized = normalizeGlobalState(s);
      if (!normalized) return;
      setGlobalState(normalized);
      if (normalized.feedbackLimitReached) {
        setFeedbackLimitReached({
          message: normalized.feedbackLimitMessage || "Monthly ticket limit reached",
          upgradePlan: normalized.feedbackUpgradePlan || "business",
        });
      } else {
        setFeedbackLimitReached(null);
      }
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
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
      text?.includes("NOT_AUTHENTICATED") ||
      text?.includes("UNAUTHORIZED")
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

  /* Dashboard switched workspace — drop cached sessions so the next open
     refetches against the user's new active workspace. */
  React.useEffect(() => {
    const handler = () => {
      try {
        invalidateSessionsCache();
      } catch (err) {
        console.warn("[ECHLY] invalidateSessionsCache on workspace switch failed", err);
      }
    };
    window.addEventListener("ECHLY_REFRESH_SESSION", handler);
    return () => window.removeEventListener("ECHLY_REFRESH_SESSION", handler);
  }, []);

  /* Extension: when background forwards ECHLY_RESUME_SESSION to this tab, set the active session and enter session mode (skip the picker). */
  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      const sessionId = detail?.sessionId;
      if (typeof sessionId !== "string" || sessionId.length === 0) return;
      logger.debug("extension", "resume_session_received", { sessionId });
      onActiveSessionChange(sessionId);
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch((err) =>
        logSendMessageRejection("ECHLY_SESSION_MODE_START (ECHLY_RESUME_SESSION)", err)
      );
      onExpandRequest();
    };
    window.addEventListener("ECHLY_RESUME_SESSION", handler);
    return () => window.removeEventListener("ECHLY_RESUME_SESSION", handler);
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
      (response: { authenticated?: boolean; user?: AuthUser | null; feedbackUsage?: number | null; feedbackLimit?: number | null } | undefined) => {
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
        if (typeof response?.feedbackUsage === "number") setFeedbackUsage(response.feedbackUsage);
        if (typeof response?.feedbackLimit === "number") setFeedbackLimit(response.feedbackLimit);
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
      feedbackId: providedFeedbackId,
    }: {
      transcript: string;
      screenshot: string | null;
      context?: CaptureContext | null;
      callbacks?: {
        onSuccess: (ticket: StructuredFeedback) => void;
        onError: () => void;
      };
      sessionMode?: boolean;
      feedbackId?: string;
    }): Promise<StructuredFeedback> => {
      if (!effectiveSessionId || !user) {
        throw new Error("Missing session or user");
      }

      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      const { ocrImageDataUrl: _ocrImg, ...contextForApi } = (context ?? {}) as Record<string, unknown>;
      const enrichedContext: CaptureContext = {
        ...(contextForApi as Omit<CaptureContext, "url">),
        url: (context as CaptureContext | null)?.url ?? currentUrl,
      };
      delete (enrichedContext as Record<string, unknown>).ocrImageDataUrl;

      type StructureTicket = {
        title?: string;
        tags?: string[];
        description?: string;
        pageArea?: string | null;
      };
      const [structureSettled, uploadSettled] = await Promise.allSettled([
        apiFetch("/api/structure-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            context: enrichedContext,
          }),
        }).then(async (res) => {
          throwIfHttpError(res, "structure-feedback");
          return (await res.json()) as {
            success?: boolean;
            data?: { tickets?: StructureTicket[]; structuredSuccess?: boolean };
            error?: { message?: string };
          };
        }),
        screenshot
          ? uploadScreenshot(screenshot, effectiveSessionId)
          : Promise.reject(new Error("Screenshot is required.")),
      ]);

      if (structureSettled.status === "rejected") {
        console.error("[ECHLY] structure-feedback request failed", structureSettled.reason);
        throw structureSettled.reason;
      }

      const structureEnvelope = structureSettled.value;
      const structuredPayload = structureEnvelope.data ?? null;
      const structuredErrorMessage = structureEnvelope.error?.message;

      if (
        !structuredPayload?.structuredSuccess ||
        !structuredPayload.tickets?.length
      ) {
        throw new Error(
          structuredErrorMessage ?? "Structure feedback did not return a ticket"
        );
      }
      const normalized = structuredPayload.tickets[0];

      let finalScreenshotId: string | null = null;
      if (uploadSettled.status === "fulfilled") {
        finalScreenshotId = uploadSettled.value.screenshotId;
      } else {
        console.error("[ECHLY] screenshot upload failed", uploadSettled.reason);
        if (ECHLY_STRICT_MODE) {
          throw uploadSettled.reason as Error;
        }
      }
      if (ECHLY_STRICT_MODE && !finalScreenshotId) {
        throw new Error("Attempted create without screenshot");
      }

      try {

        const token = await getExtensionToken();
        if (!token) {
          throw new Error("No extension token available");
        }

        const feedbackId = providedFeedbackId ?? generateFeedbackId();
        if (inFlightFeedbackIds.has(feedbackId)) {
          throw new Error(`Duplicate feedback prevented (in-flight): ${feedbackId}`);
        }
        inFlightFeedbackIds.add(feedbackId);

        let feedbackResponse:
          | {
              success?: boolean;
              data?: {
                success?: boolean;
                ticket?: { id: string; title: string; description?: string; type?: string };
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
                    tags: normalized.tags ?? [],
                    description: normalized.description ?? "",
                    pageArea: normalized.pageArea ?? null,
                    url: enrichedContext.url ?? undefined,
                    viewportWidth:
                      typeof enrichedContext.viewportWidth === "number"
                        ? enrichedContext.viewportWidth
                        : undefined,
                    viewportHeight:
                      typeof enrichedContext.viewportHeight === "number"
                        ? enrichedContext.viewportHeight
                        : undefined,
                    screenWidth:
                      typeof (enrichedContext as { screenWidth?: number }).screenWidth === "number"
                        ? (enrichedContext as { screenWidth?: number }).screenWidth
                        : (typeof window !== "undefined" && typeof window.screen?.width === "number"
                            ? window.screen.width
                            : undefined),
                    screenHeight:
                      typeof (enrichedContext as { screenHeight?: number }).screenHeight === "number"
                        ? (enrichedContext as { screenHeight?: number }).screenHeight
                        : (typeof window !== "undefined" && typeof window.screen?.height === "number"
                            ? window.screen.height
                            : undefined),
                    devicePixelRatio:
                      typeof enrichedContext.devicePixelRatio === "number"
                        ? enrichedContext.devicePixelRatio
                        : (typeof window !== "undefined" ? (window.devicePixelRatio || 1) : undefined),
                    userAgent:
                      typeof navigator !== "undefined" && typeof navigator.userAgent === "string"
                        ? navigator.userAgent
                        : undefined,
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
                  if (response?.limitReached) {
                    const limitErr = new Error(response?.error || "Monthly ticket limit reached") as Error & { limitReached: boolean; upgradePlan: string };
                    limitErr.limitReached = true;
                    limitErr.upgradePlan = (response as { upgradePlan?: string }).upgradePlan ?? "business";
                    reject(limitErr);
                  } else {
                    reject(new Error(response?.error || "Failed to create feedback"));
                  }
                  return;
                }
                resolve(response);
              }
            );
          })) as {
            success?: boolean;
            data?: {
              success?: boolean;
              ticket?: { id: string; title: string; description?: string; type?: string };
            };
            error?: string;
          };
        } finally {
          inFlightFeedbackIds.delete(feedbackId);
        }

        type CreatedTicket = {
          id: string;
          title: string;
          description?: string;
          type?: string;
          screenshotId?: string | null;
          tags?: string[];
        };
        const feedbackJson = feedbackResponse?.data;
        const text =
          typeof feedbackResponse?.error === "string"
            ? feedbackResponse.error
            : JSON.stringify(feedbackResponse?.error ?? "");
        if (!feedbackResponse?.success && isAuthFailureResponse(text)) {
          throw new Error("Not authenticated.");
        }
        if (feedbackJson === undefined || typeof feedbackJson !== "object" || feedbackJson === null) {
          throw new Error("Feedback creation returned no ticket.");
        }
        const tick = requireApiSuccessData<{ ticket: CreatedTicket }>(feedbackJson).ticket;
        const created: StructuredFeedback = {
          id: tick.id,
          title: tick.title,
          description: tick.description ?? "",
          type: tick.type ?? "Feedback",
          screenshotId: finalScreenshotId,
          tags: normalized.tags ?? [],
          pageArea: normalized.pageArea ?? null,
          userAgent:
            typeof navigator !== "undefined" && typeof navigator.userAgent === "string"
              ? navigator.userAgent
              : null,
          viewportWidth:
            typeof enrichedContext.viewportWidth === "number"
              ? enrichedContext.viewportWidth
              : null,
          viewportHeight:
            typeof enrichedContext.viewportHeight === "number"
              ? enrichedContext.viewportHeight
              : null,
          devicePixelRatio:
            typeof enrichedContext.devicePixelRatio === "number"
              ? enrichedContext.devicePixelRatio
              : (typeof window !== "undefined" ? (window.devicePixelRatio || 1) : null),
          createdAt: Date.now(),
        };
        notifyFeedbackCreated(created, effectiveSessionId);
        return created;
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
        screenWidth?: number;
        screenHeight?: number;
        subtreeText?: string | null;
        capturedAt?: number;
      } | null,
      options?: { sessionMode?: boolean }
    ): Promise<StructuredFeedback> => {
      if (feedbackLimitReached) {
        callbacks?.onError?.();
        throw new Error("Feedback limit reached");
      }
      const feedbackId = generateFeedbackId();
      const jobId = callbacks ? feedbackId : null;
      if (jobId) {
        const job: FeedbackJob = {
          id: jobId,
          status: "processing",
          transcript,
          screenshot,
          createdAt: Date.now(),
        };
        setFeedbackJobs((prev) => [job, ...prev]);
        chrome.runtime
          .sendMessage({ type: "ECHLY_FEEDBACK_JOB_STARTED", id: jobId, createdAt: job.createdAt })
          .catch((err) => logSendMessageRejection("ECHLY_FEEDBACK_JOB_STARTED", err));
      }

      startLocalOp();
      try {
        setIsProcessingFeedback(true);
        const ticket = await processFeedbackPipeline({
          transcript,
          screenshot,
          context: (context as CaptureContext | null | undefined) ?? null,
          callbacks,
          sessionMode: options?.sessionMode,
          feedbackId,
        });
        if (jobId) setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
        callbacks?.onSuccess?.(ticket);
        return ticket;
      } catch (err) {
        logger.error("error", "feedback_pipeline_failed", err);
        const isLimitErr = err instanceof Error && (err as Error & { limitReached?: boolean }).limitReached === true;
        if (isLimitErr) {
          if (jobId) setFeedbackJobs((prev) => prev.filter((j) => j.id !== jobId));
          setFeedbackLimitReached({
            message: (err as Error).message || "Monthly ticket limit reached",
            upgradePlan: (err as Error & { upgradePlan?: string }).upgradePlan ?? "business",
          });
        } else if (jobId) {
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
        endLocalOp();
      }
    },
    [processFeedbackPipeline, startLocalOp, endLocalOp, setFeedbackLimitReached, feedbackLimitReached]
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      setLocalFeedbackItems((prev) => {
        const list = prev ?? [];
        const snap = list.find((i) => i.id === id);
        if (snap) deleteSnapshotsRef.current.set(id, snap);
        pendingDeletesRef.current.add(id);
        return list.filter((i) => i.id !== id);
      });
      setCountsDelta((d) => d - 1);

      startLocalOp();
      try {
        const res = await apiFetch(`/api/tickets/${id}`, { method: "DELETE" });
        throwIfHttpError(res, "DELETE ticket");
        pendingDeletesRef.current.delete(id);
        deleteSnapshotsRef.current.delete(id);
        notifyTicketDeleted(id);
      } catch (err) {
        logger.error("error", "delete_ticket_failed", err);
        pendingDeletesRef.current.delete(id);
        const restored = deleteSnapshotsRef.current.get(id);
        deleteSnapshotsRef.current.delete(id);
        if (restored) {
          setLocalFeedbackItems((prev) => {
            const list = prev ?? [];
            if (list.some((i) => i.id === id)) return list;
            return [restored, ...list];
          });
        }
        setCountsDelta((d) => d + 1);
      } finally {
        endLocalOp();
      }
    },
    [startLocalOp, endLocalOp]
  );

  const handleUpdate = React.useCallback(
    async (id: string, payload: { title: string; description?: string; tags?: string[] }) => {
      let typeForMessage = "Feedback";
      setLocalFeedbackItems((prev) => {
        const list = prev ?? [];
        const cur = list.find((i) => i.id === id);
        if (cur) {
          typeForMessage = cur.type ?? "Feedback";
          if (!editRollbackRef.current.has(id)) {
            editRollbackRef.current.set(id, { ...cur });
          }
        }
        return list.map((p) =>
          p.id === id
            ? {
                ...p,
                title: payload.title,
                description: payload.description ?? "",
                tags: payload.tags ?? p.tags,
              }
            : p
        );
      });
      chrome.runtime
        .sendMessage({
          type: "ECHLY_TICKET_UPDATED",
          ticket: {
            id,
            title: payload.title,
            description: payload.description ?? "",
            tags: payload.tags,
            type: typeForMessage,
          },
        })
        .catch((err) => logSendMessageRejection("ECHLY_TICKET_UPDATED (optimistic)", err));

      startLocalOp();
      try {
        const res = await apiFetch(`/api/tickets/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description ?? "",
            tags: payload.tags,
          }),
        });
        throwIfHttpError(res, "PATCH ticket");
        const rawPatch = await res.json();
        const ticket = requireApiSuccessData<{
          ticket: { id: string; title: string; description?: string; type?: string; tags?: string[] };
        }>(rawPatch).ticket;
        editRollbackRef.current.delete(id);
        chrome.runtime
          .sendMessage({
            type: "ECHLY_TICKET_UPDATED",
            ticket: {
              id: ticket.id,
              title: ticket.title,
              description: ticket.description ?? "",
              tags: ticket.tags ?? payload.tags,
              type: ticket.type ?? "Feedback",
            },
          })
          .catch((err) => logSendMessageRejection("ECHLY_TICKET_UPDATED", err));
      } catch (err) {
        logger.error("error", "update_ticket_failed", err);
        const rolled = editRollbackRef.current.get(id);
        editRollbackRef.current.delete(id);
        if (rolled) {
          setLocalFeedbackItems((prev) => (prev ?? []).map((p) => (p.id === id ? rolled : p)));
          chrome.runtime
            .sendMessage({
              type: "ECHLY_TICKET_UPDATED",
              ticket: {
                id: rolled.id,
                title: rolled.title,
                description: rolled.description ?? "",
                type: rolled.type ?? "Feedback",
              },
            })
            .catch((e) => logSendMessageRejection("ECHLY_TICKET_UPDATED (rollback)", e));
        }
      } finally {
        endLocalOp();
      }
    },
    [startLocalOp, endLocalOp]
  );

  const onSessionTitleChange = React.useCallback(
    (newTitle: string) => {
      if (!effectiveSessionId) return;
      const trimmed = newTitle.trim() || "Untitled Session";
      setLocalSessionTitle(trimmed);
      startLocalOp();
      void (async () => {
        try {
          const res = await apiFetch(`/api/sessions/${effectiveSessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: trimmed }),
          });
          throwIfHttpError(res, "PATCH session title");
          const rawTitle = await res.json();
          requireApiSuccessData<{ session: unknown }>(rawTitle);
          chrome.runtime
            .sendMessage({
              type: "ECHLY_SESSION_UPDATED",
              sessionId: effectiveSessionId,
              title: trimmed,
            })
            .catch((err) => logSendMessageRejection("ECHLY_SESSION_UPDATED", err));
        } catch (err) {
          logger.error("error", "session_title_update_failed", err);
          setLocalSessionTitle(null);
        } finally {
          endLocalOp();
        }
      })();
    },
    [effectiveSessionId, startLocalOp, endLocalOp]
  );

  const fetchSessions = React.useCallback(async () => {
    const sessions = await getSessionsCached(apiFetch);
    if (ECHLY_DEBUG) logger.debug("extension", "sessions_returned", { count: sessions.length });
    return sessions;
  }, []);

  async function createSession(): Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  > {
    if (ECHLY_DEBUG) logger.debug("extension", "session_create_started");
    const res = await apiFetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: generateSessionTitle() }),
    });
    const data = (await res.json()) as {
      success?: boolean;
      data?: { session?: { id: string }; upgradePlan?: unknown };
      error?: { code?: string; message?: string };
    };
    const limitPayload =
      data.data && typeof data.data === "object" && "upgradePlan" in data.data
        ? (data.data as { upgradePlan?: unknown })
        : null;
    if (ECHLY_DEBUG) {
      logger.debug("extension", "session_create_response", {
        status: res.status,
        ok: res.ok,
        success: data.success,
        error: data.error,
      });
    }
    if (
      res.status === 403 &&
      data.success === false &&
      data.error?.code === "FORBIDDEN" &&
      limitPayload
    ) {
      logger.debug("extension", "session_limit_reached");
      return {
        limitReached: true,
        message: data.error.message ?? "You've reached your session limit.",
        upgradePlan: limitPayload.upgradePlan,
      };
    }
    if (!res.ok) {
      throw new Error("API_ERROR_" + res.status);
    }
    const inner = requireApiSuccessData<{ session: { id: string } }>(data);
    const newSessionId = inner.session.id;
    if (!newSessionId) {
      throw new Error("API_ERROR_" + res.status);
    }
    invalidateSessionsCache();
    return { id: newSessionId };
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
    (sessionId: string, _options?: { enterCaptureImmediately?: boolean }) => {
      chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId }, () => {
        logRuntimeLastError("ECHLY_SET_ACTIVE_SESSION (onPreviousSessionSelect)");
      });
      chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch((err) =>
        logSendMessageRejection("ECHLY_SESSION_MODE_START (onPreviousSessionSelect)", err)
      );
      void (async () => {
        try {
          const sessionRes = await apiFetch(`/api/sessions/${sessionId}`);
          throwIfHttpError(sessionRes, "GET session for resume");
          const sessionRaw = await sessionRes.json();
          const sessionPayload = requireApiSuccessData<{ session: { url?: string } }>(sessionRaw);
          const openUrl = sessionPayload.session.url;
          if (typeof openUrl === "string" && openUrl) {
            chrome.runtime.sendMessage({
              type: "ECHLY_OPEN_TAB",
              url: openUrl,
            }).catch((err) => logSendMessageRejection("ECHLY_OPEN_TAB (resume session)", err));
          }
        } catch (e) {
          console.error("[ECHLY] session URL fetch failed (optional tab open)", e);
        }
      })();
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

  const onCloseWidget = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: "ECHLY_CLOSE_WIDGET" }).catch((err) =>
      logSendMessageRejection("ECHLY_CLOSE_WIDGET", err)
    );
  }, []);

  if (authState === "loading" && !user) {
    return (
      <div className="echly-v2">
        <div className="pill auth-check-pill">
          <div className="auth-check-body">
            <div className="auth-check-logo">
              <img
                src={chrome.runtime.getURL("assets/annote-logo-icon.svg")}
                alt="Annote"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div className="auth-check-bar-wrap">
              <div className="auth-check-bar" />
            </div>
            <span className="auth-check-text">Connecting to Annote…</span>
          </div>
        </div>
      </div>
    );
  }

  const uiGlobal = globalState ?? BOOTSTRAP_GLOBAL_UI;
  const displayFeedbackItems = localFeedbackItems ?? uiGlobal.feedback.items;
  const displayTotalCount = Math.max(0, uiGlobal.counts.total + countsDelta);
  const displaySessionTitle = localSessionTitle ?? uiGlobal.sessionTitle ?? undefined;

  if (authState === "unauthenticated" || !user) {
    return (
      <div className="echly-v2">
        <div className="pill pill-sm" style={{ position: "relative" }}>
          <button
            type="button"
            onClick={onCloseWidget}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "#54495F",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-hover)";
              e.currentTarget.style.color = "#15101F";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#54495F";
            }}
            title="Close"
            aria-label="Close Annote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="auth-body">
            <div className="auth-icon">
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5.5 7V5a2.5 2.5 0 1 1 5 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="10" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="auth-title">Sign in to use Annote</div>
            <div className="auth-sub">
              Capture voice or written feedback on any page — Annote will sync it to your workspace.
            </div>
            <button type="button" className="auth-cta" onClick={onTriggerLogin}>
              Open Login
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="auth-foot">
              New to Annote?{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onTriggerLogin(); }}
              >
                Create an account
              </a>
            </div>
          </div>
        </div>
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
    <div style={{ position: "relative" }}>
      {globalState === null && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, #DCD5F0, #5A49BF)",
            opacity: 0.9,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}
      <EchlyWidgetErrorBoundary>
        <CaptureWidget
          key={widgetResetKey}
          sessionId={effectiveSessionId ?? ""}
          userId={user.uid}
          extensionMode={true}
          fetchClient={extensionFetchClient}
          __extensionSavingState={isSaving}
          onExtensionSavingSignalsChange={onExtensionSavingSignalsChange}
          captureMode={uiGlobal.captureMode}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          widgetToggleRef={widgetToggleRef}
          onRecordingChange={onRecordingChange}
          expanded={uiGlobal.expanded}
          onExpandRequest={onExpandRequest}
          onCollapseRequest={onCollapseRequest}
          captureDisabled={false}
          theme={theme}
          onThemeToggle={onThemeToggle}
          fetchSessions={fetchSessions}
          hasPreviousSessions={hasPreviousSessions}
          onPreviousSessionSelect={onPreviousSessionSelect}
          pointers={displayFeedbackItems}
          feedbackRecovering={uiGlobal.feedback.recovering === true}
          feedbackRecoveryAttempts={uiGlobal.feedback.recoveryAttempts}
          feedbackFetchFailed={uiGlobal.feedback.recovering !== true && uiGlobal.feedback.recoveryAttempts > 0}
          totalCount={displayTotalCount}
          openCount={uiGlobal.openCount}
          resolvedCount={uiGlobal.resolvedCount}
          sessionLoading={uiGlobal.sessionLoading}
          sessionTitleProp={displaySessionTitle}
          onSessionTitleChange={onSessionTitleChange}
          isProcessingFeedback={isProcessingFeedback}
          feedbackJobs={mergedFeedbackJobs}
          onSessionEnd={() => {}}
          onCreateSession={createSession}
          onActiveSessionChange={onActiveSessionChange}
          ensureAuthenticated={ensureAuthenticated}
          verifySessionBeforeSessions={verifySessionBeforeSessions}
          onTriggerLogin={onTriggerLogin}
          globalSessionModeActive={uiGlobal.session.status !== "idle"}
          globalSessionPaused={uiGlobal.session.status === "paused"}
          editPauseTooltipVisible={uiGlobal.editPauseTooltipVisible ?? false}
          onSetEditPauseTooltip={(visible) =>
            chrome.runtime.sendMessage({ type: "ECHLY_SET_EDIT_PAUSE_TOOLTIP", visible }).catch((err) =>
              logSendMessageRejection("ECHLY_SET_EDIT_PAUSE_TOOLTIP", err)
            )
          }
          onSessionModeStart={() => {
            window.__ECHLY_ENSURE_KEEPALIVE__?.();
            chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch((err) =>
              logSendMessageRejection("ECHLY_SESSION_MODE_START", err)
            );
          }}
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
            const sessionId = uiGlobal.session.id;
            window.__ECHLY_DISCONNECT_KEEPALIVE__?.();
            void (async () => {
              await new Promise<void>((resolve, reject) => {
                chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END" }, () => {
                  if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                  else resolve();
                });
              });
              await new Promise((r) => setTimeout(r, 50));
              if (sessionId) {
                const url = `${APP_ORIGIN}/session/${sessionId}`;
                chrome.runtime.sendMessage({ type: "ECHLY_OPEN_TAB", url }).catch((err) =>
                  logSendMessageRejection("ECHLY_OPEN_TAB (session mode end)", err)
                );
              }
            })().catch((err) => logSendMessageRejection("ECHLY_SESSION_MODE_END chain", err));
          }}
          onSessionModeEndSoft={() => {
            window.__ECHLY_DISCONNECT_KEEPALIVE__?.();
            void (async () => {
              try {
                await new Promise<void>((resolve, reject) => {
                  chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_END_SOFT" }, () => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve();
                  });
                });
              } catch (err) {
                logSendMessageRejection("ECHLY_SESSION_MODE_END_SOFT", err);
              }
            })();
          }}
          captureRootParent={widgetRoot}
          launcherLogoUrl={launcherLogoUrl}
          openResumeModal={openResumeModalFromMessage}
          onResumeModalClose={() => setOpenResumeModalFromMessage(false)}
          sessionLimitReached={sessionLimitReached}
          feedbackLimitReached={feedbackLimitReached}
          feedbackUsage={feedbackUsage}
          feedbackLimit={feedbackLimit}
          sessionStartErrorBanner={sessionStartErrorBanner}
          onSessionStartErrorDismiss={() => setSessionStartErrorBanner(null)}
          environment={environment}
          assertIdentityBeforeWorkspaceMutations={() => {
            /* Extension host: mutations are authorized via extension session / background; no web WorkspaceProvider assert. */
          }}
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
    </div>
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
    feedbackLimitReached: state.feedbackLimitReached === true,
    feedbackLimitMessage: typeof state.feedbackLimitMessage === "string" ? state.feedbackLimitMessage : null,
    feedbackUpgradePlan: typeof state.feedbackUpgradePlan === "string" ? state.feedbackUpgradePlan : null,
    feedbackJobs: Array.isArray(state.feedbackJobs) ? state.feedbackJobs : [],
    editPauseTooltipVisible: state.editPauseTooltipVisible === true,
  };
}

/** Debug: passive wheel + scroll listeners to verify events reach the page (never block scroll). */
function ensureScrollDebugListeners(): void {
  const win = window as Window & { __ECHLY_SCROLL_DEBUG__?: boolean };
  if (win.__ECHLY_SCROLL_DEBUG__) return;
  win.__ECHLY_SCROLL_DEBUG__ = true;
  const wheelHandler = () => ECHLY_DEBUG && console.debug("ECHLY wheel event reached page");
  const scrollHandler = () => ECHLY_DEBUG && console.debug("ECHLY scroll event detected");
  window.addEventListener("wheel", wheelHandler, { passive: true });
  document.addEventListener("scroll", scrollHandler, { passive: true });
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
 * Mount the widget (host element + shadow DOM + React).
 * Bootstrap loads this script via <script> tag and then dispatches buffered events; React effects
 * subscribed to those events catch up the UI. Host visibility is owned by bootstrap.
 */
function injectWidgetUI(): void {
  logger.debug("extension", "ui_injected");
  let host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = SHADOW_HOST_ID;
    host.setAttribute("data-echly-ui", "true");
    /* Host is content-sized and pinned to a corner. Drag/snap moves the host itself via
       updateHostPosition(corner); the inner widget stays at the host's origin. Critically,
       the host must NOT be a full-viewport overlay or it intercepts every page click and
       breaks click-to-capture. */
    host.style.position = "fixed";
    host.style.bottom = "24px";
    host.style.right = "24px";
    host.style.top = "auto";
    host.style.left = "auto";
    host.style.width = "auto";
    host.style.height = "auto";
    host.style.zIndex = "2147483647";
    host.style.display = "block";
    host.style.pointerEvents = "auto";
    host.style.visibility = "visible";

    waitForBody(() => {
      document.body.appendChild(host!);
      mountReactApp(host!);
    });
  }
  installHostPositionUpdater(host!);
  ensureScrollDebugListeners();
}

/** Expose updateHostPosition(corner) on window so the drag-snap logic in useCaptureWidget
 *  can move the shadow host itself. The host stays content-sized to avoid intercepting
 *  page clicks; only its corner anchor changes. */
function installHostPositionUpdater(host: HTMLDivElement): void {
  const w = window as Window & {
    __ECHLY_UPDATE_HOST_POSITION__?: (corner: "tl" | "tr" | "bl" | "br") => void;
  };
  if (w.__ECHLY_UPDATE_HOST_POSITION__) return;
  w.__ECHLY_UPDATE_HOST_POSITION__ = (corner) => {
    const target = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
    if (!target) return;
    if (corner === "tl") {
      target.style.top = "24px";
      target.style.left = "24px";
      target.style.bottom = "auto";
      target.style.right = "auto";
    } else if (corner === "tr") {
      target.style.top = "24px";
      target.style.right = "24px";
      target.style.bottom = "auto";
      target.style.left = "auto";
    } else if (corner === "bl") {
      target.style.bottom = "24px";
      target.style.left = "24px";
      target.style.top = "auto";
      target.style.right = "auto";
    } else {
      target.style.bottom = "24px";
      target.style.right = "24px";
      target.style.top = "auto";
      target.style.left = "auto";
    }
  };
  void host;
}

/** Widget entry point: invoked when bootstrap appends widget.js. Idempotent. */
(function widgetEntry() {
  if (window.__ECHLY_WIDGET_LOADED__) return;
  window.__ECHLY_WIDGET_LOADED__ = true;
  injectWidgetUI();
})();
