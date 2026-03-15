/**
 * Content script: ultra-thin UI layer. Auto-injected via manifest on all URLs.
 * Single mount, visibility controlled by background (ECHLY_VISIBILITY). No blocking overlays.
 * Auth in popup only; unauthenticated = minimal disabled state with Sign in button.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { apiFetch } from "./contentAuthFetch";
import { requestTokenFromPage } from "./requestTokenFromPage";
import { uploadScreenshot, generateFeedbackId, generateScreenshotId } from "./contentScreenshot";
import { getVisibleTextFromScreenshot } from "./ocr";
import CaptureWidget from "@/components/CaptureWidget";
import type { StructuredFeedback, CaptureContext, FeedbackJob } from "@/components/CaptureWidget/types";
import { ECHLY_DEBUG, log } from "@/lib/utils/logger";
import { echlyLog } from "@/lib/debug/echlyLogger";

const ROOT_ID = "echly-root";
const SHADOW_HOST_ID = "echly-shadow-host";
const THEME_STORAGE_KEY = "widget-theme";
/** App origin for opening dashboard (same as API base). */
const APP_ORIGIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://echly-web.vercel.app";

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
  const host = document.getElementById(SHADOW_HOST_ID);
  if (host) {
    (host as HTMLDivElement).style.display = visible ? "block" : "none";
  }
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
  pointers: StructuredFeedback[];
  captureMode: "voice" | "text";
  user?: AuthUser | null;
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

/** Ask background to open login page in a new tab (Loom-style flow) so user can sign in. */
function requestOpenLoginPage(): void {
  chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" }).catch(() => {});
}

/** Notify background when content creates a ticket via apiFetch so globalUIState.pointers stays in sync. */
function notifyFeedbackCreated(ticket: { id: string; title: string; actionSteps?: string[]; type?: string }): void {
  chrome.runtime.sendMessage({
    type: "ECHLY_FEEDBACK_CREATED",
    ticket: {
      id: ticket.id,
      title: ticket.title,
      actionSteps: ticket.actionSteps ?? [],
      type: ticket.type ?? "Feedback",
    },
  }).catch(() => {});
}

type ContentAppProps = {
  widgetRoot: HTMLElement;
  initialTheme: "dark" | "light";
};

function ContentApp({ widgetRoot, initialTheme }: ContentAppProps) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [sessionMessage, setSessionMessage] = React.useState<string | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [theme, setTheme] = React.useState<"dark" | "light">(initialTheme);
  /** Local loading flag set immediately on Start/Previous Session click; cleared when globalState.sessionLoading becomes false. */
  const [sessionLoadingOverride, setSessionLoadingOverride] = React.useState(false);
  /** True while Start Session request is in progress; cleared when globalState.sessionId is set. */
  const [startSessionLoading, setStartSessionLoading] = React.useState(false);
  const [globalState, setGlobalState] = React.useState<GlobalUIState>({
    visible: false,
    expanded: false,
    isRecording: false,
    sessionId: null,
    sessionTitle: null,
    sessionModeActive: false,
    sessionPaused: false,
    sessionLoading: false,
    pointers: [],
    captureMode: "voice",
    user: null,
  });
  const [widgetResetKey, setWidgetResetKey] = React.useState(0);
  const [hasPreviousSessions, setHasPreviousSessions] = React.useState(false);
  const effectiveSessionId = globalState.sessionId;
  const widgetToggleRef = React.useRef<(() => void) | null>(null);

  type ExtensionClarityPending = {
    tickets: Array<{ title?: string; description?: string; suggestedTags?: string[]; actionSteps?: string[] }>;
    screenshotUrl: string | null;
    screenshotId: string;
    uploadPromise: Promise<string | null>;
    transcript: string;
    screenshot: string | null;
    firstFeedbackId: string;
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
  const logoUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("assets/Echly_logo.svg")
      : "/Echly_logo.svg";
  const launcherLogoUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("assets/Echly_logo_launcher.svg")
      : "/Echly_logo_launcher.svg";

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

  /* Global UI state: derived only from background (ECHLY_GLOBAL_STATE). Auth never requested by content. */
  React.useEffect(() => {
    const applyGlobalState = (state: GlobalUIState) => {
      setHostVisibility(getShouldShowTray(state));
      setGlobalState((prev) => mergeWithPointerProtection(prev, state));
      if (state.user !== undefined) {
        setUser(
          state.user && state.user.uid
            ? {
                uid: state.user.uid,
                name: state.user.name ?? null,
                email: state.user.email ?? null,
                photoURL: state.user.photoURL ?? null,
              }
            : null
        );
      }
      setAuthChecked(true);
    };
    (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__ = applyGlobalState;
    return () => {
      delete (window as Window & { __ECHLY_APPLY_GLOBAL_STATE__?: (state: GlobalUIState) => void }).__ECHLY_APPLY_GLOBAL_STATE__;
    };
  }, []);

  /* Clear local session loading override when background reports loading finished. */
  React.useEffect(() => {
    if (globalState.sessionLoading === false) setSessionLoadingOverride(false);
  }, [globalState.sessionLoading]);

  /* Clear Start Session button loading when we have a session id. */
  React.useEffect(() => {
    if (globalState.sessionId) setStartSessionLoading(false);
  }, [globalState.sessionId]);

  /* Global UI state: always overwrite from background; auth comes from state only (no ECHLY_GET_AUTH_STATE). */
  React.useEffect(() => {
    const handler = (e: CustomEvent<{ state: GlobalUIState }>) => {
      const s = e.detail?.state;
      if (!s) return;
      echlyLog("CONTENT", "global state received", s);
      setHostVisibility(getShouldShowTray(s));
      setGlobalState((prev) => mergeWithPointerProtection(prev, s));
      if (s.user !== undefined) {
        setUser(
          s.user && s.user.uid
            ? { uid: s.user.uid, name: s.user.name ?? null, email: s.user.email ?? null, photoURL: s.user.photoURL ?? null }
            : null
        );
      }
      setAuthChecked(true);
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  }, []);

  /* Hydrate from background on mount (global state only; no auth request). */
  React.useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_GLOBAL_STATE" },
      (response: GlobalStateResponse) => {
        const state = response?.state;
        if (state) {
          setHostVisibility(getShouldShowTray(state));
          setGlobalState((prev) => mergeWithPointerProtection(prev, state));
          if (state.user !== undefined) {
            setUser(
              state.user && state.user.uid
                ? { uid: state.user.uid, name: state.user.name ?? null, email: state.user.email ?? null, photoURL: state.user.photoURL ?? null }
                : null
            );
          }
          setAuthChecked(true);
        }
      }
    );
  }, []);

  /* Resync global state when tab becomes visible (ECHLY_GET_GLOBAL_STATE only; no auth request). */
  React.useEffect(() => {
    const handler = () => {
      if (document.hidden) return;
      chrome.runtime.sendMessage(
        { type: "ECHLY_GET_GLOBAL_STATE" },
        (response: GlobalStateResponse) => {
          if (response?.state) {
            const normalized = normalizeGlobalState(response.state);
            if (normalized) {
              setHostVisibility(getShouldShowTray(normalized));
              setGlobalState((prev) => mergeWithPointerProtection(prev, normalized));
              if (normalized.user !== undefined) {
                setUser(
                  normalized.user && normalized.user.uid
                    ? { uid: normalized.user.uid, name: normalized.user.name ?? null, email: normalized.user.email ?? null, photoURL: normalized.user.photoURL ?? null }
                    : null
                );
              }
              setAuthChecked(true);
            }
          }
        }
      );
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  /* On widget open, query backend for sessions so Previous Sessions button shows only when sessions exist. */
  React.useEffect(() => {
    if (!globalState.visible) return;
    let cancelled = false;
    async function checkSessions() {
      try {
        const res = await apiFetch("/api/sessions?limit=1");
        const data = (await res.json()) as { sessions?: unknown[] };
        if (!cancelled) setHasPreviousSessions(Boolean(data.sessions?.length));
      } catch {
        if (!cancelled) setHasPreviousSessions(false);
      }
    }
    checkSessions();
    return () => {
      cancelled = true;
    };
  }, [globalState.visible]);

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

  const onExpandRequest = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: "ECHLY_EXPAND_WIDGET" }).catch(() => {});
  }, []);
  const onCollapseRequest = React.useCallback(() => {
    chrome.runtime.sendMessage({ type: "ECHLY_COLLAPSE_WIDGET" }).catch(() => {});
  }, []);

  const onThemeToggle = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyThemeToRoot(widgetRoot, next);
  }, [theme, widgetRoot]);

  /* Auth state: only from ECHLY_AUTH_STATE_UPDATED or globalState.user (background is sole authority). */
  React.useEffect(() => {
    const listener = (msg: { type?: string; authenticated?: boolean; user?: AuthUser | null }) => {
      if (msg?.type !== "ECHLY_AUTH_STATE_UPDATED") return;
      if (msg.authenticated && msg.user?.uid) {
        setUser({
          uid: msg.user.uid,
          name: msg.user.name ?? null,
          email: msg.user.email ?? null,
          photoURL: msg.user.photoURL ?? null,
        });
      } else {
        setUser(null);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

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
          const visibleTextPromise = getVisibleTextFromScreenshot(imageForOcr);
          const firstFeedbackId = generateFeedbackId();
          const screenshotId = generateScreenshotId();
          const uploadPromise = screenshot
            ? uploadScreenshot(screenshot, effectiveSessionId, screenshotId)
            : Promise.resolve(null as string | null);
          const visibleTextFromScreenshot = await visibleTextPromise;
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
          const structureBody = { transcript, context: enrichedContext };
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
                  firstFeedbackId,
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
                  firstFeedbackId,
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
              chrome.runtime.sendMessage(
                {
                  type: "ECHLY_PROCESS_FEEDBACK",
                  payload: { transcript, screenshotUrl: null, screenshotId, sessionId: effectiveSessionId, context: enrichedContext },
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
                    uploadPromise.then((url) => {
                      if (url) {
                        echlyLog("PIPELINE", "screenshot uploaded", { screenshotUrl: url });
                        echlyLog("PIPELINE", "screenshot patched", { ticketId });
                        apiFetch(`/api/tickets/${ticketId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ screenshotUrl: url }),
                        }).catch(() => {});
                      }
                    }).catch(() => {});
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
            let firstCreated: StructuredFeedback | undefined;
            for (let i = 0; i < tickets.length; i++) {
              const t = tickets[i];
              const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
              const actionSteps = Array.isArray(t.actionSteps) ? t.actionSteps : [];
              const body = {
                sessionId: effectiveSessionId,
                title: t.title ?? "",
                description: desc,
                type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
                contextSummary: desc,
                actionSteps,
                suggestedTags: t.suggestedTags,
                screenshotUrl: null,
                screenshotId: i === 0 ? screenshotId : undefined,
                metadata: { clientTimestamp: Date.now() },
                ...clarityMeta,
              };
              const feedbackRes = await apiFetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              const feedbackJson = (await feedbackRes.json()) as {
                success?: boolean;
                ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
              };
              if (feedbackJson.success && feedbackJson.ticket) {
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
              notifyFeedbackCreated(firstCreated);
              uploadPromise.then((url) => {
                if (url) {
                  echlyLog("PIPELINE", "screenshot uploaded", { screenshotUrl: url });
                  echlyLog("PIPELINE", "screenshot patched", { ticketId });
                  apiFetch(`/api/tickets/${ticketId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ screenshotUrl: url }),
                  }).catch(() => {});
                }
              }).catch(() => {});
              callbacks.onSuccess(firstCreated);
            } else {
              echlyLog("PIPELINE", "error");
              setFeedbackJobs((prev) =>
                prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "AI processing failed." } : j))
              );
              callbacks.onError();
            }
          } catch (err) {
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
      const screenshotId = generateScreenshotId();
      const uploadPromise = screenshot
        ? uploadScreenshot(screenshot, effectiveSessionId, screenshotId)
        : Promise.resolve(null as string | null);
      const visibleTextFromScreenshot = await getVisibleTextFromScreenshot(imageForOcr);
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
      let firstCreated: StructuredFeedback | undefined;
      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
        const body = {
          sessionId: effectiveSessionId,
          title: t.title ?? "",
          description: desc,
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: desc,
          actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
          suggestedTags: t.suggestedTags,
          screenshotUrl: null,
          screenshotId: i === 0 ? screenshotId : undefined,
          metadata: { clientTimestamp: Date.now() },
          ...clarityMeta,
        };
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const feedbackJson = (await feedbackRes.json()) as {
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) {
        const ticketId = firstCreated.id;
        notifyFeedbackCreated(firstCreated);
        uploadPromise.then((url) => {
          if (url) {
            apiFetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ screenshotUrl: url }),
            }).catch(() => {});
          }
        }).catch(() => {});
      }
      return firstCreated;
      } finally {
        setIsProcessingFeedback(false);
      }
    },
    [effectiveSessionId, user]
  );

  const handleDelete = React.useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/tickets/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("[Echly] Delete ticket failed:", err);
      throw err;
    }
  }, []);

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
    const res = await apiFetch("/api/sessions");
    const json = (await res.json()) as { success?: boolean; sessions?: Array<{ id: string; title: string; updatedAt?: string; openCount?: number; resolvedCount?: number; feedbackCount?: number }> };
    const sessions = json.sessions ?? [];
    if (ECHLY_DEBUG) console.log("[Echly] Sessions returned:", { ok: res.ok, status: res.status, success: json.success, count: sessions.length, sessions });
    if (!res.ok || !json.success) return [];
    return sessions;
  }, []);

  const createSession = React.useCallback(async (): Promise<{ id: string } | null> => {
    if (ECHLY_DEBUG) console.log("[Echly] Creating session");
    try {
      const res = await apiFetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const json = (await res.json()) as { success?: boolean; session?: { id: string } };
      if (ECHLY_DEBUG) console.log("[Echly] Create session response:", { ok: res.ok, status: res.status, success: json.success, sessionId: json.session?.id });
      if (!res.ok || !json.success || !json.session?.id) return null;
      const session = { id: json.session.id };
      return session;
    } catch (err) {
      console.error("[Echly] Failed to create session:", err);
      return null;
    }
  }, []);

  const onActiveSessionChange = React.useCallback((newSessionId: string) => {
    setSessionLoadingOverride(true);
    chrome.runtime.sendMessage({ type: "ECHLY_SET_ACTIVE_SESSION", sessionId: newSessionId }, () => {});
  }, []);

  const onPreviousSessionSelect = React.useCallback(
    async (sessionId: string, _options?: { enterCaptureImmediately?: boolean }) => {
      setSessionLoadingOverride(true);
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

  const submitPendingFeedback = React.useCallback(
    async (pending: ExtensionClarityPending) => {
      if (!effectiveSessionId) return;
      setIsProcessingFeedback(true);
      if (pending.tickets.length === 0) {
        chrome.runtime.sendMessage(
          {
            type: "ECHLY_PROCESS_FEEDBACK",
            payload: {
              transcript: pending.transcript,
              screenshotUrl: null,
              screenshotId: pending.screenshotId,
              sessionId: effectiveSessionId,
              context: pending.context ?? {},
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
              pending.uploadPromise.then((url) => {
                if (url) {
                  apiFetch(`/api/tickets/${ticketId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ screenshotUrl: url }),
                  }).catch(() => {});
                }
              }).catch(() => {});
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
      let firstCreated: StructuredFeedback | undefined;
      for (let i = 0; i < pending.tickets.length; i++) {
        const t = pending.tickets[i];
        const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
        const body = {
          sessionId: effectiveSessionId,
          title: t.title ?? "",
          description: desc,
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: desc,
          actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
          suggestedTags: t.suggestedTags,
          screenshotUrl: null,
          screenshotId: i === 0 ? pending.screenshotId : undefined,
          metadata: { clientTimestamp: Date.now() },
          ...clarityMeta,
        };
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const feedbackJson = (await feedbackRes.json()) as {
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) {
        const ticketId = firstCreated.id;
        pending.uploadPromise.then((url) => {
          if (url) {
            apiFetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ screenshotUrl: url }),
            }).catch(() => {});
          }
        }).catch(() => {});
        setIsProcessingFeedback(false);
        pending.callbacks.onSuccess(firstCreated);
      } else {
        echlyLog("PIPELINE", "error");
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
      }
    },
    [effectiveSessionId]
  );

  const submitEditedFeedback = React.useCallback(
    async (pending: ExtensionClarityPending, editedText: string) => {
      if (!effectiveSessionId) return;
      setIsProcessingFeedback(true);
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
          chrome.runtime.sendMessage(
            {
              type: "ECHLY_PROCESS_FEEDBACK",
              payload: {
                transcript: trimmed,
                screenshotUrl: null,
                screenshotId: pending.screenshotId,
                sessionId: effectiveSessionId,
                context: pending.context ?? {},
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
                pending.uploadPromise.then((url) => {
                  if (url) {
                    apiFetch(`/api/tickets/${ticketId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ screenshotUrl: url }),
                    }).catch(() => {});
                  }
                }).catch(() => {});
              } else {
                echlyLog("PIPELINE", "error");
                pending.callbacks.onError();
              }
            }
          );
          return;
        }

        let firstCreated: StructuredFeedback | undefined;
        for (let i = 0; i < tickets.length; i++) {
          const t = tickets[i];
          const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
          const body = {
            sessionId: effectiveSessionId,
            title: t.title ?? "",
            description: desc,
            type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
            contextSummary: desc,
            actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
            suggestedTags: t.suggestedTags,
            screenshotUrl: null,
            screenshotId: i === 0 ? pending.screenshotId : undefined,
            metadata: { clientTimestamp: Date.now() },
            ...clarityMeta,
          };
          const feedbackRes = await apiFetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const feedbackJson = (await feedbackRes.json()) as {
            success?: boolean;
            ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
          };
          if (feedbackJson.success && feedbackJson.ticket) {
            const tick = feedbackJson.ticket;
            const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
            if (!firstCreated)
              firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
          }
        }
        if (firstCreated) {
          const ticketId = firstCreated.id;
          notifyFeedbackCreated(firstCreated);
          pending.uploadPromise.then((url) => {
            if (url) {
              apiFetch(`/api/tickets/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ screenshotUrl: url }),
              }).catch(() => {});
            }
          }).catch(() => {});
          setIsProcessingFeedback(false);
          pending.callbacks.onSuccess(firstCreated);
        } else {
          echlyLog("PIPELINE", "error");
          setIsProcessingFeedback(false);
          pending.callbacks.onError();
        }
      } catch (err) {
        console.error("[Echly] Submit edited feedback failed:", err);
        echlyLog("PIPELINE", "error");
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
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
      let firstCreated: StructuredFeedback | undefined;
      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i];
        const desc = typeof t.description === "string" ? t.description : (t.title ?? "");
        const body = {
          sessionId: effectiveSessionId,
          title: t.title ?? "",
          description: desc,
          type: Array.isArray(t.suggestedTags) && t.suggestedTags[0] ? t.suggestedTags[0] : "Feedback",
          contextSummary: desc,
          actionSteps: Array.isArray(t.actionSteps) ? t.actionSteps : [],
          suggestedTags: t.suggestedTags,
          screenshotUrl: null,
          screenshotId: i === 0 ? pending.screenshotId : undefined,
          metadata: { clientTimestamp: Date.now() },
          ...clarityMeta,
        };
        const feedbackRes = await apiFetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const feedbackJson = (await feedbackRes.json()) as {
          success?: boolean;
          ticket?: { id: string; title: string; description: string; type?: string; actionSteps?: string[] };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          const steps = tick.actionSteps ?? (tick.description ? tick.description.split(/\n\s*\n/) : []);
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, actionSteps: steps, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) {
        const ticketId = firstCreated.id;
        notifyFeedbackCreated(firstCreated);
        pending.uploadPromise.then((url) => {
          if (url) {
            apiFetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ screenshotUrl: url }),
            }).catch(() => {});
          }
        }).catch(() => {});
        setIsProcessingFeedback(false);
        pending.callbacks.onSuccess(firstCreated);
      } else {
        echlyLog("PIPELINE", "error");
        setIsProcessingFeedback(false);
        pending.callbacks.onError();
      }
    } catch (err) {
      console.error("[Echly] Use suggestion failed:", err);
      echlyLog("PIPELINE", "error");
      setIsProcessingFeedback(false);
      pending.callbacks.onError();
    }
  }, [extensionClarityPending, effectiveSessionId]);

  React.useEffect(() => {
    if (isEditingFeedback && clarityTextareaRef.current) {
      clarityTextareaRef.current.focus();
    }
  }, [isEditingFeedback]);

  const pending = extensionClarityPending;

  if (!user) return null;

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
        sessionLoading={sessionLoadingOverride || (globalState.sessionLoading ?? false)}
        startSessionLoading={startSessionLoading}
        sessionTitleProp={globalState.sessionTitle ?? undefined}
        onSessionTitleChange={onSessionTitleChange}
        isProcessingFeedback={isProcessingFeedback}
        feedbackJobs={feedbackJobs}
        onSessionEnd={() => {}}
        onCreateSession={createSession}
        onActiveSessionChange={onActiveSessionChange}
        globalSessionModeActive={globalState.sessionModeActive ?? false}
        globalSessionPaused={globalState.sessionPaused ?? false}
        onSessionModeStart={() => {
          setStartSessionLoading(true);
          chrome.runtime.sendMessage({ type: "ECHLY_SESSION_MODE_START" }).catch(() => {
            setStartSessionLoading(false);
          });
        }}
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
      />
    </>
  );
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
    pointers: Array.isArray(state.pointers) ? state.pointers : [],
    captureMode: state.captureMode === "text" ? "text" : "voice",
    user: state.user !== undefined ? state.user : null,
  };
}

function dispatchGlobalState(state: GlobalUIState): void {
  echlyLog("CONTENT", "dispatch event", { type: "ECHLY_GLOBAL_STATE" });
  window.dispatchEvent(
    new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state } })
  );
}

/** Request initial global state from background. Restores visibility, expanded, recording, session mode on load/refresh. */
function syncInitialGlobalState(host: HTMLDivElement): void {
  chrome.runtime.sendMessage(
    { type: "ECHLY_GET_GLOBAL_STATE" },
    (response: GlobalStateResponse) => {
      const normalized = normalizeGlobalState(response?.state);
      if (!normalized) return;
      host.style.display = getShouldShowTray(normalized) ? "block" : "none";
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
        setHostVisibility(getShouldShowTray(normalized));
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
  chrome.runtime.onMessage.addListener((msg: { type?: string; state?: GlobalUIState; ticket?: { id: string; title: string; description: string; type?: string }; sessionId?: string }, _sender, sendResponse) => {
    if (msg.type === "ECHLY_GET_TOKEN_FROM_PAGE") {
      requestTokenFromPage()
        .then((token) => sendResponse({ token }))
        .catch(() => sendResponse({ token: null }));
      return true;
    }
    if (msg.type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
      echlyLog("CONTENT", "dispatch event", { type: "ECHLY_FEEDBACK_CREATED" });
      window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED", { detail: { ticket: msg.ticket, sessionId: msg.sessionId } }));
      return;
    }
    const h = document.getElementById(SHADOW_HOST_ID);
    if (!h) return;
    if (msg.type === "ECHLY_GLOBAL_STATE" && msg.state) {
      const state = msg.state;
      setHostVisibility(getShouldShowTray(state));
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
    /* Tab activation resync: always fetch and apply state; never debounce or skip. */
    if (msg.type === "ECHLY_SESSION_STATE_SYNC") {
      chrome.runtime.sendMessage({ type: "ECHLY_GET_GLOBAL_STATE" }, (response: GlobalStateResponse) => {
        if (response?.state) {
          const normalized = normalizeGlobalState(response.state);
          if (normalized) {
            setHostVisibility(getShouldShowTray(normalized));
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

/**
 * Single mount: create host once, mount React once, default hidden.
 * Visibility via ECHLY_VISIBILITY from background. No re-mount, no injection logic.
 */
/** Dashboard origins where the token bridge is allowed to run. */
const DASHBOARD_ORIGINS = ["https://echly-web.vercel.app", "http://localhost:3000"];

/** Inject page-context token bridge only on dashboard. Extension content script runs on all URLs; bridge runs only on dashboard. */
function injectPageTokenBridge(): void {
  const origin = window.location.origin;
  if (!DASHBOARD_ORIGINS.includes(origin)) return;
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("pageTokenBridge.js");
  script.onload = () => script.remove();
  document.documentElement.appendChild(script);
}

/** Forward login completion signal from page (postMessage) to background so auth refreshes after redirect. */
function ensureLoginCompleteForwarder(): void {
  const win = window as Window & { __ECHLY_LOGIN_FORWARDER__?: boolean };
  if (win.__ECHLY_LOGIN_FORWARDER__) return;
  win.__ECHLY_LOGIN_FORWARDER__ = true;
  window.addEventListener("message", (event: MessageEvent) => {
    if (!event.data) return;
    if (event.data.type === "ECHLY_PAGE_LOGIN_SUCCESS") {
      if (!DASHBOARD_ORIGINS.includes(event.origin)) return;
      chrome.runtime.sendMessage({
        type: "ECHLY_EXTENSION_AUTH_SUCCESS",
        idToken: event.data.idToken,
        refreshToken: event.data.refreshToken,
      }).catch(() => {});
      return;
    }
    if (event.data?.type === "ECHLY_EXTENSION_LOGIN_COMPLETE") {
      if (!DASHBOARD_ORIGINS.includes(event.origin)) return;
      chrome.runtime.sendMessage({ type: "ECHLY_EXTENSION_LOGIN_COMPLETE" }).catch(() => {});
    }
  });
}

function main(): void {
  injectPageTokenBridge();
  ensureLoginCompleteForwarder();
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

  ensureMessageListener(host);
  syncInitialGlobalState(host);
  ensureVisibilityStateRefresh();
  ensureScrollDebugListeners();
}

main();
