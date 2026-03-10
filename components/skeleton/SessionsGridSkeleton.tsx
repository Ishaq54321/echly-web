import SessionCardSkeleton from "./SessionCardSkeleton";

export default function SessionsGridSkeleton() {
  return (
    <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <SessionCardSkeleton key={i} />
      ))}
    </div>
  );
}
