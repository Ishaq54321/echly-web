function SessionSkeletonCard() {
  return (
    <div className="relative w-full rounded-xl border border-neutral-200 bg-white p-5 overflow-hidden shadow-sm animate-pulse [animation-duration:1.8s]">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-200/80 rounded-t-xl" aria-hidden />
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-5 pr-10 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-neutral-200 shrink-0" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="h-3 w-24 bg-neutral-100 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-16 rounded-full bg-neutral-200" />
            <div className="h-6 w-12 rounded-full bg-blue-100" />
          </div>
        </div>

        <div className="mt-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mb-3" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-8 bg-neutral-200 rounded" />
            <div className="h-4 w-8 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionSkeletonList({ count }: { count: number }) {
  const safeCount = Math.max(0, Math.floor(count));

  if (safeCount === 0) return null;

  return (
    <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
      {Array.from({ length: safeCount }).map((_, index) => (
        <SessionSkeletonCard key={index} />
      ))}
    </div>
  );
}
