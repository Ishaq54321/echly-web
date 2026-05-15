"use client";

import React from "react";
import { useAudioLevels } from "../core/hooks/useAudioLevels";

export interface WaveformProps {
  /** Audio source — an AnalyserNode or a MediaStream. Pass null when idle. */
  source: MediaStream | AnalyserNode | null;
  /** Number of bars to display (default: 30, or 16 when `compact`). */
  barCount?: number;
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
 * mode preview). Data comes from {@link useAudioLevels}; bars roll
 * right-to-left like WhatsApp / Voice Memos. Sizing is configurable so the
 * same component serves both the full pill and inline/compact surfaces.
 */
export function Waveform({
  source,
  barCount,
  height,
  width = "auto",
  color,
  compact = false,
}: WaveformProps) {
  const effectiveBarCount = barCount ?? (compact ? 16 : 30);
  const effectiveHeight = height ?? (compact ? 20 : 28);

  const { bars } = useAudioLevels(source, {
    barCount: effectiveBarCount,
  });

  return (
    <div
      className="echly-pill-waveform"
      aria-hidden="true"
      style={{
        height: `${effectiveHeight}px`,
        width: width === "auto" ? undefined : `${width}px`,
      }}
    >
      {bars.map((level, i) => (
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
