import FolderSkeletonCard from "./FolderSkeleton";

export default function FoldersSkeleton({ count }: { count: number }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {Array.from({ length: count }).map((_, i) => (
        <FolderSkeletonCard key={i} />
      ))}
    </div>
  );
}
