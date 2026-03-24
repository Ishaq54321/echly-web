"use client";

import React, { useState, useSyncExternalStore } from "react";

export type TextFeedbackPanelProps = {
  screenshot?: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  /** When set, drives modal light/dark. When omitted, syncs from `#echly-root[data-theme]`. */
  theme?: "light" | "dark";
};

function subscribeEchlyRootTheme(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const root = document.getElementById("echly-root");
  if (!root) return () => {};
  const obs = new MutationObserver(onChange);
  obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

function getEchlyRootThemeSnapshot(): "light" | "dark" {
  const t = document.getElementById("echly-root")?.getAttribute("data-theme");
  return t === "light" ? "light" : "dark";
}

function getEchlyRootThemeServerSnapshot(): "light" | "dark" {
  return "dark";
}

function useResolvedTheme(prop?: "light" | "dark"): "light" | "dark" {
  const fromDom = useSyncExternalStore(
    subscribeEchlyRootTheme,
    getEchlyRootThemeSnapshot,
    getEchlyRootThemeServerSnapshot
  );
  return prop ?? fromDom;
}

export function TextFeedbackPanel({
  screenshot,
  onSubmit,
  onCancel,
  theme: themeProp,
}: TextFeedbackPanelProps) {
  const [text, setText] = useState("");
  const theme = useResolvedTheme(themeProp);
  const isDark = theme === "dark";

  const handleSubmit = () => {
    const t = text.trim();
    if (t) onSubmit(t);
  };

  return (
    <div
      className={`echly-text-modal ${isDark ? "dark" : "light"}`}
      data-echly-ui="true"
    >
      {screenshot && (
        <div className="echly-text-modal__shot-wrap">
          <div className="echly-text-modal__shot-frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- session capture data URL */}
            <img
              src={screenshot}
              alt="Capture"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
      <div className="echly-text-modal__body">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the feedback..."
          aria-label="Feedback text"
          rows={3}
          className="echly-textarea"
        />
        <div className="echly-text-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="echly-btn-cancel">
              Cancel
            </button>
          )}
          <button
            type="button"
            className="echly-btn-save submit-feedback"
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
