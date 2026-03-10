"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MessageSquareMore, Folder } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { DiscussionList, type ProjectItem } from "@/components/discussion/DiscussionList";
import { DiscussionThread } from "@/components/discussion/DiscussionThread";
import { DiscussionSkeleton } from "@/components/discussion/DiscussionSkeleton";

export default function DiscussionPage() {
  const { user, loading } = useAuthGuard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEmpty, setIsEmpty] = useState<boolean | null>(null);
  const handleEmptyChange = useCallback((empty: boolean) => setIsEmpty(empty), []);
  const handleProjectsLoaded = useCallback((list: ProjectItem[]) => setProjects(list), []);

  if (loading) {
    return (
      <div className="flex-1 bg-white flex flex-col w-full min-h-0 pt-20">
        <div className="w-full px-6 flex flex-1 flex-col min-h-0">
          <div className="mb-0 shrink-0">
            <h1 className="text-3xl font-semibold text-neutral-900">Discussion</h1>
            <p className="text-sm text-neutral-500 mt-1">
              All feedback conversations across sessions
            </p>
          </div>
          <div className="border-b border-neutral-300 mt-6 shrink-0" />
          <div className="grid grid-cols-[220px_320px_1fr] flex-1 h-full min-h-0 items-stretch">
            <div className="h-full bg-white border-r border-neutral-300 px-4 py-4 space-y-1 overflow-y-auto min-h-0">
              <div className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
            </div>
            <div className="h-full bg-white border-r border-neutral-300 px-4 py-4 overflow-y-auto min-h-0">
              <DiscussionSkeleton />
            </div>
            <div className="h-full bg-white flex justify-center px-4 py-4 min-h-0 overflow-hidden">
              <div className="w-full max-w-[760px] flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <p className="text-lg font-medium text-neutral-800">
                    Select a ticket to view conversation
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Choose a discussion from the middle panel
                  </p>
                </div>
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
            <p className="text-sm text-neutral-500 mt-1">
              All feedback conversations across sessions
            </p>
          </div>
          <div className="border-b border-neutral-300 mt-6 shrink-0" />
          <div className="grid grid-cols-[220px_320px_1fr] flex-1 h-full min-h-0 items-stretch">
            <div className="h-full bg-white border-r border-neutral-300 px-4 py-4" />
            <div className="h-full bg-white border-r border-neutral-300 px-4 py-4" />
            <div className="h-full bg-white flex justify-center items-center px-4 py-4">
              <p className="text-sm text-neutral-600 font-normal">
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
          <p className="text-sm text-neutral-500 mt-1">
            All feedback conversations across sessions
          </p>
        </div>

        <div className="border-b border-neutral-300 mt-6 shrink-0" />

        <div className="grid grid-cols-[220px_320px_1fr] flex-1 h-full min-h-0 items-stretch">
          {/* LEFT: Projects */}
          <div className="h-full bg-white border-r border-neutral-300 px-4 py-4 space-y-1 overflow-y-auto min-h-0">
            {projects.length === 0 && isEmpty === false ? (
              <div className="py-2 text-sm text-neutral-500">Loading…</div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedProjectId === null
                      ? "bg-[#155DFC14] text-[#155DFC] font-medium"
                      : "text-neutral-600 hover:bg-neutral-100"
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
                      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-[#155DFC14] text-[#155DFC] font-medium"
                          : "text-neutral-600 hover:bg-neutral-100"
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

          {/* MIDDLE: Threads */}
          <div className="h-full bg-white border-r border-neutral-300 px-4 py-4 overflow-y-auto min-h-0">
            {isEmpty === true ? (
              <div className="py-8 text-center">
                <MessageSquareMore className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-neutral-900">
                  No discussions yet
                </h2>
                <p className="mt-2 text-sm text-neutral-500 max-w-[280px] mx-auto">
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
              />
            )}
          </div>

          {/* RIGHT: Conversation */}
          <div className="h-full bg-white flex px-4 py-4 min-h-0 overflow-hidden">
            <div className="w-full min-h-0 flex flex-col">
              <DiscussionThread
                feedbackId={selectedId}
                onCommentAdded={() => setRefreshKey((k) => k + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
