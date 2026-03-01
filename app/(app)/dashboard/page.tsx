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
  const {
    sessions,
    loading,
    handleCreateSession,
    updateSession,
    removeSession,
  } = useWorkspaceOverview();
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
      <div className="flex flex-col w-full min-h-[40vh] bg-[hsl(var(--surface-2))]">
        <div className="mx-auto w-full max-w-[1800px] px-10 pt-10 pb-16 flex items-center justify-center">
          <p className="text-[13px] text-[hsl(var(--text-secondary))]">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-0 bg-[hsl(var(--surface-2))]">
      <div className="mx-auto w-full max-w-[1800px] px-10 pt-10 pb-16">
        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
              Workspaces
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus-ring-brand h-9 px-3 bg-white border border-[hsl(var(--border))] rounded-xl text-[13px] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all duration-150 min-w-[180px]"
              aria-label="Search sessions"
            />
            <button
              type="button"
              onClick={handleCreateSession}
              className="focus-ring-brand h-9 rounded-xl bg-neutral-900 text-white text-[13px] px-4 font-medium hover:brightness-95 active:scale-[0.98] focus:outline-none transition-transform duration-100 ease-out"
            >
              New Session
            </button>
          </div>
        </header>

        <main className="flex-1">
          {/* TODO: Future: Archived view to list archived sessions. */}
          <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
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
          {filteredSessions.length === 0 && (
            <p className="text-[13px] text-[hsl(var(--text-secondary))] py-8">
              {search.trim()
                ? "No sessions match your search."
                : "No sessions yet. Create one to get started."}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
