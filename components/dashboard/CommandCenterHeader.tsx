"use client";

export interface CommandCenterHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: "all" | "archived";
  onViewModeChange: (mode: "all" | "archived") => void;
  onNewSession: () => void;
}

export function CommandCenterHeader({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onNewSession,
}: CommandCenterHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div>
        <h1 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))]">
          Command Center
        </h1>
        <p className="mt-2 text-[14px] leading-[1.5] text-[hsl(var(--text-tertiary))]">
          High-signal overview across all sessions.
        </p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div
          className="flex rounded-lg border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] p-0.5"
          role="tablist"
          aria-label="Filter sessions"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "all"}
            onClick={() => onViewModeChange("all")}
            className={`h-8 px-3.5 rounded-md text-[13px] font-medium transition-colors duration-150 ease-out ${
              viewMode === "all"
                ? "bg-[var(--layer-2-hover-bg)] text-[hsl(var(--text-primary-strong))]"
                : "text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "archived"}
            onClick={() => onViewModeChange("archived")}
            className={`h-8 px-3.5 rounded-md text-[13px] font-medium transition-colors duration-150 ease-out ${
              viewMode === "archived"
                ? "bg-[var(--layer-2-hover-bg)] text-[hsl(var(--text-primary-strong))]"
                : "text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))]"
            }`}
          >
            Archived
          </button>
        </div>
        <button
          type="button"
          onClick={onNewSession}
          className="btn-primary-glow h-9 rounded-lg bg-[var(--color-primary)] text-white text-[14px] px-4 font-semibold shadow-[0_2px_8px_rgba(26,86,219,0.28)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:ring-offset-2 transition-[transform,box-shadow,background-color] duration-200 [transition-timing-function:var(--ease-premium)] cursor-pointer"
        >
          New Session
        </button>
        <input
          type="search"
          placeholder="Search sessions"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 px-3.5 min-w-[160px] rounded-lg bg-[var(--layer-1-bg)] border border-[var(--layer-2-border)] text-[14px] text-[hsl(var(--text-primary-strong))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-150 ease-out"
          aria-label="Search sessions"
        />
      </div>
    </div>
  );
}
