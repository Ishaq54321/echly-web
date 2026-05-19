"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { attachElementHighlighter, detachElementHighlighter } from "./session/elementHighlighter";
import { attachClickCapture, detachClickCapture } from "./session/clickCapture";
import { SessionControlPanel } from "./SessionControlPanel";
import { CapturePill } from "@/lib/capture-engine/pill";
import type { SessionFeedbackPending, VoiceCaptureError } from "@/lib/capture-engine/core/types";

function createCommentCursor() {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">`,
    `<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    `</svg>`,
  ].join("");
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 6 6, auto`;
}

const COMMENT_CURSOR = createCommentCursor();

export type SessionOverlayProps = {
  captureRoot: HTMLDivElement;
  sessionMode: boolean;
  sessionPaused: boolean;
  pausePending?: boolean;
  endPending?: boolean;
  isFinishing?: boolean;
  sessionFeedbackPending: SessionFeedbackPending | null;
  state: string;
  onElementClicked: (element: Element) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onRecordVoice: () => void;
  onDoneVoice: () => void;
  onSaveText: (transcript: string) => void;
  onCancel?: () => void;
  /** Stop voice capture without dismissing pending feedback (mode-switch teardown). */
  onStopVoiceForModeSwitch?: () => void;
  captureMode?: "voice" | "text";
  listeningAudioLevel?: number;
  audioAnalyser?: AnalyserNode | null;
  voiceError?: VoiceCaptureError;
  onRetryVoice?: () => void;
  onResetVoice?: () => void;
  onSelectMicrophone?: (deviceId: string) => void;
  voiceMicDeviceId?: string;
  __extensionSavingState?: boolean;
  onModeChange?: (mode: "voice" | "text") => void;
  /** When true, suspend hover highlighting and click capture (e.g. mouse is over the Echly tray). */
  captureSuspended?: boolean;
};

/**
 * Renders session UI into capture root and attaches highlighter + click capture.
 * When sessionMode and !sessionPaused, hover and click are active; when sessionFeedbackPending
 * is set, click capture is effectively disabled (popup is on top and has data-annote-ui).
 */
export function SessionOverlay({
  captureRoot,
  sessionMode,
  sessionPaused,
  pausePending = false,
  endPending = false,
  isFinishing = false,
  sessionFeedbackPending,
  state,
  onElementClicked,
  onPause,
  onResume,
  onEnd,
  onRecordVoice,
  onDoneVoice,
  onSaveText,
  onCancel,
  onStopVoiceForModeSwitch,
  captureMode = "voice",
  audioAnalyser = null,
  voiceError = null,
  onRetryVoice,
  onResetVoice,
  onSelectMicrophone,
  voiceMicDeviceId = "",
  __extensionSavingState,
  onModeChange,
  captureSuspended = false,
}: SessionOverlayProps) {
  const cleanupRef = useRef<(() => void)[]>([]);
  const voiceStartedForPendingRef = useRef(false);
  const sessionActionPending = pausePending || endPending;
  const sessionCursorActive = sessionMode && !sessionPaused && !sessionActionPending && !captureSuspended;
  /**
   * Highlighter + click-capture use a stable getActive() closure that mutates
   * via this ref, so toggling captureSuspended doesn't tear down listeners.
   */
  const captureSuspendedRef = useRef(captureSuspended);
  useEffect(() => {
    captureSuspendedRef.current = captureSuspended;
  }, [captureSuspended]);

  /**
   * First-capture-per-session tooltip: shows "Click anywhere to capture" near the cursor
   * until the user initiates their first capture in this session. Resets when session ends.
   */
  const captureTooltipShownRef = useRef(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveringEchlyUi, setHoveringEchlyUi] = useState(false);

  useEffect(() => {
    if (sessionMode) {
      if (!captureTooltipShownRef.current) setTooltipVisible(true);
    } else {
      captureTooltipShownRef.current = false;
      setTooltipVisible(false);
      setCursorPos(null);
    }
  }, [sessionMode]);

  useEffect(() => {
    if (sessionFeedbackPending && !captureTooltipShownRef.current) {
      captureTooltipShownRef.current = true;
      setTooltipVisible(false);
    }
  }, [sessionFeedbackPending]);

  const showCaptureTooltip =
    tooltipVisible &&
    sessionCursorActive &&
    !sessionFeedbackPending &&
    !captureTooltipShownRef.current &&
    !hoveringEchlyUi;

  useEffect(() => {
    if (!sessionCursorActive || !tooltipVisible || captureTooltipShownRef.current) return;
    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const target = e.target as Element | null;
      const overEchly = !!target?.closest?.("[data-annote-ui]");
      setHoveringEchlyUi(overEchly);
    };
    document.addEventListener("mousemove", handleMove, { passive: true });
    return () => document.removeEventListener("mousemove", handleMove);
  }, [sessionCursorActive, tooltipVisible]);

  /**
   * Local captureMode override: when the user switches from text → voice inside the panel,
   * we flip to "voice" locally without needing to change the external captureMode prop.
   * Resets whenever sessionFeedbackPending clears.
   */
  const [overrideCaptureMode, setOverrideCaptureMode] = useState<"voice" | "text" | null>(null);
  const effectiveCaptureMode = overrideCaptureMode ?? captureMode;

  useEffect(() => {
    if (!sessionFeedbackPending) setOverrideCaptureMode(null);
  }, [sessionFeedbackPending]);

  /** Switch from text panel to voice panel while keeping the same pending feedback. */
  const handleSwitchToVoice = useCallback(() => {
    setOverrideCaptureMode("voice");
    onModeChange?.("voice");
    if (!voiceStartedForPendingRef.current) {
      voiceStartedForPendingRef.current = true;
      onRecordVoice();
    }
  }, [onRecordVoice, onModeChange]);

  /**
   * Switch from voice panel to text panel while keeping the same pending feedback.
   * Stops any in-flight MediaRecorder via the dedicated mode-switch handler
   * (NOT onCancel — onCancel would dismiss the whole pill, killing the text
   * mount we're about to do). Falls back to onCancel only if no stop handler
   * is wired up — better to over-dismiss than to leak the recorder.
   */
  const handleSwitchToText = useCallback(() => {
    if (state === "voice_listening") {
      if (onStopVoiceForModeSwitch) {
        onStopVoiceForModeSwitch();
      } else if (onCancel) {
        onCancel();
      }
    }
    voiceStartedForPendingRef.current = false;
    setOverrideCaptureMode("text");
    onModeChange?.("text");
  }, [state, onCancel, onStopVoiceForModeSwitch, onModeChange]);

  /** Unified mode-change for the pill's hover-revealed toggle. */
  const handlePillModeChange = useCallback(
    (mode: "voice" | "text") => {
      if (mode === "text") handleSwitchToText();
      else handleSwitchToVoice();
    },
    [handleSwitchToText, handleSwitchToVoice],
  );

  /**
   * Track whether the mic permission has been permanently blocked.
   * Uses the Permissions API plus a timing heuristic: a getUserMedia rejection
   * that returns in <150ms generally means the browser skipped the prompt
   * (already-denied state). The hook recovered this logic from pre-pill commits.
   */
  const [micPermissionBlocked, setMicPermissionBlocked] = useState(false);
  const lastErrorAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (voiceError === "mic_permission") {
      lastErrorAtRef.current = Date.now();
    }
  }, [voiceError]);

  useEffect(() => {
    if (voiceError !== "mic_permission") {
      setMicPermissionBlocked(false);
      return;
    }
    let cancelled = false;
    const elapsedSinceRetry =
      lastErrorAtRef.current != null ? Date.now() - lastErrorAtRef.current : null;
    /** Fast rejection (<150ms) → no prompt → permanent block. */
    if (elapsedSinceRetry != null && elapsedSinceRetry < 150) {
      setMicPermissionBlocked(true);
    }
    if (
      typeof navigator !== "undefined" &&
      navigator.permissions &&
      typeof navigator.permissions.query === "function"
    ) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          if (status.state === "denied") setMicPermissionBlocked(true);
        })
        .catch(() => {
          /* Permissions API not supported — rely on timing heuristic only */
        });
    }
    return () => {
      cancelled = true;
    };
  }, [voiceError]);

  useEffect(() => {
    if (!sessionMode || !captureRoot) return;
    const getActive = () =>
      sessionMode &&
      !sessionPaused &&
      !sessionActionPending &&
      sessionFeedbackPending == null &&
      !captureSuspendedRef.current;
    cleanupRef.current.push(
      attachElementHighlighter(captureRoot, { getActive })
    );
    cleanupRef.current.push(
      attachClickCapture(captureRoot, {
        enabled: getActive,
        onElementClicked,
      })
    );
    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
      detachElementHighlighter();
      detachClickCapture();
    };
  }, [
    sessionMode,
    captureRoot,
    sessionPaused,
    sessionActionPending,
    sessionFeedbackPending,
    onElementClicked,
  ]);

  /* Keep feedback cursor scoped to active session capture mode.
     Sets body cursor AND injects a global !important rule so element-level
     cursor styles (button, a, [role=button], etc.) don't override the comment cursor. */
  useEffect(() => {
    if (!captureRoot?.isConnected) return;
    if (!sessionCursorActive) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = COMMENT_CURSOR;

    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-annote-cursor-override", "true");
    styleEl.textContent = `
      html, body, body * {
        cursor: ${COMMENT_CURSOR} !important;
      }
      [data-annote-ui], [data-annote-ui] * {
        cursor: auto !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.body.style.cursor = previousCursor;
      styleEl.remove();
    };
  }, [sessionCursorActive, captureRoot]);

  /* When captureMode is voice and we have pending feedback, start voice recording immediately (once). */
  useEffect(() => {
    if (!sessionFeedbackPending || captureMode !== "voice" || voiceStartedForPendingRef.current) return;
    voiceStartedForPendingRef.current = true;
    onRecordVoice();
  }, [sessionFeedbackPending, captureMode, onRecordVoice]);

  useEffect(() => {
    if (!sessionFeedbackPending) voiceStartedForPendingRef.current = false;
  }, [sessionFeedbackPending]);

  if (!sessionMode || !captureRoot) return null;

  const saving = Boolean(__extensionSavingState);

  const content = (
    <>
      <div
        aria-hidden
        className="echly-session-overlay-cursor"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2147483645,
          cursor: sessionCursorActive ? COMMENT_CURSOR : "default",
        }}
      />
      {showCaptureTooltip && cursorPos && (() => {
        const TOOLTIP_W = 170;
        const TOOLTIP_H = 28;
        const OFFSET = 20;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
        const vh = typeof window !== "undefined" ? window.innerHeight : 768;
        const flipX = cursorPos.x + OFFSET + TOOLTIP_W > vw;
        const flipY = cursorPos.y + OFFSET + TOOLTIP_H > vh;
        const left = flipX ? cursorPos.x - OFFSET - TOOLTIP_W : cursorPos.x + OFFSET;
        const top = flipY ? cursorPos.y - OFFSET - TOOLTIP_H : cursorPos.y + OFFSET;
        return (
          <div
            aria-hidden
            className="echly-capture-tooltip"
            style={{
              position: "fixed",
              left,
              top,
              pointerEvents: "none",
              zIndex: 2147483646,
              background: "rgba(0, 0, 0, 0.75)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            Click anywhere to capture
          </div>
        );
      })()}
      <SessionControlPanel
        sessionPaused={sessionPaused}
        pausePending={pausePending}
        endPending={endPending}
        __extensionSavingState={saving}
        onPause={onPause}
        onResume={onResume}
        onEnd={onEnd}
      />
      {sessionFeedbackPending && (
        <CapturePill
          targetElement={sessionFeedbackPending.targetElement ?? null}
          analyser={!isFinishing && !voiceError ? (audioAnalyser ?? null) : null}
          isListening={state === "voice_listening" && !isFinishing && !voiceError}
          isFinishing={isFinishing}
          mode={effectiveCaptureMode}
          voiceError={voiceError}
          micPermissionBlocked={micPermissionBlocked}
          onSendVoice={onDoneVoice}
          onCancel={onCancel ?? (() => {})}
          onResetVoice={onResetVoice ?? (() => {})}
          onSendText={onSaveText}
          onRetryVoice={onRetryVoice ?? (() => {})}
          onModeChange={handlePillModeChange}
          onSelectMic={onSelectMicrophone}
          selectedMicId={voiceMicDeviceId}
          portalTarget={captureRoot}
        />
      )}
    </>
  );

  return createPortal(content, captureRoot);
}
