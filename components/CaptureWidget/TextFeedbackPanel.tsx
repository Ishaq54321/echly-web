"use client";

import React, { useEffect, useState } from "react";

export type TextFeedbackPanelProps = {
  screenshot?: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  /** When set, drives modal light/dark. When omitted, syncs from `#echly-root[data-theme]`. */
  theme?: "light" | "dark";
  /** When provided, renders a "Switch to Voice Mode" row that calls this on click. */
  onSwitchToVoice?: () => void;
  /** Element selector badge (e.g. "#pricing-cta") */
  elementSelector?: string;
  /** Element width in px for badge */
  elementWidth?: number;
  /** Element height in px for badge */
  elementHeight?: number;
};

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

  const shotBadge =
    elementSelector ? (
      <span className="ovl-shot-tag">
        {elementSelector}
        {elementWidth && elementHeight ? ` · ${elementWidth} × ${elementHeight}` : ""}
      </span>
    ) : null;

  return (
    <div className="echly-v2 echly-v2-overlay-anchor" data-echly-ui="true">
      <div className="center-card" data-echly-ui="true">
        <div className="ovl-top-bar">
          {onSwitchToVoice && (
            <button type="button" className="ovl-top-pill" onClick={onSwitchToVoice}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span className="ovl-top-pill-label">Switch to Voice mode</span>
            </button>
          )}
        </div>
        {screenshot && (
          <div className="ovl-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Capture" />
            {shotBadge}
          </div>
        )}

        <div className="ovl-textarea-wrap">
          <textarea
            className="ovl-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you noticed…"
            aria-label="Feedback text"
            autoFocus
          />
          <div className="ovl-textarea-foot">
            <span className="hint">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M8 2l4 3M8 2L4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              AI will structure this into a ticket
            </span>
            <span className="count">{text.length} / 1000</span>
          </div>
        </div>

        <div className="ovl-actions">
          <button type="button" className="rec-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`finish-btn${!text.trim() ? " disabled" : ""}`}
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
