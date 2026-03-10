export function DiscussionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl bg-neutral-200/60 animate-pulse"
        />
      ))}
    </div>
  );
}
