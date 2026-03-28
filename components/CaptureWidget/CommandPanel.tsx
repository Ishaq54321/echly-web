"use client";

import React from "react";

export type SessionOption = {
  id: string;
  title: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type CommandPanelProps = {
  onCaptureArea: () => void;
  onCaptureElement?: () => void;
  onStartSession?: () => void;
  onResumeSession?: () => void;
  onOpenPreviousSession?: () => void;
  hasActiveSession?: boolean;
  recentSessions?: SessionOption[];
  onSelectSession?: (sessionId: string) => void;
  captureDisabled?: boolean;
};

export default function CommandPanel({
  onCaptureArea,
  onCaptureElement,
  onStartSession,
  onResumeSession,
  onOpenPreviousSession,
  hasActiveSession = false,
  recentSessions = [],
  onSelectSession,
  captureDisabled = false,
}: CommandPanelProps) {
  const effectivelyDisabled = captureDisabled;

  return (
    <>
      <section>
        <h3 className="echly-command-section-title">Capture Feedback</h3>
        <div className="echly-command-actions">
          <button
            type="button"
            onClick={effectivelyDisabled ? undefined : onCaptureArea}
            disabled={effectivelyDisabled}
            className="echly-btn-primary"
            aria-label="Capture area"
          >
            Capture Area
          </button>
          {onCaptureElement != null && (
            <button
              type="button"
              onClick={effectivelyDisabled ? undefined : onCaptureElement}
              disabled={effectivelyDisabled}
              className="echly-btn-secondary"
              aria-label="Capture element"
            >
              Capture Element
            </button>
          )}
          {onStartSession != null && (
            <button
              type="button"
              onClick={effectivelyDisabled ? undefined : onStartSession}
              disabled={effectivelyDisabled}
              className="echly-btn-secondary"
              aria-label="Start session"
            >
              Start Session
            </button>
          )}
        </div>
      </section>

      {(onResumeSession || onOpenPreviousSession) && (
        <section className="echly-recent-sessions">
          <h3 className="echly-command-section-title">Recent Sessions</h3>
          {onResumeSession && hasActiveSession && (
            <button
              type="button"
              onClick={onResumeSession}
              className="echly-btn-secondary"
              style={{ width: "100%" }}
              aria-label="Resume session"
            >
              Resume Session
            </button>
          )}
          {recentSessions.length > 0 && onSelectSession
            ? recentSessions.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSession(s.id)}
                  className="echly-recent-session-item"
                >
                  {s.title?.trim() ? <span>{s.title}</span> : null}
                </button>
              ))
            : onOpenPreviousSession && (
                <button
                  type="button"
                  onClick={onOpenPreviousSession}
                  className="echly-btn-ghost"
                  style={{ width: "100%" }}
                  aria-label="Previous Sessions"
                >
                  Previous Sessions
                </button>
              )}
        </section>
      )}
    </>
  );
}
