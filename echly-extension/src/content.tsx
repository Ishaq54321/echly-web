/**
 * Content script: ultra-thin UI layer. Auto-injected via manifest on all URLs.
 * Single mount, visibility controlled by background (ECHLY_VISIBILITY). No blocking overlays.
 * Auth in popup only; unauthenticated = minimal disabled state with "Sign in from extension" tooltip.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { apiFetch } from "./contentAuthFetch";
import { uploadScreenshot, generateFeedbackId } from "./contentScreenshot";
import { getVisibleTextFromScreenshot } from "./ocr";
import CaptureWidget from "@/components/CaptureWidget";
import { log } from "@/lib/utils/logger";

const ROOT_ID = "echly-root";
const SHADOW_HOST_ID = "echly-shadow-host";
const THEME_STORAGE_KEY = "widget-theme";

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

type GlobalUIState = { visible: boolean; expanded: boolean; isRecording: boolean; sessionId: string | null };

/** Ask background to open popup (e.g. in a new tab) so user can sign in. */
function requestOpenPopup(): void {
  chrome.runtime.sendMessage({ type: "ECHLY_OPEN_POPUP" }).catch(() => {});
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
  const [globalState, setGlobalState] = React.useState<GlobalUIState>({
    visible: false,
    expanded: false,
    isRecording: false,
    sessionId: null,
  });
  const effectiveSessionId = globalState.sessionId;
  const widgetToggleRef = React.useRef<(() => void) | null>(null);
  const submissionLock = React.useRef(false);

  type ExtensionClarityPending = {
    tickets: Array<{ title?: string; description?: string; suggestedTags?: string[]; actionSteps?: string[] }>;
    screenshotUrl: string | null;
    transcript: string;
    screenshot: string | null;
    firstFeedbackId: string;
    clarityScore: number;
    clarityIssues: string[];
    suggestedRewrite: string | null;
    confidence: number;
    callbacks: { onSuccess: (ticket: { id: string; title: string; description: string; type: string }) => void; onError: () => void };
    context?: Record<string, unknown>;
  };
  const [extensionClarityPending, setExtensionClarityPending] = React.useState<ExtensionClarityPending | null>(null);
  const [showClarityAssistant, setShowClarityAssistant] = React.useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = React.useState(false);
  const [editedTranscript, setEditedTranscript] = React.useState("");
  const clarityTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const clarityAssistantSubmitLock = React.useRef(false);
  const [clarityAssistantSubmitting, setClarityAssistantSubmitting] = React.useState(false);
  const logoUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("assets/Echly_logo.svg")
      : "/Echly_logo.svg";

  React.useEffect(() => {
    const toggleHandler = () => {
      widgetToggleRef.current?.();
    };

    window.addEventListener("ECHLY_TOGGLE_WIDGET", toggleHandler);

    return () => {
      window.removeEventListener("ECHLY_TOGGLE_WIDGET", toggleHandler);
    };
  }, []);

  /* Global UI state: derived only from background (ECHLY_GLOBAL_STATE). No local source of truth. */
  React.useEffect(() => {
    const handler = (e: CustomEvent<{ state: typeof globalState }>) => {
      const s = e.detail?.state;
      if (s) setGlobalState(s);
    };
    window.addEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
    return () => window.removeEventListener("ECHLY_GLOBAL_STATE", handler as EventListener);
  }, []);

  /* When user is on dashboard session page, set that session as the extension's active session. */
  React.useEffect(() => {
    const sendActiveSessionIfDashboard = () => {
      const origin = window.location.origin;
      const isAppOrigin =
        origin === "https://echly-web.vercel.app" || origin === "http://localhost:3000";
      if (!isAppOrigin) return;
      const segments = window.location.pathname.split("/").filter(Boolean);
      if (segments[0] === "dashboard" && segments[1]) {
        chrome.runtime.sendMessage(
          { type: "ECHLY_SET_ACTIVE_SESSION", sessionId: segments[1] },
          () => {}
        );
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

  React.useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_GET_AUTH_STATE" },
      (response: { authenticated?: boolean; user?: AuthUser | null } | undefined) => {
        if (response?.authenticated && response.user?.uid) {
          setUser({
            uid: response.user.uid,
            name: response.user.name ?? null,
            email: response.user.email ?? null,
            photoURL: response.user.photoURL ?? null,
          });
        } else {
          setUser(null);
        }
        setAuthChecked(true);
      }
    );
  }, []);

  const handleComplete = React.useCallback(
    async (
      transcript: string,
      screenshot: string | null,
      callbacks?: {
        onSuccess: (ticket: { id: string; title: string; description: string; type: string }) => void;
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
        capturedAt?: number;
      } | null
    ): Promise<{ id: string; title: string; description: string; type: string } | undefined> => {
      if (submissionLock.current) return undefined;
      submissionLock.current = true;

      if (!effectiveSessionId || !user) {
        callbacks?.onError();
        submissionLock.current = false;
        return undefined;
      }
      if (callbacks) {
        (async () => {
          const visibleTextPromise = getVisibleTextFromScreenshot(screenshot ?? null);
          const firstFeedbackId = generateFeedbackId();
          let screenshotUrl: string | null = null;
          if (screenshot) {
            try {
              screenshotUrl = await uploadScreenshot(screenshot, effectiveSessionId, firstFeedbackId);
            } catch (err) {
              console.error("[Echly] Screenshot upload failed:", err);
              callbacks.onError();
              submissionLock.current = false;
              return;
            }
          }
          const visibleTextFromScreenshot = await visibleTextPromise;
          console.log("[OCR] Extracted visibleText:", visibleTextFromScreenshot);
          const currentUrl = typeof window !== "undefined" ? window.location.href : "";
          const enrichedContext = {
            ...(context ?? {}),
            visibleText: visibleTextFromScreenshot,
            url: context?.url ?? currentUrl,
          };
          const structureBody = { transcript, context: enrichedContext };
          try {
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

            /* Intercept before any submission: pause and show clarity assistant when score <= 20 (even when tickets is empty). */
            if (data.success && clarityScore <= 20) {
              console.log("CLARITY GUARD TRIGGERED", clarityScore);
              setExtensionClarityPending({
                tickets,
                screenshotUrl,
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
              submissionLock.current = false;
              return;
            }

            /* Pipeline requested clarification (vague feedback or verification failed): show clarity assistant, do not create fallback ticket */
            const needsClarification = Boolean((data as { needsClarification?: boolean }).needsClarification);
            const verificationIssues = (data as { verificationIssues?: string[] }).verificationIssues ?? [];
            if (data.success && needsClarification && tickets.length === 0) {
              console.log("PIPELINE NEEDS CLARIFICATION", verificationIssues);
              setExtensionClarityPending({
                tickets: [],
                screenshotUrl,
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
              submissionLock.current = false;
              return;
            }

            if (!data.success || tickets.length === 0) {
              chrome.runtime.sendMessage(
                {
                  type: "ECHLY_PROCESS_FEEDBACK",
                  payload: { transcript, screenshotUrl, sessionId: effectiveSessionId, context: enrichedContext },
                },
                (response: { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string }; error?: string } | undefined) => {
                  submissionLock.current = false;
                  if (chrome.runtime.lastError) {
                    callbacks.onError();
                    return;
                  }
                  if (response?.success && response.ticket) {
                    callbacks.onSuccess({
                      id: response.ticket.id,
                      title: response.ticket.title,
                      description: response.ticket.description,
                      type: response.ticket.type ?? "Feedback",
                    });
                  } else {
                    callbacks.onError();
                  }
                }
              );
              return;
            }

            /* clarityScore > 20: continue with normal submission to /api/feedback */
            const clarityStatus = clarityScore >= 85 ? "clear" : clarityScore >= 60 ? "needs_improvement" : "unclear";
            const clarityMeta = { clarityScore, clarityIssues, clarityConfidence: confidence, clarityStatus };
            let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
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
                screenshotUrl: i === 0 ? screenshotUrl : null,
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
                ticket?: { id: string; title: string; description: string; type?: string };
              };
              if (feedbackJson.success && feedbackJson.ticket) {
                const tick = feedbackJson.ticket;
                if (!firstCreated)
                  firstCreated = { id: tick.id, title: tick.title, description: tick.description, type: tick.type ?? "Feedback" };
              }
            }
            submissionLock.current = false;
            if (firstCreated) callbacks.onSuccess(firstCreated);
            else callbacks.onError();
          } catch (err) {
            console.error("[Echly] Structure or submit failed:", err);
            submissionLock.current = false;
            callbacks.onError();
          }
        })();
        return;
      }
      try {
      const visibleTextFromScreenshot = await getVisibleTextFromScreenshot(screenshot ?? null);
      console.log("[OCR] Extracted visibleText:", visibleTextFromScreenshot);
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      const structureBody = {
        transcript,
        context: {
          ...(context ?? {}),
          visibleText: visibleTextFromScreenshot,
          url: context?.url ?? currentUrl,
        },
      };
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

      let screenshotUrl: string | null = null;
      if (tickets.length > 0 && screenshot) {
        const firstFeedbackId = generateFeedbackId();
        screenshotUrl = await uploadScreenshot(screenshot, effectiveSessionId, firstFeedbackId);
      }

      const clarityStatus = clarityScore >= 85 ? "clear" : clarityScore >= 60 ? "needs_improvement" : "unclear";
      const clarityMeta = { clarityScore, clarityIssues, clarityConfidence: confidence, clarityStatus };
      let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
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
          screenshotUrl: i === 0 ? screenshotUrl : null,
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
          ticket?: { id: string; title: string; description: string; type?: string };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          if (!firstCreated)
            firstCreated = {
              id: tick.id,
              title: tick.title,
              description: tick.description,
              type: tick.type ?? "Feedback",
            };
        }
      }
      return firstCreated;
      } finally {
        submissionLock.current = false;
      }
    },
    [effectiveSessionId, user]
  );

  const handleDelete = React.useCallback(async (_id: string) => {}, []);

  const submitPendingFeedback = React.useCallback(
    async (pending: ExtensionClarityPending) => {
      if (!effectiveSessionId) return;
      if (pending.tickets.length === 0) {
        chrome.runtime.sendMessage(
          {
            type: "ECHLY_PROCESS_FEEDBACK",
            payload: {
              transcript: pending.transcript,
              screenshotUrl: pending.screenshotUrl,
              sessionId: effectiveSessionId,
              context: pending.context ?? {},
            },
          },
          (response: { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string }; error?: string } | undefined) => {
            if (chrome.runtime.lastError) {
              console.error("[Echly] Submit anyway failed:", chrome.runtime.lastError.message);
              pending.callbacks.onError();
              return;
            }
            if (response?.success && response.ticket) {
              pending.callbacks.onSuccess({
                id: response.ticket.id,
                title: response.ticket.title,
                description: response.ticket.description,
                type: response.ticket.type ?? "Feedback",
              });
            } else {
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
      let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
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
          screenshotUrl: i === 0 ? pending.screenshotUrl : null,
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
          ticket?: { id: string; title: string; description: string; type?: string };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, description: tick.description, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) pending.callbacks.onSuccess(firstCreated);
      else pending.callbacks.onError();
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
          chrome.runtime.sendMessage(
            {
              type: "ECHLY_PROCESS_FEEDBACK",
              payload: {
                transcript: trimmed,
                screenshotUrl: pending.screenshotUrl,
                sessionId: effectiveSessionId,
                context: pending.context ?? {},
              },
            },
            (response: { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string } } | undefined) => {
              if (chrome.runtime.lastError) {
                console.error("[Echly] Submit edited feedback failed:", chrome.runtime.lastError.message);
                pending.callbacks.onError();
                return;
              }
              if (response?.success && response.ticket) {
                pending.callbacks.onSuccess({
                  id: response.ticket.id,
                  title: response.ticket.title,
                  description: response.ticket.description,
                  type: response.ticket.type ?? "Feedback",
                });
              } else {
                pending.callbacks.onError();
              }
            }
          );
          return;
        }

        let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
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
            screenshotUrl: i === 0 ? pending.screenshotUrl : null,
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
            ticket?: { id: string; title: string; description: string; type?: string };
          };
          if (feedbackJson.success && feedbackJson.ticket) {
            const tick = feedbackJson.ticket;
            if (!firstCreated)
              firstCreated = { id: tick.id, title: tick.title, description: tick.description, type: tick.type ?? "Feedback" };
          }
        }
        if (firstCreated) pending.callbacks.onSuccess(firstCreated);
        else pending.callbacks.onError();
      } catch (err) {
        console.error("[Echly] Submit edited feedback failed:", err);
        pending.callbacks.onError();
      }
    },
    [effectiveSessionId]
  );

  const handleExtensionClarityUseSuggestion = React.useCallback(async () => {
    const pending = extensionClarityPending;
    if (!pending?.suggestedRewrite?.trim() || !effectiveSessionId) return;
    setExtensionClarityPending(null);
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
      let firstCreated: { id: string; title: string; description: string; type: string } | undefined;
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
          screenshotUrl: i === 0 ? pending.screenshotUrl : null,
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
          ticket?: { id: string; title: string; description: string; type?: string };
        };
        if (feedbackJson.success && feedbackJson.ticket) {
          const tick = feedbackJson.ticket;
          if (!firstCreated)
            firstCreated = { id: tick.id, title: tick.title, description: tick.description, type: tick.type ?? "Feedback" };
        }
      }
      if (firstCreated) pending.callbacks.onSuccess(firstCreated);
      else pending.callbacks.onError();
    } catch (err) {
      console.error("[Echly] Use suggestion failed:", err);
      pending.callbacks.onError();
    }
  }, [extensionClarityPending, effectiveSessionId]);

  React.useEffect(() => {
    if (isEditingFeedback && clarityTextareaRef.current) {
      clarityTextareaRef.current.focus();
    }
  }, [isEditingFeedback]);

  const liveStructureFetch = React.useCallback(
    async (transcript: string): Promise<{ title: string; tags: string[]; priority: string } | null> => {
      try {
        const res = await apiFetch("/api/structure-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcript.trim() }),
        });
        const data = (await res.json()) as {
          success?: boolean;
          tickets?: Array<{
            title?: string;
            suggestedTags?: string[];
          }>;
        };
        if (!data.success || !Array.isArray(data.tickets) || data.tickets.length === 0) return null;
        const t = data.tickets[0];
        const title = typeof t.title === "string" ? t.title : "";
        const tags = Array.isArray(t.suggestedTags) ? t.suggestedTags : [];
        return { title, tags, priority: "medium" };
      } catch {
        return null;
      }
    },
    []
  );

  if (!authChecked) {
    return null;
  }

  if (!user) {
    return (
      <div style={{ pointerEvents: "auto" }}>
        <button
          type="button"
          title="Sign in from extension"
          onClick={requestOpenPopup}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 20px",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff",
            color: "#6b7280",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "90%",
              background: "#F8FBFF",
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
        sessionId={effectiveSessionId ?? ""}
        userId={user.uid}
        extensionMode={true}
        onComplete={handleComplete}
        onDelete={handleDelete}
        widgetToggleRef={widgetToggleRef}
        onRecordingChange={onRecordingChange}
        expanded={globalState.expanded}
        onExpandRequest={onExpandRequest}
        onCollapseRequest={onCollapseRequest}
        liveStructureFetch={liveStructureFetch}
        captureDisabled={!effectiveSessionId}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
    </>
  );
}

/** Minimal CSS reset inside shadow root for style isolation. Theme (data-theme) and color-scheme come from globals.css. */
const SHADOW_RESET = `
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;
  }
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

/** Create shadow root, styles, container; mount React. Call only once per host. */
function mountReactApp(host: HTMLDivElement): void {
  const shadowRoot = host.attachShadow({ mode: "open" });
  injectShadowStyles(shadowRoot);

  const container = document.createElement("div");
  container.id = ROOT_ID;
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

/** Request initial global state from background. Restores visibility, expanded, recording on load/refresh. */
function syncInitialGlobalState(host: HTMLDivElement): void {
  chrome.runtime.sendMessage(
    { type: "ECHLY_GET_GLOBAL_STATE" },
    (state: { visible?: boolean; expanded?: boolean; isRecording?: boolean; sessionId?: string | null } | undefined) => {
      if (!state) return;
      host.style.display = state.visible ? "block" : "none";
      window.dispatchEvent(
        new CustomEvent("ECHLY_GLOBAL_STATE", {
          detail: {
            state: {
              visible: state.visible ?? false,
              expanded: state.expanded ?? false,
              isRecording: state.isRecording ?? false,
              sessionId: state.sessionId ?? null,
            },
          },
        })
      );
    }
  );
}

/** Listen for global state; single listener. Background is source of truth. */
function ensureMessageListener(host: HTMLDivElement): void {
  const win = window as Window & { __ECHLY_MESSAGE_LISTENER__?: boolean };
  if (win.__ECHLY_MESSAGE_LISTENER__) return;
  win.__ECHLY_MESSAGE_LISTENER__ = true;
  chrome.runtime.onMessage.addListener((msg: { type?: string; state?: GlobalUIState; ticket?: { id: string; title: string; description: string; type?: string }; sessionId?: string }) => {
    if (msg.type === "ECHLY_FEEDBACK_CREATED" && msg.ticket && msg.sessionId) {
      window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED", { detail: { ticket: msg.ticket, sessionId: msg.sessionId } }));
      return;
    }
    const h = document.getElementById(SHADOW_HOST_ID);
    if (!h) return;
    if (msg.type === "ECHLY_GLOBAL_STATE" && msg.state) {
      (h as HTMLDivElement).style.display = msg.state.visible ? "block" : "none";
      window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE", { detail: { state: msg.state } }));
    }
    if (msg.type === "ECHLY_TOGGLE") {
      window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET"));
    }
  });
}

/**
 * Single mount: create host once, mount React once, default hidden.
 * Visibility via ECHLY_VISIBILITY from background. No re-mount, no injection logic.
 */
function main(): void {
  let host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = SHADOW_HOST_ID;
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
}

main();
