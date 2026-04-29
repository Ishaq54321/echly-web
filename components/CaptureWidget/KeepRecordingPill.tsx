"use client";

import React from "react";

type KeepRecordingPillProps = {
  onDismiss: () => void;
};

export function KeepRecordingPill({ onDismiss }: KeepRecordingPillProps) {
  return (
    <div className="echly-v2-keep-pill-anchor">
      <div className="echly-keep-pill">
        <span className="hint-icon" aria-hidden>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="currentColor" />
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
          </svg>
        </span>
        <span className="hint-text">
          <b>Keep going.</b> Record your next note while this one processes.
        </span>
        <button
          type="button"
          className="hint-close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
