"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MessageSquareMore } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { DiscussionList } from "@/components/discussion/DiscussionList";
import { DiscussionThread } from "@/components/discussion/DiscussionThread";
import { DiscussionSkeleton } from "@/components/discussion/DiscussionSkeleton";

export default function DiscussionPage() {
  const { user, loading } = useAuthGuard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEmpty, setIsEmpty] = useState<boolean | null>(null);
  const handleEmptyChange = useCallback((empty: boolean) => setIsEmpty(empty), []);

  if (loading) {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full overflow-hidden font-sans">
        <header className="shrink-0 border-b border-neutral-200 bg-white px-8 py-6">
          <h1 className="text-4xl font-semibold text-neutral-900">Discussion</h1>
          <p className="mt-1 text-sm text-neutral-500 font-normal">
            All feedback conversations across sessions
          </p>
        </header>
        <div className="flex flex-1 min-h-0 h-full">
          <div className="w-[320px] shrink-0 border-r border-neutral-200 bg-[#F8FAFC] p-4">
            <DiscussionSkeleton />
          </div>
          <div className="flex-1 flex items-center justify-center bg-white">
            <p className="text-sm text-neutral-500 font-normal">
              Select a discussion to view conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full overflow-hidden font-sans">
        <header className="shrink-0 border-b border-neutral-200 bg-white px-8 py-6">
          <h1 className="text-4xl font-semibold text-neutral-900">Discussion</h1>
          <p className="mt-1 text-sm text-neutral-500 font-normal">
            All feedback conversations across sessions
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-neutral-600 font-normal">
            Please sign in to view discussions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col w-full overflow-hidden font-sans">
      {/* Header */}
      <header className="shrink-0 border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-4xl font-semibold text-neutral-900">Discussion</h1>
        <p className="mt-1 text-sm text-neutral-500 font-normal">
          All feedback conversations across sessions
        </p>
      </header>

      {/* Two-panel workspace: Discussion Inbox | Conversation Workspace */}
      <div className="flex flex-1 min-h-0 h-full font-sans">
        {isEmpty === true ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <MessageSquareMore className="w-12 h-12 text-neutral-300 mb-4" />
            <h2 className="text-lg font-semibold text-neutral-900">
              No discussions yet
            </h2>
            <p className="mt-2 text-sm text-neutral-500 max-w-[280px]">
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
          <>
            {/* Left: Discussion Inbox (thread list) */}
            <DiscussionList
              selectedId={selectedId}
              onSelect={setSelectedId}
              refreshKey={refreshKey}
              onEmptyChange={handleEmptyChange}
            />
            {/* Right: Conversation Workspace — anchored left, max 960px */}
            <div className="flex-1 min-w-0 flex flex-col min-h-0 max-w-[960px] ml-10">
              <div className="flex-1 min-h-0 min-w-0 bg-[#F8FAFC] p-6 rounded-[20px]">
                <DiscussionThread
                  feedbackId={selectedId}
                  onCommentAdded={() => setRefreshKey((k) => k + 1)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
