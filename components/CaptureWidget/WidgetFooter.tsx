"use client";

import React from "react";
import { Plus } from "lucide-react";

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
    <button
      type="button"
      onClick={effectivelyDisabled ? undefined : onAddFeedback}
      disabled={effectivelyDisabled}
      className={`echly-add-feedback-btn ${effectivelyDisabled ? "echly-add-feedback-btn--disabled" : ""}`}
      aria-label="Add feedback"
    >
      <Plus size={18} strokeWidth={2} className="echly-add-feedback-icon" />
    </button>
  );
}
