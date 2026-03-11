"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MessageSquareMore, Folder } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { DiscussionList, type ProjectItem, type DiscussionItem } from "@/components/discussion/DiscussionList";
import { DiscussionThread } from "@/components/discussion/DiscussionThread";
import { DiscussionSkeleton } from "@/components/discussion/DiscussionSkeleton";
import { ResizeHandle } from "@/components/discussion/ResizeHandle";

const MIN_SIDEBAR = 200;
const MAX_SIDEBAR = 360;
const MIN_LIST = 280;
const MAX_LIST = 420;
const MIN_RIGHT = 520;
const DEFAULT_LIST_BASIS = 320;

export default function DiscussionPage() {
  const { user, loading } = useAuthGuard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [listItems, setListItems] = useState<DiscussionItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEmpty, setIsEmpty] = useState<boolean | null>(null);
  const [sidebarBasis, setSidebarBasis] = useState(260);
  const [listBasis, setListBasis] = useState(DEFAULT_LIST_BASIS);
  const handleEmptyChange = useCallback((empty: boolean) => setIsEmpty(empty), []);
  const handleProjectsLoaded = useCallback((list: ProjectItem[]) => setProjects(list), []);

  /** Update only the selected ticket's reply count when a comment is added; do NOT trigger ticket list reload. */
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

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarBasis((prev) => Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, prev + delta)));
  }, []);
  const handleListResize = useCallback((delta: number) => {
    setListBasis((prev) => Math.min(MAX_LIST, Math.max(MIN_LIST, prev + delta)));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20">
        <div className="w-full px-6 flex flex-1 flex-col min-h-0">
          <div className="mb-0 shrink-0">
            <h1 className="text-3xl font-semibold text-neutral-900">Discussion</h1>
            <p className="text-sm text-secondary mt-1">
              All feedback conversations across sessions
            </p>
          </div>
          <div className="border-b border-neutral-300 mt-6 shrink-0" />
          <div className="discussion-layout flex flex-1 min-h-0 w-full pt-0 items-stretch">
            <div
              className="shrink-0 bg-white px-3 py-2 space-y-0.5 overflow-y-auto min-h-0"
              style={{ flex: "0 0 260px" }}
            >
              <div className="h-10 rounded-lg skeleton" />
            </div>
            <div
              className="shrink-0 bg-white overflow-y-auto min-h-0 px-3 py-2 border-l border-neutral-300"
              style={{ flex: `1 1 ${DEFAULT_LIST_BASIS}px`, minWidth: MIN_LIST }}
            >
              <DiscussionSkeleton />
            </div>
            <div className="flex-1 min-w-0 bg-white flex justify-center px-4 py-4 min-h-0 overflow-hidden">
              <div className="text-center max-w-sm">
                <p className="text-lg font-medium text-neutral-800">
                  Select a ticket to view conversation
                </p>
                <p className="text-sm text-secondary mt-2">
                  Choose a discussion from the middle panel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20">
        <div className="w-full px-6 flex flex-1 flex-col min-h-0">
          <div className="mb-0 shrink-0">
            <h1 className="text-3xl font-semibold text-neutral-900">Discussion</h1>
            <p className="text-sm text-secondary mt-1">
              All feedback conversations across sessions
            </p>
          </div>
          <div className="border-b border-neutral-300 mt-6 shrink-0" />
          <div className="discussion-layout flex flex-1 min-h-0 w-full pt-0 items-stretch">
            <div className="shrink-0 bg-white px-3 py-2" style={{ flex: "0 0 260px" }} />
            <div className="shrink-0 bg-white pl-0 pr-3 py-2 border-l border-neutral-300" style={{ flex: `1 1 ${DEFAULT_LIST_BASIS}px` }} />
            <div className="flex-1 min-w-0 bg-white flex justify-center items-center px-4 py-4">
              <p className="text-sm text-secondary font-normal">
                Please sign in to view discussions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20">
      <div className="w-full px-6 flex flex-1 flex-col min-h-0">
        <div className="mb-0 shrink-0">
          <h1 className="text-3xl font-semibold text-neutral-900">Discussion</h1>
          <p className="text-sm text-secondary mt-1">
            All feedback conversations across sessions
          </p>
        </div>

        <div className="border-b border-neutral-300 mt-6 shrink-0" />

        <div className="discussion-layout flex flex-1 min-h-0 w-full pt-0 items-stretch">
          {/* LEFT: Projects — Navigation (light) */}
          <div
            className="discussion-panel-sidebar shrink-0 bg-white px-3 py-2 space-y-0.5 overflow-y-auto min-h-0"
            style={{ flex: `0 0 ${sidebarBasis}px`, minWidth: MIN_SIDEBAR, maxWidth: MAX_SIDEBAR }}
          >
            {projects.length === 0 && isEmpty === false ? (
              <div className="py-2 text-sm text-secondary">Loading…</div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    selectedProjectId === null
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-secondary hover:bg-neutral-50"
                  }`}
                >
                  <Folder className="h-4 w-4 shrink-0 text-[#155DFC]" />
                  <span className="truncate">All projects</span>
                </button>
                {projects.map((proj) => {
                  const isActive = selectedProjectId === proj.id;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-secondary hover:bg-neutral-50"
                      }`}
                    >
                      <Folder className="h-4 w-4 shrink-0 text-[#155DFC]" />
                      <span className="truncate">{proj.name}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <ResizeHandle onResize={handleSidebarResize} />

          {/* MIDDLE: Discussions — static 1px grey divider; selection rail is per-row */}
          <div
            className="discussion-panel-list shrink-0 h-full min-h-0 bg-white overflow-y-auto flex flex-col border-l border-neutral-300"
            style={{ flex: `1 1 ${listBasis}px`, minWidth: MIN_LIST, maxWidth: MAX_LIST }}
          >
            {isEmpty === true ? (
              <div className="px-3 py-8 text-center">
                <MessageSquareMore className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-neutral-900">
                  No discussions yet
                </h2>
                <p className="mt-2 text-sm text-secondary max-w-[280px] mx-auto">
                  When feedback receives comments, they will appear here.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#155DFC] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#0F4ED1] transition"
                >
                  Open Sessions
                </Link>
              </div>
            ) : (
              <DiscussionList
                selectedId={selectedId}
                onSelect={setSelectedId}
                refreshKey={refreshKey}
                filterBySessionId={selectedProjectId}
                onEmptyChange={handleEmptyChange}
                onProjectsLoaded={handleProjectsLoaded}
                items={listItems}
                setItems={setListItems}
              />
            )}
          </div>

          <ResizeHandle onResize={handleListResize} />

          {/* RIGHT: Ticket workspace (strong) — left-aligned reading column */}
          <div
            className="flex-1 min-w-0 bg-white flex py-4 min-h-0 overflow-hidden"
            style={{ flex: "2 1 auto", minWidth: MIN_RIGHT }}
          >
            <div className="w-full min-h-0 flex flex-col">
              <DiscussionThread
                feedbackId={selectedId}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
