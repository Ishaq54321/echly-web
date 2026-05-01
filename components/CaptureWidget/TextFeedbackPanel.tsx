"use client";

import React, { useEffect, useState } from "react";

export type TextFeedbackPanelProps = {
  screenshot?: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  /** When set, drives modal light/dark. When omitted, syncs from `#echly-root[data-theme]`. */
  theme?: "light" | "dark";
  /** When provided, renders a "Voice mode" pill on the screenshot that calls this on click. */
  onSwitchToVoice?: () => void;
  /** Element selector badge (e.g. "#pricing-cta") */
  elementSelector?: string;
  /** Element width in px for badge */
  elementWidth?: number;
  /** Element height in px for badge */
  elementHeight?: number;
};

const MAX_LEN = 1000;

export function TextFeedbackPanel({
  screenshot,
  onSubmit,
  onCancel,
  onSwitchToVoice,
  elementSelector,
  elementWidth,
  elementHeight,
}: TextFeedbackPanelProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const t = text.trim();
    if (t) onSubmit(t);
  };

  useEffect(() => {
    if (!onCancel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const charCountWarn = text.length > 900;

  return (
    <div className="echly-v2 echly-v2-overlay-anchor" data-echly-ui="true">
      <div className="vc-card" data-echly-ui="true">
        {screenshot && (
          <div className="vc-screenshot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Capture" />
            {onSwitchToVoice && (
              <div className="vc-top-controls">
                <button type="button" className="vc-glass-pill" onClick={onSwitchToVoice}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  <span>Voice mode</span>
                </button>
              </div>
            )}
            {elementSelector && (
              <span className="vc-selector">
                {elementSelector}
                {elementWidth && elementHeight ? ` · ${elementWidth} × ${elementHeight}` : ""}
              </span>
            )}
          </div>
        )}

        <div className="vc-body">
          <div className="vc-helper">
            <div className="vc-helper-main">Describe what you&apos;d change in your own words</div>
            <div className="vc-helper-sub">
              We&apos;ll turn it into structured, actionable feedback.
            </div>
          </div>

          <div className="vc-textarea-wrap">
            <textarea
              className="vc-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your feedback here..."
              maxLength={MAX_LEN}
              aria-label="Feedback text"
              autoFocus
            />
            <div className="vc-textarea-footer">
              <span className="vc-textarea-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
                We&apos;ll structure this into a ticket
              </span>
              <span className={`vc-char-count${charCountWarn ? " vc-char-warn" : ""}`}>
                {text.length} / {MAX_LEN}
              </span>
            </div>
          </div>

          <div className="vc-actions">
            <button type="button" className="vc-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="vc-done-btn"
              onClick={handleSubmit}
              disabled={!text.trim()}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
