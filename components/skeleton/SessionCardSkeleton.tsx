export default function SessionCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex h-full flex-col justify-between">
        <div>
          {/* Header: icon + title — matches WorkspaceCard */}
          <div className="flex items-center gap-3 mb-5 pr-10 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-neutral-200 shrink-0" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="h-3 w-24 bg-neutral-100 rounded" />
            </div>
          </div>

          {/* Signal pills */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-16 rounded-full bg-neutral-200" />
            <div className="h-6 w-12 rounded-full bg-neutral-200" />
          </div>
        </div>

        <div className="mt-auto">
          <div className="h-px bg-neutral-200 mb-3" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-8 bg-neutral-200 rounded" />
            <div className="h-4 w-8 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
