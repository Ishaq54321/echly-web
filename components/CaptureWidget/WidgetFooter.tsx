"use client";

type WidgetFooterProps = {
  isIdle: boolean;
  onAddFeedback: () => void;
};

export default function WidgetFooter({
  isIdle,
  onAddFeedback,
}: WidgetFooterProps) {
  return (
    <button
      type="button"
      onClick={onAddFeedback}
      className={`mt-3 w-full px-6 py-2.5 rounded-lg flex items-center justify-center text-sm font-medium tracking-tight
  transition-all duration-150 ease-out
  ${
    !isIdle
      ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
      : "focus-ring-brand bg-brand-primary text-white hover:brightness-95 active:scale-[0.98] focus-visible:outline-none transition-transform duration-100 ease-out"
  }`}
    >
      + Add Feedback
    </button>
  );
}
