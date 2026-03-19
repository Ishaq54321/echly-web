import SessionCardSkeleton from "./SessionCardSkeleton";

export default function SessionsGridSkeleton({
  count = 10,
  variant,
}: {
  count?: number;
  variant?: "generic" | "exact";
}) {
  const effectiveCount = variant === "generic" ? 3 : count;
  const safeCount = Math.max(0, Math.floor(effectiveCount));
  return (
    <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
      {Array.from({ length: safeCount }).map((_, i) => (
        <SessionCardSkeleton key={i} />
      ))}
    </div>
  );
}
