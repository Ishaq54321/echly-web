"use client";

import React from "react";

type KeepRecordingPillProps = {
  onDismiss: () => void;
  fading?: boolean;
  placement?: "top" | "bottom";
};

export function KeepRecordingPill({ onDismiss, fading, placement }: KeepRecordingPillProps) {
  return (
    <div
      className={`echly-v2 echly-v2-keep-pill-anchor${fading ? " echly-keep-pill-fading" : ""}`}
      data-placement={placement || "top"}
    >
      <div className="echly-keep-pill">
        <span className="keep-icon" aria-hidden>
          <span className="keep-sparkles">
            <span className="keep-sparkle" />
            <span className="keep-sparkle" />
            <span className="keep-sparkle" />
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </span>
        <span className="keep-text">
          <strong>Keep going!</strong>
          Capture your next ticket or switch tabs — we handle everything in the background.
        </span>
        <button type="button" className="keep-close" onClick={onDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="echly-tooltip">Dismiss</span>
        </button>
      </div>
    </div>
  );
}
