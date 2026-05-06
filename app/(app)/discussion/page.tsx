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
import { authFetch } from "@/lib/authFetch";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { getTicketStatus } from "@/lib/domain/feedback";

const FOLDER_LABEL: Record<FolderKey, string> = {
  inbox: "Inbox",
  mentions: "Mentions",
  assigned: "Assigned to me",
  saved: "Saved",
};

interface RawFeedbackItem {
  id?: string;
  title?: string;
  sessionId?: string;
  sessionName?: string;
  commentCount?: number;
  lastCommentPreview?: string;
  status?: string;
  isResolved?: boolean;
  updatedAt?: string;
  createdAt?: ThreadListItem["createdAt"];
  lastCommentAt?: ThreadListItem["lastCommentAt"];
  isUnread?: boolean;
  assigneeId?: string | null;
  userId?: string | null;
  userName?: string | null;
}

export default function DiscussionPage() {
  const { user, loading } = useAuthGuard();
  const { authUid } = useWorkspace();

  const [items, setItems] = useState<ThreadListItem[]>([]);
  const [allItemsRaw, setAllItemsRaw] = useState<RawFeedbackItem[]>([]);
  const [mentionsRaw, setMentionsRaw] = useState<RawFeedbackItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMentions, setLoadingMentions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFolder, setSelectedFolder] = useState<FolderKey>("inbox");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Fetch inbox threads
  useEffect(() => {
    if (!authUid) return;
    let cancelled = false;
    setLoadingItems(true);
    setError(null);
    void (async () => {
      try {
        const res = await authFetch("/api/feedback?conversationsOnly=true&limit=50", {
          cache: "no-store",
        });
        if (!res || !res.ok) throw new Error("Failed to load feedback");
        const inner = requireApiSuccessData<{ feedback: unknown[] }>(await res.json());
        if (cancelled) return;
        if (!Array.isArray(inner.feedback)) {
          throw new Error("Invalid response: feedback must be an array");
        }
        const raw = inner.feedback as RawFeedbackItem[];
        setAllItemsRaw(raw);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUid]);

  // Fetch mentions on demand
  useEffect(() => {
    if (!authUid) return;
    if (selectedFolder !== "mentions") return;
    let cancelled = false;
    setLoadingMentions(true);
    void (async () => {
      try {
        const res = await authFetch(
          `/api/feedback?mentionsUserId=${encodeURIComponent(authUid)}&limit=50`,
          { cache: "no-store" }
        );
        if (!res || !res.ok) throw new Error("Failed to load mentions");
        const inner = requireApiSuccessData<{ feedback: unknown[] }>(await res.json());
        if (cancelled) return;
        if (!Array.isArray(inner.feedback)) {
          throw new Error("Invalid response: feedback must be an array");
        }
        setMentionsRaw(inner.feedback as RawFeedbackItem[]);
      } catch (err) {
        if (!cancelled) {
          console.error("[DiscussionPage] mentions fetch:", err);
          setMentionsRaw([]);
        }
      } finally {
        if (!cancelled) setLoadingMentions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUid, selectedFolder]);

  // Map raw to ThreadListItem
  useEffect(() => {
    const mapRow = (f: RawFeedbackItem): ThreadListItem => {
      const id = String(f.id ?? "");
      const isResolved = f.status === "resolved" || f.isResolved === true;
      return {
        id,
        title: typeof f.title === "string" ? f.title.trim() : "",
        sessionId: String(f.sessionId ?? ""),
        sessionName: typeof f.sessionName === "string" ? f.sessionName : undefined,
        authorName: typeof f.userName === "string" ? f.userName : undefined,
        commentCount: typeof f.commentCount === "number" ? f.commentCount : 0,
        lastCommentPreview: typeof f.lastCommentPreview === "string" ? f.lastCommentPreview : undefined,
        status: getTicketStatus({ isResolved }),
        updatedAt: typeof f.updatedAt === "string" ? f.updatedAt : undefined,
        createdAt: f.createdAt,
        lastCommentAt: f.lastCommentAt,
        isUnread: f.isUnread === true,
        isMentionedYou: false,
      };
    };
    setItems(allItemsRaw.map(mapRow));
  }, [allItemsRaw]);

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
    const assigned = openItems.filter((i) => {
      const raw = allItemsRaw.find((r) => r.id === i.id);
      return raw?.assigneeId === authUid;
    }).length;
    const mentionsOpen = mentionsRaw.filter(
      (r) => !(r.status === "resolved" || r.isResolved === true)
    ).length;
    return {
      inbox,
      mentions: mentionsOpen,
      assigned,
      saved: 0,
    };
  }, [items, allItemsRaw, authUid, mentionsRaw]);

  // Filter threads by folder + session. Resolved/archived items are excluded everywhere.
  const visibleItems = useMemo(() => {
    const openList = items.filter((i) => i.status !== "resolved");
    if (selectedSessionId) {
      return openList.filter((i) => i.sessionId === selectedSessionId);
    }
    switch (selectedFolder) {
      case "assigned":
        return openList.filter((i) => {
          const raw = allItemsRaw.find((r) => r.id === i.id);
          return raw?.assigneeId === authUid;
        });
      case "mentions": {
        return mentionsRaw
          .map((f) => {
            const id = String(f.id ?? "");
            const isResolved =
              f.status === "resolved" || f.isResolved === true;
            return {
              id,
              title: typeof f.title === "string" ? f.title.trim() : "",
              sessionId: String(f.sessionId ?? ""),
              sessionName: typeof f.sessionName === "string" ? f.sessionName : undefined,
              authorName: typeof f.userName === "string" ? f.userName : undefined,
              commentCount: typeof f.commentCount === "number" ? f.commentCount : 0,
              lastCommentPreview:
                typeof f.lastCommentPreview === "string" ? f.lastCommentPreview : undefined,
              status: getTicketStatus({ isResolved }),
              updatedAt: typeof f.updatedAt === "string" ? f.updatedAt : undefined,
              createdAt: f.createdAt,
              lastCommentAt: f.lastCommentAt,
              isUnread: f.isUnread === true,
              isMentionedYou: true,
            } satisfies ThreadListItem;
          })
          .filter((i) => i.status !== "resolved");
      }
      case "saved":
        return [];
      case "inbox":
      default:
        return openList;
    }
  }, [items, selectedFolder, selectedSessionId, allItemsRaw, authUid, mentionsRaw]);

  const listTitle = useMemo(() => {
    if (selectedSessionId) {
      const session = sessions.find((s) => s.id === selectedSessionId);
      return session?.name?.trim() || "Session";
    }
    return FOLDER_LABEL[selectedFolder];
  }, [selectedFolder, selectedSessionId, sessions]);

  const handleSelectThread = useCallback((id: string) => {
    setSelectedThreadId(id);
    setMobileView("detail");
  }, []);

  const handleMobileBack = useCallback(() => {
    setMobileView("list");
    setSelectedThreadId(null);
  }, []);

  const handleCommentAdded = useCallback(() => {
    if (!selectedThreadId) return;
    const id = selectedThreadId;
    setAllItemsRaw((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, commentCount: (r.commentCount ?? 0) + 1 }
          : r
      )
    );
  }, [selectedThreadId]);

  const handleFolderChange = useCallback((key: FolderKey) => {
    setSelectedFolder(key);
    setSelectedThreadId(null);
  }, []);

  const handleSessionChange = useCallback((id: string | null) => {
    setSelectedSessionId(id);
    setSelectedThreadId(null);
  }, []);

  if (!user && !loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Please sign in to view discussions.
        </p>
      </div>
    );
  }

  const listLoading =
    selectedFolder === "mentions" ? loadingMentions : loadingItems;

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
    <div className="flex h-full overflow-hidden bg-[var(--surface-subtle)] gap-[6px]">
      {/* Col 1: Folders (lg+) */}
      <div className="hidden lg:flex w-[240px] shrink-0">
        <DiscussionFolders
          selectedFolder={selectedFolder}
          selectedSessionId={selectedSessionId}
          counts={counts}
          sessions={sessions}
          onFolderChange={handleFolderChange}
          onSessionChange={handleSessionChange}
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
          error={error}
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
            <div className="flex flex-1 items-center justify-center bg-white">
              <MinimalLoader />
            </div>
          }
        >
          <DiscussionConversation
            feedbackId={selectedThreadId}
            onCommentAdded={handleCommentAdded}
            listLoaded={!loadingItems}
          />
        </Suspense>
      </div>
    </div>
  );
}
