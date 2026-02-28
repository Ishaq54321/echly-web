"use client";

interface Props {
  feedback: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  selectedIndex?: number;
  total?: number;
}

export default function FeedbackSidebar({
  feedback,
  selectedId,
  onSelect,
  selectedIndex,
  total,
}: Props) {
  return (
    <div className="flex h-full flex-col border-r border-[hsl(var(--border))] border-opacity-50 bg-[hsl(var(--surface-1))] px-6 pt-8 pb-6">
      <div className="space-y-5">
        <div>
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--text-muted))]">
            FEEDBACK
          </div>
          {selectedIndex !== undefined && total !== undefined && (
            <div className="text-xs text-[hsl(var(--text-muted))]">
              {selectedIndex + 1} of {total}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col space-y-1.5 overflow-y-auto">
          {feedback.map((item) => {
            const isActive = item.id === selectedId;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`relative w-full cursor-pointer rounded-xl px-4 py-3.5 text-left transition-all duration-150 ease-out
                  ${isActive ? "bg-[hsl(var(--surface-2))]" : "hover:bg-[hsl(var(--surface-2))]"}`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[hsl(var(--accent))]"
                    aria-hidden
                  />
                )}
                <div className="truncate text-sm font-medium text-[hsl(var(--text-primary))]">
                  {item.title}
                </div>
                <div className="mt-1">
                  <span className="rounded-full bg-[hsl(var(--surface-2))] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[hsl(var(--text-muted))]">
                    {item.type}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
