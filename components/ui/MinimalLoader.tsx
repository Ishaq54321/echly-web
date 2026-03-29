"use client";

type MinimalLoaderProps = {
  className?: string;
  /** Visible status text; default is neutral loading copy */
  label?: string;
  showLabel?: boolean;
  /** Tighter layout with spinner and label in a row */
  compact?: boolean;
};

export function MinimalLoader({
  className = "",
  label = "Loading…",
  showLabel = true,
  compact = false,
}: MinimalLoaderProps) {
  return (
    <div
      className={
        compact
          ? `inline-flex flex-row items-center gap-2 ${className}`.trim()
          : `flex flex-col items-center justify-center gap-3 py-8 px-4 ${className}`.trim()
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className={
          compact
            ? "h-4 w-4 shrink-0 rounded-full border-2 border-neutral-200 border-t-[#155DFC] animate-spin"
            : "h-5 w-5 shrink-0 rounded-full border-2 border-neutral-200 border-t-[#155DFC] animate-spin"
        }
        aria-hidden
      />
      {showLabel ? (
        <span className="text-sm text-neutral-500">{label}</span>
      ) : null}
    </div>
  );
}
