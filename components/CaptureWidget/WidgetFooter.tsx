"use client";

import React from "react";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
  /** When set (extension mode), show only session actions (no "Capture feedback") */
  extensionMode?: boolean;
  onStartSession?: () => void;
  onResumeSession?: () => void;
  onOpenPreviousSession?: () => void;
  hasActiveSession?: boolean;
  captureDisabled?: boolean;
};

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
  extensionMode = false,
  onStartSession,
  onResumeSession,
  onOpenPreviousSession,
  hasActiveSession = false,
  captureDisabled = false,
}: WidgetFooterProps) {
  const effectivelyDisabled = !isIdle || captureDisabled;
  const resumeDisabled = effectivelyDisabled || !hasActiveSession || !onResumeSession;
  const showSessionActions = Boolean(onResumeSession || onOpenPreviousSession);

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
        {showSessionActions && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={resumeDisabled ? undefined : onResumeSession}
              disabled={resumeDisabled}
              className={`echly-add-insight-btn echly-add-insight-btn--secondary ${resumeDisabled ? "echly-add-insight-btn--disabled" : ""}`}
              aria-label="Resume Session"
              style={{
                flex: 1,
                minWidth: 0,
                background: "rgba(37, 99, 235, 0.15)",
                color: "#2563eb",
                border: "1px solid rgba(37, 99, 235, 0.4)",
              }}
            >
              Resume Session
            </button>
            <button
              type="button"
              onClick={effectivelyDisabled ? undefined : onOpenPreviousSession}
              disabled={effectivelyDisabled}
              className={`echly-add-insight-btn echly-add-insight-btn--secondary ${effectivelyDisabled ? "echly-add-insight-btn--disabled" : ""}`}
              aria-label="Open Previous Session"
              style={{
                flex: 1,
                minWidth: 0,
                background: "rgba(255,255,255,0.08)",
                color: "#2563eb",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              Open Previous Session
            </button>
          </div>
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
