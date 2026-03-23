# AI Feedback Pipeline — Full System Export

This document exports the end-to-end AI feedback pipeline for external debugging. Source paths are relative to the repository root unless noted.

---

## Section 1 — Pipeline Overview

End-to-end flow:

1. **Audio input** — User speaks; `getUserMedia` provides an audio stream.
2. **MediaRecorder** — `MediaRecorder` records chunks into `audioChunksRef`; on finish, chunks are merged into a `Blob` (`audio/webm`).
3. **Whisper API** — `POST` to `/api/transcribe-audio` with `FormData` field `file` → OpenAI `audio.transcriptions.create` → JSON `{ transcript }`.
4. **`finishListening()`** — Stops recorder, builds blob, calls transcribe, parses response into `finalTranscript`, updates recording state, then invokes the completion callback.
5. **`onComplete()`** — Prop from `CaptureWidget` / `useCaptureWidget` into the host (extension `content.tsx`): `handleComplete`.
6. **`handleComplete()`** — Logs transcript, optional job tracking, calls `processFeedbackPipeline`.
7. **`processFeedbackPipeline()`** — OCR enrichment, builds context, **`apiFetch("/api/structure-feedback", { ... })`** (authenticated fetch; same route as `fetch` to that path).
8. **Server route** — `app/api/structure-feedback/route.ts`: auth, rate limit, `req.json()`, validates `transcript`, calls `runFeedbackPipeline`.
9. **AI pipeline** — `runFeedbackPipeline` → `normalizeInput` → `runVoiceToTicket` → `extractStructuredFeedback` (GPT) → ticket payload.

---

## Section 2 — Whisper Layer

### Server: `app/api/transcribe-audio/route.ts` (full file)

```ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-mini-transcribe",
    });

    console.log("[WHISPER_RESPONSE]", {
      textLength: response.text?.length,
      preview: response.text?.slice(0, 100),
    });

    return NextResponse.json({
      transcript: response.text || "",
    });
  } catch (error) {
    console.error("[WHISPER_ERROR]", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
```

### Client: `lib/capture-engine/core/hooks/useCaptureWidget.ts` — Whisper fetch + parsing

Relevant excerpt from `finishListening` (fetch, response handling, `finalTranscript`):

```ts
        let whisperRes: Response;
        if (environment) {
          console.log("[WHISPER_API_URL]", {
            url: `${environment.apiBase}/api/transcribe-audio`,
          });
          console.log("[WHISPER_FORMDATA_FIX]", {
            usingRawFetch: true,
          });
          whisperRes = await fetch(
            `${environment.apiBase}/api/transcribe-audio`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
              signal: controller.signal,
            }
          );
        } else {
          whisperRes = await fetch("/api/transcribe-audio", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });
        }

        clearTimeout(timeout);

        if (!whisperRes.ok) {
          throw new Error("Whisper API failed");
        }

        try {
          const text = await whisperRes.text();
          whisperData = JSON.parse(text);
        } catch (e) {
          // fallback: try to extract plain text
          whisperData = { transcript: "" };
        }

      } catch (error) {
        console.error("[WHISPER_FAILED]", error);

        whisperData = { transcript: "" };
      }

      const finalTranscript =
        typeof whisperData.transcript === "string"
          ? whisperData.transcript.trim()
          : typeof whisperData.text === "string"
          ? whisperData.text.trim()
          : "";
```

---

## Section 3 — Audio Capture Flow

File: `lib/capture-engine/core/hooks/useCaptureWidget.ts` — relevant parts only.

### `startListening`

```ts
  const startListening = useCallback(async () => {
    echlyLog("RECORDING", "start");
    const startTime = Date.now();
    voiceStartTimeRef.current = startTime;
    if (ECHLY_DEBUG) console.log("[VOICE] UI recording started", startTime);
    try {
      // Enumerate devices only when user starts voice (user gesture); avoids permission popup on page load.
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === "audioinput");
      const deviceList = inputs.map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${inputs.indexOf(d) + 1}`,
      }));
      onDevicesEnumerated?.(deviceList);
      const audioConstraints: boolean | MediaTrackConstraints = selectedMicrophoneId
        ? { deviceId: { exact: selectedMicrophoneId } }
        : true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      mediaStreamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      setAudioAnalyser(analyser);
      if (typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder is not supported in this browser.");
      }
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start();
      recordingActiveRef.current = true;
      setState("voice_listening");
      setListeningAudioLevel(0);
    } catch (err) {
      console.error("Microphone permission denied:", err);
      recordingActiveRef.current = false;
      if (extensionMode && pointersPropRef.current) {
        setPointers(pointersPropRef.current);
      }
      setErrorMessage("Microphone permission denied.");
      setState("error");
      removeCaptureRoot();
      restoreWidget();
    }
  }, [selectedMicrophoneId, onDevicesEnumerated]);
```

### `finishListening` (full function)

Source: `lib/capture-engine/core/hooks/useCaptureWidget.ts` (lines 565–876).

```ts
  const finishListening = useCallback(async () => {
    if (isFinishingListening) return;
    setIsFinishingListening(true);
    echlyLog("RECORDING", "finish requested");
    try {
      recordingActiveRef.current = false;
      if (extensionMode && pointersPropRef.current) {
        setPointers(pointersPropRef.current);
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
      playDoneClick();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        await new Promise<void>((resolve) => {
          const recorder = mediaRecorderRef.current!;
          recorder.onstop = () => resolve();
          recorder.stop();
        });
      }
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      console.log("[VOICE_DEBUG_AUDIO]", {
        hasAudioBlob: !!audioBlob,
        size: audioBlob?.size,
        chunks: audioChunksRef.current.length,
      });
      mediaRecorderRef.current = null;
      setLastRecordedAudio(audioBlob);
      console.log("[VOICE_RECORDING]", {
        chunks: audioChunksRef.current.length,
        size: audioBlob.size,
      });
      let whisperData: any = {};

      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");

        console.log("[WHISPER_UPLOAD]", {
          size: audioBlob.size,
        });

        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, 15000); // 15 sec safety

        let whisperRes: Response;
        if (environment) {
          console.log("[WHISPER_API_URL]", {
            url: `${environment.apiBase}/api/transcribe-audio`,
          });
          console.log("[WHISPER_FORMDATA_FIX]", {
            usingRawFetch: true,
          });
          whisperRes = await fetch(
            `${environment.apiBase}/api/transcribe-audio`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
              signal: controller.signal,
            }
          );
        } else {
          whisperRes = await fetch("/api/transcribe-audio", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });
        }

        clearTimeout(timeout);

        if (!whisperRes.ok) {
          throw new Error("Whisper API failed");
        }

        try {
          const text = await whisperRes.text();
          whisperData = JSON.parse(text);
        } catch (e) {
          // fallback: try to extract plain text
          whisperData = { transcript: "" };
        }

      } catch (error) {
        console.error("[WHISPER_FAILED]", error);

        whisperData = { transcript: "" };
      }

      const finalTranscript =
        typeof whisperData.transcript === "string"
          ? whisperData.transcript.trim()
          : typeof whisperData.text === "string"
          ? whisperData.text.trim()
          : "";
      console.log("[FINAL_TRANSCRIPT_SOURCE]", finalTranscript);
      console.log("[CHECK_WHISPER_OUTPUT]", {
        transcript: finalTranscript,
        length: finalTranscript.length,
      });
      console.log("[WHISPER_TRANSCRIPT]", {
        length: finalTranscript.length,
        preview: finalTranscript.slice(0, 100),
      });

      console.log("[VOICE_FLOW_COMPLETE]", {
        transcriptLength: finalTranscript.length,
      });

      const activeId = activeRecordingIdRef.current;
      if (!activeId) {
        setState("idle");
        setIsFinishingListening(false);
        return;
      }
      const currentRecordings = recordingsRef.current;
      const active = currentRecordings.find((r) => r.id === activeId);
      if (!active) {
        setState("idle");
        setIsFinishingListening(false);
        return;
      }
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === activeId ? { ...r, transcript: finalTranscript } : r
        )
      );
      const completionContext = active.context ?? undefined;
      let completionCallbacks: Parameters<CaptureWidgetProps["onComplete"]>[2];
      let completionOptions: Parameters<CaptureWidgetProps["onComplete"]>[4];
      let expectsStructuredResult = false;
      let handleOnCompleteThrow: ((error: unknown) => void) | null = null;

      if (extensionMode) {
        const isSessionFeedback = sessionModeRef.current;
        if (isSessionFeedback) {
          /* Session mode: create marker immediately, clear state so user can click another element, process async. */
          const root = captureRootRef.current;
          const element = lastSessionClickedElementRef.current ?? undefined;
          const placeholderId = `pending-${Date.now()}`;
          if (root) {
            createMarker(
              root,
              { id: placeholderId, x: 0, y: 0, element, title: "Saving feedback…" },
              {
                getSessionPaused: () => sessionPausedRef.current,
                onMarkerClick: (marker) => {
                  setHighlightTicketId(marker.id);
                  setExpandedId(marker.id);
                },
              }
            );
          }
          if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "finishListening session mode" });
          setPending(null);
          setSessionFeedbackSaving(true);
          setRecordings((prev) => prev.filter((r) => r.id !== activeId));
          setActiveRecordingId(null);
          setState("idle");
          lastSessionClickedElementRef.current = null;
          if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", finalTranscript);
          pipelineActiveRef.current = true;
          completionOptions = { sessionMode: true };
          completionCallbacks = {
            onSuccess: (ticket) => {
              pipelineActiveRef.current = false;
              setSessionFeedbackSaving(false);
              setIsFinishingListening(false);
              if (root) updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
              if (!extensionMode) {
                const t = ticket as StructuredFeedback & { instruction?: string; description?: string };
                setPointers((prev) => [
                  { id: t.id, title: t.title, actionSteps: t.actionSteps ?? ((t.instruction ?? t.description) ? (t.instruction ?? t.description ?? "").split("\n") : []), type: t.type },
                  ...prev,
                ]);
              }
              setHighlightTicketId(ticket.id);
              setTimeout(() => setHighlightTicketId(null), 1200);
            },
            onError: () => {
              pipelineActiveRef.current = false;
              setSessionFeedbackSaving(false);
              setIsFinishingListening(false);
              if (root) removeMarker(placeholderId);
              setErrorMessage("AI processing failed.");
            },
          };
          handleOnCompleteThrow = (error) => {
            pipelineActiveRef.current = false;
            setSessionFeedbackSaving(false);
            setIsFinishingListening(false);
            if (root) removeMarker(placeholderId);
            console.error(error);
            setErrorMessage("AI processing failed.");
          };
        } else {
          setState("processing");
          if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", finalTranscript);
          pipelineActiveRef.current = true;
          completionCallbacks = {
            onSuccess: (ticket) => {
              pipelineActiveRef.current = false;
              setIsFinishingListening(false);
              if (!extensionMode) {
                const t = ticket as StructuredFeedback & { instruction?: string; description?: string };
                setPointers((prev) => [
                  { id: t.id, title: t.title, actionSteps: t.actionSteps ?? ((t.instruction ?? t.description) ? (t.instruction ?? t.description ?? "").split("\n") : []), type: t.type },
                  ...prev,
                ]);
              }
              setRecordings((prev) => prev.filter((r) => r.id !== activeId));
              setActiveRecordingId(null);
              setHighlightTicketId(ticket.id);
              setTimeout(() => setHighlightTicketId(null), 1200);
              setOrbSuccess(true);
              setTimeout(() => setOrbSuccess(false), 200);
              setPillExiting(true);
              setTimeout(() => {
                removeCaptureRoot();
                restoreWidget();
                setPillExiting(false);
              }, 120);
            },
            onError: () => {
              pipelineActiveRef.current = false;
              setIsFinishingListening(false);
              setErrorMessage("AI processing failed.");
              setState("voice_listening");
            },
          };
          handleOnCompleteThrow = (error) => {
            pipelineActiveRef.current = false;
            setIsFinishingListening(false);
            console.error(error);
            setErrorMessage("AI processing failed.");
            setState("voice_listening");
          };
        }
      } else {
        setState("processing");
        if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", finalTranscript);
        expectsStructuredResult = true;
        handleOnCompleteThrow = (error) => {
          console.error(error);
          setErrorMessage("AI processing failed.");
          setState("voice_listening");
          setIsFinishingListening(false);
        };
      }

      try {
        console.log("[CHECK_BEFORE_ONCOMPLETE]", {
          transcript: finalTranscript,
          length: finalTranscript.length,
        });
        if (!finalTranscript || finalTranscript.length === 0) {
          console.error("[CRITICAL_BUG_EMPTY_TRANSCRIPT]");
        }
        const structured = await onComplete(
          finalTranscript,
          active.screenshot,
          completionCallbacks,
          completionContext,
          completionOptions
        );
        if (!expectsStructuredResult) {
          return;
        }
        if (!structured) {
          setState("idle");
          removeCaptureRoot();
          restoreWidget();
          setIsFinishingListening(false);
          return;
        }
        if (!extensionMode) {
          setPointers((prev) => [
            { id: structured.id, title: structured.title, actionSteps: structured.actionSteps ?? [], type: structured.type },
            ...prev,
          ]);
        }
        setRecordings((prev) => prev.filter((r) => r.id !== activeId));
        setActiveRecordingId(null);
        setHighlightTicketId(structured.id);
        setTimeout(() => setHighlightTicketId(null), 1200);
        setOrbSuccess(true);
        setTimeout(() => setOrbSuccess(false), 200);
        setPillExiting(true);
        setTimeout(() => {
          removeCaptureRoot();
          restoreWidget();
          setPillExiting(false);
        }, 120);
        setIsFinishingListening(false);
      } catch (err) {
        handleOnCompleteThrow?.(err);
      }
    } catch (err) {
      console.error("[VOICE_FINISH_FAILED]", err);
      setErrorMessage("Failed to finish listening.");
      setState("voice_listening");
      setIsFinishingListening(false);
    } finally {
      setIsFinishingListening(false);
    }
  }, [isFinishingListening, setLastRecordedAudio, onComplete, extensionMode, removeCaptureRoot, restoreWidget, environment]);
```

### Session text submit path — `onComplete` with pending transcript

When session feedback is submitted via text (not only `finishListening`), `onComplete` is called with `transcript` from the pending flow:

```ts
        onComplete(transcript, pending.screenshot ?? null, {
          onSuccess: (ticket) => {
            pipelineActiveRef.current = false;
            setSessionFeedbackSaving(false);
            if (root) {
              updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
            }
            /* ... */
          },
          onError: () => {
            pipelineActiveRef.current = false;
            setSessionFeedbackSaving(false);
            if (root) removeMarker(placeholderId);
            setErrorMessage("AI processing failed.");
          },
        }, pending.context ?? undefined, { sessionMode: true });
```

---

## Section 4 — Content Layer

File: `echly-extension/src/content.tsx` — `processFeedbackPipeline`, `handleComplete`, and request body construction.

### `processFeedbackPipeline` (full callback)

```ts
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
      const fallbackTicket = {
        title: transcript?.slice(0, 80) || "User Feedback",
        actionSteps: transcript ? [transcript] : [],
        suggestedTags: [] as string[],
      };

      if (!effectiveSessionId || !user) {
        throw new Error("Missing session or user");
      }

      const ctx = context as CaptureContext | null | undefined;
      const imageForOcr = ctx?.ocrImageDataUrl ?? screenshot ?? null;
      let ocrText = "";
      try {
        const result = await Promise.race([
          getVisibleTextFromScreenshot(imageForOcr),
          new Promise<string>((resolve) => setTimeout(() => resolve(""), 1500)),
        ]);
        ocrText = result ?? "";
      } catch {
        ocrText = "";
      }

      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      let selectedElement: HTMLElement | null = null;
      if (context?.domPath && typeof document !== "undefined") {
        try {
          selectedElement = document.querySelector(context.domPath) as HTMLElement | null;
        } catch {
          selectedElement = null;
        }
      }
      const elementType = detectElementType(selectedElement);
      const { ocrImageDataUrl: _ocrImg, ...contextForApi } = (context ?? {}) as Record<string, unknown>;
      const enrichedContext: CaptureContext = {
        ...(contextForApi as Omit<CaptureContext, "visibleText" | "url">),
        visibleText: (ocrText?.trim() && ocrText) || (context as CaptureContext | null)?.visibleText || null,
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
        console.log("[FINAL_ROUTE_BODY]", {
          transcript,
          context: enrichedContext,
          hasTranscript: !!transcript,
          transcriptLength: transcript?.length,
        });
        const res = await apiFetch("/api/structure-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            context: enrichedContext,
            ocr: ocrText || null,
            ocrText: ocrText || null,
          }),
        });
        structured = (await res.json()) as {
          success?: boolean;
          tickets?: StructureTicket[];
          error?: string;
        };
      } catch {
        structured = null;
      }

      const normalized = structured?.success && structured.tickets?.length
        ? structured.tickets[0]
        : fallbackTicket;

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
          setSessionMessage("Authentication expired. Please sign in again.");
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
        console.error("[ECHLY] Feedback create failed:", e);
        throw e;
      }
    },
    [effectiveSessionId, getExtensionToken, isAuthFailureResponse, user]
  );
```

### `handleComplete` (full callback)

```ts
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
      console.log("[CHECK_CONTENT_RECEIVED]", {
        transcript,
        length: transcript?.length,
      });
      console.log("[CONTENT_RECEIVED_FINAL]", transcript);
      console.log("[CONTENT_RECEIVED_FINAL_META]", {
        transcript,
        length: transcript?.length,
      });
      const fallbackResult: StructuredFeedback = {
        id: `local-${createUniqueId()}`,
        title: transcript?.slice(0, 80) || "User Feedback",
        actionSteps: transcript ? [transcript] : [],
        type: "Feedback",
      };

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
        console.error("[ECHLY ERROR] Feedback pipeline failed:", err);
        if (jobId) {
          setFeedbackJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, status: "failed" as const, errorMessage: "AI processing failed." } : j))
          );
        }
        callbacks?.onError?.();
        return fallbackResult;
      } finally {
        setIsProcessingFeedback(false);
      }
    },
    [processFeedbackPipeline]
  );
```

---

## Section 5 — API Request

The extension does **not** use bare `fetch("/api/structure-feedback")`; it uses **`apiFetch`** from `./api` (adds auth and base URL). The **logical** request matches a POST to `/api/structure-feedback` with JSON body:

### Exact payload structure (as built in `processFeedbackPipeline`)

```json
{
  "transcript": "<string>",
  "context": "<enriched CaptureContext — url, domPath, visibleText, elementType, etc.>",
  "ocr": "<string | null>",
  "ocrText": "<string | null>"
}
```

### Exact client code constructing the body

```ts
        const res = await apiFetch("/api/structure-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            context: enrichedContext,
            ocr: ocrText || null,
            ocrText: ocrText || null,
          }),
        });
```

**Note:** The server route reads `transcript` and passes `rawBody.context` into the pipeline; extra keys (`ocr`, `ocrText`) are present on the JSON object and consumed where `rawContext` is normalized in `voiceToTicketPipeline` / `buildDomContextForPipeline`.

---

## Section 6 — Server Route

### `app/api/structure-feedback/route.ts` (full file)

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { requireAuth } from "@/lib/server/auth";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { runFeedbackPipeline } from "@/lib/ai/runFeedbackPipeline";
import { corsHeaders } from "@/lib/server/cors";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  return true;
}

/** Stable response shape. One recording → one ticket; tickets[] has one element for compatibility. */
type StructureResponse = {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
};

/**
 * POST /api/structure-feedback
 *
 * Capture layer: accepts transcript + context (visibleText, nearbyText, domPath, elements, viewport, etc.).
 * All processing is delegated to the central pipeline (lib/ai/runFeedbackPipeline).
 */
export async function POST(req: NextRequest): Promise<Response> {
  const stableFailure = (error: string): NextResponse<StructureResponse> =>
    NextResponse.json(
      { success: false, tickets: [], error },
      { status: 200, headers: corsHeaders(req) }
    );

  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }
  if (!checkRateLimit(user.uid)) {
    return NextResponse.json(
      { success: false, tickets: [], error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: corsHeaders(req) }
    );
  }

  try {
    await resolveWorkspaceForUser(user.uid);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    throw err;
  }

  let client: OpenAI;
  try {
    client = getOpenAIClient();
  } catch {
    return NextResponse.json(
      { success: false, tickets: [], error: "Missing OpenAI API key" },
      { status: 200, headers: corsHeaders(req) }
    );
  }

  let rawBody: { transcript?: unknown; context?: unknown };
  try {
    rawBody = await req.json();
  } catch {
    return stableFailure("Invalid request body");
  }
  console.log("[FINAL_ROUTE_BODY]", rawBody);
  const { transcript } = rawBody;
  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { success: false, tickets: [], error: "No valid transcript provided" },
      { status: 200, headers: corsHeaders(req) }
    );
  }

  console.log("[CHECK_SERVER_TRANSCRIPT]", {
    transcript,
    length: transcript?.length,
  });

  try {
    const result = await runFeedbackPipeline(client, { transcript, context: rawBody?.context });

    console.log("[PHASE3_FINAL]", {
      fields: Object.keys(result.tickets?.[0] || {}),
    });
    console.log("[PHASE3_READY]", {
      status: "clean",
      readyForPhase4: true,
    });

    return NextResponse.json(
      {
        success: result.success,
        tickets: result.tickets ?? [],
      },
      {
        status: 200,
        headers: corsHeaders(req),
      }
    );
  } catch (err) {
    console.error("STRUCTURING ERROR:", err);
    return NextResponse.json(
      { success: false, tickets: [], error: "AI pipeline failed" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
```

---

## Section 7 — AI Pipeline

### `lib/ai/runFeedbackPipeline.ts` (full file)

```ts
/**
 * Echly AI Feedback Pipeline — Minimal voice → ticket orchestrator.
 *
 * Architecture: one recording → one ticket.
 *
 *   User Voice Recording
 *   → Speech-to-text (client)
 *   → Context Builder (transcript + DOM context, <1000 tokens)
 *   → Single GPT-4o-mini call
 *   → Structured JSON → ONE ticket
 *   → Return to UI
 *
 * No instruction graph, no refinement, no clause splitting, no verification layer.
 */

import type OpenAI from "openai";
import { runVoiceToTicket } from "@/lib/ai/voiceToTicketPipeline";

/* ===== CAPTURE: NORMALIZE REQUEST ===== */

export interface PipelineCaptureInput {
  transcript: string;
  context?: unknown;
}

/** Normalize request body. Transcript is required; context is passed through. */
export function normalizeInput(raw: PipelineCaptureInput): { transcript: string; context: unknown } {
  const transcript = typeof raw.transcript === "string" ? raw.transcript.trim() : "";
  const context = raw.context ?? null;
  return { transcript, context };
}

/* ===== PIPELINE OUTPUT ===== */

export interface PipelineOutput {
  success: boolean;
  tickets: Array<Record<string, unknown>>;
  error?: string;
}

function generateSmartTags(transcript: string, elementType: string | null) {
  const text = transcript.toLowerCase();

  const tags = [];

  // ELEMENT FIRST
  if (elementType === "button") tags.push("Button");
  if (elementType === "image") tags.push("Image");
  if (elementType === "heading") tags.push("Heading");
  if (elementType === "link") tags.push("Link");
  if (elementType === "icon") tags.push("Icon");

  // CONTENT SECOND
  if (text.includes("text") || text.includes("word")) {
    tags.push("Text");
  }

  if (text.includes("image")) {
    tags.push("Image");
  }

  // ACTION THIRD
  if (
    text.includes("size") ||
    text.includes("increase") ||
    text.includes("decrease")
  ) {
    tags.push("Size");
  }

  if (text.includes("color") || text.includes("colour")) {
    tags.push("Color");
  }

  // Replace section-based intent with Layout
  if (
    text.includes("section") ||
    text.includes("layout") ||
    text.includes("block")
  ) {
    tags.push("Layout");
  }

  // SECONDARY CONTEXT
  if (text.includes("button")) {
    tags.push("Button");
  }

  if (text.includes("icon")) {
    tags.push("Icon");
  }

  if (text.includes("link")) {
    tags.push("Link");
  }

  if (text.includes("heading")) {
    tags.push("Heading");
  }

  // REMOVE DUPLICATES
  const unique = [...new Set(tags)];

  // LIMIT TO 5
  return unique.slice(0, 5);
}

/**
 * Run the minimal feedback pipeline: one transcript → one ticket.
 * Called from POST /api/structure-feedback.
 */
export async function runFeedbackPipeline(
  client: OpenAI,
  input: PipelineCaptureInput
): Promise<PipelineOutput> {
  const { transcript, context } = normalizeInput(input);

  let result;
  try {
    result = await runVoiceToTicket(client, transcript, context);
  } catch (err) {
    console.error("[PIPELINE] runVoiceToTicket failed", err);
    return {
      success: false,
      tickets: [],
      error: "Structuring failed",
    };
  }

  const ticketPayload = {
    title: result.ticket.title,
    actionSteps: result.ticket.actionSteps,
    suggestedTags: generateSmartTags(
      transcript,
      (context as { elementType?: string } | null)?.elementType || null
    ),
  };

  console.log("[SMART_TAGS]", {
    transcriptPreview: transcript.slice(0, 80),
    elementType: (context as { elementType?: string } | null)?.elementType || null,
    tagCount: ticketPayload.suggestedTags.length,
    tags: ticketPayload.suggestedTags,
  });

  return {
    success: result.success,
    tickets: [ticketPayload],
  };
}
```

### `lib/ai/voiceToTicketPipeline.ts` (full file)

See repository file `lib/ai/voiceToTicketPipeline.ts` — it is 420 lines. It is included in full below:

```ts
/**
 * Minimal voice → ticket pipeline: one transcript, one GPT-4o-mini call, one ticket.
 * No instruction graph, no refinement, no verification.
 */

import type OpenAI from "openai";
import { truncateForTokenBudget } from "@/lib/ai/pipelineTokenBudget";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/interpreterPrompt";
import type { PipelineContext } from "@/lib/server/pipelineContext";
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";

/* ===== DOM CONTEXT & TYPES ===== */

/** DOM context sent to the AI. Limited to <1000 tokens total. */
export interface DomContextForAI {
  elementHTML: string | null;
  elementType: string | null;
  nearbyText: string | null;
  visibleText: string | null;
  domPath: string | null;
  pageURL: string;
}

/** Max tokens for combined DOM context (element + nearby + visible + path). */
const DOM_CONTEXT_MAX_TOKENS = 1000;
const CHARS_PER_TOKEN = 4;

/** One action from the LLM. */
export interface ExtractedAction {
  step: number;
  instruction: string;
  entity: string;
}

/** Raw JSON shape returned by the LLM. */
export interface StructuredFeedbackJSON {
  title?: string;
  actions: ExtractedAction[];
}

/** Normalized ticket for API response. */
export interface VoiceTicket {
  title: string;
  actionSteps: string[];
}

function buildDomContextFromPipelineContext(ctx: PipelineContext | null): DomContextForAI {
  if (!ctx) {
    return { elementHTML: null, elementType: null, nearbyText: null, visibleText: null, domPath: null, pageURL: "" };
  }
  const url = typeof ctx.url === "string" ? ctx.url : "";
  const domPath = ctx.domPath ?? null;
  const elementType = ctx.elementType ?? null;
  const nearbyText = ctx.nearbyText ?? null;
  const visibleText = ctx.visibleText ?? ctx.screenshotOCRText ?? null;
  const subtreeText = ctx.subtreeText ?? null;
  const elementHTML = subtreeText ?? null;
  return {
    elementHTML,
    elementType,
    nearbyText,
    visibleText,
    domPath,
    pageURL: url,
  };
}

/**
 * Truncate DOM context so total size is under DOM_CONTEXT_MAX_TOKENS (1000 tokens).
 * Uses truncateForTokenBudget on elementHTML, nearbyText, visibleText before building the prompt.
 * domPath and pageURL are kept as-is (small).
 */
function truncateDomContextToBudget(ctx: DomContextForAI): DomContextForAI {
  const maxChars = DOM_CONTEXT_MAX_TOKENS * CHARS_PER_TOKEN;
  const fixedChars = (ctx.pageURL?.length ?? 0) + (ctx.domPath?.length ?? 0);
  const remaining = maxChars - fixedChars;
  if (remaining <= 0) {
    return { ...ctx, elementHTML: null, nearbyText: null, visibleText: null };
  }
  const budgetElement = Math.floor(remaining * 0.4);
  const budgetNearby = Math.floor(remaining * 0.35);
  const budgetVisible = Math.floor(remaining * 0.25);

  return {
    elementHTML: ctx.elementHTML
      ? truncateForTokenBudget(ctx.elementHTML, budgetElement)
      : null,
    elementType: ctx.elementType ?? null,
    nearbyText: ctx.nearbyText
      ? truncateForTokenBudget(ctx.nearbyText, budgetNearby)
      : null,
    visibleText: ctx.visibleText
      ? truncateForTokenBudget(ctx.visibleText, budgetVisible)
      : null,
    domPath: ctx.domPath,
    pageURL: ctx.pageURL,
  };
}

/**
 * Build DOM context for the AI from raw request context.
 * Limits total DOM tokens to <1000.
 */
export function buildDomContextForPipeline(rawContext: unknown): DomContextForAI {
  const ctx = normalizeRawContext(rawContext);
  const domContext = buildDomContextFromPipelineContext(ctx);
  return truncateDomContextToBudget(domContext);
}

function normalizeRawContext(raw: unknown): PipelineContext | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    url: typeof o.url === "string" ? o.url : undefined,
    domPath: o.domPath != null && typeof o.domPath === "string" ? o.domPath : null,
    nearbyText:
      Array.isArray(o.nearbyText) && o.nearbyText.length > 0
        ? (o.nearbyText as unknown[]).filter((x): x is string => typeof x === "string").join("\n")
        : o.nearbyText != null && typeof o.nearbyText === "string"
          ? o.nearbyText
          : null,
    visibleText: o.visibleText != null && typeof o.visibleText === "string" ? o.visibleText : null,
    screenshotOCRText: o.screenshotOCRText != null && typeof o.screenshotOCRText === "string" ? o.screenshotOCRText : null,
    subtreeText: o.subtreeText != null && typeof o.subtreeText === "string" ? o.subtreeText : null,
    elementType: o.elementType != null && typeof o.elementType === "string" ? o.elementType : null,
  };
}

function dedupeLines(text: string | null): string | null {
  if (!text) return text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return [...new Set(lines)].join("\n");
}

function cleanVisibleText(text: string | null): string | null {
  if (!text) return text;

  return text
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/\b[a-zA-Z]{1,2}\b/g, " ")
    .replace(/(.)\1{3,}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function limitText(text: string | null, max = 1500): string | null {
  if (!text) return text;
  return text.slice(0, max);
}

function buildUserMessage(
  transcript: string,
  domContext: DomContextForAI,
  shouldUseOCR: boolean,
  ocrText: string | null
): string {
  const parts: string[] = [];

  parts.push("USER INTENT (SOURCE OF TRUTH):");
  parts.push(transcript.trim());

  parts.push("\nREFERENCE CONTEXT (DO NOT USE FOR DECISIONS):");

  parts.push("Selected element:");
  parts.push(domContext.elementHTML || "None");

  parts.push("\nElement type:");
  parts.push(domContext.elementType || "None");

  parts.push("\nNearby text:");
  parts.push(domContext.nearbyText || "None");

  parts.push("\nVisible text:");
  parts.push(domContext.visibleText || "None");

  if (shouldUseOCR) {
    parts.push("\nVISUAL TEXT (OCR - REFERENCE ONLY):");
    parts.push(ocrText || "None");
  }

  return parts.join("\n");
}

/* ===== EXTRACTION & PARSING ===== */

/** JSON schema for strict extraction output. Enforced via response_format. */
const FEEDBACK_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          step: { type: "number" },
          description: { type: "string" },
          entity: { type: "string" },
        },
        required: ["step", "description", "entity"],
      },
    },
  },
  required: ["title", "actions"],
} as const;

/** Fallback when parsing fails or actions array is missing. */
function fallbackStructuredFeedback(transcript: string): StructuredFeedbackJSON {
  return {
    actions: [
      {
        step: 1,
        instruction: transcript.trim() || "Update UI element",
        entity: "general",
      },
    ],
  };
}

function parseStructuredResponse(text: string): StructuredFeedbackJSON | null {
  const trimmed = text.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) jsonStr = codeBlock[1].trim();
  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (!Array.isArray(o.actions)) return null;
    const actions: ExtractedAction[] = [];
    for (const item of o.actions) {
      if (item && typeof item === "object") {
        const a = item as Record<string, unknown>;
        const instruction =
          typeof a.description === "string"
            ? a.description
            : typeof a.instruction === "string"
              ? a.instruction
              : String(a.description ?? a.instruction ?? "");
        actions.push({
          step: typeof a.step === "number" ? a.step : actions.length + 1,
          instruction,
          entity: typeof a.entity === "string" ? a.entity : "",
        });
      }
    }
    const title = typeof o.title === "string" ? o.title.trim() : "";
    return { title, actions };
  } catch {
    return null;
  }
}

/** Sanitize AI-generated title: max 5 words, max 60 characters. */
function sanitizeTitle(title: string): string {
  if (!title) return "";
  const words = title.split(/\s+/).slice(0, 5);
  const cleaned = words.join(" ");
  return cleaned.slice(0, 60);
}

/* ===== GPT CALLS ===== */

/**
 * Single GPT-4o-mini call: transcript + domContext → structured JSON.
 * Uses response_format json_schema so output is always valid JSON matching the schema.
 * On parse failure or missing actions, returns fallback (transcript as single action).
 */
export async function extractStructuredFeedback(
  client: OpenAI,
  transcript: string,
  domContext: DomContextForAI,
  context?: { ocrText?: string | null; screenshotOCRText?: string | null } | null
): Promise<{ json: StructuredFeedbackJSON; raw: string }> {
  const ocrText =
    context?.ocrText ||
    context?.screenshotOCRText ||
    null;
  const shouldUseOCR =
    (!domContext.elementHTML || domContext.elementHTML.length < 10) &&
    !!ocrText &&
    ocrText.length > 20;
  console.log("[OCR_DECISION]", {
    hasElement: !!domContext.elementHTML,
    elementLength: domContext.elementHTML?.length || 0,
    ocrLength: ocrText?.length || 0,
    shouldUseOCR
  });
  console.log("[AI_PHASE2_INPUT]", {
    transcriptPreview: transcript.slice(0, 100),
    elementPreview: domContext.elementHTML?.slice(0, 100),
    elementType: domContext.elementType || null,
    nearbyPreview: domContext.nearbyText?.slice(0, 100),
    visiblePreview: domContext.visibleText?.slice(0, 100),
    ocrPreview: shouldUseOCR ? ocrText?.slice(0, 100) : null
  });
  const userMessage = buildUserMessage(transcript, domContext, shouldUseOCR, ocrText);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 300,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "feedback_actions",
        schema: FEEDBACK_JSON_SCHEMA as Record<string, unknown>,
        strict: true,
      },
    },
    messages,
  });
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const json = parseStructuredResponse(raw);
  console.log("[AI_PHASE2_OUTPUT]", {
    title: json?.title,
    actionsCount: json?.actions?.length,
    firstAction: json?.actions?.[0]?.instruction
  });
  if (!json || !Array.isArray(json.actions) || json.actions.length === 0) {
    return { json: fallbackStructuredFeedback(transcript), raw };
  }
  return { json, raw };
}

/* ===== PUBLIC API ===== */

/**
 * Run the minimal pipeline: transcript + context → one ticket.
 * One transcript → one ticket. Multiple actions become actionSteps on that ticket; never multiple tickets.
 */
export async function runVoiceToTicket(
  client: OpenAI,
  transcript: string,
  rawContext: unknown
): Promise<{
  success: boolean;
  ticket: VoiceTicket;
}> {
  if (!transcript || !transcript.trim()) {
    return {
      success: true,
      ticket: { title: "", actionSteps: [] },
    };
  }

  const domContext = buildDomContextForPipeline(rawContext);
  const rawCtx = rawContext != null && typeof rawContext === "object"
    ? (rawContext as Record<string, unknown>)
    : null;
  const normalizedInput = {
    transcript: transcript || "",
    elementText: domContext?.elementHTML || null,
    nearbyText: domContext?.nearbyText || null,
    visibleText: domContext?.visibleText || "",
    ocrText:
      (typeof rawCtx?.ocrText === "string" ? rawCtx.ocrText : null) ||
      (typeof rawCtx?.screenshotOCRText === "string" ? rawCtx.screenshotOCRText : null),
  };

  normalizedInput.elementText = dedupeLines(normalizedInput.elementText);
  normalizedInput.nearbyText = dedupeLines(normalizedInput.nearbyText);
  normalizedInput.visibleText = dedupeLines(normalizedInput.visibleText) ?? "";
  normalizedInput.visibleText = cleanVisibleText(normalizedInput.visibleText) ?? "";
  normalizedInput.visibleText = limitText(normalizedInput.visibleText, 1500) ?? "";
  normalizedInput.nearbyText = limitText(normalizedInput.nearbyText, 1500);

  if (!normalizedInput.elementText) {
    normalizedInput.elementText = null;
  }

  if (!normalizedInput.nearbyText) {
    normalizedInput.nearbyText = null;
  }

  if (!normalizedInput.ocrText) {
    normalizedInput.ocrText = null;
  }

  const aiContext: DomContextForAI = {
    ...domContext,
    elementHTML: normalizedInput.elementText,
    nearbyText: normalizedInput.nearbyText,
    visibleText: normalizedInput.visibleText || null,
  };
  const { json } = await extractStructuredFeedback(client, normalizedInput.transcript, aiContext, {
    ocrText: normalizedInput.ocrText,
    screenshotOCRText: typeof rawCtx?.screenshotOCRText === "string" ? rawCtx.screenshotOCRText : null,
  });

  const actionSteps = json.actions
    .sort((a, b) => a.step - b.step)
    .map((a) => a.instruction.trim())
    .filter(Boolean);

  const aiTitle =
    typeof json.title === "string"
      ? sanitizeTitle(json.title)
      : "";
  const title =
    aiTitle.length > 0
      ? aiTitle
      : generateTicketTitle(actionSteps);

  const ticket: VoiceTicket = {
    title,
    actionSteps,
  };

  return {
    success: true,
    ticket,
  };
}
```

---

## Section 8 — Transcript Flow Trace

| Step | Layer | Variable name | Source file (approx. line) | Transformation |
|------|--------|---------------|----------------------------|----------------|
| 1 | Whisper API response | `response` (OpenAI object), `response.text` | `app/api/transcribe-audio/route.ts` 17–20 | OpenAI returns text; logged as `textLength` / `preview`. |
| 1b | HTTP JSON body | `transcript: response.text \|\| ""` | same file 27–28 | Empty string if falsy `text`. |
| 2 | Client parse | `text` (string from `whisperRes.text()`) | `useCaptureWidget.ts` 647 | Raw response body. |
| 2b | Parsed object | `whisperData` | 598, 648, 651–652 | `JSON.parse(text)` → object; on failure `{ transcript: "" }`. |
| 2c | Outer catch | `whisperData` | 657 | On fetch/abort failure: `{ transcript: "" }`. |
| 3 | Client normalized | `finalTranscript` | 660–665 | Prefer `whisperData.transcript`, else `whisperData.text`, else `""`; `.trim()` on strings. |
| 4 | Recording state | `transcript: finalTranscript` on recording | 693–696 | Stored on active `Recording`. |
| 5 | `onComplete` 1st argument | `finalTranscript` | 829–830 | Passed to host callback. |
| 6 | `handleComplete` parameter | `transcript` | `content.tsx` 737–759 | Same value as argument (parameter name `transcript`). |
| 7 | `processFeedbackPipeline` destructuring | `transcript` | `content.tsx` 531–537 | Same string passed through. |
| 8 | JSON body field | `transcript` property | `content.tsx` 612–617 | `JSON.stringify({ transcript, context, ocr, ocrText })`. |
| 9 | Server parse | `rawBody` | `route.ts` 111 | `await req.json()`. |
| 10 | Server extract | `transcript` from `rawBody` | 116–117 | Destructuring; must be non-empty string. |
| 11 | Pipeline input | `transcript` in `{ transcript, context: rawBody?.context }` | 130 | Passed to `runFeedbackPipeline`. |
| 12 | Normalize | `transcript` (trimmed) | `runFeedbackPipeline.ts` 27–28, 116 | `normalizeInput`: `typeof === "string" ? trim() : ""`. |
| 13 | Voice pipeline | `transcript` → `normalizedInput.transcript` | `voiceToTicketPipeline.ts` 336–358, 391 | Early exit if blank after trim; else `transcript \|\| ""` in normalized object. |

**Alternate path (session text submit):** `transcript` in `handleSessionFeedbackSubmit` → `onComplete(transcript, ...)` at `useCaptureWidget.ts` 1529 — not from Whisper; same downstream chain from `handleComplete` onward.

---

## Section 9 — Multiple Execution Check

### All places `onComplete` is **called** (invocation)

| File | Line(s) | Context |
|------|---------|---------|
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 829 | `await onComplete(finalTranscript, ...)` inside `finishListening`. |
| `lib/capture-engine/core/hooks/useCaptureWidget.ts` | 1529 | `onComplete(transcript, pending.screenshot ?? null, ...)` in session feedback submit handler. |

### Prop wiring (not a “call”, but connects the callback)

| File | Line(s) | Context |
|------|---------|---------|
| `echly-extension/src/content.tsx` | 1058 | `onComplete={handleComplete}` on `CaptureWidget`. |
| `lib/capture-engine/core/CaptureWidget.tsx` | 22, 93 | `onComplete` passed into `useCaptureWidget`. |

### All places `processFeedbackPipeline` is **called**

| File | Line(s) | Context |
|------|---------|---------|
| `echly-extension/src/content.tsx` | 790 | `await processFeedbackPipeline({ transcript, screenshot, context, callbacks, sessionMode })` inside `handleComplete`. |

`processFeedbackPipeline` is **defined** only in `content.tsx` (line 531) and **invoked** at line 790.

---

## Section 10 — Final Notes

### Fallback logic (transcript-related)

- **`app/api/transcribe-audio/route.ts`:** `transcript: response.text || ""`.
- **`useCaptureWidget.ts`:** JSON parse failure → `whisperData = { transcript: "" }`; outer Whisper failure → same; `finalTranscript` falls back to `whisperData.text` if `transcript` not a string.
- **`content.tsx` `processFeedbackPipeline`:** `fallbackTicket` when API returns no successful ticket; `normalized` uses `structured.tickets[0]` or `fallbackTicket`.
- **`content.tsx` `handleComplete`:** on pipeline error, returns `fallbackResult` (local id, title from transcript slice).
- **`runFeedbackPipeline.ts`:** `normalizeInput` coerces non-string transcript to `""`.
- **`voiceToTicketPipeline.ts`:** `runVoiceToTicket` returns empty ticket if `!transcript || !transcript.trim()`; `fallbackStructuredFeedback` / `parseStructuredResponse` failure uses transcript for single action; title fallback via `generateTicketTitle`.

### Empty string coercion

- Server transcribe: `response.text || ""`.
- Client: `finalTranscript` default `""`; `whisperData` forced to `{ transcript: "" }` on errors.
- `normalizeInput`: non-string → `""`.
- `runVoiceToTicket`: `transcript || ""` in `normalizedInput`.
- `extractStructuredFeedback` raw: `?? ""`.
- Various `|| null` / `|| "None"` in prompts for display fields (not the primary transcript field).

### try/catch blocks affecting transcript

- **`transcribe-audio/route.ts`:** whole handler try/catch → 500 on error (no transcript returned).
- **`useCaptureWidget.ts`:** inner try around Whisper fetch/parse; outer catch sets empty transcript; `finishListening` try/catch around `onComplete` delegates to `handleOnCompleteThrow`.
- **`structure-feedback/route.ts`:** try/catch on `req.json()`; try/catch on `runFeedbackPipeline`.
- **`runFeedbackPipeline.ts`:** try/catch around `runVoiceToTicket` returns failure object.
- **`content.tsx`:** try/catch around OCR; try/catch around `apiFetch` + `res.json()` sets `structured = null`; try/catch in `handleComplete` returns `fallbackResult` on error.

---

*Generated as a static export of the pipeline. Line numbers refer to the repository state at export time and may drift with edits.*
