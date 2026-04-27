"use client";

import { DiscussionSidebarHeading } from "@/components/discussion/DiscussionSidebarHeading";

export interface SidebarProject {
  id: string;
  name: string;
  count: number;
}

export interface DiscussionSidebarProps {
  projects: SidebarProject[];
  totalCount: number;
  selectedProjectId: string | null;
  onProjectChange: (id: string | null) => void;
  /** Threads matching session + search (same basis as list header counts) */
  filteredThreadCount: number;
  openThreadCount: number;
  statsLoading: boolean;
}

export function DiscussionSidebar({
  projects,
  totalCount,
  selectedProjectId,
  onProjectChange,
  filteredThreadCount,
  openThreadCount,
  statsLoading,
}: DiscussionSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-white overflow-hidden">
      <DiscussionSidebarHeading
        filteredThreadCount={filteredThreadCount}
        openThreadCount={openThreadCount}
        statsLoading={statsLoading}
      />

      {/* Workspace section */}
      <div className="px-4 pb-1 pt-3 shrink-0">
        <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-meta">Workspace</p>
      </div>
      <button
        type="button"
        onClick={() => onProjectChange(null)}
        className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-left text-[14px] transition-all ${
          selectedProjectId === null
            ? "bg-[var(--brand-subtle)]/70 text-discussion-title font-medium"
            : "text-discussion-supporting hover:bg-[var(--surface-hover)] hover:text-discussion-title"
        }`}
      >
        <span
          className={`w-[6px] h-[6px] rounded-full shrink-0 ${
            selectedProjectId === null ? "bg-[var(--brand)]" : "bg-[var(--text-tertiary)]"
          }`}
        />
        <span className="flex-1 truncate">All projects</span>
        <span
          className={`ml-auto text-[12px] px-[6px] py-0.5 rounded-full font-medium tabular-nums ${
            selectedProjectId === null
              ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
              : "bg-[var(--surface-hover)] text-meta"
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* Sessions section */}
      {projects.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-1 shrink-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-meta">Sessions</p>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 pb-2">
            {projects.map((proj) => {
              const isActive = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onProjectChange(proj.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-left text-[14px] transition-all ${
                    isActive
                      ? "bg-[var(--brand-subtle)]/70 text-discussion-title font-medium"
                      : "text-discussion-supporting hover:bg-[var(--surface-hover)] hover:text-discussion-title"
                  }`}
                >
                  <span
                    className={`w-[6px] h-[6px] rounded-full shrink-0 ${
                      isActive ? "bg-[var(--brand)]" : "bg-[var(--text-tertiary)]"
                    }`}
                  />
                  <span className="flex-1 truncate">{proj.name || "Untitled"}</span>
                  <span
                    className={`ml-auto text-[12px] px-[6px] py-0.5 rounded-full font-medium tabular-nums ${
                      isActive
                        ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                        : "bg-[var(--surface-hover)] text-meta"
                    }`}
                  >
                    {proj.count}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {projects.length === 0 && <div className="flex-1" />}

    </aside>
  );
}
