"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import {
  DiscussionFolders,
  type FolderKey,
  type FolderSession,
} from "@/components/discussion/DiscussionFolders";
import {
  DiscussionThreadList,
  type ThreadListItem,
} from "@/components/discussion/DiscussionThreadList";
import { DiscussionConversation } from "@/components/discussion/DiscussionConversation";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useWorkspaceStore } from "@/lib/client/workspaceStore";
import { getTicketStatus, type Feedback } from "@/lib/domain/feedback";
import {
  retainDiscussionFeedbackListener,
  useDiscussionFeedback,
} from "@/lib/realtime/discussionFeedbackStore";
import { useUserAvatars } from "@/lib/hooks/useUserAvatars";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const FOLDER_LABEL: Record<FolderKey, string> = {
  inbox: "Inbox",
  mentions: "Mentions",
  assigned: "Assigned to me",
  saved: "Saved",
};

export default function DiscussionPage() {
  const { user, loading } = useAuthGuard();
  const { authUid, workspaceId, isIdentityReady } = useWorkspace();

  const {
    items: realtimeItems,
    loading: loadingItems,
    error: storeError,
  } = useDiscussionFeedback(workspaceId);

  const { sessions: workspaceSessions } = useWorkspaceStore();

  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("inbox");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Phase 4: drive the mobile two-pane swap off useIsMobile + selectedThreadId
  // instead of an independent useState, so orientation/resize changes update
  // the visible pane without going stale.
  const isMobile = useIsMobile();
  const mobileView: "list" | "detail" =
    isMobile && selectedThreadId ? "detail" : "list";

  // Realtime workspace-scoped feedback listener (threads w/ comments).
  useEffect(() => {
    if (!isIdentityReady) return;
    const wid = workspaceId?.trim();
    if (!wid) return;
    const release = retainDiscussionFeedbackListener(wid);
    return () => release();
  }, [isIdentityReady, workspaceId]);

  const sessionTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of workspaceSessions) {
      if (s.session?.id && typeof s.session.title === "string" && s.session.title.trim()) {
        m.set(s.session.id, s.session.title);
      }
    }
    return m;
  }, [workspaceSessions]);

  const mentionedFeedbackIds = useMemo(() => {
    const set = new Set<string>();
    const uid = authUid ?? "";
    if (!uid) return set;
    for (const f of realtimeItems) {
      if (f.mentionedUserIds?.includes(uid)) set.add(f.id);
    }
    return set;
  }, [realtimeItems, authUid]);

  // Phase 25.3: the realtime feedback listener only carries the stale
  // denormalized creatorAvatarUrl snapshot. Resolve the last actor's avatar
  // LIVE so the inbox row updates the instant that user changes their photo,
  // without a page refresh. Both the last-commenter uid and the creator uid
  // are subscribed because either can be the row's "last actor".
  const actorUids = useMemo(() => {
    const ids: string[] = [];
    for (const f of realtimeItems) {
      if (f.lastCommentByUid) ids.push(f.lastCommentByUid);
      if (f.userId) ids.push(f.userId);
    }
    return ids;
  }, [realtimeItems]);

  const liveAvatars = useUserAvatars(actorUids);

  const items: ThreadListItem[] = useMemo(() => {
    return realtimeItems.map((f: Feedback): ThreadListItem => {
      const isResolved = f.status === "resolved" || f.isResolved === true;

      // Phase 25.1: the inbox row shows the LAST ACTOR (most recent
      // commenter) instead of the creator. Fall back to the creator when
      // a ticket has no comments yet. The avatar color is keyed on the
      // actor's uid so it stays consistent with everywhere else; the
      // creator's snapshot URL is only reused when the last actor IS the
      // creator (server endpoints resolve it live elsewhere).
      const hasLastCommenter =
        typeof f.lastCommentByUid === "string" && f.lastCommentByUid.length > 0;
      const lastActorUid = hasLastCommenter
        ? f.lastCommentByUid!
        : f.userId ?? null;
      const lastActorName = hasLastCommenter
        ? f.lastCommentByName || undefined
        : f.creatorName || undefined;
      // Live avatar keyed on the actor's uid — overrides the stale
      // f.creatorAvatarUrl snapshot entirely. Null when the user has no
      // photo set (UserAvatar renders the seeded-color initials fallback).
      const lastActorAvatarUrl = lastActorUid
        ? liveAvatars.get(lastActorUid) ?? undefined
        : undefined;

      return {
        id: f.id,
        title: typeof f.title === "string" ? f.title.trim() : "",
        sessionId: f.sessionId ?? "",
        sessionName: sessionTitleMap.get(f.sessionId ?? "") || undefined,
        lastActorName,
        lastActorAvatarUrl,
        lastActorUid,
        commentCount: f.commentCount ?? 0,
        lastCommentPreview: f.lastCommentPreview,
        status: getTicketStatus({ isResolved }),
        updatedAt: undefined,
        createdAt: f.createdAt ?? undefined,
        lastCommentAt: f.lastCommentAt ?? undefined,
        isUnread: false,
        isMentionedYou: mentionedFeedbackIds.has(f.id),
      };
    });
  }, [realtimeItems, sessionTitleMap, mentionedFeedbackIds, liveAvatars]);

  const assigneeByFeedbackId = useMemo(() => {
    const m = new Map<string, string | null | undefined>();
    realtimeItems.forEach((f) => m.set(f.id, f.assigneeId));
    return m;
  }, [realtimeItems]);

  // Sessions list (derived from inbox, only sessions with threads)
  const sessions: FolderSession[] = useMemo(() => {
    const map = new Map<string, FolderSession>();
    items.forEach((i) => {
      if (!i.sessionId) return;
      const existing = map.get(i.sessionId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(i.sessionId, {
          id: i.sessionId,
          name: i.sessionName ?? "",
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [items]);

  // Counts (all folders exclude resolved/archived items)
  const counts = useMemo(() => {
    const openItems = items.filter((i) => i.status !== "resolved");
    const inbox = openItems.length;
    const assigned = openItems.filter(
      (i) => assigneeByFeedbackId.get(i.id) === authUid
    ).length;
    const mentionsOpen = openItems.filter((i) =>
      mentionedFeedbackIds.has(i.id)
    ).length;
    return {
      inbox,
      mentions: mentionsOpen,
      assigned,
      saved: 0,
    };
  }, [items, assigneeByFeedbackId, authUid, mentionedFeedbackIds]);

  // Filter threads by folder + session. Resolved/archived items are excluded everywhere.
  const visibleItems = useMemo(() => {
    const openList = items.filter((i) => i.status !== "resolved");
    if (selectedSessionId) {
      return openList.filter((i) => i.sessionId === selectedSessionId);
    }
    switch (selectedFolder) {
      case "assigned":
        return openList.filter(
          (i) => assigneeByFeedbackId.get(i.id) === authUid
        );
      case "mentions":
        return openList.filter((i) => mentionedFeedbackIds.has(i.id));
      case "saved":
        return [];
      case "inbox":
      default:
        return openList;
    }
  }, [items, selectedFolder, selectedSessionId, assigneeByFeedbackId, authUid, mentionedFeedbackIds]);

  const listTitle = useMemo(() => {
    if (selectedSessionId) {
      const session = sessions.find((s) => s.id === selectedSessionId);
      return session?.name?.trim() || "Session";
    }
    return FOLDER_LABEL[selectedFolder];
  }, [selectedFolder, selectedSessionId, sessions]);

  const handleSelectThread = useCallback((id: string) => {
    setSelectedThreadId(id);
  }, []);

  const handleMobileBack = useCallback(() => {
    setSelectedThreadId(null);
  }, []);

  const handleFolderChange = useCallback((key: FolderKey) => {
    setSelectedFolder(key);
    setSelectedThreadId(null);
  }, []);

  const handleSessionChange = useCallback((id: string | null) => {
    setSelectedSessionId(id);
    setSelectedThreadId(null);
  }, []);

  const selectedTicketSeed = useMemo(() => {
    if (!selectedThreadId) return null;
    const f = realtimeItems.find((it) => it.id === selectedThreadId);
    if (!f) return null;
    return {
      id: f.id,
      title: f.title,
      sessionId: f.sessionId,
      screenshotId: f.screenshotId,
      description: f.description,
      status: (f.status === "resolved" ? "resolved" : "open") as "open" | "resolved",
      isResolved: f.isResolved,
    };
  }, [selectedThreadId, realtimeItems]);

  if (!user && !loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Please sign in to view discussions.
        </p>
      </div>
    );
  }

  const listLoading = loadingItems;

  const emptyContext: "inbox" | "mentions" | "assigned" | "session" | "saved" =
    selectedSessionId
      ? "session"
      : selectedFolder === "mentions"
        ? "mentions"
        : selectedFolder === "assigned"
          ? "assigned"
          : selectedFolder === "saved"
            ? "saved"
            : "inbox";

  return (
    <div className="flex h-full overflow-hidden bg-[var(--surface-page)] gap-[6px]">
      {/* Col 1: Folders (lg+) */}
      <div className="hidden lg:flex w-[240px] shrink-0">
        <DiscussionFolders
          selectedFolder={selectedFolder}
          selectedSessionId={selectedSessionId}
          counts={counts}
          sessions={sessions}
          onFolderChange={handleFolderChange}
          onSessionChange={handleSessionChange}
          loading={loadingItems}
        />
      </div>

      {/* Col 2: Thread list */}
      <div
        className={`
          flex flex-col min-h-0
          ${mobileView === "detail" ? "hidden md:flex" : "flex"}
          w-full md:w-[360px] md:shrink-0
        `}
      >
        <DiscussionThreadList
          title={listTitle}
          totalCount={visibleItems.length}
          items={visibleItems}
          selectedId={selectedThreadId}
          onSelect={handleSelectThread}
          search={search}
          onSearchChange={setSearch}
          loading={listLoading}
          error={storeError ? storeError.message : null}
          emptyContext={emptyContext}
        />
      </div>

      {/* Col 3: Detail */}
      <div
        className={`
          flex-1 min-w-0 flex flex-col overflow-hidden
          ${mobileView === "list" ? "hidden md:flex" : "flex"}
        `}
      >
        {mobileView === "detail" && (
          <button
            type="button"
            onClick={handleMobileBack}
            className="md:hidden shrink-0 flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)] text-[14px] font-medium text-[var(--brand)] bg-white"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            All discussions
          </button>
        )}

        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center bg-[var(--surface-card)]">
              <MinimalLoader />
            </div>
          }
        >
          <DiscussionConversation
            feedbackId={selectedThreadId}
            listLoaded={!loadingItems}
            initialTicket={selectedTicketSeed}
          />
        </Suspense>
      </div>
    </div>
  );
}
