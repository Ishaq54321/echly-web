"use client";

import React from "react";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
  /** When set (extension mode), show only session actions (no "Capture feedback") */
  extensionMode?: boolean;
  onStartSession?: () => void;
  onOpenPreviousSession?: () => void;
  hasActiveSession?: boolean;
  captureDisabled?: boolean;
};

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
  extensionMode = false,
  onStartSession,
  onOpenPreviousSession,
  hasActiveSession = false,
  captureDisabled = false,
}: WidgetFooterProps) {
  const effectivelyDisabled = !isIdle || captureDisabled;

  if (extensionMode) {
    return (
      <div className="echly-command-actions">
        <button
          type="button"
          onClick={effectivelyDisabled ? undefined : onStartSession}
          disabled={effectivelyDisabled}
          className="echly-start-session-btn"
          aria-label="Start Session"
        >
          Start Session
        </button>
        <button
          type="button"
          onClick={effectivelyDisabled ? undefined : onOpenPreviousSession}
          disabled={effectivelyDisabled}
          className="echly-previous-session-btn"
          aria-label="Previous Sessions"
        >
          Previous Sessions
        </button>
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
