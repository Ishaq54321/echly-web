"use client";

import React from "react";

export type SentimentGlow = "negative" | "neutral" | "positive";

type Props = {
  isSpeaking?: boolean;
  audioLevel?: number;
  isExiting?: boolean;
  isProcessing?: boolean;
  isSuccess?: boolean;
  sentiment?: SentimentGlow;
  /** Orb diameter in px (default 48; capsule uses 44) */
  size?: number;
};

/**
 * Mic orb: 44px in capsule, 48px elsewhere. #FF4D4F soft glow.
 * Idle: breathe. Speaking: ring + glow. Processing: orb shrinks slightly. Success: green pulse.
 */
export function MicOrb({
  isSpeaking = false,
  audioLevel = 0,
  isExiting = false,
  isProcessing = false,
  isSuccess = false,
  sentiment = "neutral",
  size = 48,
}: Props) {
  const ringScale = isSpeaking ? 1 + Math.min(0.22, audioLevel * 0.28) : 1;
  const ringSize = size;

  return (
    <div
      className={`
        echly-mic-orb-wrapper
        ${size === 44 ? "echly-mic-orb-wrapper--44" : ""}
        ${isExiting ? "echly-mic-orb--exiting" : ""}
        ${isProcessing ? "echly-mic-orb--processing" : ""}
        ${isSuccess ? "echly-mic-orb--success" : ""}
        echly-mic-orb-sentiment--${sentiment}
      `}
      style={size !== 48 ? { width: size, height: size, minWidth: size, minHeight: size } : undefined}
    >
      {!isProcessing && (
        <div
          className={`
            echly-mic-orb-ring
            ${isSpeaking ? "echly-mic-orb-ring--active" : "echly-mic-orb-ring--glow"}
          `}
          style={
            isSpeaking
              ? {
                  width: ringSize,
                  height: ringSize,
                  marginLeft: -(ringSize / 2),
                  marginTop: -(ringSize / 2),
                  transform: `scale(${ringScale})`,
                }
              : {
                  width: ringSize,
                  height: ringSize,
                  marginLeft: -(ringSize / 2),
                  marginTop: -(ringSize / 2),
                }
          }
          aria-hidden
        />
      )}
      <div className="echly-mic-orb" style={{ width: size, height: size }} aria-hidden />
    </div>
  );
}
