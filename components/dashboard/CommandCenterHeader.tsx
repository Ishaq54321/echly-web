"use client";

import { Button } from "@/components/ui/Button";

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
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
      <div>
        <h1 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.02em] text-[var(--text-primary-strong)]">
          Command Center
        </h1>
        <p className="mt-2 text-[14px] leading-[1.5] text-[var(--text-tertiary)]">
          High-signal overview across all sessions.
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 md:flex-shrink-0">
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
            className={`h-[38px] px-4 rounded-[var(--radius-btn)] text-[14px] font-medium transition-colors duration-150 ease-out ${
              viewMode === "all"
                ? "bg-[var(--layer-2-hover-bg)] text-[var(--text-primary-strong)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary-soft)]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "archived"}
            onClick={() => onViewModeChange("archived")}
            className={`h-[38px] px-4 rounded-[var(--radius-btn)] text-[14px] font-medium transition-colors duration-150 ease-out ${
              viewMode === "archived"
                ? "bg-[var(--layer-2-hover-bg)] text-[var(--text-primary-strong)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary-soft)]"
            }`}
          >
            Archived
          </button>
        </div>
        <Button
          variant="primary"
          type="button"
          onClick={onNewSession}
          className="h-[38px] rounded-[var(--radius-btn)] text-[14px] px-4 font-semibold"
        >
          New Session
        </Button>
        <input
          type="search"
          placeholder="Search sessions"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 md:h-9 px-3.5 w-full md:min-w-[160px] md:w-auto rounded-lg bg-[var(--layer-1-bg)] border border-[var(--layer-2-border)] text-[14px] text-[var(--text-primary-strong)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-150 ease-out"
          aria-label="Search sessions"
        />
      </div>
    </div>
  );
}
