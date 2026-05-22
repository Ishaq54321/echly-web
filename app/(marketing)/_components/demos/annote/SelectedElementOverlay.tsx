"use client";

/**
 * Forklifted from: lib/capture-engine/pill/SelectedElementOverlay.tsx
 *
 * Visual code is byte-faithful to the source — className, data-annote-ui,
 * aria-hidden, and the inline style object (position:fixed, transform, width,
 * height) are unchanged from the source.
 *
 * Modifications (only):
 * - Removed the rAF tick loop and ResizeObserver (the demo's faux site CTA
 *   doesn't move, so frame-accurate tracking isn't needed).
 * - Replaced the `targetElement: HTMLElement | null` prop with
 *   `targetRect: { top, left, width, height } | null` so the orchestrator
 *   can supply the static rect that anchors the overlay.
 * - The single `updatePosition` write that runs once on mount is preserved
 *   verbatim, applied via inline style in the JSX.
 *
 * Visual output: a position:fixed pointer-events:none div with the same
 * .echly-selected-overlay class, anchored to the supplied rect.
 */

import React from "react";

export interface SelectedElementOverlayProps {
  targetRect: { top: number; left: number; width: number; height: number } | null;
}

export function SelectedElementOverlay({ targetRect }: SelectedElementOverlayProps) {
  if (!targetRect) return null;

  return (
    <div
      className="echly-selected-overlay"
      data-annote-ui="true"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "block",
        transform: `translate(${targetRect.left}px, ${targetRect.top}px)`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
      }}
    />
  );
}
