"use client";

import React from "react";
import { createPortal } from "react-dom";
import { RegionCaptureOverlay } from "./RegionCaptureOverlay";
import { VoiceBubble } from "./VoiceBubble";
import type { CaptureContext } from "./types";

export type CaptureLayerState =
  | "capturing"
  | "listening"
  | "processing-structure"
  | "saving-feedback"
  | "idle";

export type CaptureLayerProps = {
  /** Portal target: #echly-capture-root */
  captureRoot: HTMLDivElement;
  extensionMode: boolean;
  state: CaptureLayerState;
  pillExiting: boolean;
  listeningExiting: boolean;
  listeningAudioLevel: number;
  listeningSentiment: "negative" | "neutral" | "positive";
  getFullTabImage: () => Promise<string | null>;
  onRegionCaptured: (croppedDataUrl: string, context?: CaptureContext | null) => void;
  onCancelCapture: () => void;
  onDone: () => void;
};

/**
 * Renders the capture UI (overlay, region selection, voice bubble) into #echly-capture-root.
 * Completely separate from the widget DOM tree.
 */
export function CaptureLayer({
  captureRoot,
  extensionMode,
  state,
  pillExiting,
  listeningExiting,
  listeningAudioLevel,
  listeningSentiment,
  getFullTabImage,
  onRegionCaptured,
  onCancelCapture,
  onDone,
}: CaptureLayerProps) {
  const showOverlay =
    state === "listening" ||
    state === "processing-structure" ||
    state === "saving-feedback" ||
    pillExiting;
  const showBubble =
    state === "listening" ||
    state === "processing-structure" ||
    state === "saving-feedback" ||
    pillExiting;

  const content = (
    <>
      {showOverlay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.08)",
            pointerEvents: "auto",
            zIndex: 2147483646,
          }}
          aria-hidden
        />
      )}
      {extensionMode && state === "capturing" && (
        <RegionCaptureOverlay
          getFullTabImage={getFullTabImage}
          onCapture={onRegionCaptured}
          onCancel={onCancelCapture}
          getWidgetOrigin={undefined}
        />
      )}
      {showBubble && (
        <div
          className={
            pillExiting
              ? "echly-voice-pill-wrapper echly-voice-pill--exiting"
              : "echly-voice-pill-wrapper"
          }
        >
          <VoiceBubble
            isListening={state === "listening"}
            isProcessing={
              state === "processing-structure" || state === "saving-feedback" || pillExiting
            }
            isExiting={state === "processing-structure" && listeningExiting}
            audioLevel={listeningAudioLevel}
            sentiment={listeningSentiment}
            onDone={onDone}
          />
        </div>
      )}
    </>
  );

  return createPortal(content, captureRoot);
}
