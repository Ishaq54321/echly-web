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

function EchlySymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.5}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  );
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
      <div className="flex flex-col w-full min-h-[40vh] bg-[#F7F8FA]">
        <div className="w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-center">
          <p className="text-[13px] text-neutral-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-0 bg-[#F7F8FA]">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-neutral-600 mt-0.5 inline-flex hover:text-brand-primary transition-colors duration-200" aria-hidden>
              <EchlySymbol />
            </span>
            <div>
              <h1 className="text-[30px] font-medium tracking-[-0.01em] text-neutral-900">
                Workspaces
              </h1>
              <p className="text-[13px] text-neutral-500 mt-1">
                Sessions and feedback in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
            type="search"
            placeholder="Search sessions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring-brand h-9 px-3 bg-white border border-neutral-200/70 rounded-xl text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none min-w-[180px]"
            aria-label="Search sessions"
            />
            <button
              type="button"
              onClick={handleCreateSession}
              className="focus-ring-brand h-9 rounded-xl bg-neutral-900 text-white text-[13px] px-4 font-medium hover:bg-neutral-800 focus:outline-none transition-colors"
            >
              New Session
            </button>
          </div>
        </header>

        <main className="mt-8 flex-1">
          {/* TODO: Future: Archived view to list archived sessions. */}
          <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-10">
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
            <p className="text-[13px] text-neutral-500 py-8">
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
