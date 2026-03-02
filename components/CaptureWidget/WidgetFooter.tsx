"use client";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
  /** When true, button is disabled and no click handler runs. No message shown. */
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
      className={`echly-widget-font echly-sidebar-add-btn ${effectivelyDisabled ? "echly-sidebar-add-btn--disabled" : ""}`}
    >
      + Add Feedback
    </button>
  );
}
