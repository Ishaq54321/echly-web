"use client";

import { authFetch } from "@/lib/authFetch";
import { playDoneClick } from "@/lib/playDoneClick";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSessionFeedback } from "@/lib/feedback";
import type {
  StructuredFeedback,
  Recording,
  CaptureState,
  CaptureWidgetProps,
  Position,
  CaptureContext,
} from "../types";
import { buildCaptureContext } from "@/lib/captureContext";
import { playShutterSound } from "@/lib/playShutterSound";
import { logSession } from "../session/sessionMode";
import { cropScreenshotAroundElement } from "../session/cropAroundElement";
import { createMarker, removeAllMarkers, updateMarker, removeMarker } from "../session/feedbackMarkers";
import { echlyLog } from "@/lib/debug/echlyLogger";

const SAFE_MARGIN = 24;
const ECHLY_MOTION = "140ms cubic-bezier(0.2, 0.8, 0.2, 1)";
const OVERLAY_ROOT_ID = "echly-capture-root";
const SESSION_WAIT_POLL_MS = 120;

export type SentimentGlow = "negative" | "neutral" | "positive";

function getSentimentFromTranscript(transcript: string): SentimentGlow {
  const t = transcript.toLowerCase().trim();
  if (!t) return "neutral";
  const negative =
    /\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(t);
  const positive =
    /\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(t);
  if (negative && !positive) return "negative";
  if (positive && !negative) return "positive";
  if (negative && positive) {
    const negCount = (t.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g) ?? []).length;
    const posCount = (t.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g) ?? []).length;
    return negCount > posCount ? "negative" : posCount > negCount ? "positive" : "neutral";
  }
  return "neutral";
}

type SpeechRecognitionInstance = { start(): void; stop(): void };

/** One result item: first alternative at index 0 has transcript. */
interface SpeechRecognitionResultItem {
  0: { transcript: string };
  length: number;
  isFinal: boolean;
}

/** Web Speech API result event (for recognition.onresult). */
interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: Array<SpeechRecognitionResultItem>;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance & {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((e: SpeechRecognitionResultEvent) => void) | null;
      onend: (() => void) | null;
      onstart?: (() => void) | null;
      onspeechstart?: (() => void) | null;
      onaudiostart?: (() => void) | null;
    };
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance & {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((e: SpeechRecognitionResultEvent) => void) | null;
      onend: (() => void) | null;
      onstart?: (() => void) | null;
      onspeechstart?: (() => void) | null;
      onaudiostart?: (() => void) | null;
    };
  }
}

function generateRecordingId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function captureTabWithoutOverlay(
  capture: () => Promise<string | null>
): Promise<string | null> {
  const overlay = document.getElementById(OVERLAY_ROOT_ID) as HTMLElement | null;
  const previousDisplay = overlay?.style.display ?? "";

  try {
    if (overlay) {
      overlay.style.display = "none";
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    return await capture();
  } finally {
    if (overlay) {
      overlay.style.display = previousDisplay;
    }
  }
}

const CAPTURE_FLOW_STATES: CaptureState[] = [
  "focus_mode",
  "region_selecting",
  "voice_listening",
  "processing",
];

export function useCaptureWidget({
  sessionId,
  extensionMode = false,
  initialPointers,
  onComplete,
  onDelete,
  onUpdate,
  onRecordingChange,
  loadSessionWithPointers,
  pointers: pointersProp,
  onSessionLoaded,
  onCreateSession,
  onActiveSessionChange,
  globalSessionModeActive,
  globalSessionPaused,
  onSessionModeStart,
  onSessionModePause,
  onSessionModeResume,
  onSessionModeEnd,
}: CaptureWidgetProps) {
  if (process.env.NODE_ENV === "development") {
    console.count("useCaptureWidget render");
  }
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [isOpen, setIsOpenState] = useState(false);
  const [state, setState] = useState<CaptureState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pointers, setPointers] = useState<StructuredFeedback[]>(
    initialPointers ?? []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSteps, setEditedSteps] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingStructured, setPendingStructured] = useState<StructuredFeedback | null>(null);
  const [listeningAudioLevel, setListeningAudioLevel] = useState(0);
  const [widgetOpenBeforeCapture, setWidgetOpenBeforeCapture] = useState(true);
  const [highlightTicketId, setHighlightTicketId] = useState<string | null>(null);
  const [pillExiting, setPillExiting] = useState(false);
  const [captureRootReady, setCaptureRootReady] = useState(false);
  const [captureRootEl, setCaptureRootEl] = useState<HTMLDivElement | null>(null);
  const [orbSuccess, setOrbSuccess] = useState(false);
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [pausePending, setPausePending] = useState(false);
  const [endPending, setEndPending] = useState(false);
  const [sessionFeedbackPending, setSessionFeedbackPending] = useState<{
    screenshot: string;
    context: CaptureContext | null;
  } | null>(null);
  const [sessionFeedbackSaving, setSessionFeedbackSaving] = useState(false);

  const sessionModeRef = useRef(false);
  const sessionPausedRef = useRef(false);
  const lastSessionClickedElementRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    sessionModeRef.current = sessionMode;
  }, [sessionMode]);
  useEffect(() => {
    sessionPausedRef.current = sessionPaused;
  }, [sessionPaused]);

  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const captureRootRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRecordingIdRef = useRef<string | null>(null);
  const recordingsRef = useRef<Recording[]>(recordings);
  const stateRef = useRef<CaptureState>(state);
  const pipelineActiveRef = useRef(false);
  const manualStopRef = useRef(false);
  const editingIdRef = useRef<string | null>(null);
  const trayLockedRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const pauseWaitTimeoutRef = useRef<number | null>(null);
  const endWaitTimeoutRef = useRef<number | null>(null);
  /** [VOICE] Diagnostic: timestamp when UI recording started (startListening called). */
  const voiceStartTimeRef = useRef<number | null>(null);
  /** [VOICE] Diagnostic: timestamp when recognition.onstart fired. */
  const recognitionOnstartTimeRef = useRef<number | null>(null);
  /** [VOICE] Diagnostic: whether first transcript chunk has been logged for this session. */
  const hasReceivedFirstTranscriptRef = useRef(false);
  /** True while in voice_listening (or equivalent) so overlay/effects do not tear down during recording. */
  const recordingActiveRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /** Focus mode: dim overlay + desaturation when in focus_mode or region_selecting */
  useEffect(() => {
    if (state === "focus_mode" || state === "region_selecting") {
      document.documentElement.style.filter = "saturate(0.98)";
    } else {
      document.documentElement.style.filter = "";
    }
    return () => {
      document.documentElement.style.filter = "";
    };
  }, [state]);

  /** Audio level loop while voice_listening */
  useEffect(() => {
    if (state !== "voice_listening") {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
      setListeningAudioLevel(0);
      return;
    }
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId: number;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const sum = data.reduce((a, b) => a + b, 0);
      const avg = data.length ? sum / data.length : 0;
      const normalized = Math.min(1, avg / 128);
      setListeningAudioLevel(normalized);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    rafRef.current = rafId;
    return () => {
      cancelAnimationFrame(rafId);
      rafRef.current = null;
    };
  }, [state]);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    trayLockedRef.current = CAPTURE_FLOW_STATES.includes(state);
  }, [state]);

  const wasRecordingRef = useRef(false);
  useEffect(() => {
    if (!onRecordingChange) return;
    const recording = CAPTURE_FLOW_STATES.includes(state);
    if (recording) {
      wasRecordingRef.current = true;
      onRecordingChange(true);
    } else if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      onRecordingChange(false);
    }
  }, [state, onRecordingChange]);

  const setIsOpen = useCallback((next: boolean) => {
    if (next === false) {
      if (trayLockedRef.current) return;
      if (extensionMode) return;
      if (CAPTURE_FLOW_STATES.includes(stateRef.current)) return;
      if (editingIdRef.current) return;
    }
    setIsOpenState(next);
  }, [extensionMode]);

  const toggleOpen = useCallback(() => {
    setIsOpenState((prev) => !prev);
  }, []);

  useEffect(() => {
    activeRecordingIdRef.current = activeRecordingId;
  }, [activeRecordingId]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  /* ================= DRAG ================= */

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !widgetRef.current) return;
      e.preventDefault();
      const widgetWidth = widgetRef.current.offsetWidth;
      const widgetHeight = widgetRef.current.offsetHeight;
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;
      const maxX = window.innerWidth - widgetWidth - SAFE_MARGIN;
      const maxY = window.innerHeight - widgetHeight - SAFE_MARGIN;
      newX = Math.max(SAFE_MARGIN, Math.min(newX, maxX));
      newY = Math.max(SAFE_MARGIN, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || !widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setIsDragging(true);
    document.body.style.userSelect = "none";
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
  }, []);

  const createCaptureRoot = useCallback(() => {
    if (captureRootRef.current) {
      console.debug("ECHLY createCaptureRoot", "skipped (ref already set)");
      return;
    }
    const existingRoot = document.getElementById(OVERLAY_ROOT_ID);
    if (existingRoot) {
      console.debug("ECHLY createCaptureRoot", "reusing existing DOM root");
      captureRootRef.current = existingRoot as HTMLDivElement;
      setCaptureRootEl(existingRoot as HTMLDivElement);
      setCaptureRootReady(true);
      return;
    }
    console.debug("ECHLY createCaptureRoot");
    setSessionFeedbackPending(null);
    const captureEl = document.createElement("div");
    captureEl.id = OVERLAY_ROOT_ID;
    document.body.appendChild(captureEl);
    captureRootRef.current = captureEl;
    setCaptureRootEl(captureEl);
    setCaptureRootReady(true);
  }, []);

  /* Dedicated marker layer: appended after React portal so reconciliation does not remove markers. */
  useEffect(() => {
    const root = document.getElementById("echly-capture-root");
    if (!root || root.querySelector("#echly-marker-layer")) return;
    const markerLayer = document.createElement("div");
    markerLayer.id = "echly-marker-layer";
    markerLayer.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "width:100%",
      "height:100%",
      "pointer-events:none",
      "z-index:2147483646",
    ].join(";");
    root.appendChild(markerLayer);
  }, [captureRootEl]);

  const removeCaptureRoot = useCallback(() => {
    if (recordingActiveRef.current) return;
    if (extensionMode && globalSessionModeActive !== false) {
      return;
    }
    console.debug("ECHLY removeCaptureRoot");
    if (captureRootRef.current) {
      try {
        captureRootRef.current.remove();
      } catch (err) {
        console.error("CaptureWidget error:", err);
      }
      captureRootRef.current = null;
    }
    const el = document.getElementById(OVERLAY_ROOT_ID);
    if (el) el.remove();
    setCaptureRootEl(null);
    setCaptureRootReady(false);
  }, [extensionMode, globalSessionModeActive]);

  const restoreWidget = useCallback(() => {
    setState("idle");
    setIsOpenState(widgetOpenBeforeCapture);
  }, [widgetOpenBeforeCapture]);

  const clearSessionWaitTimeout = useCallback((type: "pause" | "end") => {
    const timeoutRef =
      type === "pause" ? pauseWaitTimeoutRef : endWaitTimeoutRef;
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pauseWaitTimeoutRef.current != null) {
        window.clearTimeout(pauseWaitTimeoutRef.current);
      }
      if (endWaitTimeoutRef.current != null) {
        window.clearTimeout(endWaitTimeoutRef.current);
      }
    };
  }, []);

  /* ================= SYNC / LOAD SESSION FEEDBACK ================= */

  useEffect(() => {
    if (initialPointers != null) {
      setPointers(initialPointers);
      return;
    }
    /* Extension: never auto-load session from sessionId. Session loads only when user clicks Resume (loadSessionWithPointers). */
    if (extensionMode) return;
    if (!sessionId) return;
    const loadFeedback = async () => {
      const existing = await getSessionFeedback(sessionId);
      setPointers(
        existing.map((item) => ({
          id: item.id,
          title: item.title,
          actionSteps: item.actionSteps ?? (item.description ? item.description.split("\n") : []),
          type: item.type,
        }))
      );
    };
    loadFeedback();
  }, [extensionMode, sessionId, initialPointers]);

  /* ================= SPEECH ================= */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      const t = Date.now();
      recognitionOnstartTimeRef.current = t;
      console.log("[VOICE] recognition.onstart", t);
      const startTime = voiceStartTimeRef.current;
      if (startTime != null) {
        console.log("[VOICE] delay UI recording start→onstart:", t - startTime, "ms");
      }
    };
    recognition.onspeechstart = () => {
      console.log("[VOICE] speech detected", Date.now());
    };
    recognition.onaudiostart = () => {
      console.log("[VOICE] audio start", Date.now());
    };
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let text = "";
      for (let i = 0; i < event.results.length; ++i) {
        const result: SpeechRecognitionResultItem = event.results[i];
        const item = result[0];
        if (!item) continue;

        text += item.transcript + " ";
      }
      text = text.replace(/\s+/g, " ").trim();
      const t = Date.now();
      echlyLog("RECORDING", "result", { transcript: text });
      console.log("[VOICE] transcript received", t, text);
      if (text && !hasReceivedFirstTranscriptRef.current) {
        hasReceivedFirstTranscriptRef.current = true;
        console.log("[VOICE] first transcript chunk:", text, "length:", text.length);
        const startTime = voiceStartTimeRef.current;
        const onstartTime = recognitionOnstartTimeRef.current;
        if (startTime != null) {
          console.log("[VOICE] delay UI→first transcript:", t - startTime, "ms");
        }
        if (onstartTime != null) {
          console.log("[VOICE] delay onstart→first transcript:", t - onstartTime, "ms");
        }
      }
      const activeId = activeRecordingIdRef.current;
      if (activeId) {
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === activeId ? { ...r, transcript: text } : r
          )
        );
      }
    };
    recognition.onend = () => {
      if (!manualStopRef.current) {
        echlyLog("RECORDING", "unexpected end");
        if (stateRef.current === "voice_listening") {
          recordingActiveRef.current = false;
          setState("idle");
        }
        return;
      }

      manualStopRef.current = false;
      recordingActiveRef.current = false;

      const s = stateRef.current;
      if (s === "processing" || s === "success") return;
      setState("idle");
    };
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch (err) {
        console.error("CaptureWidget error:", err);
      }
    };
  }, []);

  /* ================= LISTEN ================= */

  const startListening = useCallback(async () => {
    echlyLog("RECORDING", "start");
    const startTime = Date.now();
    voiceStartTimeRef.current = startTime;
    recognitionOnstartTimeRef.current = null;
    hasReceivedFirstTranscriptRef.current = false;
    console.log("[VOICE] UI recording started", startTime);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      console.log("[VOICE] recognition.start() called", Date.now());
      recognitionRef.current?.start();
      recordingActiveRef.current = true;
      setState("voice_listening");
      setListeningAudioLevel(0);
    } catch (err) {
      console.error("Microphone permission denied:", err);
      recordingActiveRef.current = false;
      setErrorMessage("Microphone permission denied.");
      setState("error");
      removeCaptureRoot();
      restoreWidget();
    }
  }, []);

  const finishListening = useCallback(async () => {
    echlyLog("RECORDING", "finish requested");
    recordingActiveRef.current = false;
    manualStopRef.current = true;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
    playDoneClick();
    recognitionRef.current?.stop();
    const activeId = activeRecordingIdRef.current;
    if (!activeId) {
      setState("idle");
      return;
    }
    const currentRecordings = recordingsRef.current;
    const active = currentRecordings.find((r) => r.id === activeId);
    console.log("[VOICE] finishListening transcript:", active?.transcript);
    if (!active || !active.transcript || active.transcript.trim().length < 5) {
      console.warn("[VOICE] transcript too short, skipping pipeline");
      setState("idle");
      return;
    }
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
        setSessionFeedbackPending(null);
        setSessionFeedbackSaving(true);
        setRecordings((prev) => prev.filter((r) => r.id !== activeId));
        setActiveRecordingId(null);
        setState("idle");
        lastSessionClickedElementRef.current = null;
        console.log("[VOICE] final transcript sent to pipeline:", active.transcript);
        try {
          pipelineActiveRef.current = true;
          onComplete(active.transcript, active.screenshot, {
            onSuccess: (ticket) => {
              pipelineActiveRef.current = false;
              setSessionFeedbackSaving(false);
              if (root) updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
              const t = ticket as StructuredFeedback & { description?: string };
              setPointers((prev) => [
                {
                  id: t.id,
                  title: t.title,
                  actionSteps: t.actionSteps ?? (t.description ? t.description.split("\n") : []),
                  type: t.type,
                },
                ...prev,
              ]);
              setHighlightTicketId(ticket.id);
              setTimeout(() => setHighlightTicketId(null), 1200);
            },
            onError: () => {
              pipelineActiveRef.current = false;
              setSessionFeedbackSaving(false);
              if (root) removeMarker(placeholderId);
              setErrorMessage("AI processing failed.");
            },
          }, active.context ?? undefined, { sessionMode: true });
        } catch (error) {
          pipelineActiveRef.current = false;
          setSessionFeedbackSaving(false);
          if (root) removeMarker(placeholderId);
          console.error(error);
          setErrorMessage("AI processing failed.");
        }
        return;
      }
      setState("processing");
      console.log("[VOICE] final transcript sent to pipeline:", active.transcript);
      pipelineActiveRef.current = true;
      onComplete(active.transcript, active.screenshot, {
        onSuccess: (ticket) => {
          pipelineActiveRef.current = false;
          const t = ticket as StructuredFeedback & { description?: string };
          setPointers((prev) => [
            {
              id: t.id,
              title: t.title,
              actionSteps: t.actionSteps ?? (t.description ? t.description.split("\n") : []),
              type: t.type,
            },
            ...prev,
          ]);
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
          setErrorMessage("AI processing failed.");
          setState("voice_listening");
        },
      }, active.context ?? undefined);
      return;
    }
    setState("processing");
    console.log("[VOICE] final transcript sent to pipeline:", active.transcript);
    try {
      const structured = await onComplete(active.transcript, active.screenshot);
      if (!structured) {
        setState("idle");
        removeCaptureRoot();
        restoreWidget();
        return;
      }
      setPointers((prev) => [
        {
          id: structured.id,
          title: structured.title,
          actionSteps: structured.actionSteps ?? [],
          type: structured.type,
        },
        ...prev,
      ]);
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
    } catch (err) {
      console.error(err);
      setErrorMessage("AI processing failed.");
      setState("voice_listening");
    }
  }, [onComplete, extensionMode, removeCaptureRoot, restoreWidget]);

  const discardListening = useCallback(() => {
    echlyLog("RECORDING", "discard");
    recordingActiveRef.current = false;
    recognitionRef.current?.stop();
    const activeId = activeRecordingIdRef.current;
    setRecordings((prev) => prev.filter((r) => r.id !== activeId));
    setActiveRecordingId(null);
    setState("cancelled");
    removeCaptureRoot();
    restoreWidget();
  }, [removeCaptureRoot, restoreWidget]);

  /** ESC: any capture flow → cancelled */
  useEffect(() => {
    if (!captureRootReady) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (CAPTURE_FLOW_STATES.includes(stateRef.current)) {
          discardListening();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [captureRootReady, discardListening]);

  /* ================= SHARE / RESET ================= */

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  }, []);

  const resetSession = useCallback(() => {
    setPointers([]);
    setRecordings([]);
    setActiveRecordingId(null);
    setState("idle");
    setExpandedId(null);
    setEditingId(null);
    setShowMenu(false);
  }, []);

  useEffect(() => {
    if (extensionMode) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [extensionMode]);

  /* ================= POINTER ACTIONS ================= */

  const deletePointer = useCallback(async (id: string) => {
    try {
      await onDelete(id);
      setPointers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }, [onDelete]);

  const startEditing = useCallback((p: StructuredFeedback) => {
    setEditingId(p.id);
    setEditedTitle(p.title);
    setEditedSteps(p.actionSteps ?? []);
  }, []);

  const saveEdit = useCallback(async (id: string) => {
    const title = editedTitle.trim() || editedTitle;
    const actionSteps = editedSteps;

    /* Optimistic update: persist to local state and exit edit mode immediately so the UI updates on click. */
    setPointers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, title: title || p.title, actionSteps } : p
      )
    );
    setEditingId(null);

    try {
      const res = await authFetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || editedTitle, actionSteps }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: { id: string; title: string; actionSteps?: string[]; type?: string } };
      if (res.ok && data.success && data.ticket) {
        const t = data.ticket;
        setPointers((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, title: t.title, actionSteps: t.actionSteps ?? p.actionSteps, type: t.type ?? p.type }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Save edit failed:", err);
    }
  }, [editedTitle, editedSteps]);

  const updatePointer = useCallback(
    async (id: string, payload: { title: string; actionSteps: string[] }) => {
      try {
        if (onUpdate) {
          await onUpdate(id, payload);
          setPointers((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, title: payload.title, actionSteps: payload.actionSteps }
                : p
            )
          );
          return;
        }
        const res = await authFetch(`/api/tickets/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title,
            actionSteps: payload.actionSteps,
          }),
        });
        const data = (await res.json()) as {
          success?: boolean;
          ticket?: { id: string; title: string; actionSteps?: string[]; type?: string };
        };
        if (!res.ok || !data.success) throw new Error("Update failed");
        const t = data.ticket;
        setPointers((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  title: t?.title ?? p.title,
                  actionSteps: t?.actionSteps ?? payload.actionSteps,
                }
              : p
          )
        );
      } catch (err) {
        console.error("Ticket update failed:", err);
        throw err;
      }
    },
    [onUpdate]
  );

  /* ================= CAPTURE ================= */

  const getFullTabImage = useCallback((): Promise<string | null> => {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      return captureTabWithoutOverlay(
        () =>
          new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { type: "CAPTURE_TAB" },
              (response: { success?: boolean; screenshot?: string } | undefined) => {
                if (!response || !response.success) {
                  reject(new Error("Capture failed"));
                } else {
                  resolve(response.screenshot ?? null);
                }
              }
            );
          })
      );
    }
    return Promise.resolve(null);
  }, []);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      return getFullTabImage();
    }
    const { captureScreenshot: webCapture } = await import("@/lib/capture");
    return webCapture();
  }, [getFullTabImage]);

  const handleRegionSelectStart = useCallback(() => {
    setState("region_selecting");
  }, []);

  const handleRegionCaptured = useCallback(
    (croppedDataUrl: string, context?: CaptureContext | null) => {
      const id = generateRecordingId();
      const newRecording: Recording = {
        id,
        screenshot: croppedDataUrl,
        transcript: "",
        structuredOutput: null,
        context: context ?? null,
        createdAt: Date.now(),
      };
      setRecordings((prev) => [...prev, newRecording]);
      setActiveRecordingId(id);
      startListening();
    },
    [startListening]
  );

  const handleCancelCapture = useCallback(() => {
    setState("cancelled");
    removeCaptureRoot();
    restoreWidget();
  }, [removeCaptureRoot, restoreWidget]);

  const setActiveRecordingTranscript = useCallback((transcript: string) => {
    const activeId = activeRecordingIdRef.current;
    if (!activeId) return;
    setRecordings((prev) =>
      prev.map((r) => (r.id === activeId ? { ...r, transcript } : r))
    );
  }, []);

  const startSession = useCallback(async () => {
    if (stateRef.current !== "idle" || sessionModeRef.current || globalSessionModeActive) return;
    echlyLog("SESSION", "start");
    console.log("[Echly] Start New Feedback Session clicked");
    logSession("start");
    if (extensionMode && onCreateSession && onActiveSessionChange) {
      const session = await onCreateSession();
      if (!session?.id) return;
      onActiveSessionChange(session.id);
      setPointers([]);
      onSessionModeStart?.();
    }
    setSessionFeedbackPending(null);
    setSessionFeedbackSaving(false);
    setPausePending(false);
    setEndPending(false);
  }, [extensionMode, onCreateSession, onActiveSessionChange, onSessionModeStart, globalSessionModeActive]);

  const pauseSession = useCallback(() => {
    if (
      (!sessionModeRef.current && !globalSessionModeActive) ||
      sessionPausedRef.current ||
      pausePending ||
      endPending
    ) {
      return;
    }
    echlyLog("SESSION", "pause requested");

    const finalizePause = () => {
      echlyLog("SESSION", "pause finalized");
      clearSessionWaitTimeout("pause");
      logSession("pause");
      onSessionModePause?.();
      setPausePending(false);
    };

    if (pipelineActiveRef.current) {
      clearSessionWaitTimeout("pause");
      setPausePending(true);

      const waitForPipeline = () => {
        if (pipelineActiveRef.current) {
          pauseWaitTimeoutRef.current = window.setTimeout(
            waitForPipeline,
            SESSION_WAIT_POLL_MS
          );
          return;
        }

        finalizePause();
      };

      waitForPipeline();
      return;
    }

    finalizePause();
  }, [
    clearSessionWaitTimeout,
    endPending,
    globalSessionModeActive,
    onSessionModePause,
    pausePending,
  ]);

  const resumeSession = useCallback(() => {
    if (!sessionModeRef.current && !globalSessionModeActive) return;
    echlyLog("SESSION", "resume");
    setPausePending(false);
    setEndPending(false);
    logSession("resume");
    onSessionModeResume?.();
  }, [globalSessionModeActive, onSessionModeResume]);

  const endSession = useCallback((afterEnd?: () => void) => {
    if ((!sessionModeRef.current && !globalSessionModeActive) || endPending) return;
    echlyLog("SESSION", "end requested");

    const finalizeEnd = () => {
      echlyLog("SESSION", "end finalized");
      clearSessionWaitTimeout("end");
      logSession("end");
      setPausePending(false);
      setEndPending(false);
      setSessionFeedbackPending(null);
      setSessionFeedbackSaving(false);
      setPointers([]);
      onSessionModeEnd?.();
      afterEnd?.();
    };

    if (pipelineActiveRef.current) {
      clearSessionWaitTimeout("end");
      setEndPending(true);
      const waitForPipeline = () => {
        if (pipelineActiveRef.current) {
          endWaitTimeoutRef.current = window.setTimeout(
            waitForPipeline,
            SESSION_WAIT_POLL_MS
          );
          return;
        }
        finalizeEnd();
      };
      waitForPipeline();
      return;
    }

    finalizeEnd();
  }, [clearSessionWaitTimeout, endPending, globalSessionModeActive, onSessionModeEnd]);

  /** Session mode starts ONLY when globalSessionModeActive === true (single source of truth). Never start from sessionId or pointers. */
  useEffect(() => {
    if (globalSessionModeActive === true) {
      setSessionMode(true);
      createCaptureRoot();
    }
  }, [globalSessionModeActive, createCaptureRoot]);

  /**
   * Sync session mode from global state (ECHLY_GLOBAL_STATE).
   * When globalSessionModeActive is true, overlay activates; pointers come from global state (pointersProp) or loadSessionWithPointers.
   */
  useEffect(() => {
    if (!extensionMode || globalSessionModeActive === undefined) return;
    echlyLog("SESSION", "global sync", { active: globalSessionModeActive, paused: globalSessionPaused });
    if (globalSessionModeActive === true) {
      setSessionMode(true);
      setSessionPaused(globalSessionPaused ?? false);
      if (!recordingActiveRef.current) setSessionFeedbackPending(null);
      setEndPending(false);
      if (!captureRootRef.current) {
        createCaptureRoot();
      }
    }
    if (globalSessionPaused === true) {
      setSessionPaused(true);
      setPausePending(false);
    }
    if (globalSessionModeActive === false) {
      if (recordingActiveRef.current) return;
      setSessionMode(false);
      setSessionPaused(false);
      setPausePending(false);
      setEndPending(false);
      setSessionFeedbackPending(null);
      setSessionFeedbackSaving(false);
      removeAllMarkers();
      removeCaptureRoot();
    }
  }, [extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot, removeCaptureRoot]);

  /** Safety: when globalSessionModeActive is false, always clear widget and overlay so session never auto-restarts. */
  useEffect(() => {
    if (!extensionMode) return;
    if (!globalSessionModeActive) {
      if (recordingActiveRef.current) return;
      setSessionMode(false);
      setSessionPaused(false);
      setPausePending(false);
      setEndPending(false);
      setSessionFeedbackPending(null);
      setSessionFeedbackSaving(false);
      removeAllMarkers();
      removeCaptureRoot();
    }
  }, [extensionMode, globalSessionModeActive, removeCaptureRoot]);

  /** When globalSessionPaused changes while session mode is active, sync local paused state. */
  useEffect(() => {
    if (extensionMode && globalSessionModeActive && globalSessionPaused !== undefined) {
      setSessionPaused(globalSessionPaused);
      if (globalSessionPaused) {
        setPausePending(false);
        setExpandedId(null);
        setHighlightTicketId(null);
      }
    }
  }, [extensionMode, globalSessionModeActive, globalSessionPaused]);

  /** Tab activation recovery: when session mode is active globally and capture root is missing, recreate it. */
  useEffect(() => {
    if (!extensionMode || globalSessionModeActive !== true) return;
    const onVisibilityChange = () => {
      if (document.hidden) return;
      if (!globalSessionModeActive || captureRootRef.current) return;
      setSessionMode(true);
      setSessionPaused(globalSessionPaused ?? false);
      setSessionFeedbackPending(null);
      setEndPending(false);
      createCaptureRoot();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [extensionMode, globalSessionModeActive, globalSessionPaused, createCaptureRoot]);

  /** Extension: sync global pointers from background so all tabs show the same tray. */
  useEffect(() => {
    if (!extensionMode || pointersProp === undefined) return;
    if (recordingActiveRef.current) return;
    setPointers(pointersProp);
    setSessionFeedbackPending(null);
  }, [extensionMode, pointersProp]);

  /** When parent passes loadSessionWithPointers (e.g. after Resume picker), apply once and notify. */
  useEffect(() => {
    if (!extensionMode || !loadSessionWithPointers?.sessionId) return;
    setPointers(loadSessionWithPointers.pointers ?? []);
    setSessionFeedbackPending(null);
    onSessionLoaded?.();
  }, [extensionMode, loadSessionWithPointers, onSessionLoaded]);

  const handleSessionElementClicked = useCallback(
    async (element: Element) => {
      if (sessionFeedbackPending && !captureRootRef.current) {
        setSessionFeedbackPending(null);
        return;
      }
      if (!getFullTabImage || sessionFeedbackPending != null) return;
      logSession("element clicked");
      playShutterSound();
      let fullImage: string | null = null;
      try {
        fullImage = await getFullTabImage();
      } catch {
        return;
      }
      if (!fullImage) return;
      let cropped: string;
      try {
        cropped = await cropScreenshotAroundElement(fullImage, element);
      } catch {
        return;
      }
      const context = buildCaptureContext(window, element);
      lastSessionClickedElementRef.current = element instanceof HTMLElement ? element : null;
      setSessionFeedbackPending({ screenshot: cropped, context });
    },
    [getFullTabImage, sessionFeedbackPending]
  );

  const handleSessionFeedbackSubmit = useCallback(
    (transcript: string) => {
      const pending = sessionFeedbackPending;
      if (!pending || !transcript || transcript.trim().length === 0) {
        setSessionFeedbackPending(null);
        return;
      }
      const root = captureRootRef.current;
      const element = lastSessionClickedElementRef.current ?? undefined;
      const placeholderId = `pending-${Date.now()}`;
      const processingTitle = "Saving feedback…";

      /* Create marker immediately so user can continue clicking. */
      if (root) {
        createMarker(
          root,
          {
            id: placeholderId,
            x: 0,
            y: 0,
            element: element ?? undefined,
            title: processingTitle,
          },
          {
            getSessionPaused: () => sessionPausedRef.current,
            onMarkerClick: (marker) => {
              setHighlightTicketId(marker.id);
              setExpandedId(marker.id);
            },
          }
        );
      }

      setSessionFeedbackPending(null);
      setSessionFeedbackSaving(true);
      setState("idle");
      lastSessionClickedElementRef.current = null;

      /* Send to structure-feedback async; update marker and list when done. */
      console.log("[VOICE] final transcript sent to pipeline:", transcript);
      try {
        pipelineActiveRef.current = true;
        onComplete(transcript, pending.screenshot, {
          onSuccess: (ticket) => {
            pipelineActiveRef.current = false;
            setSessionFeedbackSaving(false);
            if (root) {
              updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
            }
            const t = ticket as StructuredFeedback & { description?: string };
            setPointers((prev) => [
              {
                id: t.id,
                title: t.title,
                actionSteps: t.actionSteps ?? (t.description ? t.description.split("\n") : []),
                type: t.type,
              },
              ...prev,
            ]);
            setHighlightTicketId(ticket.id);
            setTimeout(() => setHighlightTicketId(null), 1200);
          },
          onError: () => {
            pipelineActiveRef.current = false;
            setSessionFeedbackSaving(false);
            if (root) removeMarker(placeholderId);
            setErrorMessage("AI processing failed.");
          },
        }, pending.context ?? undefined, { sessionMode: true });
      } catch (error) {
        pipelineActiveRef.current = false;
        setSessionFeedbackSaving(false);
        if (root) removeMarker(placeholderId);
        console.error(error);
        setErrorMessage("AI processing failed.");
      }
    },
    [sessionFeedbackPending, onComplete]
  );

  const handleSessionFeedbackCancel = useCallback(() => {
    setSessionFeedbackPending(null);
    setSessionFeedbackSaving(false);
  }, []);

  const handleSessionStartVoice = useCallback(() => {
    const pending = sessionFeedbackPending;
    if (!pending) return;
    const id = generateRecordingId();
    const newRecording: Recording = {
      id,
      screenshot: pending.screenshot,
      transcript: "",
      structuredOutput: null,
      context: pending.context ?? null,
      createdAt: Date.now(),
    };
    setRecordings((prev) => [...prev, newRecording]);
    setActiveRecordingId(id);
    startListening();
  }, [sessionFeedbackPending, startListening]);

  const handleAddFeedback = useCallback(async () => {
    if (stateRef.current !== "idle") return;
    setErrorMessage(null);
    recognitionRef.current?.stop();
    setWidgetOpenBeforeCapture(isOpen);
    setIsOpenState(false);
    createCaptureRoot();
    setState("focus_mode");
    if (extensionMode) {
      return;
    }
    try {
      const image = await captureScreenshot();
      if (!image) {
        handleCancelCapture();
        return;
      }
      const id = generateRecordingId();
      const newRecording: Recording = {
        id,
        screenshot: image,
        transcript: "",
        structuredOutput: null,
        createdAt: Date.now(),
      };
      setRecordings((prev) => [...prev, newRecording]);
      setActiveRecordingId(id);
      startListening();
    } catch (err) {
      console.error(err);
      setErrorMessage("Screen capture failed.");
      setState("error");
      handleCancelCapture();
    }
  }, [
    extensionMode,
    isOpen,
    captureScreenshot,
    startListening,
    createCaptureRoot,
    handleCancelCapture,
  ]);

  const handlers = useMemo(
    () => ({
      setIsOpen,
      toggleOpen,
      startDrag,
      handleShare,
      setShowMenu,
      resetSession,
      startListening,
      finishListening,
      discardListening,
      deletePointer,
      updatePointer,
      startEditing,
      saveEdit,
      setExpandedId,
      setEditedTitle,
      setEditedSteps,
      handleAddFeedback,
      handleRegionCaptured,
      handleRegionSelectStart,
      handleCancelCapture,
      getFullTabImage,
      setActiveRecordingTranscript,
      startSession,
      pauseSession,
      resumeSession,
      endSession,
      handleSessionElementClicked,
      handleSessionFeedbackSubmit,
      handleSessionFeedbackCancel,
      handleSessionStartVoice,
    }),
    [
      setIsOpen,
      toggleOpen,
      startDrag,
      handleShare,
      resetSession,
      startListening,
      finishListening,
      discardListening,
      deletePointer,
      updatePointer,
      startEditing,
      saveEdit,
      setExpandedId,
      setEditedTitle,
      setEditedSteps,
      handleAddFeedback,
      handleRegionCaptured,
      handleRegionSelectStart,
      handleCancelCapture,
      getFullTabImage,
      setActiveRecordingTranscript,
      startSession,
      pauseSession,
      resumeSession,
      endSession,
      handleSessionElementClicked,
      handleSessionFeedbackSubmit,
      handleSessionFeedbackCancel,
      handleSessionStartVoice,
    ]
  );

  const activeRecording = useMemo(
    () => (activeRecordingId ? recordings.find((r) => r.id === activeRecordingId) : null),
    [activeRecordingId, recordings]
  );
  const listeningSentiment = useMemo((): SentimentGlow => {
    if (state !== "voice_listening") return "neutral";
    return getSentimentFromTranscript(activeRecording?.transcript ?? "");
  }, [state, activeRecording?.transcript]);

  const liveTranscript = activeRecording?.transcript?.trim() ?? "";

  return {
    state: {
      isOpen,
      state,
      errorMessage,
      pointers,
      expandedId,
      editingId,
      editedTitle,
      editedSteps,
      showMenu,
      position,
      liveTranscript,
      listeningAudioLevel,
      listeningSentiment,
      highlightTicketId,
      pillExiting,
      orbSuccess,
      sessionMode,
      sessionPaused,
      pausePending,
      endPending,
      sessionFeedbackPending,
    },
    handlers,
    refs: {
      widgetRef,
      menuRef,
      captureRootRef,
    },
    captureRootReady,
    captureRootEl,
  };
}
