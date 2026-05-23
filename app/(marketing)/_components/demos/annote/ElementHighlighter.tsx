"use client";

/**
 * Reproduced from: components/CaptureWidget/session/elementHighlighter.ts
 *
 * The source is imperative DOM manipulation (single overlay div created via
 * document.createElement, positioned on mousemove). The marketing demo has no
 * mouse-driven hover behavior, so this is the one component where the
 * "byte-faithful forklift" rule doesn't apply — we instead build a React
 * component that produces the same visual output.
 *
 * Visual values copied verbatim from elementHighlighter.ts:
 *   - outline: 2px solid #5A49BF       (HIGHLIGHT_STYLE.outline, line 9)
 *   - background: rgba(37,99,235,0.1)  (HIGHLIGHT_STYLE.background, line 10)
 *   - border-radius: 4px               (overlay cssText, line 81)
 *   - box-sizing: border-box           (overlay cssText, line 80)
 *   - pointer-events: none             (overlay cssText, line 78)
 *   - data-annote-ui="true"            (overlay setAttribute, line 75)
 *   - aria-hidden="true"               (overlay setAttribute, line 74)
 *
 * Marketing adaptations:
 * - Position is absolute (inside the stage box), not fixed-to-viewport.
 * - Z-index isn't 2147483646 (the extension uses a very high z-index to sit
 *   above everything on real sites; in the demo the stage is self-contained).
 * - Geometry is supplied as a static prop instead of read from
 *   getBoundingClientRect on mousemove.
 */

import React from "react";

export interface ElementHighlighterProps {
  rect: { top: number; left: number; width: number; height: number } | null;
  visible?: boolean;
}

/**
 * Fix 3 (v7): the highlight is framed 7px outside the element's bounding box on
 * each side, so it reads as a deliberate selection frame around the element
 * rather than a tight trace of its edge.
 */
const HIGHLIGHT_OUTSET = 7;

export function ElementHighlighter({ rect, visible = true }: ElementHighlighterProps) {
  if (!rect || !visible) return null;
  // The `hcd-element-highlight` class is keyed off `rect` so React remounts the
  // element on every new capture — that retriggers the entry animation
  // (scale-in + brand glow pulse). Pure-CSS, runs once per click.
  const rectKey = `${rect.top}-${rect.left}-${rect.width}-${rect.height}`;
  return (
    <div
      key={rectKey}
      aria-hidden="true"
      data-annote-ui="true"
      className="hcd-element-highlight"
      style={{
        position: "absolute",
        top: rect.top - HIGHLIGHT_OUTSET,
        left: rect.left - HIGHLIGHT_OUTSET,
        width: rect.width + HIGHLIGHT_OUTSET * 2,
        height: rect.height + HIGHLIGHT_OUTSET * 2,
        boxSizing: "border-box",
        borderRadius: 4,
        outline: "2px solid #5A49BF",
        background: "rgba(37,99,235,0.1)",
        pointerEvents: "none",
      }}
    />
  );
}
