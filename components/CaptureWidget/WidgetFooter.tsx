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
      className={`mt-3 w-full px-6 py-2.5 rounded-md flex items-center justify-center text-sm font-semibold tracking-tight
  transition-[color,filter,transform] duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
  ${
    !isIdle
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:brightness-[0.96] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
  }`}
    >
      + Add Feedback
    </button>
  );
}
