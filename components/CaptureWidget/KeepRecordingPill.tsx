"use client";

import React from "react";

type KeepRecordingPillProps = {
  onDismiss: () => void;
  fading?: boolean;
};

export function KeepRecordingPill({ onDismiss, fading }: KeepRecordingPillProps) {
  return (
    <div className={`echly-v2 echly-v2-keep-pill-anchor${fading ? " echly-keep-pill-fading" : ""}`}>
      <div className="echly-keep-pill">
        <span className="keep-icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </span>
        <span className="keep-text">
          <strong>No need to wait!</strong> Capture your next one — we handle the rest.
        </span>
        <button type="button" className="keep-close" onClick={onDismiss} aria-label="Dismiss" title="Dismiss">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
