"use client";

import React from "react";

/** Solid white microphone icon, 16px. */
function MicIcon16() {
  return (
    <svg
      width="16"
      height="16"
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
 * Contained mic capsule: glass wrapper, 32px red orb inside, 16px white mic.
 * Subtle outer glow. Processing: desaturate to neutral gray.
 */
export function RecordingMicOrb({ isProcessing }: RecordingMicOrbProps) {
  return (
    <div className="echly-recording-mic-wrapper" aria-hidden>
      <div
        className={[
          "echly-recording-orb-inner",
          isProcessing ? "echly-recording-orb-inner--processing" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="echly-recording-orb-icon" style={{ color: "#FFFFFF" }}>
          <MicIcon16 />
        </span>
      </div>
    </div>
  );
}
