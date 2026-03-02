"use client";

import React from "react";
import { createPortal } from "react-dom";
import { RegionCaptureOverlay } from "./RegionCaptureOverlay";
import { VoiceBubble } from "./VoiceBubble";
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
  aiRoot: HTMLDivElement;
  extensionMode: boolean;
  state: CaptureLayerState;
  pillExiting: boolean;
  listeningAudioLevel: number;
  listeningSentiment: "negative" | "neutral" | "positive";
  liveTranscript: string;
  aiPreviewTitle: string | null;
  orbSuccess: boolean;
  getFullTabImage: () => Promise<string | null>;
  onRegionCaptured: (croppedDataUrl: string, context?: CaptureContext | null) => void;
  onRegionSelectStart: () => void;
  onCancelCapture: () => void;
  onDone: () => void;
};

/**
 * Overlay + region → #echly-capture-root.
 * Voice capsule + Cancel → #echly-ai-root.
 */
export function CaptureLayer({
  captureRoot,
  aiRoot,
  extensionMode,
  state,
  pillExiting,
  listeningAudioLevel,
  listeningSentiment,
  liveTranscript,
  aiPreviewTitle,
  orbSuccess,
  getFullTabImage,
  onRegionCaptured,
  onRegionSelectStart,
  onCancelCapture,
  onDone,
}: CaptureLayerProps) {
  const showDimOverlay =
    state === "focus_mode" || state === "region_selecting";
  const showRegionOverlay =
    extensionMode && (state === "focus_mode" || state === "region_selecting");
  const showCapsule =
    state === "voice_listening" ||
    state === "processing" ||
    pillExiting;
  const showCancel = state === "voice_listening" && !pillExiting;

  const captureContent = (
    <>
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
          onCapture={onRegionCaptured}
          onCancel={onCancelCapture}
          onSelectionStart={onRegionSelectStart}
        />
      )}
    </>
  );

  const capsuleContent = showCapsule ? (
    <div className="echly-voice-row">
      {showCancel && (
        <button
          type="button"
          onClick={onCancelCapture}
          className="echly-capsule-cancel"
          aria-label="Cancel"
        >
          Cancel
        </button>
      )}
      <div
        className={
          pillExiting
            ? "echly-capsule-wrapper echly-capsule-wrapper--exiting"
            : "echly-capsule-wrapper"
        }
      >
        <VoiceBubble
          isListening={state === "voice_listening"}
          isProcessing={state === "processing" || pillExiting}
          isExiting={state === "processing" && pillExiting}
          audioLevel={listeningAudioLevel}
          sentiment={listeningSentiment}
          liveTranscript={liveTranscript}
          aiPreviewTitle={aiPreviewTitle}
          orbSuccess={orbSuccess}
          onDone={onDone}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {createPortal(captureContent, captureRoot)}
      {capsuleContent && createPortal(capsuleContent, aiRoot)}
    </>
  );
}
