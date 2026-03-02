"use client";

import React from "react";

/** Solid white microphone icon, 18px. */
function MicIcon18() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

export type RecordingMicOrbProps = {
  isRecording: boolean;
  isProcessing: boolean;
};

/**
 * Recording capsule mic: 48px, radial gradient, inset + glow shadow,
 * white mic SVG 18px. Pulse 1 → 1.06 every 1.2s when recording.
 * Processing: desaturate, no glow.
 */
export function RecordingMicOrb({ isRecording, isProcessing }: RecordingMicOrbProps) {
  return (
    <div
      className={[
        "echly-recording-orb-inner",
        isRecording && !isProcessing ? "echly-recording-orb-inner--pulse" : "",
        isProcessing ? "echly-recording-orb-inner--processing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <span className="echly-recording-orb-icon" style={{ color: "#FFFFFF" }}>
        <MicIcon18 />
      </span>
    </div>
  );
}
