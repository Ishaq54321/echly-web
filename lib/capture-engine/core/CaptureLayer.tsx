"use client";

import React from "react";
import { createPortal } from "react-dom";
import { RegionCaptureOverlay, SessionOverlay } from "./internal/overlayHelpers";
import type { CaptureContext, SessionFeedbackPending, VoiceCaptureError } from "./types";

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
  /** When set (e.g. dashboard), overlays are portaled into this root so they appear above host UI. */
  captureRootParent?: HTMLElement | null;
  extensionMode: boolean;
  state: CaptureLayerState;
  getFullTabImage: () => Promise<string | null>;
  onRegionCaptured: (croppedDataUrl: string, context?: CaptureContext | null) => void;
  onRegionSelectStart: () => void;
  onCancelCapture: () => void;
  /** Session Feedback Mode: when true, show session overlay instead of region capture */
  sessionMode?: boolean;
  /** Optimistic UI: when true, render session overlay even before sessionId/global state arrives. */
  optimisticSessionStarting?: boolean;
  /** From background (ECHLY_GLOBAL_STATE). Overlay only shows when true and sessionId is set to avoid stale state. */
  globalSessionModeActive?: boolean;
  /** Active session ID. Overlay only shows when set to avoid stale state. */
  sessionId?: string;
  sessionPaused?: boolean;
  pausePending?: boolean;
  endPending?: boolean;
  isFinishing?: boolean;
  sessionFeedbackPending?: SessionFeedbackPending | null;
  onSessionElementClicked?: (element: Element) => void;
  onSessionPause?: () => void;
  onSessionResume?: () => void;
  onSessionEnd?: () => void;
  onSessionRecordVoice?: () => void;
  onSessionDoneVoice?: () => void;
  onSessionSaveText?: (transcript: string) => void;
  onSessionFeedbackCancel?: () => void;
  /** Stop the voice pipeline without dismissing the pending feedback (used when switching voice → text mid-recording). */
  onStopVoiceForModeSwitch?: () => void;
  /** When "voice", element click opens voice UI; when "text", opens text UI. No per-click choice. */
  captureMode?: "voice" | "text";
  /** 0–1 normalized level for voice waveform (from useCaptureWidget state). */
  listeningAudioLevel?: number;
  /** AnalyserNode for real-time audio visualizer (from useCaptureWidget state). */
  audioAnalyser?: AnalyserNode | null;
  voiceError?: VoiceCaptureError;
  /** True while startListening is awaiting getUserMedia (drives the pill's "Waiting for microphone…" UI). */
  isAwaitingMicrophone?: boolean;
  onRetryVoice?: () => void;
  onResetVoice?: () => void;
  onSelectMicrophone?: (deviceId: string) => void;
  voiceMicDeviceId?: string;
  /** Extension: derived saving indicator for session chrome. */
  __extensionSavingState?: boolean;
  /** Called when user switches mode from within an overlay — syncs the header toggle. */
  onModeChange?: (mode: "voice" | "text") => void;
  /** When true, mouse is over the Echly tray UI; suspend hover highlights and click capture. */
  captureSuspended?: boolean;
};

/**
 * Overlay + region → #echly-capture-root.
 * When sessionMode is true, only SessionOverlay is shown (no region drag).
 */
export function CaptureLayer({
  captureRoot,
  captureRootParent,
  extensionMode,
  state,
  getFullTabImage,
  onRegionCaptured,
  onRegionSelectStart,
  onCancelCapture,
  sessionMode = false,
  optimisticSessionStarting = false,
  globalSessionModeActive = false,
  sessionId: sessionIdProp,
  sessionPaused = false,
  pausePending = false,
  endPending = false,
  isFinishing = false,
  sessionFeedbackPending = null,
  onSessionElementClicked,
  onSessionPause,
  onSessionResume,
  onSessionEnd,
  onSessionRecordVoice,
  onSessionDoneVoice,
  onSessionSaveText,
  onSessionFeedbackCancel = () => {},
  onStopVoiceForModeSwitch,
  captureMode = "voice",
  listeningAudioLevel = 0,
  audioAnalyser = null,
  voiceError = null,
  isAwaitingMicrophone = false,
  onRetryVoice,
  onResetVoice,
  onSelectMicrophone,
  voiceMicDeviceId = "",
  __extensionSavingState,
  onModeChange,
  captureSuspended = false,
}: CaptureLayerProps) {
  if (extensionMode && (!sessionMode || (!sessionIdProp && !optimisticSessionStarting))) return null;
  const showSessionOverlay =
    sessionMode &&
    extensionMode &&
    ((!!globalSessionModeActive && !!sessionIdProp) || optimisticSessionStarting);
  const showRegionOverlay =
    !showSessionOverlay && (state === "focus_mode" || state === "region_selecting");
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
          isFinishing={isFinishing}
          sessionFeedbackPending={sessionFeedbackPending ?? null}
          state={state}
          captureMode={captureMode}
          listeningAudioLevel={listeningAudioLevel}
          audioAnalyser={audioAnalyser ?? null}
          voiceError={voiceError}
          isAwaitingMicrophone={isAwaitingMicrophone}
          onRetryVoice={onRetryVoice}
          onResetVoice={onResetVoice}
          onSelectMicrophone={onSelectMicrophone}
          voiceMicDeviceId={voiceMicDeviceId}
          onElementClicked={onSessionElementClicked}
          onPause={onSessionPause}
          onResume={onSessionResume}
          onEnd={onSessionEnd}
          onRecordVoice={onSessionRecordVoice}
          onDoneVoice={onSessionDoneVoice}
          onSaveText={onSessionSaveText}
          onCancel={onSessionFeedbackCancel}
          onStopVoiceForModeSwitch={onStopVoiceForModeSwitch}
          __extensionSavingState={__extensionSavingState}
          onModeChange={onModeChange}
          captureSuspended={captureSuspended}
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
            zIndex: 999999,
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

  const portalTarget = captureRootParent ?? captureRoot;
  return (
    <>
      {createPortal(captureContent, portalTarget)}
    </>
  );
}
