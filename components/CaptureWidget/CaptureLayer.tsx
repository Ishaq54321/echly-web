"use client";

import React from "react";
import { createPortal } from "react-dom";
import { RegionCaptureOverlay } from "./RegionCaptureOverlay";
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
};

/**
 * Overlay + region → #echly-capture-root.
 */
export function CaptureLayer({
  captureRoot,
  extensionMode,
  state,
  getFullTabImage,
  onRegionCaptured,
  onRegionSelectStart,
  onCancelCapture,
}: CaptureLayerProps) {
  const showDimOverlay =
    state === "focus_mode" || state === "region_selecting";
  const showRegionOverlay =
    extensionMode && (state === "focus_mode" || state === "region_selecting");

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
