"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useWorkspace } from "@/lib/client/workspaceContext";
import {
  DiscussionList,
  type ProjectItem,
  type DiscussionItem,
} from "@/components/discussion/DiscussionList";
import { DiscussionThread } from "@/components/discussion/DiscussionThread";
import {
  DiscussionSidebar,
  type SidebarProject,
} from "@/components/discussion/DiscussionSidebar";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { MinimalLoader } from "@/components/ui/MinimalLoader";

export default function DiscussionPage() {
  const { user, loading } = useAuthGuard();
  const { authDisplayName } = useWorkspace();
  const { showToast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [listItems, setListItems] = useState<DiscussionItem[]>([]);
  const [isEmpty, setIsEmpty] = useState<boolean | null>(null);

  /** Mobile: 'list' shows the thread list panel; 'detail' shows the selected thread */
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleEmptyChange = useCallback(
    (empty: boolean) => setIsEmpty(empty),
    []
  );
  const handleProjectsLoaded = useCallback(
    (list: ProjectItem[]) => setProjects(list),
    []
  );

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setMobileView("detail");
  }, []);

  const handleMobileBack = useCallback(() => {
    setMobileView("list");
    setSelectedId(null);
  }, []);

  /** Increment reply count for the selected ticket without triggering a list reload. */
  const handleCommentAdded = useCallback(() => {
    if (!selectedId) return;
    setListItems((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedId
          ? { ...ticket, commentCount: (ticket.commentCount ?? 0) + 1 }
          : ticket
      )
    );
  }, [selectedId]);

  /** Sync reopened status into list (by selection). Resolve uses optimistic update in advance handler. */
  const handleStatusChanged = useCallback((affectedTicketId?: string) => {
    const id = affectedTicketId ?? selectedId;
    if (!id) return;
    setListItems((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket;
        const next = ticket.status === "resolved" ? "open" : "resolved";
        return { ...ticket, status: next };
      })
    );
  }, [selectedId]);

  /**
   * Instant UX: navigate + optimistic resolve from list snapshot (current row still open),
   * then PATCH runs in DiscussionThread.
   */
  const handleResolvedAdvanceQueue = useCallback(
    (currentId: string) => {
      const tickets = listItems;
      const isOpen = (t: (typeof tickets)[number]) => t.status !== "resolved";
      const currentIndex = tickets.findIndex((t) => t.id === currentId);
      const nextOpenAfter =
        currentIndex >= 0
          ? tickets.slice(currentIndex + 1).find(isOpen)
          : undefined;
      const firstOtherOpen = tickets.find(
        (t) => t.id !== currentId && isOpen(t)
      );
      const target = nextOpenAfter ?? firstOtherOpen;
      if (target) {
        setSelectedId(target.id);
      } else {
        showToast("No more feedback");
      }
      setListItems((prev) =>
        prev.map((t) =>
          t.id === currentId ? { ...t, status: "resolved" as const } : t
        )
      );
    },
    [listItems, showToast]
  );

  const handleResolveFailed = useCallback((ticketId: string) => {
    setListItems((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: "open" as const } : t
      )
    );
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const sidebarProjects = useMemo<SidebarProject[]>(() => {
    return projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      count: listItems.filter((i) => i.sessionId === proj.id).length,
    }));
  }, [projects, listItems]);

  const selectedIndex = useMemo(() => {
    if (!selectedId) return undefined;
    const idx = listItems.findIndex((i) => i.id === selectedId);
    return idx >= 0 ? idx + 1 : undefined;
  }, [selectedId, listItems]);

  const userInitial = authDisplayName?.charAt(0).toUpperCase() ?? undefined;

  // ── Loading / auth guard ───────────────────────────────────────────────────
  if (!user && !loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-[13px] text-secondary">
          Please sign in to view discussions.
        </p>
      </div>
    );
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden bg-white border-t border-neutral-200">
      {/* ── Panel 1: Sidebar (≥ lg only) ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[220px] shrink-0 border-r border-neutral-200">
        <DiscussionSidebar
          projects={sidebarProjects}
          totalCount={listItems.length}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userName={authDisplayName ?? undefined}
          userInitial={userInitial}
        />
      </div>

      {/* ── Panel 2: Thread list ──────────────────────────────────────────── */}
      {/*
        Mobile: visible when mobileView === 'list'
        md+: always visible, fixed 340px width
      */}
      <div
        className={`
          flex flex-col border-r border-neutral-200
          ${mobileView === "detail" ? "hidden md:flex" : "flex"}
          w-full md:w-[340px] md:shrink-0
        `}
      >
        {/* Mobile: search bar (sidebar is hidden) */}
        <div className="lg:hidden shrink-0 px-4 pt-3 pb-0">
          <input
            type="search"
            placeholder="Search discussions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-[7px] text-[13px] bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-meta outline-none focus:border-[#155DFC]/50 focus:bg-white transition-colors"
          />
        </div>

        {/* Mobile: session filter (sidebar is hidden on < lg) */}
        {sidebarProjects.length > 0 && (
          <div className="lg:hidden shrink-0 flex items-center gap-1.5 px-4 py-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedProjectId(null)}
              className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all ${
                selectedProjectId === null
                  ? "bg-[#EEF3FF] text-[#155DFC] border-[#bfdbfe] font-medium"
                  : "bg-transparent text-secondary border-neutral-200 hover:text-neutral-900"
              }`}
            >
              All
            </button>
            {sidebarProjects.map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => setSelectedProjectId(proj.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all ${
                  selectedProjectId === proj.id
                    ? "bg-[#EEF3FF] text-[#155DFC] border-[#bfdbfe] font-medium"
                    : "bg-transparent text-secondary border-neutral-200 hover:text-neutral-900"
                }`}
              >
                {proj.name || "Untitled"}
              </button>
            ))}
          </div>
        )}

        <DiscussionList
          selectedId={selectedId}
          onSelect={handleSelect}
          search={searchQuery}
          filterBySessionId={selectedProjectId}
          onEmptyChange={handleEmptyChange}
          onProjectsLoaded={handleProjectsLoaded}
          items={listItems}
          setItems={setListItems}

        />
      </div>

      {/* ── Panel 3: Detail ───────────────────────────────────────────────── */}
      {/*
        Mobile: visible when mobileView === 'detail' (or no thread selected shows placeholder)
        md+: always visible, fills remaining space
      */}
      <div
        className={`
          flex-1 min-w-0 flex flex-col overflow-hidden
          ${mobileView === "list" && !selectedId ? "hidden md:flex" : ""}
          ${mobileView === "list" && selectedId ? "hidden md:flex" : ""}
          ${mobileView === "detail" ? "flex" : ""}
        `}
      >
        {/* Mobile back button */}
        {mobileView === "detail" && (
          <button
            type="button"
            onClick={handleMobileBack}
            className="md:hidden shrink-0 flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-200 text-[13px] font-medium text-[#155DFC] bg-white"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            All discussions
          </button>
        )}

        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center bg-white">
              <MinimalLoader />
            </div>
          }
        >
          <DiscussionThread
            feedbackId={selectedId}
            onCommentAdded={handleCommentAdded}
            onStatusChanged={handleStatusChanged}
            onResolvedAdvanceQueue={handleResolvedAdvanceQueue}
            onResolveFailed={handleResolveFailed}
            listLoaded={isEmpty !== null}
            threadIndex={selectedIndex}
            threadTotal={listItems.length}
          />
        </Suspense>
      </div>
    </div>
  );
}
