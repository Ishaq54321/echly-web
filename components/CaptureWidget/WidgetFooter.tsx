"use client";

import React from "react";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
  captureDisabled?: boolean;
};

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
  captureDisabled = false,
}: WidgetFooterProps) {
  const effectivelyDisabled = !isIdle || captureDisabled;
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
