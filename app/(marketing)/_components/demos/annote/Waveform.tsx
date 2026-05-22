"use client";

/**
 * Forklifted from: lib/capture-engine/pill/Waveform.tsx
 *
 * Visual code is byte-faithful to the source — className strings, the bar
 * mapping, the `Math.max(3, Math.min(effectiveHeight, level * effectiveHeight))`
 * sizing formula, and inline style construction are unchanged.
 *
 * Modifications (only):
 * - Removed the `useAudioLevels` hook (depends on AnalyserNode / MediaStream).
 *   The bar levels are now passed in as a `levels: number[]` prop driven by
 *   the demo orchestrator's sine-wave mock.
 * - Replaced the `source: MediaStream | AnalyserNode | null` prop with
 *   `levels: number[]`. The orchestrator picks `barCount` by passing an array
 *   of the desired length (default mirrors source: 30 normally, 16 compact).
 *
 * The single bar-rendering JSX block (`bars.map((level, i) => ...)`) is
 * unchanged from the source.
 */

import React from "react";

export interface WaveformProps {
  /** Mock audio levels (each value 0–1), one per bar. */
  levels: number[];
  /** Height in px (default: 28, or 20 when `compact`). */
  height?: number;
  /** Width in px or "auto" (default: the CSS-defined width). */
  width?: number | "auto";
  /** Bar color override (defaults to the --pill-waveform token via CSS). */
  color?: string;
  /** Compact size preset — use for inline UIs like dictation. */
  compact?: boolean;
}

/**
 * Single shared waveform used across the app (pill voice/text, dictation,
 * mode preview). Bars roll right-to-left like WhatsApp / Voice Memos. Sizing
 * is configurable so the same component serves both the full pill and
 * inline/compact surfaces.
 */
export function Waveform({
  levels,
  height,
  width = "auto",
  color,
  compact = false,
}: WaveformProps) {
  const effectiveHeight = height ?? (compact ? 20 : 28);

  return (
    <div
      className="echly-pill-waveform"
      aria-hidden="true"
      style={{
        height: `${effectiveHeight}px`,
        width: width === "auto" ? undefined : `${width}px`,
      }}
    >
      {levels.map((level, i) => (
        <span
          key={i}
          className="echly-pill-wave-bar"
          style={{
            height: `${Math.max(3, Math.min(effectiveHeight, level * effectiveHeight))}px`,
            background: color,
          }}
        />
      ))}
    </div>
  );
}
