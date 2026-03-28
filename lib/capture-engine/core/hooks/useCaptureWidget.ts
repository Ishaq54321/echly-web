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
  VoiceCaptureError,
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
import { logger } from "@/lib/logger";
import { getOrCreateShareLink } from "@/lib/share/getOrCreateShareLink";

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

function isTranscriptUsable(transcript: unknown): transcript is string {
  return typeof transcript === "string" && transcript.trim().length >= 3;
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
  userId,
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
  onVoiceMicrophoneSelect,
  captureRootParent,
  environment,
  assertIdentityBeforeWorkspaceMutations,
}: CaptureWidgetProps) {
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
  const [startSessionPending, setStartSessionPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const [pausePending, setPausePending] = useState(false);
  const [endPending, setEndPending] = useState(false);
  const [sessionFeedbackPending, setSessionFeedbackPending] = useState<SessionFeedbackPending | null>(captureState.pending);
  const [sessionFeedbackSaving, setSessionFeedbackSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionLimitReached, setSessionLimitReached] = useState<{
    message?: string;
    upgradePlan?: unknown;
  } | null>(null);
  const [voiceError, setVoiceError] = useState<VoiceCaptureError>(null);
  const [micDeviceOverride, setMicDeviceOverride] = useState<string | null>(null);

  const sessionMode = globalSessionModeActive ?? false;
  const sessionPaused = globalSessionPaused ?? false;

  const guardWorkspaceMutation = useCallback(() => {
    if (!assertIdentityBeforeWorkspaceMutations) {
      throw new Error("Identity guard missing in capture widget");
    }
    assertIdentityBeforeWorkspaceMutations();
  }, [assertIdentityBeforeWorkspaceMutations]);

  const sessionStatus: "idle" | "starting" | "active" = sessionMode
    ? "active"
    : startSessionPending
      ? "starting"
      : "idle";
  const sessionModeRef = useRef(sessionMode);
  const sessionPausedRef = useRef(sessionPaused);
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeRecordingIdRef = useRef<string | null>(null);
  const recordingsRef = useRef<Recording[]>(recordings);
  const stateRef = useRef<CaptureState>(state);
  const pipelineActiveRef = useRef(false);
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
  /** True while in voice_listening (or equivalent) so overlay/effects do not tear down during recording. */
  const recordingActiveRef = useRef(false);
  /** True when sessionFeedbackPending is set (capture UI visible); used to protect from spurious clears. */
  const sessionFeedbackPendingRef = useRef(false);
  /** Prevent duplicate Start Session requests before React state updates land. */
  const startSessionPendingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    sessionFeedbackPendingRef.current = sessionFeedbackPending != null;
  }, [sessionFeedbackPending]);

  useEffect(() => {
    if (!sessionFeedbackPending) {
      setIsFinishing(false);
    }
  }, [sessionFeedbackPending]);

  /** Sync pending to global store so it survives React remounts. */
  const setPending = useCallback((value: SessionFeedbackPending | null) => {
    captureState.pending = value;
    setSessionFeedbackPending(value);
  }, []);

  /** Restore persisted capture state on mount (e.g. after widget remount). */
  useEffect(() => {
    if (captureState.pending) {
      logger.debug("extension", "restoring_pending_capture_state");
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

  const stopListeningAudio = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close().catch((err) => {
      logger.error("error", "audio_context_close_failed", err);
    });
    audioContextRef.current = null;
    analyserRef.current = null;
    setAudioAnalyser(null);
    setListeningAudioLevel(0);
  }, []);

  /** Audio level loop while voice_listening and not finishing */
  useEffect(() => {
    if (state !== "voice_listening" || isFinishing) {
      stopListeningAudio();
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
  }, [state, isFinishing, stopListeningAudio]);

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
      if (ECHLY_DEBUG) console.debug("ECHLY createCaptureRoot", "noop (ref already set)");
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
      logger.debug("extension", "pending_cleared", { reason: "create_capture_root" });
      setPending(null);
    } else {
      logger.debug("extension", "pending_clear_noop");
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
        logger.error("error", "capture_widget_error", err);
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

  const pointers = useMemo(
    () => pointersProp ?? loadSessionWithPointers?.pointers ?? initialPointers ?? [],
    [pointersProp, loadSessionWithPointers?.pointers, initialPointers]
  );

  /* ================= LISTEN ================= */

  const startListening = useCallback(async () => {
    echlyLog("RECORDING", "start");
    setVoiceError(null);
    const startTime = Date.now();
    voiceStartTimeRef.current = startTime;
    logger.debug("voice", "recording_started", { startTime });
    try {
      // Enumerate devices only when user starts voice (user gesture); avoids permission popup on page load.
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === "audioinput");
      const deviceList = inputs.map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${inputs.indexOf(d) + 1}`,
      }));
      onDevicesEnumerated?.(deviceList);
      const effectiveMicId = micDeviceOverride ?? selectedMicrophoneId ?? undefined;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:
          effectiveMicId && effectiveMicId.length > 0
            ? { deviceId: { exact: effectiveMicId } }
            : true,
      });
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
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onerror = (event) => {
        logger.error("error", "voice_recording_error", event);
      };
      mediaRecorder.start();
      logger.debug("voice", "recording_started");
      recordingActiveRef.current = true;
      setIsFinishing(false);
      setState("voice_listening");
      setListeningAudioLevel(0);
    } catch (err) {
      logger.error("error", "microphone_permission_denied", err);
      recordingActiveRef.current = false;
      if (sessionFeedbackPendingRef.current) {
        setVoiceError("mic_permission");
        setState("idle");
        return;
      }
      setErrorMessage("Microphone permission denied.");
      setState("error");
      removeCaptureRoot();
      restoreWidget();
    }
  }, [selectedMicrophoneId, micDeviceOverride, onDevicesEnumerated, removeCaptureRoot, restoreWidget]);

  const retryVoiceCapture = useCallback(() => {
    setVoiceError(null);
    setErrorMessage(null);
    startListening();
  }, [startListening]);

  const selectVoiceMicrophone = useCallback(
    (deviceId: string) => {
      if (!deviceId) return;
      onVoiceMicrophoneSelect?.(deviceId);
      setMicDeviceOverride(deviceId);
    },
    [onVoiceMicrophoneSelect]
  );

  const finishListening = useCallback(async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    echlyLog("RECORDING", "finish requested");
    recordingActiveRef.current = false;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
    playDoneClick();
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) {
      stopListeningAudio();
      setState("idle");
      setIsFinishing(false);
      return;
    }
    const activeId = activeRecordingIdRef.current;
    if (!activeId) {
      try {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      } catch (err) {
        logger.error("error", "media_recorder_stop_failed", err);
      }
      stopListeningAudio();
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      setState("idle");
      setIsFinishing(false);
      return;
    }
    mediaRecorder.onstop = async () => {
      logger.debug("voice", "recording_stopped");
      const audioFile = new File(audioChunksRef.current, "recording.webm", {
        type: "audio/webm",
      });
      const voiceFailurePanelOpen = sessionFeedbackPendingRef.current;
      logger.debug("voice", "file_created", {
        size: audioFile.size,
        type: audioFile.type,
        isFile: audioFile instanceof File,
      });
      try {
        const formData = new FormData();
        formData.append("file", audioFile);
        logger.debug("voice", "transcription_started");
        if (!environment?.authenticatedFetch) {
          throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch required for transcription).");
        }
        guardWorkspaceMutation();
        const res = await environment.authenticatedFetch("/api/transcribe-audio", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        let data: { transcript?: string; error?: string } = {};
        try {
          data = (await res.json()) as { transcript?: string; error?: string };
        } catch {
          data = {};
        }
        if (!res.ok) {
          logger.error("error", "voice_transcription_http_failed", { status: res.status });
          logger.error("voice", "transcription_failed", { status: res.status });
          const noSpeech =
            res.status === 400 && data?.error === "NO_SPEECH_DETECTED";
          if (voiceFailurePanelOpen) {
            setVoiceError(noSpeech ? "no_audio" : "transcription_failed");
          } else {
            setErrorMessage(
              noSpeech
                ? "We didn't detect clear audio. Try again."
                : "Transcription failed. Try again."
            );
          }
          setState("idle");
          return;
        }
        const transcript = data?.transcript;
        if (!isTranscriptUsable(transcript)) {
          logger.error("error", "voice_invalid_transcript");
          logger.error("voice", "transcription_failed");
          if (voiceFailurePanelOpen) {
            setVoiceError("no_audio");
          } else {
            setErrorMessage("We didn't detect clear audio. Try again.");
          }
          setState("idle");
          return;
        }
        logger.debug("voice", "transcription_success", { length: transcript.length });

        const currentRecordings = recordingsRef.current;
        const active = currentRecordings.find((r) => r.id === activeId);
        if (!active) {
          setState("idle");
          return;
        }
        setRecordings((prev) =>
          prev.map((r) => (r.id === activeId ? { ...r, transcript } : r))
        );

        if (extensionMode) {
          const isSessionFeedback = sessionModeRef.current;
          if (isSessionFeedback) {
            setPending(null);
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
            setSessionFeedbackSaving(true);
            setRecordings((prev) => prev.filter((r) => r.id !== activeId));
            setActiveRecordingId(null);
            setState("idle");
            lastSessionClickedElementRef.current = null;
            try {
              pipelineActiveRef.current = true;
              logger.debug("ai", "processing_started", { source: "voice_session_mode" });
              onComplete(transcript, active.screenshot, {
                onSuccess: (ticket) => {
                  pipelineActiveRef.current = false;
                  logger.debug("ai", "processing_success", { ticketId: ticket.id });
                  setSessionFeedbackSaving(false);
                  if (root) updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
                  setHighlightTicketId(ticket.id);
                  setTimeout(() => setHighlightTicketId(null), 1200);
                },
                onError: () => {
                  pipelineActiveRef.current = false;
                  logger.error("ai", "processing_failed");
                  setSessionFeedbackSaving(false);
                  if (root) removeMarker(placeholderId);
                  setErrorMessage("AI processing failed.");
                },
              }, active.context ?? undefined, { sessionMode: true });
            } catch (error) {
              pipelineActiveRef.current = false;
              setSessionFeedbackSaving(false);
              if (root) removeMarker(placeholderId);
              logger.error("error", "ai_processing_failed", error);
              logger.error("ai", "processing_failed");
              setErrorMessage("AI processing failed.");
            }
            return;
          }
          setState("processing");
          pipelineActiveRef.current = true;
          logger.debug("ai", "processing_started", { source: "voice" });
          onComplete(transcript, active.screenshot, {
            onSuccess: (ticket) => {
              pipelineActiveRef.current = false;
              logger.debug("ai", "processing_success", { ticketId: ticket.id });
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
              logger.error("ai", "processing_failed");
              setErrorMessage("AI processing failed.");
              setState("voice_listening");
            },
          }, active.context ?? undefined);
          return;
        }
        setState("processing");
        logger.debug("ai", "processing_started", { source: "voice" });
        try {
          const structured = await onComplete(transcript, active.screenshot);
          if (!structured) {
            logger.error("ai", "processing_failed");
            setState("idle");
            removeCaptureRoot();
            restoreWidget();
            return;
          }
          logger.debug("ai", "processing_success", { ticketId: structured.id });
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
          logger.error("error", "ai_processing_failed", err);
          logger.error("ai", "processing_failed");
          setErrorMessage("AI processing failed.");
          setState("voice_listening");
        }
      } catch (error) {
        logger.error("error", "voice_transcription_failed", error);
        logger.error("voice", "transcription_failed");
        if (voiceFailurePanelOpen) {
          setVoiceError("transcription_failed");
        } else {
          setErrorMessage("Transcription failed. Try again.");
        }
        setState("idle");
      } finally {
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        setIsFinishing(false);
      }
    };
    try {
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      stopListeningAudio();
    } catch (error) {
      logger.error("error", "voice_stop_failed", error);
      stopListeningAudio();
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      setState("idle");
      setIsFinishing(false);
    }
  }, [
    isFinishing,
    onComplete,
    extensionMode,
    removeCaptureRoot,
    restoreWidget,
    environment,
    setPending,
    stopListeningAudio,
    guardWorkspaceMutation,
  ]);

  const discardListening = useCallback(() => {
    echlyLog("RECORDING", "discard");
    setVoiceError(null);
    recordingActiveRef.current = false;
    setIsFinishing(false);
    const recorder = mediaRecorderRef.current;
    try {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    } catch (error) {
      logger.error("error", "voice_stop_failed", error);
    }
    stopListeningAudio();
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    const activeId = activeRecordingIdRef.current;
    setRecordings((prev) => prev.filter((r) => r.id !== activeId));
    setActiveRecordingId(null);
    setState("cancelled");
    removeCaptureRoot();
    restoreWidget();
  }, [removeCaptureRoot, restoreWidget, stopListeningAudio]);

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
      guardWorkspaceMutation();
      const origin = window.location.origin;
      const url = await getOrCreateShareLink({
        sessionId,
        userId,
        origin,
      });
      await navigator.clipboard.writeText(url);
    } catch (err) {
      logger.error("error", "share_clipboard_failed", err);
    }
  }, [sessionId, userId, guardWorkspaceMutation]);

  const resetSession = useCallback(() => {
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
    } catch (err) {
      logger.error("error", "delete_failed", err);
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

    if (!environment?.authenticatedFetch) {
      throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch required for saveEdit).");
    }
    try {
      logger.debug("extension", "api_fetch_feedback");
      guardWorkspaceMutation();
      const res = await environment.authenticatedFetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || editedTitle, actionSteps }),
      });
      const data = (await res.json()) as { success?: boolean; ticket?: { id: string; title: string; actionSteps?: string[]; type?: string } };
      if (!res.ok || !data.success || !data.ticket) {
        throw new Error("Save failed: API_ERROR_" + res.status);
      }
      setEditingId(null);
    } catch (err) {
      logger.error("error", "save_edit_failed", err);
      setEditingId(id);
      setErrorMessage("Could not save changes. Try again.");
    }
  }, [editedTitle, editedSteps, environment, guardWorkspaceMutation]);

  const updatePointer = useCallback(
    async (id: string, payload: { title: string; actionSteps: string[] }) => {
      try {
        if (onUpdate) {
          await onUpdate(id, payload);
          return;
        }
        if (!environment?.authenticatedFetch) {
          throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch or onUpdate required).");
        }
        logger.debug("extension", "api_fetch_feedback");
        guardWorkspaceMutation();
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
      } catch (err) {
        logger.error("error", "ticket_update_failed", err);
        throw err;
      }
    },
    [onUpdate, environment, guardWorkspaceMutation]
  );

  /* ================= CAPTURE ================= */

  const getFullTabImage = useCallback(async (): Promise<string | null> => {
    if (!environment?.captureTabScreenshot) {
      logger.error("error", "capture_environment_missing_for_screenshot");
      return null;
    }
    logger.debug("extension", "screenshot_capture_started");
    const hidden = hideEchlyUI();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    try {
      const screenshot = await environment.captureTabScreenshot();
      return screenshot ?? null;
    } catch (err) {
      logger.warn("extension", "screenshot_capture_failed", err);
      return null;
    } finally {
      restoreEchlyUI(hidden);
    }
  }, [environment]);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!environment?.captureTabScreenshot) {
      logger.error("error", "capture_environment_missing_for_screenshot");
      return null;
    }
    logger.debug("extension", "screenshot_capture_started");
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
    // Prevent double-clicks while starting
    if (startSessionPendingRef.current) return;
    if (stateRef.current !== "idle" || sessionModeRef.current || globalSessionModeActive) return;
    startSessionPendingRef.current = true;

    // STEP 1: INSTANT UI RESPONSE (do not switch screens or reset UI until API resolves)
    setStartSessionPending(true);
    setErrorMessage(null);

    setPending(null);
    setSessionFeedbackSaving(false);
    setPausePending(false);
    setEndPending(false);

    echlyLog("SESSION", "start");
    logSession("start");

    try {
      if (extensionMode && typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        const authState = await new Promise<{ authenticated?: boolean } | null>((resolve) => {
          chrome.runtime.sendMessage(
            { type: "GET_AUTH_STATE" },
            (response: { authenticated?: boolean } | undefined) => {
              if (chrome.runtime.lastError) {
                resolve(null);
                return;
              }
              resolve(response ?? null);
            }
          );
        });

        if (!authState?.authenticated) {
          await new Promise<void>((resolve) => {
            chrome.runtime.sendMessage({ type: "ECHLY_TRIGGER_LOGIN" }, () => {
              resolve();
            });
          });
          setStartSessionPending(false);
          return;
        }
      } else if (ensureAuthenticated && !(await ensureAuthenticated())) {
        setStartSessionPending(false);
        return;
      }

      const result = environment
        ? await environment.createSession()
        : extensionMode && onCreateSession
          ? await onCreateSession()
          : null;

      // 403 / session limit: trigger existing upgrade flow immediately (no blink, no silent fail)
      if (result && "limitReached" in result && result.limitReached) {
        logger.debug("extension", "session_limit_reached");
        setStartSessionPending(false);
        setSessionLimitReached({
          message: result.message ?? "You've reached your session limit.",
          upgradePlan: result.upgradePlan,
        });
        return;
      }

      if (!result || !("id" in result) || !result.id) {
        throw new Error("Session creation failed");
      }

      // STEP 2: FINALIZE only after successful session creation (prevents UI blink)
      if (environment) {
        await environment.setActiveSession?.(result.id);
        await environment.startSessionMode?.();
      } else if (extensionMode && onActiveSessionChange) {
        onActiveSessionChange(result.id);
        onSessionModeStart?.();
      }

      onSessionViewRequested?.();
      setSessionLimitReached(null);
    } catch (e) {
      logger.error("error", "session_start_failed", e);
      setErrorMessage("Could not start session. Try again.");
    } finally {
      startSessionPendingRef.current = false;
      setStartSessionPending(false);
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
      setPending(null);
      setSessionFeedbackSaving(false);
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
   * React to global session state changes from background.
   * Root lifecycle is handled by the dedicated effect above.
   */
  useEffect(() => {
    if (!extensionMode || globalSessionModeActive === undefined) return;
    echlyLog("SESSION", "global sync", { active: globalSessionModeActive, paused: globalSessionPaused });
    if (globalSessionModeActive === true) {
      if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
        setPending(null);
      }
      setEndPending(false);
    }
    if (globalSessionPaused === true) {
      setPausePending(false);
    }
    if (globalSessionModeActive === false) {
      setPausePending(false);
      setEndPending(false);
      if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
        setPending(null);
      }
      setSessionFeedbackSaving(false);
      removeAllMarkers();
    }
  }, [extensionMode, globalSessionModeActive, globalSessionPaused]);

  /** When session is globally paused, clear pause-pending UI and focus state. */
  useEffect(() => {
    if (extensionMode && globalSessionModeActive && globalSessionPaused !== undefined) {
      if (globalSessionPaused) {
        setPausePending(false);
        setExpandedId(null);
        setHighlightTicketId(null);
      }
    }
  }, [extensionMode, globalSessionModeActive, globalSessionPaused]);

  /** Extension: sync global pointers from background so tray updates in real time. Background is source of truth; content notifies via ECHLY_FEEDBACK_CREATED when tickets are created. */
  useEffect(() => {
    if (!extensionMode || pointersProp === undefined) return;
    if (!pipelineActiveRef.current && !recordingActiveRef.current && !sessionFeedbackPendingRef.current) {
      setPending(null);
    }
  }, [extensionMode, pointersProp]);

  /** When parent passes loadSessionWithPointers (e.g. after Resume picker), apply once and notify. */
  useEffect(() => {
    if (!extensionMode || !loadSessionWithPointers?.sessionId) return;
    // Render-only model in extension mode: pointers are always sourced from background props.
    onSessionLoaded?.();
  }, [extensionMode, loadSessionWithPointers, onSessionLoaded]);

  const handleSessionElementClicked = useCallback(
    async (element: Element) => {
      if (sessionFeedbackPending && !captureRootRef.current) {
        setPending(null);
        return;
      }
      if (!getFullTabImage || sessionFeedbackPending != null) return;
      logSession("element clicked");
      playShutterSound();
      let fullImage: string | null = null;
      try {
        fullImage = await getFullTabImage();
      } catch (err) {
        logger.warn("extension", "screenshot_capture_failed", err);
        fullImage = null;
      }
      let screenshot: string | undefined = undefined;
      if (fullImage) {
        const containerRect = detectVisualContainer(element);
        const safeRect = clampRect({
          x: containerRect.x,
          y: containerRect.y,
          w: containerRect.width,
          h: containerRect.height,
        });
        try {
          const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
          screenshot = await cropImageToRegion(fullImage, safeRect, dpr);
        } catch (err) {
          logger.warn("extension", "screenshot_crop_failed", err);
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

      setPending(null);
      setSessionFeedbackSaving(true);
      setState("idle");
      lastSessionClickedElementRef.current = null;

      /* Send to structure-feedback async; update marker and list when done. */
      try {
        pipelineActiveRef.current = true;
        logger.debug("ai", "processing_started", { source: "text_session_mode" });
        onComplete(transcript, pending.screenshot ?? null, {
          onSuccess: (ticket) => {
            pipelineActiveRef.current = false;
            logger.debug("ai", "processing_success", { ticketId: ticket.id });
            setSessionFeedbackSaving(false);
            if (root) {
              updateMarker(placeholderId, { id: ticket.id, title: ticket.title });
            }
            setHighlightTicketId(ticket.id);
            setTimeout(() => setHighlightTicketId(null), 1200);
          },
          onError: () => {
            pipelineActiveRef.current = false;
            logger.error("ai", "processing_failed");
            setSessionFeedbackSaving(false);
            if (root) removeMarker(placeholderId);
            setErrorMessage("AI processing failed.");
          },
        }, pending.context ?? undefined, { sessionMode: true });
      } catch (error) {
        pipelineActiveRef.current = false;
        setSessionFeedbackSaving(false);
        if (root) removeMarker(placeholderId);
        logger.error("error", "ai_processing_failed", error);
        logger.error("ai", "processing_failed");
        setErrorMessage("AI processing failed.");
      }
    },
    [sessionFeedbackPending, onComplete]
  );

  const handleSessionFeedbackCancel = useCallback(() => {
    setVoiceError(null);
    setIsFinishing(false);
    const recorder = mediaRecorderRef.current;
    try {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    } catch (error) {
      logger.error("error", "voice_stop_failed", error);
    }
    stopListeningAudio();
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
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
  }, [setPending, stopListeningAudio]);

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
    const recorder = mediaRecorderRef.current;
    try {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    } catch (error) {
      logger.error("error", "voice_stop_failed", error);
    }
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    setWidgetOpenBeforeCapture(isOpen);
    setIsOpenState(false);
    createCaptureRoot();
    setState("focus_mode");
  }, [isOpen, createCaptureRoot]);

  const handleAddFeedback = useCallback(async () => {
    if (stateRef.current !== "idle") return;
    setErrorMessage(null);
    const recorder = mediaRecorderRef.current;
    try {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    } catch (error) {
      logger.error("error", "voice_stop_failed", error);
    }
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
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
      logger.warn("extension", "screenshot_capture_failed", err);
      screenshot = null;
    }
    logger.debug("extension", "screenshot_captured", { exists: !!screenshot });
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
      retryVoiceCapture,
      selectVoiceMicrophone,
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
      retryVoiceCapture,
      selectVoiceMicrophone,
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
      isFinishing,
      sessionFeedbackPending,
      sessionLimitReached,
      audioAnalyser,
      voiceError,
      voiceMicDeviceId: micDeviceOverride ?? selectedMicrophoneId ?? "",
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
