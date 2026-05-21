/**
 * Placeholder rows shown while the session list loads, in place of the
 * full-area BrandLoader. Mirrors `SessionWorkspaceRow`'s real structure so
 * content swaps in without layout shift:
 *  - outer: `flex w-full items-center justify-between rounded-lg px-4 py-4`
 *  - left: `gap-4` — circular 38px leading element (the ProgressPie) + a
 *    text column with a 15px title row and a 13px subtitle row
 *  - right: `gap-10` — the open / resolved / date metadata items
 */
export function SessionRowSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className="mt-2 space-y-1"
      aria-busy="true"
      aria-label="Loading sessions"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex w-full items-center justify-between rounded-lg px-4 py-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Leading element mirrors the 38px box wrapping a 32px ProgressPie */}
            <div className="flex h-[38px] w-[38px] items-center justify-center">
              <div className="session-row-skeleton__bar h-[32px] w-[32px] rounded-full" />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              {/* Title — matches the 15px font-medium heading line */}
              <div className="session-row-skeleton__bar h-[15px] w-[240px] max-w-full rounded" />
              {/* Subtitle — matches the 13px secondary "Created by · N comments" line */}
              <div className="session-row-skeleton__bar h-[13px] w-[150px] max-w-full rounded" />
            </div>
          </div>
          {/* Right metadata cluster — open / resolved / date, gap-10 like the real row */}
          <div className="flex min-h-[36px] items-center shrink-0 gap-2 md:gap-10">
            <div className="session-row-skeleton__bar h-[14px] w-[64px] rounded" />
            <div className="session-row-skeleton__bar h-[14px] w-[78px] rounded" />
            <div className="session-row-skeleton__bar h-[14px] w-[70px] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
