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
  /** When true (extension), show loading spinner instead of Start / Previous Session buttons */
  sessionLoading?: boolean;
  /** When true, Start Session button shows spinner and is disabled */
  startSessionLoading?: boolean;
  /** When true, Previous Sessions button shows spinner and is disabled */
  sessionSwitchLoading?: boolean;
};

const ButtonSpinner = () => (
  <div className="echly-footer-btn-spinner-wrap" aria-hidden>
    <span className="echly-spinner" />
  </div>
);

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
  extensionMode = false,
  onStartSession,
  onOpenPreviousSession,
  hasActiveSession = false,
  captureDisabled = false,
  sessionLoading = false,
  startSessionLoading = false,
  sessionSwitchLoading = false,
}: WidgetFooterProps) {
  const effectivelyDisabled = !isIdle || captureDisabled;

  if (extensionMode) {
    if (sessionLoading) {
      return (
        <div className="echly-command-actions echly-command-actions--loading" aria-busy="true" aria-live="polite">
          <div className="echly-footer-loading">
            <span className="echly-spinner" aria-hidden />
            <span className="echly-footer-loading-text">Loading session...</span>
          </div>
        </div>
      );
    }
    const startDisabled = effectivelyDisabled || startSessionLoading;
    const previousDisabled = effectivelyDisabled || sessionSwitchLoading;
    return (
      <div className="echly-command-actions">
        <button
          type="button"
          onClick={startDisabled ? undefined : onStartSession}
          disabled={startDisabled}
          className="echly-start-session-btn"
          aria-label="Start Session"
          aria-busy={startSessionLoading}
        >
          {startSessionLoading ? <ButtonSpinner /> : "Start Session"}
        </button>
        <button
          type="button"
          onClick={previousDisabled ? undefined : onOpenPreviousSession}
          disabled={previousDisabled}
          className="echly-previous-session-btn"
          aria-label="Previous Sessions"
          aria-busy={sessionSwitchLoading}
        >
          {sessionSwitchLoading ? <ButtonSpinner /> : "Previous Sessions"}
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
