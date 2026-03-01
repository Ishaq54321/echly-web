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
      className={`mt-3 w-full px-6 py-2.5 rounded-lg flex items-center justify-center text-sm font-medium tracking-tight transition-colors duration-150 ${
        effectivelyDisabled
          ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
          : "cursor-pointer focus-ring-brand bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] focus-visible:outline-none"
      }`}
    >
      + Add Feedback
    </button>
  );
}
