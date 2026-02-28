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
      onClick={onAddFeedback}
      className={`mt-2 w-full px-6 py-3 rounded-lg text-sm font-semibold tracking-tight transition-colors duration-[120ms] ease-out
  ${
    !isIdle
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:brightness-[0.96]"
  }`}
    >
      + Add Feedback
    </button>
  );
}
