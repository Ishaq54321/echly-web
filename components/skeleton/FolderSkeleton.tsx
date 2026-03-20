export default function FolderSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-xl bg-white min-w-[200px] shadow-sm">
      <div className="h-5 w-5 bg-neutral-200 rounded shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-3 w-16 bg-neutral-100 rounded" />
      </div>
    </div>
  );
}
