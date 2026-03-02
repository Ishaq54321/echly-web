"use client";

import React from "react";

/** Solid white microphone icon, 22px. */
function MicIcon22() {
  return (
    <svg
      width="22"
      height="22"
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
  audioLevel: number;
};

/**
 * 72px mic orb. Radial gradient, soft glow. Scale 1–1.1 on audio when listening. Processing: desaturate.
 */
export function RecordingMicOrb({
  isRecording,
  isProcessing,
  audioLevel,
}: RecordingMicOrbProps) {
  const scale = isRecording && !isProcessing
    ? 1 + Math.min(0.1, audioLevel * 0.1)
    : 1;
  const isListening = isRecording && !isProcessing;

  return (
    <div
      className={[
        "echly-recording-orb-inner",
        isProcessing ? "echly-recording-orb-inner--processing" : "",
        isListening ? "echly-recording-orb-inner--listening" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        isRecording && !isProcessing
          ? { transform: `scale(${scale})` }
          : undefined
      }
      aria-hidden
    >
      <span className="echly-recording-orb-icon" style={{ color: "#FFFFFF" }}>
        <MicIcon22 />
      </span>
    </div>
  );
}
