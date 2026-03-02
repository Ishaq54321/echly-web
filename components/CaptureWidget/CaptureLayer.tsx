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
  extensionMode: boolean;
  state: CaptureLayerState;
  pillExiting: boolean;
  listeningAudioLevel: number;
  listeningSentiment: "negative" | "neutral" | "positive";
  aiPreviewTitle: string | null;
  getFullTabImage: () => Promise<string | null>;
  onRegionCaptured: (croppedDataUrl: string, context?: CaptureContext | null) => void;
  onRegionSelectStart: () => void;
  onCancelCapture: () => void;
  onDone: () => void;
};

/**
 * Renders the capture UI (overlay, region selection, voice capsule) into #echly-capture-root.
 * Completely separate from the sidebar DOM tree.
 */
export function CaptureLayer({
  captureRoot,
  extensionMode,
  state,
  pillExiting,
  listeningAudioLevel,
  listeningSentiment,
  aiPreviewTitle,
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

  const content = (
    <>
      {showDimOverlay && (
        <div
          className="echly-focus-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.06)",
            pointerEvents: "auto",
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
      {showCapsule && (
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
            aiPreviewTitle={aiPreviewTitle}
            onDone={onDone}
          />
        </div>
      )}
    </>
  );

  return createPortal(content, captureRoot);
}
