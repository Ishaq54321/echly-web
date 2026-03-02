"use client";

import React from "react";

export type SentimentGlow = "negative" | "neutral" | "positive";

type Props = {
  isSpeaking?: boolean;
  audioLevel?: number;
  isExiting?: boolean;
  isProcessing?: boolean;
  /** Brief green pulse after success (200ms) */
  isSuccess?: boolean;
  sentiment?: SentimentGlow;
};

/**
 * Mic orb: 48px, gradient #FF4D4F → #D9363E.
 * Idle: breathe 2.5s. Speaking: ring + glow. Processing: thin light bar. Success: green pulse.
 */
export function MicOrb({
  isSpeaking = false,
  audioLevel = 0,
  isExiting = false,
  isProcessing = false,
  isSuccess = false,
  sentiment = "neutral",
}: Props) {
  const ringScale = isSpeaking ? 1 + Math.min(0.22, audioLevel * 0.28) : 1;

  return (
    <div
      className={`
        echly-mic-orb-wrapper
        ${isExiting ? "echly-mic-orb--exiting" : ""}
        ${isProcessing ? "echly-mic-orb--processing" : ""}
        ${isSuccess ? "echly-mic-orb--success" : ""}
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
