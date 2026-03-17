"use client";

import React from "react";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
  /** When set (extension mode), show only session actions (no "Capture feedback") */
  extensionMode?: boolean;
  /** When set (dashboard), "Capture feedback" calls this to start capture (idle → focus_mode). */
  startCapture?: () => void;
  onStartSession?: () => void;
  onOpenPreviousSession?: () => void;
  /** When true, Previous Sessions button shows "Opening..." and is disabled */
  openingPrevious?: boolean;
  hasActiveSession?: boolean;
  captureDisabled?: boolean;
};

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
  extensionMode = false,
  startCapture,
  onStartSession,
  onOpenPreviousSession,
  openingPrevious = false,
  hasActiveSession = false,
  captureDisabled = false,
}: WidgetFooterProps) {
  const effectivelyDisabled = !isIdle || captureDisabled;
  const previousDisabled = effectivelyDisabled || openingPrevious;
  const onCaptureClick = startCapture ?? onAddFeedback;

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
          onClick={previousDisabled ? undefined : onOpenPreviousSession}
          disabled={previousDisabled}
          className="echly-previous-session-btn"
          aria-label={openingPrevious ? "Opening previous sessions" : "Previous Sessions"}
          aria-busy={openingPrevious}
        >
          {openingPrevious ? "Opening..." : "Previous Sessions"}
        </button>
      </div>
    );
  }

  return (
    <div className="echly-add-insight-wrap">
      <button
        type="button"
        onClick={effectivelyDisabled ? undefined : onCaptureClick}
        disabled={effectivelyDisabled}
        className={`echly-add-insight-btn ${effectivelyDisabled ? "echly-add-insight-btn--disabled" : ""}`}
        aria-label="Capture feedback"
      >
        Capture feedback
      </button>
    </div>
  );
}
