"use client";

export function CircularProgress({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      role="img"
      aria-label={`${pct}% progress`}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#f59e0b ${pct}%, #e5e7eb ${pct}%)`,
        }}
        aria-hidden
      />
      <div className="relative z-[1] h-7 w-7 shrink-0 rounded-full bg-white" aria-hidden />
    </div>
  );
}
