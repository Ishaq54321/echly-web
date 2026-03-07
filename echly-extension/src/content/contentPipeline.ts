/**
 * Feedback pipeline: handleComplete, OCR, /api/structure-feedback, /api/feedback,
 * ticket creation, screenshot patch, ECHLY_PROCESS_FEEDBACK fallback.
 * Clarity assistant: submitPendingFeedback, submitEditedFeedback, handleExtensionClarityUseSuggestion.
 */
import { echlyLog } from "@/lib/debug/echlyLogger";

export type ExtensionClarityPending = {
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
  callbacks: {
    onSuccess: (ticket: { id: string; title: string; description: string; type: string }) => void;
    onError: () => void;
  };
  context?: Record<string, unknown>;
};

type AuthUser = { uid: string; name: string | null; email: string | null; photoURL: string | null };
type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;

export type FeedbackPipelineDeps = {
  effectiveSessionId: string | null;
  user: AuthUser | null;
  apiFetch: ApiFetch;
  getVisibleTextFromScreenshot: (screenshot: string | null) => Promise<string | null>;
  uploadScreenshot: (imageDataUrl: string, sessionId: string, screenshotId: string) => Promise<string | null>;
  generateFeedbackId: () => string;
  generateScreenshotId: () => string;
  submissionLockRef: { current: boolean };
  clarityAssistantSubmitLockRef: { current: boolean };
  setExtensionClarityPending: (v: ExtensionClarityPending | null) => void;
  setEditedTranscript: (v: string) => void;
  setIsEditingFeedback: (v: boolean) => void;
  setClarityAssistantSubmitting: (v: boolean) => void;
  setShowClarityAssistant: (v: boolean) => void;
};

export function createFeedbackPipeline(deps: FeedbackPipelineDeps): {
  handleComplete: (
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
      subtreeText?: string | null;
      visibleText?: string | null;
      capturedAt?: number;
    } | null,
    options?: { sessionMode?: boolean }
  ) => Promise<{ id: string; title: string; description: string; type: string } | undefined>;
  submitPendingFeedback: (pending: ExtensionClarityPending) => Promise<void>;
  submitEditedFeedback: (pending: ExtensionClarityPending, editedText: string) => Promise<void>;
  handleExtensionClarityUseSuggestion: (extensionClarityPending: ExtensionClarityPending | null) => Promise<void>;
} {
  const {
    effectiveSessionId,
    user,
    apiFetch,
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
  } = deps;

  const submissionLock = submissionLockRef;

  function handleComplete(
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
      subtreeText?: string | null;
      visibleText?: string | null;
      capturedAt?: number;
    } | null,
    options?: { sessionMode?: boolean }
  ): Promise<{ id: string; title: string; description: string; type: string } | undefined> {
    echlyLog("PIPELINE", "start");
    if (submissionLock.current) {
      echlyLog("PIPELINE", "blocked by submissionLock");
      callbacks?.onError?.();
      return Promise.resolve(undefined);
    }
    submissionLock.current = true;

    if (!effectiveSessionId || !user) {
      echlyLog("PIPELINE", "error");
      callbacks?.onError?.();
      submissionLock.current = false;
      return Promise.resolve(undefined);
    }
    if (callbacks) {
      (async () => {
        const visibleTextPromise = getVisibleTextFromScreenshot(screenshot ?? null);
        const firstFeedbackId = generateFeedbackId();
        const screenshotId = generateScreenshotId();
        const uploadPromise = screenshot
          ? uploadScreenshot(screenshot, effectiveSessionId, screenshotId)
          : Promise.resolve(null as string | null);
        const visibleTextFromScreenshot = await visibleTextPromise;
        console.log("[OCR] Extracted visibleText:", visibleTextFromScreenshot);
        const currentUrl = typeof window !== "undefined" ? window.location.href : "";
        const enrichedContext = {
          ...(context ?? {}),
          visibleText:
            (visibleTextFromScreenshot?.trim() && visibleTextFromScreenshot) || context?.visibleText || null,
          url: context?.url ?? currentUrl,
        };
        const structureBody = { transcript, context: enrichedContext };
        try {
          echlyLog("PIPELINE", "structure request");
          console.log("[VOICE] final transcript submitted", transcript);
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
          const clarityScore =
            typeof data.clarityScore === "number"
              ? data.clarityScore
              : data.clarityScore != null
                ? Number(data.clarityScore)
                : 100;
          const clarityIssues = data.clarityIssues ?? [];
          const suggestedRewrite = data.suggestedRewrite ?? null;
          const confidence = data.confidence ?? 0.5;
          const isSessionMode = Boolean(options?.sessionMode);

          if (!isSessionMode) {
            if (data.success && clarityScore <= 20) {
              console.log("CLARITY GUARD TRIGGERED", clarityScore);
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
              clarityAssistantSubmitLockRef.current = false;
              setClarityAssistantSubmitting(false);
              setShowClarityAssistant(true);
              submissionLock.current = false;
              return;
            }
            const needsClarification = Boolean((data as { needsClarification?: boolean }).needsClarification);
            const verificationIssues = (data as { verificationIssues?: string[] }).verificationIssues ?? [];
            if (data.success && needsClarification && tickets.length === 0) {
              console.log("PIPELINE NEEDS CLARIFICATION", verificationIssues);
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
              clarityAssistantSubmitLockRef.current = false;
              setClarityAssistantSubmitting(false);
              setShowClarityAssistant(true);
              submissionLock.current = false;
              return;
            }
          }

          if (!data.success || tickets.length === 0) {
            chrome.runtime.sendMessage(
              {
                type: "ECHLY_PROCESS_FEEDBACK",
                payload: {
                  transcript,
                  screenshotUrl: null,
                  screenshotId,
                  sessionId: effectiveSessionId,
                  context: enrichedContext,
                },
              },
              (
                response:
                  | { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string }; error?: string }
                  | undefined
              ) => {
                submissionLock.current = false;
                if (chrome.runtime.lastError) {
                  echlyLog("PIPELINE", "error");
                  callbacks.onError();
                  return;
                }
                if (response?.success && response.ticket) {
                  const ticketId = response.ticket.id;
                  echlyLog("PIPELINE", "ticket created", { ticketId });
                  callbacks.onSuccess({
                    id: ticketId,
                    title: response.ticket.title,
                    description: response.ticket.description,
                    type: response.ticket.type ?? "Feedback",
                  });
                  uploadPromise
                    .then((url) => {
                      if (url) {
                        echlyLog("PIPELINE", "screenshot uploaded", { screenshotUrl: url });
                        echlyLog("PIPELINE", "screenshot patched", { ticketId });
                        apiFetch(`/api/tickets/${ticketId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ screenshotUrl: url }),
                        }).catch(() => {});
                      }
                    })
                    .catch(() => {});
                } else {
                  echlyLog("PIPELINE", "error");
                  callbacks.onError();
                }
              }
            );
            return;
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
          submissionLock.current = false;
          if (firstCreated) {
            const ticketId = firstCreated.id;
            echlyLog("PIPELINE", "ticket created", { ticketId });
            uploadPromise
              .then((url) => {
                if (url) {
                  echlyLog("PIPELINE", "screenshot uploaded", { screenshotUrl: url });
                  echlyLog("PIPELINE", "screenshot patched", { ticketId });
                  apiFetch(`/api/tickets/${ticketId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ screenshotUrl: url }),
                  }).catch(() => {});
                }
              })
              .catch(() => {});
            callbacks.onSuccess(firstCreated);
          } else {
            echlyLog("PIPELINE", "error");
            callbacks.onError();
          }
        } catch (err) {
          console.error("[Echly] Structure or submit failed:", err);
          submissionLock.current = false;
          echlyLog("PIPELINE", "error");
          callbacks.onError();
        }
      })();
      return Promise.resolve(undefined);
    }
    return (async () => {
      try {
        const screenshotId = generateScreenshotId();
        const uploadPromise = screenshot
          ? uploadScreenshot(screenshot, effectiveSessionId, screenshotId)
          : Promise.resolve(null as string | null);
        const visibleTextFromScreenshot = await getVisibleTextFromScreenshot(screenshot ?? null);
        console.log("[OCR] Extracted visibleText:", visibleTextFromScreenshot);
        const currentUrl = typeof window !== "undefined" ? window.location.href : "";
        const structureBody = {
          transcript,
          context: {
            ...(context ?? {}),
            visibleText:
              (visibleTextFromScreenshot?.trim() && visibleTextFromScreenshot) || context?.visibleText || null,
            url: context?.url ?? currentUrl,
          },
        };
        echlyLog("PIPELINE", "structure request");
        console.log("[VOICE] final transcript submitted", transcript);
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
        if (firstCreated) {
          const ticketId = firstCreated.id;
          uploadPromise
            .then((url) => {
              if (url) {
                apiFetch(`/api/tickets/${ticketId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ screenshotUrl: url }),
                }).catch(() => {});
              }
            })
            .catch(() => {});
        }
        return firstCreated;
      } finally {
        submissionLock.current = false;
      }
    })();
  }

  async function submitPendingFeedback(pending: ExtensionClarityPending): Promise<void> {
    if (!effectiveSessionId) return;
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
        (
          response:
            | { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string }; error?: string }
            | undefined
        ) => {
          if (chrome.runtime.lastError) {
            console.error("[Echly] Submit anyway failed:", chrome.runtime.lastError.message);
            echlyLog("PIPELINE", "error");
            pending.callbacks.onError();
            return;
          }
          if (response?.success && response.ticket) {
            const ticketId = response.ticket.id;
            pending.callbacks.onSuccess({
              id: ticketId,
              title: response.ticket.title,
              description: response.ticket.description,
              type: response.ticket.type ?? "Feedback",
            });
            pending.uploadPromise
              .then((url) => {
                if (url) {
                  apiFetch(`/api/tickets/${ticketId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ screenshotUrl: url }),
                  }).catch(() => {});
                }
              })
              .catch(() => {});
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
      clarityStatus: (pending.clarityScore >= 85
        ? "clear"
        : pending.clarityScore >= 60
          ? "needs_improvement"
          : "unclear") as "clear" | "needs_improvement" | "unclear",
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
    if (firstCreated) {
      const ticketId = firstCreated.id;
      pending.uploadPromise
        .then((url) => {
          if (url) {
            apiFetch(`/api/tickets/${ticketId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ screenshotUrl: url }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
      pending.callbacks.onSuccess(firstCreated);
    } else {
      echlyLog("PIPELINE", "error");
      pending.callbacks.onError();
    }
  }

  async function submitEditedFeedback(pending: ExtensionClarityPending, editedText: string): Promise<void> {
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
      const clarityStatus = (clarityScore >= 85
        ? "clear"
        : clarityScore >= 60
          ? "needs_improvement"
          : "unclear") as "clear" | "needs_improvement" | "unclear";
      const clarityMeta = {
        clarityScore,
        clarityIssues: data.clarityIssues ?? [],
        clarityConfidence: confidence,
        clarityStatus,
      };

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
          (
            response:
              | { success?: boolean; ticket?: { id: string; title: string; description: string; type?: string } }
              | undefined
          ) => {
            if (chrome.runtime.lastError) {
              console.error("[Echly] Submit edited feedback failed:", chrome.runtime.lastError.message);
              echlyLog("PIPELINE", "error");
              pending.callbacks.onError();
              return;
            }
            if (response?.success && response.ticket) {
              const ticketId = response.ticket.id;
              pending.callbacks.onSuccess({
                id: ticketId,
                title: response.ticket.title,
                description: response.ticket.description,
                type: response.ticket.type ?? "Feedback",
              });
              pending.uploadPromise
                .then((url) => {
                  if (url) {
                    apiFetch(`/api/tickets/${ticketId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ screenshotUrl: url }),
                    }).catch(() => {});
                  }
                })
                .catch(() => {});
            } else {
              echlyLog("PIPELINE", "error");
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
      if (firstCreated) {
        const ticketId = firstCreated.id;
        pending.uploadPromise
          .then((url) => {
            if (url) {
              apiFetch(`/api/tickets/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ screenshotUrl: url }),
              }).catch(() => {});
            }
          })
          .catch(() => {});
        pending.callbacks.onSuccess(firstCreated);
      } else {
        echlyLog("PIPELINE", "error");
        pending.callbacks.onError();
      }
    } catch (err) {
      console.error("[Echly] Submit edited feedback failed:", err);
      echlyLog("PIPELINE", "error");
      pending.callbacks.onError();
    }
  }

  function handleExtensionClarityUseSuggestion(
    extensionClarityPending: ExtensionClarityPending | null
  ): Promise<void> {
    const pending = extensionClarityPending;
    if (!pending?.suggestedRewrite?.trim() || !effectiveSessionId) return Promise.resolve();
    setExtensionClarityPending(null);
    return (async () => {
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
        const clarityStatus = (clarityScore >= 85
          ? "clear"
          : clarityScore >= 60
            ? "needs_improvement"
            : "unclear") as "clear" | "needs_improvement" | "unclear";
        const clarityMeta = {
          clarityScore,
          clarityIssues: data.clarityIssues ?? [],
          clarityConfidence: confidence,
          clarityStatus,
        };
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
        if (firstCreated) {
          const ticketId = firstCreated.id;
          pending.uploadPromise
            .then((url) => {
              if (url) {
                apiFetch(`/api/tickets/${ticketId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ screenshotUrl: url }),
                }).catch(() => {});
              }
            })
            .catch(() => {});
          pending.callbacks.onSuccess(firstCreated);
        } else {
          echlyLog("PIPELINE", "error");
          pending.callbacks.onError();
        }
      } catch (err) {
        console.error("[Echly] Use suggestion failed:", err);
        echlyLog("PIPELINE", "error");
        pending.callbacks.onError();
      }
    })();
  }

  return {
    handleComplete,
    submitPendingFeedback,
    submitEditedFeedback,
    handleExtensionClarityUseSuggestion,
  };
}
