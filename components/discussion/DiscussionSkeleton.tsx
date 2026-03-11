export function DiscussionSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 pl-3 pr-3 py-3">
          <div className="w-8 h-8 rounded-full skeleton shrink-0" />
          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
            <div className="h-4 w-3/4 skeleton max-w-[200px]" />
            <div className="h-3 w-1/2 skeleton max-w-[120px]" />
            <div className="h-3 w-1/3 skeleton max-w-[80px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
