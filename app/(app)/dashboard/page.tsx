"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceOverview } from "./hooks/useWorkspaceOverview";
import type { SessionWithCounts } from "./hooks/useWorkspaceOverview";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";

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

  const handleView = (sessionId: string) => {
    router.push(`/dashboard/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="surface-main flex flex-col w-full min-h-[40vh]">
        <div className="mx-auto w-full max-w-[1800px] px-10 py-8 flex items-center justify-center">
          <p className="text-[14px] text-[hsl(var(--text-tertiary))]">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-main flex flex-col w-full min-h-0">
      <div className="mx-auto w-full max-w-[1800px] px-10 pt-6 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="mb-6">
            <h1 className="text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-[hsl(var(--text-primary-strong))]">
              Workspaces
            </h1>
            <p className="mt-2.5 text-[14px] leading-[1.5] text-[hsl(var(--text-tertiary))]">
              All your team's sessions in one place.
            </p>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div
              className="flex rounded-xl border border-[var(--glass-1-border)] bg-[var(--glass-1-bg)] backdrop-blur-[8px] p-0.5"
              role="tablist"
              aria-label="Filter sessions"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "all"}
                onClick={() => setViewMode("all")}
                className={`h-9 px-4 rounded-xl text-[13px] font-medium transition-colors duration-[var(--motion-duration)] ${
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
                onClick={() => setViewMode("archived")}
                className={`h-9 px-4 rounded-xl text-[13px] font-medium transition-colors duration-[var(--motion-duration)] ${
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
              onClick={handleCreateSession}
              className="btn-primary-glow h-9 rounded-xl bg-[var(--color-primary)] text-white text-[14px] px-5 font-semibold shadow-[0_2px_8px_rgba(26,86,219,0.28)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:ring-offset-2 transition-[transform,box-shadow,background-color] duration-[var(--motion-standard)] [transition-timing-function:var(--ease-premium)] cursor-pointer"
            >
              New Session
            </button>
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 px-4 min-w-[180px] rounded-xl bg-[var(--layer-1-bg)] border border-[var(--layer-2-border)] text-[14px] text-[hsl(var(--text-primary-strong))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)]"
              aria-label="Search sessions"
            />
          </div>
        </div>

        <main className="flex-1 mt-6">
          <div className="pt-8">
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
            <p className="text-[14px] text-[hsl(var(--text-tertiary))] py-8">
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
