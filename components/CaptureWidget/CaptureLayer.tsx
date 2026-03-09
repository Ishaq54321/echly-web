"use client";

import React from "react";
import { createPortal } from "react-dom";
import { RegionCaptureOverlay } from "./RegionCaptureOverlay";
import { SessionOverlay } from "./SessionOverlay";
import type { CaptureContext } from "./types";

export type CaptureLayerState =
  | "focus_mode"
  | "region_selecting"
  | "voice_listening"
  | "processing"
  | "idle"
  | "success"
  | "cancelled"
  | "error";

export type CaptureLayerProps = {
  captureRoot: HTMLDivElement;
  extensionMode: boolean;
  state: CaptureLayerState;
  getFullTabImage: () => Promise<string | null>;
  onRegionCaptured: (croppedDataUrl: string, context?: CaptureContext | null) => void;
  onRegionSelectStart: () => void;
  onCancelCapture: () => void;
  /** Session Feedback Mode: when true, show session overlay instead of region capture */
  sessionMode?: boolean;
  /** From background (ECHLY_GLOBAL_STATE). Overlay only shows when true and sessionId is set to avoid stale state. */
  globalSessionModeActive?: boolean;
  /** Active session ID. Overlay only shows when set to avoid stale state. */
  sessionId?: string;
  sessionPaused?: boolean;
  pausePending?: boolean;
  endPending?: boolean;
  sessionFeedbackPending?: { screenshot: string; context: CaptureContext | null } | null;
  onSessionElementClicked?: (element: Element) => void;
  onSessionPause?: () => void;
  onSessionResume?: () => void;
  onSessionEnd?: () => void;
  onSessionRecordVoice?: () => void;
  onSessionDoneVoice?: () => void;
  onSessionSaveText?: (transcript: string) => void;
  onSessionFeedbackCancel?: () => void;
  /** When "voice", element click opens voice UI; when "text", opens text UI. No per-click choice. */
  captureMode?: "voice" | "text";
  /** 0–1 normalized level for voice waveform (from useCaptureWidget state). */
  listeningAudioLevel?: number;
  /** AnalyserNode for real-time audio visualizer (from useCaptureWidget state). */
  audioAnalyser?: AnalyserNode | null;
};

/**
 * Overlay + region → #echly-capture-root.
 * When sessionMode is true, only SessionOverlay is shown (no region drag).
 */
export function CaptureLayer({
  captureRoot,
  extensionMode,
  state,
  getFullTabImage,
  onRegionCaptured,
  onRegionSelectStart,
  onCancelCapture,
  sessionMode = false,
  globalSessionModeActive = false,
  sessionId: sessionIdProp,
  sessionPaused = false,
  pausePending = false,
  endPending = false,
  sessionFeedbackPending = null,
  onSessionElementClicked,
  onSessionPause,
  onSessionResume,
  onSessionEnd,
  onSessionRecordVoice,
  onSessionDoneVoice,
  onSessionSaveText,
  onSessionFeedbackCancel = () => {},
  captureMode = "voice",
  listeningAudioLevel = 0,
  audioAnalyser = null,
}: CaptureLayerProps) {
  if (extensionMode && (!sessionMode || !sessionIdProp)) return null;
  const showSessionOverlay =
    sessionMode && extensionMode && !!globalSessionModeActive && !!sessionIdProp;
  const showRegionOverlay =
    !showSessionOverlay && extensionMode && (state === "focus_mode" || state === "region_selecting");
  /* Do not show focus overlay when region overlay is shown (avoids full-screen pointer-events:auto blocking scroll). */
  const showDimOverlay =
    !showSessionOverlay &&
    !showRegionOverlay &&
    (state === "focus_mode" || state === "region_selecting");

  const captureContent = (
    <>
      {showSessionOverlay && onSessionElementClicked && onSessionPause && onSessionResume && onSessionEnd && onSessionRecordVoice && onSessionDoneVoice && onSessionSaveText && (
        <SessionOverlay
          captureRoot={captureRoot}
          sessionMode={sessionMode}
          sessionPaused={sessionPaused}
          pausePending={pausePending}
          endPending={endPending}
          sessionFeedbackPending={sessionFeedbackPending ?? null}
          state={state}
          captureMode={captureMode}
          listeningAudioLevel={listeningAudioLevel}
          audioAnalyser={audioAnalyser ?? null}
          onElementClicked={onSessionElementClicked}
          onPause={onSessionPause}
          onResume={onSessionResume}
          onEnd={onSessionEnd}
          onRecordVoice={onSessionRecordVoice}
          onDoneVoice={onSessionDoneVoice}
          onSaveText={onSessionSaveText}
          onCancel={onSessionFeedbackCancel}
        />
      )}
      {showDimOverlay && (
        <div
          className="echly-focus-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.08)",
            pointerEvents: "auto",
            cursor: "crosshair",
            zIndex: 2147483645,
          }}
          aria-hidden
        />
      )}
      {showRegionOverlay && (
        <RegionCaptureOverlay
          getFullTabImage={getFullTabImage}
          onAddVoice={onRegionCaptured}
          onCancel={onCancelCapture}
          onSelectionStart={onRegionSelectStart}
        />
      )}
    </>
  );

  return (
    <>
      {createPortal(captureContent, captureRoot)}
    </>
  );
}
