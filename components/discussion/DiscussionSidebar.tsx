"use client";

import { Search } from "lucide-react";

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
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userName?: string;
  userInitial?: string;
}

export function DiscussionSidebar({
  projects,
  totalCount,
  selectedProjectId,
  onProjectChange,
  searchQuery,
  onSearchChange,
  userName,
  userInitial,
}: DiscussionSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-white overflow-hidden">
      {/* Search */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-meta pointer-events-none" />
          <input
            type="search"
            placeholder="Search discussions…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-[7px] text-[13px] bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-meta outline-none focus:border-[#155DFC]/50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Workspace section */}
      <div className="px-4 pb-1 shrink-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-meta">Workspace</p>
      </div>
      <button
        type="button"
        onClick={() => onProjectChange(null)}
        className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-left text-[13px] transition-all ${
          selectedProjectId === null
            ? "bg-blue-50/70 text-neutral-900 font-medium"
            : "text-secondary hover:bg-neutral-50 hover:text-neutral-900"
        }`}
      >
        <span
          className={`w-[6px] h-[6px] rounded-full shrink-0 ${
            selectedProjectId === null ? "bg-[#155DFC]" : "bg-neutral-300"
          }`}
        />
        <span className="flex-1 truncate">All projects</span>
        <span
          className={`ml-auto text-[11px] px-[6px] py-0.5 rounded-full font-medium tabular-nums ${
            selectedProjectId === null
              ? "bg-[#DBEAFE] text-[#155DFC]"
              : "bg-neutral-100 text-meta"
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* Sessions section */}
      {projects.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-1 shrink-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-meta">Sessions</p>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 pb-2">
            {projects.map((proj) => {
              const isActive = selectedProjectId === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onProjectChange(proj.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-[7px] text-left text-[13px] transition-all ${
                    isActive
                      ? "bg-blue-50/70 text-neutral-900 font-medium"
                      : "text-secondary hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <span
                    className={`w-[6px] h-[6px] rounded-full shrink-0 ${
                      isActive ? "bg-[#155DFC]" : "bg-neutral-300"
                    }`}
                  />
                  <span className="flex-1 truncate">{proj.name || "Untitled"}</span>
                  <span
                    className={`ml-auto text-[11px] px-[6px] py-0.5 rounded-full font-medium tabular-nums ${
                      isActive
                        ? "bg-[#DBEAFE] text-[#155DFC]"
                        : "bg-neutral-100 text-meta"
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
