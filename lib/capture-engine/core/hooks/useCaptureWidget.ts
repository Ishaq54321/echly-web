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
  ConsoleSnapshot,
  NetworkSnapshot,
  ActionsSnapshot,
  SessionFeedbackPending,
  VoiceCaptureError,
} from "../types";
import { useMicPermissionListener } from "./useMicPermissionListener";
import { buildCaptureContext } from "../internal/contextHelpers";
import { playDoneClick, playShutterSound } from "../internal/audioHelpers";
import { logSession } from "../internal/sessionHelpers";
import {
  isMicBlockedBySitePolicy,
  isPolicyBlockError,
} from "../micSitePolicy";
import {
  detectVisualContainer,
  clampRect,
  cropImageToRegion,
  hideAnnoteUI,
  restoreAnnoteUI,
  createMarker,
  removeAllMarkers,
  updateMarker,
  removeMarker,
} from "../internal/domHelpers";
import { echlyLog } from "@/lib/debug/echlyLogger";
import { logger } from "@/lib/logger";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";

const SAFE_MARGIN = 24;
const ECHLY_MOTION = "140ms cubic-bezier(0.2, 0.8, 0.2, 1)";
const OVERLAY_ROOT_ID = "echly-capture-root";
const SHADOW_HOST_ID = "echly-shadow-host";
const SESSION_WAIT_POLL_MS = 120;

type Corner = "tl" | "tr" | "bl" | "br";

function pickCorner(x: number, y: number, width: number, height: number): Corner {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const left = centerX < vw / 2;
  const top = centerY < vh / 2;
  return left ? (top ? "tl" : "bl") : top ? "tr" : "br";
}

function cornerToPosition(corner: Corner, width: number, height: number): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = corner === "tl" || corner === "bl" ? SAFE_MARGIN : vw - width - SAFE_MARGIN;
  const y = corner === "tl" || corner === "tr" ? SAFE_MARGIN : vh - height - SAFE_MARGIN;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}


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
  feedbackLimitReached,
  triggerUpgradeShake,
  onEditTicket,
  requestConsoleSnapshot,
  requestNetworkSnapshot,
  requestActionsSnapshot,
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
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [trayCorner, setTrayCorner] = useState<Corner | null>(null);
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
  /**
   * True while startListening has invoked getUserMedia but the stream has not
   * yet attached and no error has surfaced. Powers the pill's "Waiting for
   * microphone…" copy so the user isn't staring at a flat-bar waveform with
   * a running 00:00 timer during the permission prompt.
   */
  const [isAwaitingMicrophone, setIsAwaitingMicrophone] = useState(false);
  /** Synchronous re-entry guard so the permission-grant listener can't stack
   *  concurrent retries if Chrome fires multiple change events in flight. */
  const retryInProgressRef = useRef(false);

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
  const micDeviceOverrideRef = useRef<string | null>(null);
  /** Timestamp when UI recording started (startListening called). */
  const voiceStartTimeRef = useRef<number | null>(null);
  /** True while in voice_listening (or equivalent) so overlay/effects do not tear down during recording. */
  const recordingActiveRef = useRef(false);
  /** True when sessionFeedbackPending is set (capture UI visible); used to protect from spurious clears. */
  const sessionFeedbackPendingRef = useRef(false);
  /** Prevent duplicate Start Session requests before React state updates land. */
  const startSessionPendingRef = useRef(false);
  /** Synchronous guard: prevents spam-clicks from re-entering endSession before React re-renders. */
  const isEndingRef = useRef(false);
  /** Synchronous guard: prevents spam-clicks from re-entering pauseSession before React re-renders. */
  const isPausingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    micDeviceOverrideRef.current = micDeviceOverride;
  }, [micDeviceOverride]);

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
      if (!isDragging) return;
      setIsDragging(false);
      document.body.style.userSelect = "";
      const el = widgetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const corner = pickCorner(rect.left, rect.top, rect.width, rect.height);
      setIsSnapping(true);
      setTrayCorner(corner);
      // Move the shadow host (extension only) to the snapped corner; clear inner viewport
      // coords so the widget renders at the host's origin instead of fighting it.
      const updater = (window as Window & {
        __ECHLY_UPDATE_HOST_POSITION__?: (c: "tl" | "tr" | "bl" | "br") => void;
      }).__ECHLY_UPDATE_HOST_POSITION__;
      if (extensionMode && typeof updater === "function") {
        updater(corner);
        setPosition(null);
      } else {
        setPosition(cornerToPosition(corner, rect.width, rect.height));
      }
      window.setTimeout(() => setIsSnapping(false), 220);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  /** Move the shadow host to the persisted/current corner. The host owns positioning so
   *  it can stay content-sized (a full-viewport host would intercept page clicks and
   *  break click-to-capture). The inner widget renders at the host's origin. */
  useEffect(() => {
    if (!extensionMode || !trayCorner) return;
    const updater = (window as Window & {
      __ECHLY_UPDATE_HOST_POSITION__?: (c: "tl" | "tr" | "bl" | "br") => void;
    }).__ECHLY_UPDATE_HOST_POSITION__;
    if (typeof updater !== "function") return;
    updater(trayCorner);
    setPosition(null);
  }, [extensionMode, trayCorner, isOpen]);

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
      // Belt-and-braces: if the hook unmounts while a stream is still live
      // (rare — both cancel and mode-switch handlers already call
      // stopListeningAudio), release the tracks so the browser tab's
      // recording indicator clears.
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
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
    setIsAwaitingMicrophone(true);
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
      const requestedMicId = micDeviceOverrideRef.current ?? selectedMicrophoneId ?? undefined;
      const micExistsInList =
        requestedMicId != null &&
        requestedMicId.length > 0 &&
        inputs.some((d) => d.deviceId === requestedMicId);
      const effectiveMicId = micExistsInList ? requestedMicId : undefined;
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio:
            effectiveMicId && effectiveMicId.length > 0
              ? { deviceId: { exact: effectiveMicId } }
              : true,
        });
      } catch (err) {
        // Selected mic may have been unplugged between enumeration and use; fall back to system default.
        if (effectiveMicId) {
          console.warn("[ECHLY:MIC] selected mic failed, falling back to default", err);
          try { localStorage.removeItem("annote:selectedMic"); } catch { /* noop */ }
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw err;
        }
      }
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
      setIsAwaitingMicrophone(false);
    } catch (err) {
      setIsAwaitingMicrophone(false);
      // A site-level Permissions-Policy block is not a denial we can recover
      // from — surface it as its own error so the pill shows the honest
      // "switch to Write" panel instead of a doomed Try-again loop.
      const siteBlocked =
        isMicBlockedBySitePolicy() || isPolicyBlockError(err);
      if (siteBlocked) {
        console.warn(
          "[Annote] Microphone blocked by site Permissions-Policy. " +
            "This site has disabled microphone via HTTP header — no user action can override.",
        );
      }
      logger.error("error", "microphone_permission_denied", {
        name: (err as Error)?.name,
        message: (err as Error)?.message,
        siteBlocked,
      });
      recordingActiveRef.current = false;
      if (sessionFeedbackPendingRef.current) {
        setVoiceError(siteBlocked ? "site_blocked" : "mic_permission");
        setState("idle");
        return;
      }
      setErrorMessage("Microphone permission denied.");
      setState("error");
      removeCaptureRoot();
      restoreWidget();
    }
  }, [selectedMicrophoneId, onDevicesEnumerated, removeCaptureRoot, restoreWidget]);

  const retryVoiceCapture = useCallback(() => {
    setVoiceError(null);
    setErrorMessage(null);
    startListening();
  }, [startListening]);

  /**
   * Why this listener exists: when the user clicks "Allow this time" in
   * Chrome's mic prompt AFTER getUserMedia has already rejected (or while
   * it's still pending), nothing in the recording flow was previously
   * subscribed to the Permissions API. The pill would stay stuck on the
   * error panel or the flat-bar waveform until the user manually clicked
   * "Try again" or reopened the pill. This listener observes the
   * permission flip and auto-retries startListening so the recording
   * resumes without any extra user gesture.
   *
   * Gated to only run while we're in a stalled state (awaiting the prompt
   * or already showing the mic_permission error panel), so a stray
   * permission change during normal recording cannot interrupt it.
   * Out of scope: granted→denied mid-recording (revocation), and
   * multi-tab coordination — see audit Resolution.
   */
  const micListenerEnabled =
    isAwaitingMicrophone || voiceError === "mic_permission";

  useMicPermissionListener({
    enabled: micListenerEnabled,
    onChange: (next) => {
      logger.debug("capture-widget-permission-listener", "fired", {
        next,
        voiceError,
        isAwaitingMicrophone,
        state: stateRef.current,
      });
      if (next !== "granted") return;
      if (stateRef.current === "voice_listening") return;
      if (retryInProgressRef.current) return;
      retryInProgressRef.current = true;
      logger.debug("capture-widget-permission-listener", "auto_retry");
      try {
        retryVoiceCapture();
      } finally {
        // startListening is async; release the guard on the next tick so
        // an immediate duplicate change event is dropped but the next real
        // failure→grant cycle can re-arm.
        setTimeout(() => {
          retryInProgressRef.current = false;
        }, 0);
      }
    },
  });

  /** Reset mid-recording: stop current MediaRecorder, discard buffer, restart fresh on the same mic. */
  const resetVoiceRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    try {
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }
    } catch (err) {
      logger.error("error", "voice_reset_stop_failed", err);
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    stopListeningAudio();
    await new Promise<void>((resolve) => setTimeout(resolve, 120));
    await startListening();
  }, [stopListeningAudio, startListening]);

  const selectVoiceMicrophone = useCallback(
    async (deviceId: string) => {
      if (!deviceId) return;
      onVoiceMicrophoneSelect?.(deviceId);
      micDeviceOverrideRef.current = deviceId;
      setMicDeviceOverride(deviceId);

      if (stateRef.current === "voice_listening") {
        try {
          const recorder = mediaRecorderRef.current;
          if (recorder && recorder.state !== "inactive") {
            recorder.ondataavailable = null;
            recorder.onstop = null;
            recorder.stop();
          }
          mediaRecorderRef.current = null;
          audioChunksRef.current = [];
          stopListeningAudio();
          await new Promise<void>((resolve) => setTimeout(resolve, 150));
          await startListening();
        } catch (err) {
          console.error("[ECHLY] Failed to switch microphone mid-recording:", err);
        }
      }
    },
    [onVoiceMicrophoneSelect, stopListeningAudio, startListening]
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
        let data: {
          data?: { transcript?: string };
          error?: { code?: string; message?: string };
        } = {};
        try {
          data = (await res.json()) as {
            data?: { transcript?: string };
            error?: { code?: string; message?: string };
          };
        } catch {
          data = {};
        }
        if (!res.ok) {
          logger.error("error", "voice_transcription_http_failed", { status: res.status });
          logger.error("voice", "transcription_failed", { status: res.status });
          const noSpeech =
            res.status === 400 && data?.error?.message === "NO_SPEECH_DETECTED";
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
        const transcript = data?.data?.transcript;
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
                    if (marker.id.startsWith("pending-")) {
                      setHighlightTicketId(marker.id);
                      setExpandedId(marker.id);
                      return;
                    }
                    setHighlightTicketId(marker.id);
                    setExpandedId(marker.id);
                    onEditTicket?.(marker.id);
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
          }, active.context ?? buildCaptureContext(window, null));
          return;
        }
        setState("processing");
        logger.debug("ai", "processing_started", { source: "voice" });
        try {
          // No element was clicked on this path — still give the interpreter
          // page-level grounding (URL, title, h1, viewport).
          const structured = await onComplete(
            transcript,
            active.screenshot,
            undefined,
            active.context ?? buildCaptureContext(window, null)
          );
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
    setIsAwaitingMicrophone(false);
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
      const url = `${window.location.origin}/session/${encodeURIComponent(sessionId)}`;
      await navigator.clipboard.writeText(url);
    } catch (err) {
      logger.error("error", "share_clipboard_failed", err);
    }
  }, [sessionId, guardWorkspaceMutation]);

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
    setEditedDescription(p.description ?? "");
  }, []);

  const saveEdit = useCallback(async (id: string) => {
    const title = editedTitle.trim() || editedTitle;
    const description = editedDescription;

    if (!environment?.authenticatedFetch) {
      throw new Error("[ECHLY CORE] No capture environment available (authenticatedFetch required for saveEdit).");
    }
    try {
      logger.debug("extension", "api_fetch_feedback");
      guardWorkspaceMutation();
      const res = await environment.authenticatedFetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || editedTitle, description }),
      });
      const raw = await res.json();
      if (!res.ok) {
        throw new Error("Save failed: API_ERROR_" + res.status);
      }
      requireApiSuccessData<{
        ticket: { id: string; title: string; description?: string; type?: string };
      }>(raw).ticket;
      setEditingId(null);
    } catch (err) {
      logger.error("error", "save_edit_failed", err);
      setEditingId(id);
      setErrorMessage("Could not save changes. Try again.");
    }
  }, [editedTitle, editedDescription, environment, guardWorkspaceMutation]);

  const updatePointer = useCallback(
    async (id: string, payload: { title: string; description?: string; tags?: string[] }) => {
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
            description: payload.description,
            tags: payload.tags,
          }),
        });
        const raw = await res.json();
        if (!res.ok) throw new Error("Update failed");
        requireApiSuccessData<{
          ticket: { id: string; title: string; description?: string; type?: string };
        }>(raw);
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
    const hidden = hideAnnoteUI();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setTimeout(() => resolve(), 80)
        )
      )
    );
    try {
      const screenshot = await environment.captureTabScreenshot();
      return screenshot ?? null;
    } catch (err) {
      logger.warn("extension", "screenshot_capture_failed", err);
      return null;
    } finally {
      restoreAnnoteUI(hidden);
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
    if (isPausingRef.current) return;
    if (
      (!sessionModeRef.current && !globalSessionModeActive) ||
      sessionPausedRef.current ||
      pausePending ||
      endPending
    ) {
      return;
    }
    isPausingRef.current = true;
    setPausePending(true);
    echlyLog("SESSION", "pause requested");

    const finalizePause = () => {
      echlyLog("SESSION", "pause finalized");
      clearSessionWaitTimeout("pause");
      logSession("pause");
      try {
        onSessionModePause?.();
      } catch {
        // silent
      } finally {
        isPausingRef.current = false;
        setPausePending(false);
      }
    };

    if (pipelineActiveRef.current) {
      clearSessionWaitTimeout("pause");

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

  const endSession = useCallback((afterEnd?: () => void, options?: { soft?: boolean }) => {
    if (isEndingRef.current) return;
    if ((!sessionModeRef.current && !globalSessionModeActive) || endPending) return;
    isEndingRef.current = true;
    setEndPending(true);
    echlyLog("SESSION", "end requested");

    const finalizeEnd = () => {
      echlyLog("SESSION", "end finalized");
      clearSessionWaitTimeout("end");
      logSession("end");
      setPausePending(false);
      setPending(null);
      setSessionFeedbackSaving(false);
      if (!options?.soft) {
        onSessionModeEnd?.();
      }
      afterEnd?.();
    };

    if (pipelineActiveRef.current) {
      clearSessionWaitTimeout("end");
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
      if (!isEndingRef.current) {
        setEndPending(false);
      }
    }
    if (globalSessionPaused === true) {
      if (!isPausingRef.current) {
        setPausePending(false);
      }
    }
    if (globalSessionModeActive === false) {
      setPausePending(false);
      setEndPending(false);
      isEndingRef.current = false;
      isPausingRef.current = false;
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
      if (feedbackLimitReached) {
        triggerUpgradeShake?.();
        return;
      }
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
      let safeRect: { x: number; y: number; w: number; h: number } | null = null;
      const clickedRect = element.getBoundingClientRect();
      if (fullImage) {
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const containerRect = detectVisualContainer(element);

        let cropX = containerRect.x;
        let cropY = containerRect.y;
        let cropW = containerRect.width;
        let cropH = containerRect.height;

        if (cropW / viewportW > 0.70 || cropH / viewportH > 0.50) {
          const fallbackW = Math.max(200, clickedRect.width + 200);
          const fallbackH = Math.max(150, clickedRect.height + 150);
          cropX = clickedRect.left + clickedRect.width / 2 - fallbackW / 2;
          cropY = clickedRect.top + clickedRect.height / 2 - fallbackH / 2;
          cropW = fallbackW;
          cropH = fallbackH;
        }

        const PADDING = 24;
        cropX -= PADDING;
        cropY -= PADDING;
        cropW += PADDING * 2;
        cropH += PADDING * 2;

        const MIN_W = 500;
        const MIN_H = 500;
        if (cropW < MIN_W) {
          cropX -= (MIN_W - cropW) / 2;
          cropW = MIN_W;
        }
        if (cropH < MIN_H) {
          cropY -= (MIN_H - cropH) / 2;
          cropH = MIN_H;
        }

        safeRect = clampRect({ x: cropX, y: cropY, w: cropW, h: cropH });

        try {
          const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
          screenshot = await cropImageToRegion(fullImage, safeRect, dpr);
        } catch (err) {
          logger.warn("extension", "screenshot_crop_failed", err);
        }
      }
      const context = buildCaptureContext(window, element);
      if (context && safeRect && safeRect.w > 0 && safeRect.h > 0) {
        const xPercent = ((clickedRect.left + clickedRect.width / 2 - safeRect.x) / safeRect.w) * 100;
        const yPercent = ((clickedRect.top + clickedRect.height / 2 - safeRect.y) / safeRect.h) * 100;
        context.pinPosition = { xPercent, yPercent };
      }
      const elementRect = {
        top: clickedRect.top,
        left: clickedRect.left,
        right: clickedRect.right,
        bottom: clickedRect.bottom,
        width: clickedRect.width,
        height: clickedRect.height,
      };
      const targetElement = element instanceof HTMLElement ? element : null;
      lastSessionClickedElementRef.current = targetElement;
      sessionFeedbackPendingRef.current = true;

      // Console + network + actions snapshots — extension only. Run in parallel
      // so the three 500ms timeouts don't compound. All three bridges resolve
      // (never reject) within the timeout window even when the MAIN script is
      // unreachable; capture must not block ticket creation.
      let consoleSnapshot: ConsoleSnapshot | null = null;
      let networkSnapshot: NetworkSnapshot | null = null;
      let actionsSnapshot: ActionsSnapshot | null = null;
      if (requestConsoleSnapshot || requestNetworkSnapshot || requestActionsSnapshot) {
        const [consoleResult, networkResult, actionsResult] = await Promise.all([
          requestConsoleSnapshot
            ? requestConsoleSnapshot().catch((err) => {
                logger.warn("extension", "console_snapshot_failed", err);
                return null as ConsoleSnapshot | null;
              })
            : Promise.resolve(null as ConsoleSnapshot | null),
          requestNetworkSnapshot
            ? requestNetworkSnapshot().catch((err) => {
                logger.warn("extension", "network_snapshot_failed", err);
                return null as NetworkSnapshot | null;
              })
            : Promise.resolve(null as NetworkSnapshot | null),
          requestActionsSnapshot
            ? requestActionsSnapshot().catch((err) => {
                logger.warn("extension", "actions_snapshot_failed", err);
                return null as ActionsSnapshot | null;
              })
            : Promise.resolve(null as ActionsSnapshot | null),
        ]);
        consoleSnapshot = consoleResult ?? null;
        networkSnapshot = networkResult ?? null;
        actionsSnapshot = actionsResult ?? null;
      }
      setPending({
        screenshot: screenshot || undefined,
        context,
        elementRect,
        targetElement,
        consoleSnapshot,
        networkSnapshot,
        actionsSnapshot,
      });
      onSessionActivity?.();
    },
    [
      getFullTabImage,
      sessionFeedbackPending,
      onSessionActivity,
      feedbackLimitReached,
      triggerUpgradeShake,
      requestConsoleSnapshot,
      requestNetworkSnapshot,
      requestActionsSnapshot,
    ]
  );

  const handleSessionFeedbackSubmit = useCallback(
    (transcript: string) => {
      if (feedbackLimitReached) {
        triggerUpgradeShake?.();
        return;
      }
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
              if (marker.id.startsWith("pending-")) {
                setHighlightTicketId(marker.id);
                setExpandedId(marker.id);
                return;
              }
              setHighlightTicketId(marker.id);
              setExpandedId(marker.id);
              onEditTicket?.(marker.id);
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
        // Stitch the click-time console + network snapshots onto the context
        // so they reach handleComplete without changing the onComplete
        // signature.
        const contextWithSnapshot: CaptureContext | undefined = pending.context
          ? {
              ...pending.context,
              consoleSnapshot: pending.consoleSnapshot ?? null,
              networkSnapshot: pending.networkSnapshot ?? null,
              actionsSnapshot: pending.actionsSnapshot ?? null,
            }
          : undefined;
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
        }, contextWithSnapshot, { sessionMode: true });
      } catch (error) {
        pipelineActiveRef.current = false;
        setSessionFeedbackSaving(false);
        if (root) removeMarker(placeholderId);
        logger.error("error", "ai_processing_failed", error);
        logger.error("ai", "processing_failed");
        setErrorMessage("AI processing failed.");
      }
    },
    [sessionFeedbackPending, onComplete, feedbackLimitReached, triggerUpgradeShake]
  );

  const handleSessionFeedbackCancel = useCallback(() => {
    setVoiceError(null);
    setIsAwaitingMicrophone(false);
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

  /**
   * Stop voice capture in-place without dismissing the pending feedback.
   * Used when the user switches voice → text mid-recording: we tear down
   * the MediaRecorder + audio nodes, but the pill keeps rendering so the
   * text pill can take over.
   */
  const stopVoiceForModeSwitch = useCallback(() => {
    setVoiceError(null);
    setIsAwaitingMicrophone(false);
    setIsFinishing(false);
    const recorder = mediaRecorderRef.current;
    try {
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }
    } catch (error) {
      logger.error("error", "voice_stop_failed", error);
    }
    stopListeningAudio();
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    recordingActiveRef.current = false;
    const activeId = activeRecordingIdRef.current;
    if (activeId) {
      setRecordings((prev) => prev.filter((r) => r.id !== activeId));
      setActiveRecordingId(null);
    }
    setState("idle");
  }, [stopListeningAudio]);

  const handleSessionStartVoice = useCallback(() => {
    if (feedbackLimitReached) {
      triggerUpgradeShake?.();
      return;
    }
    const pending = sessionFeedbackPending;
    if (!pending) return;
    const id = generateRecordingId();
    // Stitch the click-time console + network snapshots onto the recording's
    // context so they survive the voice-finalize handoff
    // (active.context → onComplete). Mirrors the text-mode stitch in
    // handleSessionFeedbackSubmit.
    const contextWithSnapshot: CaptureContext | null = pending.context
      ? {
          ...pending.context,
          consoleSnapshot: pending.consoleSnapshot ?? null,
          networkSnapshot: pending.networkSnapshot ?? null,
          actionsSnapshot: pending.actionsSnapshot ?? null,
        }
      : null;
    const newRecording: Recording = {
      id,
      screenshot: pending.screenshot ?? null,
      transcript: "",
      structuredOutput: null,
      context: contextWithSnapshot,
      createdAt: Date.now(),
    };
    setRecordings((prev) => [...prev, newRecording]);
    setActiveRecordingId(id);
    startListening();
  }, [sessionFeedbackPending, startListening, feedbackLimitReached, triggerUpgradeShake]);

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
      setEditedDescription,
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
      stopVoiceForModeSwitch,
      handleSessionStartVoice,
      retryVoiceCapture,
      resetVoiceRecording,
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
      setEditedDescription,
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
      stopVoiceForModeSwitch,
      handleSessionStartVoice,
      retryVoiceCapture,
      resetVoiceRecording,
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
      editedDescription,
      showMenu,
      position,
      isSnapping,
      isDragging,
      trayCorner,
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
      sessionFeedbackSaving,
      isFinishing,
      sessionFeedbackPending,
      sessionLimitReached,
      audioAnalyser,
      voiceError,
      isAwaitingMicrophone,
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
