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
      <div className="surface-main flex flex-col w-full min-h-[40vh]">
        <div className="mx-auto w-full max-w-[1800px] px-10 py-8 flex items-center justify-center">
          <p className="text-[14px] text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-main flex flex-col w-full min-h-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mx-auto w-full max-w-[1800px] px-10 py-8">
        {/* Temporary: semantic color test — remove after verification */}
        <div className="text-semantic-system text-sm mb-2" aria-hidden>
          COLOR TEST
        </div>
        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-medium text-neutral-900">
              Workspaces
            </h1>
            <p className="mt-2 text-[15px] text-neutral-500">
              Sessions and feedback in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCreateSession}
              className="h-9 rounded-lg bg-neutral-900 text-white text-[14px] px-4 font-medium hover:bg-neutral-800 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-neutral-300 transition-all duration-150"
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
        </header>

        <main className="flex-1 mt-6">
          {/* TODO: Future: Archived view to list archived sessions. */}
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
          {filteredSessions.length === 0 && (
            <p className="text-[14px] text-neutral-500 py-8">
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
