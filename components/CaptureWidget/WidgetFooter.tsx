"use client";

import React from "react";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
  /** When set (extension mode), show only Start New / Resume session actions (no "Capture feedback") */
  extensionMode?: boolean;
  onStartSession?: () => void;
  onResumeSession?: () => void;
  captureDisabled?: boolean;
};

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
  extensionMode = false,
  onStartSession,
  onResumeSession,
  captureDisabled = false,
}: WidgetFooterProps) {
  const effectivelyDisabled = !isIdle || captureDisabled;

  if (extensionMode) {
    return (
      <div className="echly-add-insight-wrap">
        <button
          type="button"
          onClick={effectivelyDisabled ? undefined : onStartSession}
          disabled={effectivelyDisabled}
          className={`echly-add-insight-btn ${effectivelyDisabled ? "echly-add-insight-btn--disabled" : ""}`}
          aria-label="Start New Feedback Session"
        >
          Start New Feedback Session
        </button>
        {onResumeSession && (
          <button
            type="button"
            onClick={effectivelyDisabled ? undefined : onResumeSession}
            disabled={effectivelyDisabled}
            className="echly-add-insight-btn echly-add-insight-btn--secondary"
            aria-label="Resume Feedback Session"
            style={{
              marginTop: 8,
              background: "rgba(37, 99, 235, 0.15)",
              color: "#2563eb",
              border: "1px solid rgba(37, 99, 235, 0.4)",
            }}
          >
            Resume Feedback Session
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="echly-add-insight-wrap">
      <button
        type="button"
        onClick={effectivelyDisabled ? undefined : onAddFeedback}
        disabled={effectivelyDisabled}
        className={`echly-add-insight-btn ${effectivelyDisabled ? "echly-add-insight-btn--disabled" : ""}`}
        aria-label="Capture feedback"
      >
        Capture feedback
      </button>
    </div>
  );
}
