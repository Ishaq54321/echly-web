"use client";

import React from "react";

export type SentimentGlow = "negative" | "neutral" | "positive";

type Props = {
  isSpeaking?: boolean;
  audioLevel?: number;
  isExiting?: boolean;
  isProcessing?: boolean;
  sentiment?: SentimentGlow;
};

/**
 * Mic orb: 52px, gradient #E5484D → #C43E42, radial glow.
 * Idle: breathe (scale 1 → 1.04 → 1). Speaking: waveform ring. Processing: gradient line, no breathe.
 * No spinner or Mic icon.
 */
export function MicOrb({
  isSpeaking = false,
  audioLevel = 0,
  isExiting = false,
  isProcessing = false,
  sentiment = "neutral",
}: Props) {
  const ringScale = isSpeaking ? 1 + Math.min(0.2, audioLevel * 0.25) : 1;

  return (
    <div
      className={`
        echly-mic-orb-wrapper
        ${isExiting ? "echly-mic-orb--exiting" : ""}
        ${isProcessing ? "echly-mic-orb--processing" : ""}
        echly-mic-orb-sentiment--${sentiment}
      `}
    >
      {!isProcessing && (
        <div
          className={`
            echly-mic-orb-ring
            ${isSpeaking ? "echly-mic-orb-ring--active" : "echly-mic-orb-ring--glow"}
          `}
          style={
            isSpeaking
              ? { transform: `translate(-50%, -50%) scale(${ringScale})` }
              : undefined
          }
          aria-hidden
        />
      )}
      {isProcessing && (
        <div className="echly-mic-orb-processing-line" aria-hidden />
      )}
      {!isProcessing && (
        <div className="echly-mic-orb" aria-hidden />
      )}
    </div>
  );
}
