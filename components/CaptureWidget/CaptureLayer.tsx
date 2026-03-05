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
  sessionPaused?: boolean;
  sessionFeedbackPending?: { screenshot: string; context: CaptureContext | null } | null;
  onSessionElementClicked?: (element: Element) => void;
  onSessionPause?: () => void;
  onSessionResume?: () => void;
  onSessionEnd?: () => void;
  onSessionRecordVoice?: () => void;
  onSessionDoneVoice?: () => void;
  onSessionSaveText?: (transcript: string) => void;
  onSessionFeedbackCancel?: () => void;
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
  sessionPaused = false,
  sessionFeedbackPending = null,
  onSessionElementClicked,
  onSessionPause,
  onSessionResume,
  onSessionEnd,
  onSessionRecordVoice,
  onSessionDoneVoice,
  onSessionSaveText,
  onSessionFeedbackCancel = () => {},
}: CaptureLayerProps) {
  const showSessionOverlay = sessionMode && extensionMode;
  const showDimOverlay =
    !showSessionOverlay && (state === "focus_mode" || state === "region_selecting");
  const showRegionOverlay =
    !showSessionOverlay && extensionMode && (state === "focus_mode" || state === "region_selecting");

  const captureContent = (
    <>
      {showSessionOverlay && onSessionElementClicked && onSessionPause && onSessionResume && onSessionEnd && onSessionRecordVoice && onSessionDoneVoice && onSessionSaveText && (
        <SessionOverlay
          captureRoot={captureRoot}
          sessionMode={sessionMode}
          sessionPaused={sessionPaused}
          sessionFeedbackPending={sessionFeedbackPending ?? null}
          state={state}
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
            background: "rgba(0,0,0,0.04)",
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
