"use client";

import React from "react";

export type SessionControlPanelProps = {
  sessionPaused: boolean;
  pausePending?: boolean;
  endPending?: boolean;
  __extensionSavingState?: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

export function SessionControlPanel({
  sessionPaused,
  pausePending = false,
  endPending = false,
  __extensionSavingState: _ignored,
  onPause,
  onResume,
  onEnd,
}: SessionControlPanelProps) {
  const isSaving = endPending || pausePending;
  const isPaused = sessionPaused && !isSaving;

  return (
    <div data-echly-ui="true" className="echly-sc-root">
      <div className="sc-bar">

        {/* Status: spinner | amber pause icon | green live dot + label */}
        <span className="sc-status">
          {isSaving ? (
            <span className="sc-spinner" aria-hidden />
          ) : isPaused ? (
            <span className="paused" aria-hidden />
          ) : (
            <span className="live" aria-hidden />
          )}
          {isSaving
            ? "Saving session…"
            : isPaused
            ? "Session paused"
            : "Session started"}
        </span>

        <span className="sc-divider" aria-hidden />

        {/* Pause / Resume */}
        {isSaving ? (
          <button type="button" className="sc-btn disabled" disabled>
            Pause
          </button>
        ) : isPaused ? (
          <button type="button" className="sc-btn brand" onClick={onResume}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M5 3.5l8 4.5-8 4.5z" fill="currentColor" />
            </svg>
            Resume
          </button>
        ) : (
          <button type="button" className="sc-btn ghost" onClick={onPause}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 4v8M10 4v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Pause
          </button>
        )}

        {/* End */}
        {isSaving ? (
          <button type="button" className="sc-btn disabled" disabled>
            End
          </button>
        ) : (
          <button type="button" className="sc-btn danger" onClick={onEnd}>
            <span className="sc-stop-sq" aria-hidden />
            End
          </button>
        )}

      </div>
    </div>
  );
}
