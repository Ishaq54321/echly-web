"use client";

/**
 * Skeleton for the billing tab. Mirrors the View B layout (the more complex
 * of the two) so data arrival causes no jarring layout shift.
 */
export function BillingLoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      {/* Current plan card */}
      <div
        className="rounded-[var(--radius-lg)] p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          minHeight: 132,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="echly-skeleton h-3.5 w-24 rounded" aria-hidden />
          <span className="echly-skeleton h-5 w-16 rounded-full" aria-hidden />
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="echly-skeleton h-8 w-32 rounded" aria-hidden />
          <span className="echly-skeleton h-5 w-24 rounded" aria-hidden />
        </div>
        <div className="echly-skeleton mt-3 h-3.5 w-40 rounded" aria-hidden />
      </div>

      {/* Payment method card */}
      <div
        className="rounded-[var(--radius-lg)] p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          minHeight: 140,
        }}
      >
        <span className="echly-skeleton h-3.5 w-28 rounded" aria-hidden />
        <div className="echly-skeleton mt-4 h-5 w-48 rounded" aria-hidden />
        <div
          className="echly-skeleton mt-6 h-[40px] w-44 rounded-[var(--radius-btn)]"
          aria-hidden
        />
      </div>

      {/* History card */}
      <div
        className="rounded-[var(--radius-lg)] p-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          minHeight: 180,
        }}
      >
        <span className="echly-skeleton h-3.5 w-28 rounded" aria-hidden />
        <div className="mt-5 flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="echly-skeleton h-4 w-24 rounded" aria-hidden />
              <span className="echly-skeleton h-4 w-20 rounded" aria-hidden />
              <span className="echly-skeleton h-4 w-16 rounded" aria-hidden />
              <span className="echly-skeleton h-4 w-20 rounded" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
