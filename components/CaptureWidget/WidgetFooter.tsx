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
      className={`mt-2 w-full px-6 py-3 rounded-md text-sm font-semibold tracking-tight transition
  ${
    !isIdle
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:opacity-95"
  }`}
    >
      + Add Feedback
    </button>
  );
}
