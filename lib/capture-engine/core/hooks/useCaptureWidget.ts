"use client";

import { ECHLY_DEBUG } from "@/lib/utils/logger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  StructuredFeedback,
  Recording,
  CaptureState,
  CaptureWidgetProps,
  Position,
  CaptureContext,
  SessionFeedbackPending,
} from "../types";
import { buildCaptureContext } from "../internal/contextHelpers";
import { playDoneClick, playShutterSound } from "../internal/audioHelpers";
import { logSession } from "../internal/sessionHelpers";
import {
  detectVisualContainer,
  clampRect,
  cropImageToRegion,
  hideEchlyUI,
  restoreEchlyUI,
  createMarker,
  removeAllMarkers,
  updateMarker,
  removeMarker,
} from "../internal/domHelpers";
import { echlyLog } from "@/lib/debug/echlyLogger";

const SAFE_MARGIN = 24;
const ECHLY_MOTION = "140ms cubic-bezier(0.2, 0.8, 0.2, 1)";
const OVERLAY_ROOT_ID = "echly-capture-root";
const SHADOW_HOST_ID = "echly-shadow-host";
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
  ensureAuthenticated,
  globalSessionModeActive,
  globalSessionPaused,
  onSessionModeStart,
  onSessionViewRequested,
  onSessionModePause,
  onSessionModeResume,
  onSessionModeEnd,
  onSessionActivity,
  captureMode = "voice",
  selectedMicrophoneId,
  onDevicesEnumerated,
  captureRootParent,
  environment,
}: CaptureWidgetProps) {
  if (ECHLY_DEBUG) console.count("useCaptureWidget render");

  if (typeof window !== "undefined" && !(window as Window & { __ECHLY_CAPTURE_STATE__?: { pending: SessionFeedbackPending | null } }).__ECHLY_CAPTURE_STATE__) {
    (window as Window & { __ECHLY_CAPTURE_STATE__?: { pending: SessionFeedbackPending | null } }).__ECHLY_CAPTURE_STATE__ = {
      pending: null,
    };
  }
  const captureState = (typeof window !== "undefined"
    ? (window as Window & { __ECHLY_CAPTURE_STATE__?: { pending: SessionFeedbackPending | null } }).__ECHLY_CAPTURE_STATE__
    : { pending: null as SessionFeedbackPending | null }) ?? { pending: null };

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [isOpen, setIsOpenState] = useState(false);
  const [state, setState] = useState<CaptureState>("idle");
  const [sessionStatus, setSessionStatus] = useState<"idle" | "starting" | "active">("idle");
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
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
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
  const [sessionFeedbackPending, setSessionFeedbackPending] = useState<SessionFeedbackPending | null>(captureState.pending);
  const [sessionFeedbackSaving, setSessionFeedbackSaving] = useState(false);
  const [sessionLimitReached, setSessionLimitReached] = useState<{
    message?: string;
    upgradePlan?: unknown;
  } | null>(null);

  const sessionModeRef = useRef(false);
  const sessionPausedRef = useRef(false);
  const sessionStatusRef = useRef<"idle" | "starting" | "active">("idle");
  const lastSessionClickedElementRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    sessionModeRef.current = sessionMode;
  }, [sessionMode]);
  useEffect(() => {
    sessionPausedRef.current = sessionPaused;
  }, [sessionPaused]);
  useEffect(() => {
    sessionStatusRef.current = sessionStatus;
  }, [sessionStatus]);

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
  /** Latest pointers from background so we can sync when recording ends (callbacks have stale closure). */
  const pointersPropRef = useRef<StructuredFeedback[] | undefined>(pointersProp);
  /** True when sessionFeedbackPending is set (capture UI visible); used to protect from spurious clears. */
  const sessionFeedbackPendingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    sessionFeedbackPendingRef.current = sessionFeedbackPending != null;
  }, [sessionFeedbackPending]);

  /** Sync pending to global store so it survives React remounts. */
  const setPending = useCallback((value: SessionFeedbackPending | null) => {
    captureState.pending = value;
    setSessionFeedbackPending(value);
  }, []);

  /** Restore persisted capture state on mount (e.g. after widget remount). */
  useEffect(() => {
    if (captureState.pending) {
      if (ECHLY_DEBUG) console.log("ECHLY restoring pending capture state");
      setPending(captureState.pending);
    }
  }, []);

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
      setAudioAnalyser(null);
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
      if (ECHLY_DEBUG) console.debug("ECHLY createCaptureRoot", "skipped (ref already set)");
      return;
    }
    const existingRoot = document.getElementById(OVERLAY_ROOT_ID);
    if (existingRoot) {
      if (ECHLY_DEBUG) console.debug("ECHLY createCaptureRoot", "reusing existing DOM root");
      (existingRoot as HTMLDivElement).style.pointerEvents = "none";
      captureRootRef.current = existingRoot as HTMLDivElement;
      setCaptureRootEl(existingRoot as HTMLDivElement);
      setCaptureRootReady(true);
      return;
    }
    if (ECHLY_DEBUG) console.debug("ECHLY createCaptureRoot");
    if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
      if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "createCaptureRoot" });
      setPending(null);
    } else {
      if (ECHLY_DEBUG) console.log("ECHLY pending clear skipped during capture");
    }
    const captureEl = document.createElement("div");
    captureEl.id = OVERLAY_ROOT_ID;
    /* pointer-events: none so wheel/scroll/touch pass through to page; interactive children use pointer-events: auto */
    captureEl.style.pointerEvents = "none";
    captureEl.style.zIndex = "2147483645";
    const parent = captureRootParent ?? document.body;
    parent.appendChild(captureEl);
    captureRootRef.current = captureEl;
    setCaptureRootEl(captureEl);
    setCaptureRootReady(true);
  }, [captureRootParent]);

  /* Extension: marker layer on document.body so getElementById finds it (capture root lives in shadow DOM). Mount when session starts; remove when session ends. */
  const MARKER_LAYER_Z = 2147483644;
  useEffect(() => {
    if (!extensionMode) return;
    if (globalSessionModeActive) {
      let layer = document.getElementById("echly-marker-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.id = "echly-marker-layer";
        layer.style.cssText = [
          "position:fixed",
          "inset:0",
          "pointer-events:none",
          `z-index:${MARKER_LAYER_Z}`,
        ].join(";");
        document.body.appendChild(layer);
      }
      return () => {};
    }
    const layer = document.getElementById("echly-marker-layer");
    if (layer && layer.parentNode === document.body) {
      layer.remove();
    }
  }, [extensionMode, globalSessionModeActive]);

  /* Non-extension: marker layer inside capture root so reconciliation does not remove markers. */
  useEffect(() => {
    if (extensionMode) return;
    const root = document.getElementById("echly-capture-root");
    if (!root || root.querySelector("#echly-marker-layer")) return;
    const markerLayer = document.createElement("div");
    markerLayer.id = "echly-marker-layer";
    markerLayer.style.cssText = [
      "position:fixed",
      "inset:0",
      "pointer-events:none",
      `z-index:${MARKER_LAYER_Z}`,
    ].join(";");
    root.appendChild(markerLayer);
  }, [extensionMode, captureRootEl]);

  const removeCaptureRoot = useCallback(() => {
    if (extensionMode && globalSessionModeActive !== false) {
      return;
    }
    if (ECHLY_DEBUG) console.debug("ECHLY removeCaptureRoot");
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
    if (!environment?.authenticatedFetch) {
      throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch required for loading feedback).");
    }
    const loadFeedback = async () => {
      console.log("[ECHLY CORE] fetch via environment");
      const res = await environment.authenticatedFetch(
        `/api/feedback?sessionId=${sessionId}&limit=200`
      );
      const data = await res.json();
      const existing = (data?.feedback ?? []) as Array<{
        id: string;
        title?: string;
        actionSteps?: string[];
        description?: string;
        type?: string;
      }>;
      setPointers(
        existing.map((item) => ({
          id: item.id,
          title: item.title ?? "",
          actionSteps: item.actionSteps ?? (item.description ? item.description.split("\n") : []),
          type: item.type ?? "bug",
        }))
      );
    };
    loadFeedback();
  }, [extensionMode, sessionId, initialPointers, environment]);

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
      if (ECHLY_DEBUG) console.log("[VOICE] recognition.onstart", t);
      const startTime = voiceStartTimeRef.current;
      if (ECHLY_DEBUG && startTime != null) {
        console.log("[VOICE] delay UI recording start→onstart:", t - startTime, "ms");
      }
    };
    recognition.onspeechstart = () => {
      if (ECHLY_DEBUG) console.log("[VOICE] speech detected", Date.now());
    };
    recognition.onaudiostart = () => {
      if (ECHLY_DEBUG) console.log("[VOICE] audio start", Date.now());
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
      if (ECHLY_DEBUG) console.log("[VOICE] transcript received", t, text);
      if (text && !hasReceivedFirstTranscriptRef.current) {
        hasReceivedFirstTranscriptRef.current = true;
        if (ECHLY_DEBUG) {
          console.log("[VOICE] first transcript chunk:", text, "length:", text.length);
          const startTime = voiceStartTimeRef.current;
          const onstartTime = recognitionOnstartTimeRef.current;
          if (startTime != null) console.log("[VOICE] delay UI→first transcript:", t - startTime, "ms");
          if (onstartTime != null) console.log("[VOICE] delay onstart→first transcript:", t - onstartTime, "ms");
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
          if (extensionMode && pointersPropRef.current) {
            setPointers(pointersPropRef.current);
          }
          setState("idle");
        }
        return;
      }

      manualStopRef.current = false;
      recordingActiveRef.current = false;
      if (extensionMode && pointersPropRef.current) {
        setPointers(pointersPropRef.current);
      }

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
      if (ECHLY_DEBUG) console.log("[VOICE] recognition.start() called", Date.now());
      recognitionRef.current?.start();
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

  const finishListening = useCallback(async () => {
    echlyLog("RECORDING", "finish requested");
    recordingActiveRef.current = false;
    if (extensionMode && pointersPropRef.current) {
      setPointers(pointersPropRef.current);
    }
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
    if (ECHLY_DEBUG) console.log("[VOICE] finishListening transcript:", active?.transcript);
    if (!active || !active.transcript || active.transcript.trim().length < 5) {
      if (ECHLY_DEBUG) console.warn("[VOICE] transcript too short, skipping pipeline");
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
        if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "finishListening session mode" });
        setPending(null);
        setSessionFeedbackSaving(true);
        setRecordings((prev) => prev.filter((r) => r.id !== activeId));
        setActiveRecordingId(null);
        setState("idle");
        lastSessionClickedElementRef.current = null;
        if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", active.transcript);
        try {
          pipelineActiveRef.current = true;
          onComplete(active.transcript, active.screenshot, {
            onSuccess: (ticket) => {
              pipelineActiveRef.current = false;
              setSessionFeedbackSaving(false);
              if (root) updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
              if (!extensionMode) {
                const t = ticket as StructuredFeedback & { description?: string };
                setPointers((prev) => [
                  { id: t.id, title: t.title, actionSteps: t.actionSteps ?? (t.description ? t.description.split("\n") : []), type: t.type },
                  ...prev,
                ]);
              }
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
      if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", active.transcript);
      pipelineActiveRef.current = true;
      onComplete(active.transcript, active.screenshot, {
        onSuccess: (ticket) => {
          pipelineActiveRef.current = false;
          if (!extensionMode) {
            const t = ticket as StructuredFeedback & { description?: string };
            setPointers((prev) => [
              { id: t.id, title: t.title, actionSteps: t.actionSteps ?? (t.description ? t.description.split("\n") : []), type: t.type },
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
          setErrorMessage("AI processing failed.");
          setState("voice_listening");
        },
      }, active.context ?? undefined);
      return;
    }
    setState("processing");
    if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", active.transcript);
    try {
      const structured = await onComplete(active.transcript, active.screenshot);
      if (!structured) {
        setState("idle");
        removeCaptureRoot();
        restoreWidget();
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
    } catch (err) {
      console.error(err);
      setErrorMessage("AI processing failed.");
      setState("voice_listening");
    }
  }, [onComplete, extensionMode, removeCaptureRoot, restoreWidget]);

  const discardListening = useCallback(() => {
    echlyLog("RECORDING", "discard");
    recordingActiveRef.current = false;
    if (extensionMode && pointersPropRef.current) {
      setPointers(pointersPropRef.current);
    }
    recognitionRef.current?.stop();
    const activeId = activeRecordingIdRef.current;
    setRecordings((prev) => prev.filter((r) => r.id !== activeId));
    setActiveRecordingId(null);
    setState("cancelled");
    removeCaptureRoot();
    restoreWidget();
  }, [extensionMode, removeCaptureRoot, restoreWidget]);

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

    if (!environment?.authenticatedFetch) {
      throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch required for saveEdit).");
    }
    try {
      console.log("[ECHLY CORE] fetch via environment");
      const res = await environment.authenticatedFetch(`/api/tickets/${id}`, {
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
  }, [editedTitle, editedSteps, environment]);

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
        if (!environment?.authenticatedFetch) {
          throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch or onUpdate required).");
        }
        console.log("[ECHLY CORE] fetch via environment");
        const res = await environment.authenticatedFetch(`/api/tickets/${id}`, {
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
    [onUpdate, environment]
  );

  /* ================= CAPTURE ================= */

  const getFullTabImage = useCallback(async (): Promise<string | null> => {
    if (!environment?.captureTabScreenshot) {
      console.error("[ECHLY CORE] No capture environment available (captureTabScreenshot required).");
      return null;
    }
    console.log("[ECHLY CORE] screenshot via environment");
    const hidden = hideEchlyUI();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    try {
      const screenshot = await environment.captureTabScreenshot();
      return screenshot ?? null;
    } catch (err) {
      console.warn("Screenshot error ignored:", err);
      return null;
    } finally {
      restoreEchlyUI(hidden);
    }
  }, [environment]);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!environment?.captureTabScreenshot) {
      console.error("[ECHLY CORE] No capture environment available (captureTabScreenshot required).");
      return null;
    }
    console.log("[ECHLY CORE] screenshot via environment");
    return getFullTabImage();
  }, [environment, getFullTabImage]);

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
    console.log("[ECHLY UX] startSession clicked");

    // Prevent double-clicks while starting
    if (sessionStatusRef.current === "starting") return;
    if (stateRef.current !== "idle" || sessionModeRef.current || globalSessionModeActive) return;

    // STEP 1: INSTANT UI RESPONSE
    setSessionStatus("starting");

    if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "startSession" });
    setPending(null);
    setSessionFeedbackSaving(false);
    setPausePending(false);
    setEndPending(false);

    echlyLog("SESSION", "start");
    if (ECHLY_DEBUG) console.log("[Echly] Start New Feedback Session clicked");
    logSession("start");

    try {
      if (ensureAuthenticated && !(await ensureAuthenticated())) {
        setSessionStatus("idle");
        return;
      }

      console.log("[ECHLY UX] creating session...");

      const result = environment
        ? await environment.createSession()
        : extensionMode && onCreateSession
          ? await onCreateSession()
          : null;

      if (result && "limitReached" in result && result.limitReached) {
        setSessionStatus("idle");
        setSessionLimitReached({
          message: result.message,
          upgradePlan: result.upgradePlan,
        });
        return;
      }

      if (!result || !("id" in result) || !result.id) {
        throw new Error("Session creation failed");
      }

      // STEP 2: FINALIZE (result narrowed to { id: string })
      if (environment) {
        await environment.setActiveSession?.(result.id);
        setPointers([]);
        await environment.startSessionMode?.();
      } else if (extensionMode && onActiveSessionChange) {
        onActiveSessionChange(result.id);
        setPointers([]);
        onSessionModeStart?.();
      }

      onSessionViewRequested?.();
      setSessionLimitReached(null);
      setSessionStatus("active");
    } catch (e) {
      console.error("[ECHLY UX] startSession failed", e);
      setSessionStatus("idle");
    }
  }, [
    environment,
    extensionMode,
    onCreateSession,
    onActiveSessionChange,
    ensureAuthenticated,
    onSessionModeStart,
    onSessionViewRequested,
    globalSessionModeActive,
    setPending,
  ]);

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
      if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "endSession finalizeEnd" });
      setPending(null);
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

  /** Root lifecycle: extension uses globalSessionModeActive; dashboard creates root in startCapture, never removes here. */
  useEffect(() => {
    if (globalSessionModeActive) {
      createCaptureRoot();
    } else if (extensionMode) {
      removeCaptureRoot();
    }
  }, [globalSessionModeActive, extensionMode, createCaptureRoot, removeCaptureRoot]);

  /**
   * Sync session mode from global state (ECHLY_GLOBAL_STATE).
   * Root lifecycle is handled by the dedicated effect above.
   */
  useEffect(() => {
    if (!extensionMode || globalSessionModeActive === undefined) return;
    echlyLog("SESSION", "global sync", { active: globalSessionModeActive, paused: globalSessionPaused });
    if (globalSessionModeActive === true) {
      setSessionMode(true);
      setSessionPaused(globalSessionPaused ?? false);
      setSessionStatus("active");
      if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
        if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "global sync (session active)" });
        setPending(null);
      } else {
        if (ECHLY_DEBUG) console.log("ECHLY pending clear skipped during capture");
      }
      setEndPending(false);
    }
    if (globalSessionPaused === true) {
      setSessionPaused(true);
      setPausePending(false);
    }
    if (globalSessionModeActive === false) {
      setSessionMode(false);
      setSessionPaused(false);
      setSessionStatus("idle");
      setPausePending(false);
      setEndPending(false);
      if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
        if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "global sync (session ended)" });
        setPending(null);
      } else {
        if (ECHLY_DEBUG) console.log("ECHLY pending clear skipped during capture");
      }
      setSessionFeedbackSaving(false);
      removeAllMarkers();
    }
  }, [extensionMode, globalSessionModeActive, globalSessionPaused]);

  /** When globalSessionPaused changes while session mode is active, sync local paused state. */
  useEffect(() => {
    if (extensionMode && globalSessionModeActive && globalSessionPaused !== undefined) {
      setSessionPaused(globalSessionPaused);
      if (globalSessionPaused) {
        setPausePending(false);
        setExpandedId(null);
        setHighlightTicketId(null);
        /* Force tray to refresh with latest pointers from background (fixes Pause → tray not updating). */
        if (pointersPropRef.current) {
          setTimeout(() => {
            setPointers([...(pointersPropRef.current ?? [])]);
          }, 50);
        }
      }
    }
  }, [extensionMode, globalSessionModeActive, globalSessionPaused]);

  /** Extension: sync global pointers from background so tray updates in real time. Background is source of truth; content notifies via ECHLY_FEEDBACK_CREATED when tickets are created. */
  useEffect(() => {
    if (!extensionMode || pointersProp === undefined) return;
    pointersPropRef.current = pointersProp;
    setPointers(pointersProp);
    if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
      if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "pointers sync effect" });
      setPending(null);
    } else {
      if (ECHLY_DEBUG) console.log("ECHLY pending clear skipped during capture");
    }
  }, [extensionMode, pointersProp]);

  /** When parent passes loadSessionWithPointers (e.g. after Resume picker), apply once and notify. */
  useEffect(() => {
    if (!extensionMode || !loadSessionWithPointers?.sessionId) return;
    setPointers(loadSessionWithPointers.pointers ?? []);
    if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
      if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "loadSessionWithPointers" });
      setPending(null);
    } else {
      if (ECHLY_DEBUG) console.log("ECHLY pending clear skipped during capture");
    }
    onSessionLoaded?.();
  }, [extensionMode, loadSessionWithPointers, onSessionLoaded]);

  const handleSessionElementClicked = useCallback(
    async (element: Element) => {
      console.log("=== [ECHLY DEBUG] CLICK DETECTED ===");
      console.log("State:", {
        sessionMode,
        sessionPaused,
        sessionFeedbackPending,
      });
      if (sessionFeedbackPending && !captureRootRef.current) {
        if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "handleSessionElementClicked (no root)" });
        setPending(null);
        return;
      }
      console.log("=== [ECHLY DEBUG] BLOCK CHECK ===", { getFullTabImage: !!getFullTabImage, sessionFeedbackPending });
      if (!getFullTabImage || sessionFeedbackPending != null) return;
      logSession("element clicked");
      playShutterSound();
      let fullImage: string | null = null;
      try {
        fullImage = await getFullTabImage();
      } catch (err) {
        console.warn("Screenshot error ignored:", err);
        fullImage = null;
      }
      console.log("=== [ECHLY DEBUG] SCREENSHOT RESULT ===", {
        exists: !!fullImage,
        length: fullImage?.length,
      });
      console.log("=== [ECHLY DEBUG] CONTINUING TO FEEDBACK UI ===");
      console.log("Screenshot captured:", !!fullImage);
      let screenshot: string | undefined = undefined;
      console.log("=== [ECHLY DEBUG] BLOCK CHECK ===", fullImage);
      if (fullImage) {
        const containerRect = detectVisualContainer(element);
        const safeRect = clampRect({
          x: containerRect.x,
          y: containerRect.y,
          w: containerRect.width,
          h: containerRect.height,
        });
        if (ECHLY_DEBUG) {
          console.log("ECHLY ELEMENT DETECTED", element);
          console.log("ECHLY CONTAINER RECT", safeRect);
        }
        try {
          const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
          screenshot = await cropImageToRegion(fullImage, safeRect, dpr);
        } catch (err) {
          console.warn("Crop failed — continuing without screenshot", err);
        }
      }
      const context = buildCaptureContext(window, element);
      const rect = element.getBoundingClientRect();
      const elementRect = {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
      lastSessionClickedElementRef.current = element instanceof HTMLElement ? element : null;
      if (ECHLY_DEBUG) console.log("ECHLY pending SET", { screenshot: !!screenshot, context });
      sessionFeedbackPendingRef.current = true;
      setPending({ screenshot: screenshot || undefined, context, elementRect });
      onSessionActivity?.();
    },
    [getFullTabImage, sessionFeedbackPending, onSessionActivity]
  );

  const handleSessionFeedbackSubmit = useCallback(
    (transcript: string) => {
      const pending = sessionFeedbackPending;
      if (!pending || !transcript || transcript.trim().length === 0) {
        if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "handleSessionFeedbackSubmit (invalid)" });
        setPending(null);
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

      if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "handleSessionFeedbackSubmit (submit)" });
      setPending(null);
      setSessionFeedbackSaving(true);
      setState("idle");
      lastSessionClickedElementRef.current = null;

      /* Send to structure-feedback async; update marker and list when done. */
      if (ECHLY_DEBUG) console.log("[VOICE] final transcript sent to pipeline:", transcript);
      try {
        pipelineActiveRef.current = true;
        onComplete(transcript, pending.screenshot ?? null, {
          onSuccess: (ticket) => {
            pipelineActiveRef.current = false;
            setSessionFeedbackSaving(false);
            if (root) {
              updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
            }
            if (!extensionMode) {
              const t = ticket as StructuredFeedback & { description?: string };
              setPointers((prev) => [
                { id: t.id, title: t.title, actionSteps: t.actionSteps ?? (t.description ? t.description.split("\n") : []), type: t.type },
                ...prev,
              ]);
            }
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
    if (ECHLY_DEBUG) console.log("ECHLY pending CLEARED", { reason: "handleSessionFeedbackCancel" });
    recognitionRef.current?.stop();
    recordingActiveRef.current = false;
    pipelineActiveRef.current = false;
    const activeId = activeRecordingIdRef.current;
    if (activeId) {
      setRecordings((prev) => prev.filter((r) => r.id !== activeId));
      setActiveRecordingId(null);
    }
    setPending(null);
    setSessionFeedbackSaving(false);
    setState("idle");
  }, [setPending]);

  const handleSessionStartVoice = useCallback(() => {
    const pending = sessionFeedbackPending;
    if (!pending) return;
    const id = generateRecordingId();
    const newRecording: Recording = {
      id,
      screenshot: pending.screenshot ?? null,
      transcript: "",
      structuredOutput: null,
      context: pending.context ?? null,
      createdAt: Date.now(),
    };
    setRecordings((prev) => [...prev, newRecording]);
    setActiveRecordingId(id);
    startListening();
  }, [sessionFeedbackPending, startListening]);

  /** Starts capture flow: idle → focus_mode. Used by dashboard "Capture feedback"; region overlay then handles selection. */
  const startCapture = useCallback(() => {
    if (stateRef.current !== "idle") return;
    setErrorMessage(null);
    recognitionRef.current?.stop();
    setWidgetOpenBeforeCapture(isOpen);
    setIsOpenState(false);
    createCaptureRoot();
    setState("focus_mode");
  }, [isOpen, createCaptureRoot]);

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
    let screenshot: string | null = null;
    try {
      screenshot = await captureScreenshot();
    } catch (err) {
      console.warn("Screenshot error ignored:", err);
      screenshot = null;
    }
    console.log("Screenshot captured:", !!screenshot);
    const id = generateRecordingId();
    const newRecording: Recording = {
      id,
      screenshot: screenshot ?? null,
      transcript: "",
      structuredOutput: null,
      createdAt: Date.now(),
    };
    setRecordings((prev) => [...prev, newRecording]);
    setActiveRecordingId(id);
    startListening();
  }, [
    extensionMode,
    isOpen,
    captureScreenshot,
    startListening,
    createCaptureRoot,
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
      startCapture,
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
      setSessionLimitReached,
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
      startCapture,
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
      setSessionLimitReached,
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
      sessionStatus,
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
      sessionLimitReached,
      audioAnalyser,
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
