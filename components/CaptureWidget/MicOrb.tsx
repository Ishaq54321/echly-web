"use client";

import React from "react";
import { Mic } from "lucide-react";

export type SentimentGlow = "negative" | "neutral" | "positive";

type Props = {
  /** When true, show amplitude-driven waveform ring; when false, soft glow only. */
  isSpeaking?: boolean;
  /** 0–1, drives ring scale when speaking. */
  audioLevel?: number;
  /** When true, orb compresses 4% (Done transition). */
  isExiting?: boolean;
  /** When true, show thin animated gradient ring only (processing state). */
  isProcessing?: boolean;
  /** Sentiment-based outer glow (max 15% intensity). */
  sentiment?: SentimentGlow;
};

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
        inline-flex items-center justify-center
        relative
        ${isExiting ? "echly-mic-orb--exiting" : ""}
        ${isProcessing ? "echly-mic-orb--processing" : ""}
        echly-mic-orb-sentiment--${sentiment}
      `}
    >
      {/* Outer ring: glow when idle, amplitude-driven when speaking, or gradient when processing */}
      {!isProcessing && (
        <div
          className={`
            echly-mic-orb-ring
            absolute rounded-full pointer-events-none
            ${isSpeaking ? "echly-mic-orb-ring--active" : "echly-mic-orb-ring--glow"}
          `}
          style={
            isSpeaking
              ? {
                  transform: `translate(-50%, -50%) scale(${ringScale})`,
                }
              : undefined
          }
          aria-hidden
        />
      )}
      {isProcessing && (
        <div className="echly-mic-orb-processing-ring absolute rounded-full pointer-events-none" aria-hidden />
      )}
      {!isProcessing && (
        <div className="echly-mic-orb relative z-10 flex items-center justify-center">
          <Mic className="echly-mic-orb-icon" size={24} strokeWidth={2} aria-hidden />
        </div>
      )}
    </div>
  );
}
