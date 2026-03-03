"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { InsightStrip } from "@/components/dashboard/InsightStrip";
import { NeedsAttentionSection } from "@/components/dashboard/NeedsAttentionSection";

const NEEDS_ATTENTION_LIMIT = 5;

function filterAndSortSessions(sessions: SessionWithCounts[], search: string): SessionWithCounts[] {
  const q = search.trim().toLowerCase();
  const list = q
    ? sessions.filter(({ session }) =>
        session.title.toLowerCase().includes(q)
      )
    : [...sessions];

  return [...list].sort((a, b) => {
    const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
    const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
    const sa = ta?.seconds ?? 0;
    const sb = tb?.seconds ?? 0;
    return sb - sa;
  });
}

function needsAttentionItems(sessions: SessionWithCounts[]): SessionWithCounts[] {
  return sessions
    .filter((item) => {
      const open = item.session.openCount ?? item.counts.open;
      return open > 0;
    })
    .sort((a, b) => {
      const openA = a.session.openCount ?? a.counts.open;
      const openB = b.session.openCount ?? b.counts.open;
      if (openB !== openA) return openB - openA;
      const ta = a.session.updatedAt as { seconds?: number } | null | undefined;
      const tb = b.session.updatedAt as { seconds?: number } | null | undefined;
      return (tb?.seconds ?? 0) - (ta?.seconds ?? 0);
    })
    .slice(0, NEEDS_ATTENTION_LIMIT);
}

export default function DashboardPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"all" | "archived">("all");
  const {
    sessions,
    loading,
    handleCreateSession,
    updateSession,
    removeSession,
  } = useWorkspaceOverview(viewMode);
  const [search, setSearch] = useState("");

  const filteredSessions = useMemo(
    () => filterAndSortSessions(sessions, search),
    [sessions, search]
  );

  const attentionItems = useMemo(
    () => (viewMode === "all" ? needsAttentionItems(sessions) : []),
    [viewMode, sessions]
  );

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="surface-main flex flex-col w-full min-h-[40vh]">
        <div className="mx-auto w-full max-w-[1800px] px-10 py-8 flex items-center justify-center">
          <p className="text-[14px] text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-main flex flex-col w-full min-h-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mx-auto w-full max-w-[1800px] px-10 pt-6 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-neutral-900">
              Workspaces
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <InsightStrip />
            <div
              className="flex rounded-lg border border-neutral-100 bg-white p-0.5"
              role="tablist"
              aria-label="Filter sessions"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "all"}
                onClick={() => setViewMode("all")}
                className={`h-8 px-3 rounded-md text-[13px] text-neutral-500 transition-colors duration-120 ${
                  viewMode === "all"
                    ? "bg-neutral-50 text-neutral-600"
                    : "text-neutral-400 hover:text-neutral-500"
                }`}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "archived"}
                onClick={() => setViewMode("archived")}
                className={`h-8 px-3 rounded-md text-[13px] text-neutral-500 transition-colors duration-120 ${
                  viewMode === "archived"
                    ? "bg-neutral-50 text-neutral-600"
                    : "text-neutral-400 hover:text-neutral-500"
                }`}
              >
                Archived
              </button>
            </div>
            <button
              type="button"
              onClick={handleCreateSession}
              className="h-9 rounded-lg bg-neutral-900 text-white text-[14px] px-4 font-medium hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-neutral-300 transition-colors duration-150 cursor-pointer"
            >
              New Session
            </button>
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 px-3 min-w-[160px] rounded-lg bg-white border border-neutral-200 text-[14px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 transition-all duration-150"
              aria-label="Search sessions"
            />
          </div>
        </div>

        <main className="flex-1 mt-6">
          {viewMode === "all" && (
            <NeedsAttentionSection items={attentionItems} onView={handleView} />
          )}
          <div className="border-t border-neutral-100 pt-4">
            <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {filteredSessions.map((item, index) => (
              <WorkspaceCard
                key={item.session.id}
                item={item}
                onView={handleView}
                index={index}
                onRenameSuccess={(session) =>
                  updateSession(session.id, { title: session.title })
                }
                onArchiveSuccess={removeSession}
                onDeleteSuccess={removeSession}
              />
            ))}
            </div>
          </div>
          {filteredSessions.length === 0 && (
            <p className="text-[14px] text-neutral-500 py-8">
              {search.trim()
                ? "No sessions match your search."
                : viewMode === "archived"
                  ? "No archived sessions."
                  : "No sessions yet. Create one to get started."}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
