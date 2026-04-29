"use client";

import React from "react";

type ModeSelectionViewProps = {
  captureMode: "voice" | "text";
  onModeChange: (mode: "voice" | "text") => void;
  onBegin: () => void;
  onBack: () => void;
  onClose: () => void;
  pageUrl?: string;
};

export default function ModeSelectionView({
  captureMode,
  onModeChange,
  onBegin,
  onBack,
  onClose,
  pageUrl,
}: ModeSelectionViewProps) {
  const rawUrl = pageUrl ?? (typeof window !== "undefined" ? window.location.href : "");
  let host = "";
  let path = "";
  try {
    if (rawUrl) {
      const u = new URL(rawUrl);
      host = u.hostname;
      path = u.pathname;
    }
  } catch {}
  const faviconInitial = host ? host.charAt(0).toUpperCase() : "W";

  return (
    <div className="pill pill-mode">
      {/* Page context strip */}
      <div className="page-context">
        <span className="page-context-favicon">{faviconInitial}</span>
        <span className="page-context-url">
          <span className="host">{host}</span>
          {path && path !== "/" ? path : ""}
        </span>
        <span className="page-context-badge">Recording ready</span>
      </div>

      {/* Header */}
      <div className="pill-head">
        <span className="pill-mark">E</span>
        <div className="pill-ws">
          <span className="pill-ws-name">Echly</span>
        </div>
        <button
          type="button"
          className="pill-icon-btn"
          onClick={onBack}
          aria-label="Back"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M9.5 4L5.5 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className="pill-icon-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="pill-rule" />

      {/* Mode prompt */}
      <div className="mode-prompt">
        <span className="mode-prompt-eyebrow">
          <span className="ai-dot" aria-hidden />
          {" "}Echly AI
        </span>
        <div className="mode-prompt-title">How do you want to give feedback?</div>
        <div className="mode-prompt-sub">Speak it or write it — I'll structure it into tickets with screenshots.</div>
      </div>

      {/* Mode cards */}
      <div className="mode-grid">
        <button
          type="button"
          className={`mode-card${captureMode === "voice" ? " active" : ""}`}
          onClick={() => onModeChange("voice")}
          aria-pressed={captureMode === "voice"}
        >
          <span className="mode-card-check" aria-hidden="true">
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="mode-card-glyph">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <div className="mode-card-title">Voice</div>
            <div className="mode-card-sub">Talk through the page. Faster.</div>
          </div>
          <span className="voice-wave" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </span>
        </button>

        <button
          type="button"
          className={`mode-card${captureMode === "text" ? " active" : ""}`}
          onClick={() => onModeChange("text")}
          aria-pressed={captureMode === "text"}
        >
          <span className="mode-card-check" aria-hidden="true">
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="mode-card-glyph">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 12.5l1-3 7-7 2 2-7 7-3 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9.5 4l2 2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <div>
            <div className="mode-card-title">Write</div>
            <div className="mode-card-sub">Type notes, click to attach.</div>
          </div>
        </button>
      </div>

      {/* Confirm row */}
      <div className="mode-confirm">
        <div className="mode-confirm-info">
          {captureMode === "voice" && (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v4M8 11h.01M2.5 13h11a1 1 0 0 0 .87-1.5l-5.5-9.5a1 1 0 0 0-1.74 0l-5.5 9.5A1 1 0 0 0 2.5 13z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mic permission required
            </>
          )}
        </div>
        <button
          type="button"
          className="begin-btn"
          style={{ backgroundColor: "#1775E0" }}
          onClick={onBegin}
        >
          Begin
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
