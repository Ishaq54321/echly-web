"use client";

export function SessionPremiumLoader() {
  return (
    <div
      className="flex flex-1 min-h-screen items-center justify-center bg-[hsl(var(--background))]"
      aria-label="Loading session"
    >
      <div
        className="h-[3px] w-[120px] rounded-full bg-neutral-300 dark:bg-neutral-600 opacity-60 animate-session-loader-pulse"
        role="presentation"
      />
    </div>
  );
}
