"use client";

export function FeedbackPremiumLoader() {
  return (
    <div className="space-y-2" aria-label="Loading feedback">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--surface-2))] px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <span className="w-6 shrink-0 text-right text-[13px] text-meta">—</span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div
              className="h-4 rounded bg-neutral-200/60 dark:bg-neutral-600/40 animate-feedback-placeholder-pulse"
              style={{ width: "60%" }}
            />
            <div
              className="h-3 rounded bg-neutral-100/80 dark:bg-neutral-700/30 animate-feedback-placeholder-pulse"
              style={{ width: "80%", animationDelay: "0.15s" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
