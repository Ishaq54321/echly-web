"use client";

/**
 * DemoCursor — replicates the real extension's session-capture cursor + tooltip
 * for the marketing demo.
 *
 * Sourced verbatim from the live extension:
 *   - The comment-bubble SVG cursor is `createCommentCursor()` in
 *     components/CaptureWidget/SessionOverlay.tsx (L11-18): a 32×32 white-fill /
 *     black-stroke speech-bubble, hotspot at (6,6).
 *   - The "Click anywhere to capture" tooltip is the `.echly-capture-tooltip`
 *     block in the same file (L342-366): dark glass pill, 20px cursor offset,
 *     edge-flip when it would overflow the stage.
 *
 * Difference from the extension: the extension sets the cursor globally on
 * <body> via an injected !important stylesheet. The demo is scoped to a single
 * stage box, so instead we:
 *   - hide the native cursor on the stage (`cursor: none` on the wrapper while
 *     inDemoZone) — done in marketing.css via the `.hcd.is-demo-zone` modifier,
 *   - render an absolutely-positioned bubble that follows the pointer,
 *   - track an `inDemoZone` flag that is false whenever the pointer is over any
 *     `[data-annote-ui]` element (tray / control panel / pill / modal), exactly
 *     matching the extension's `[data-annote-ui] { cursor: auto }` carve-out.
 *
 * The bubble + tooltip both use `pointer-events: none` so they never intercept
 * clicks destined for the stage beneath.
 */

import React from "react";

/** The exact comment-bubble SVG path from SessionOverlay.createCommentCursor. */
function CommentCursorSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="white"
        stroke="black"
        strokeWidth="2"
        d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      />
    </svg>
  );
}

export interface DemoCursorProps {
  /** Pointer position relative to the stage box, or null when outside it. */
  pos: { x: number; y: number } | null;
  /** True only when the pointer is over the click-target zone (not annote UI). */
  inDemoZone: boolean;
  /** Stage dimensions, for tooltip edge-flipping. */
  stageWidth: number;
  stageHeight: number;
}

const TOOLTIP_W = 170;
const TOOLTIP_H = 28;
const OFFSET = 20; // matches SessionOverlay's tooltip offset

export function DemoCursor({ pos, inDemoZone, stageWidth, stageHeight }: DemoCursorProps) {
  if (!pos || !inDemoZone) return null;

  // Hotspot is (6,6) on the 24-vb SVG → ~7px on the rendered 28px bubble.
  const HOTSPOT = 7;

  // Tooltip flips toward the interior when it would overflow the stage edge.
  const flipX = pos.x + OFFSET + TOOLTIP_W > stageWidth;
  const flipY = pos.y + OFFSET + TOOLTIP_H > stageHeight;
  const tipLeft = flipX ? pos.x - OFFSET - TOOLTIP_W : pos.x + OFFSET;
  const tipTop = flipY ? pos.y - OFFSET - TOOLTIP_H : pos.y + OFFSET;

  return (
    <>
      <div
        className="hcd-cursor"
        aria-hidden
        style={{ transform: `translate(${pos.x - HOTSPOT}px, ${pos.y - HOTSPOT}px)` }}
      >
        <CommentCursorSvg />
      </div>
      <div
        className="hcd-cursor-tooltip"
        aria-hidden
        style={{ transform: `translate(${tipLeft}px, ${tipTop}px)` }}
      >
        Click anywhere to capture
      </div>
    </>
  );
}
