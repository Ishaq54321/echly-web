"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { MessageSquareMore } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { formatRelativeTime } from "@/lib/utils/time";
import { getTicketStatus } from "@/lib/domain/feedback";

export interface DiscussionItem {
  id: string;
  title: string;
  sessionId: string;
  sessionName?: string;
  commentCount?: number;
  lastCommentPreview?: string;
  status: "open" | "resolved";
  updatedAt?: string;
  createdAt?: { seconds?: number } | string;
  lastCommentAt?: { seconds?: number } | string;
  isUnread?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
}

export interface DiscussionListProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  search?: string;
  refreshKey?: number;
  /** When set, only show threads for this session (project) */
  filterBySessionId?: string | null;
  /** Called when loading completes with whether there are any discussions */
  onEmptyChange?: (isEmpty: boolean) => void;
  /** Called when discussions load with unique sessions (projects) derived from the list */
  onProjectsLoaded?: (projects: ProjectItem[]) => void;
  /** Optional controlled list state; when provided, fetch updates this instead of internal state (avoids reload on reply). */
  items?: DiscussionItem[];
  setItems?: React.Dispatch<React.SetStateAction<DiscussionItem[]>>;
}

function parseUpdatedAt(item: DiscussionItem): number {
  const la = item.lastCommentAt;
  if (la && typeof la === "object" && typeof (la as { seconds?: number }).seconds === "number") {
    return (la as { seconds: number }).seconds * 1000;
  }
  if (typeof la === "string") return new Date(la).getTime();
  const u = item.updatedAt;
  if (typeof u === "string") return new Date(u).getTime();
  const c = item.createdAt;
  if (c && typeof c === "object" && typeof (c as { seconds?: number }).seconds === "number") {
    return (c as { seconds: number }).seconds * 1000;
  }
  if (typeof c === "string") return new Date(c).getTime();
  return 0;
}

export function DiscussionList({
  selectedId,
  onSelect,
  search = "",
  refreshKey = 0,
  filterBySessionId = null,
  onEmptyChange,
  onProjectsLoaded,
  items: controlledItems,
  setItems: controlledSetItems,
}: DiscussionListProps) {
  const { claimsReady } = useWorkspace();
  const [internalItems, setInternalItems] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onEmptyChangeRef = useRef(onEmptyChange);
  onEmptyChangeRef.current = onEmptyChange;
  const onProjectsLoadedRef = useRef(onProjectsLoaded);
  onProjectsLoadedRef.current = onProjectsLoaded;

  const items = controlledItems !== undefined ? controlledItems : internalItems;
  const setItems = controlledSetItems ?? setInternalItems;

  useEffect(() => {
    if (!claimsReady) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = "/api/feedback?conversationsOnly=true&limit=20";
    void (async () => {
      try {
        const res = await authFetch(url, { cache: "no-store" });
        if (!res || !res.ok) throw new Error("Failed to load feedback");
        const data = (await res.json()) as { feedback?: unknown[] };
        if (cancelled) return;
        const raw = Array.isArray(data.feedback) ? data.feedback : [];
        onEmptyChangeRef.current?.(raw.length === 0);
        const list: DiscussionItem[] = raw.map((f: unknown) => {
          const item = f as Record<string, unknown>;
          const status = (item.status as string) ?? "open";
          const isResolved = status === "resolved" || item.isResolved === true;
          return {
            id: String(item.id ?? ""),
            title: String(item.title ?? "Untitled"),
            sessionId: String(item.sessionId ?? ""),
            sessionName: typeof item.sessionName === "string" ? item.sessionName : undefined,
            commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
            lastCommentPreview: typeof item.lastCommentPreview === "string" ? item.lastCommentPreview : undefined,
            status: getTicketStatus({ isResolved }),
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
            createdAt: item.createdAt as DiscussionItem["createdAt"],
            lastCommentAt: item.lastCommentAt as DiscussionItem["lastCommentAt"],
            isUnread: item.isUnread === true,
          };
        });
        setItems(list);
        const projectMap = new Map<string, string>();
        list.forEach((i) => {
          if (i.sessionId && !projectMap.has(i.sessionId)) {
            projectMap.set(i.sessionId, i.sessionName ?? "Session");
          }
        });
        const projects: ProjectItem[] = Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }));
        onProjectsLoadedRef.current?.(projects);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, claimsReady]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterBySessionId) {
      list = list.filter((i) => i.sessionId === filterBySessionId);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.sessionName ?? "").toLowerCase().includes(q)
    );
  }, [items, search, filterBySessionId]);

  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden bg-transparent" style={{ minHeight: 200 }}>
        <div className="discussion-list-scroll flex-1 overflow-y-auto min-h-0 pl-0 pr-3 py-2">
          <div className="flex flex-col gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 pl-3 pr-3 py-3">
                <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <div className="h-4 w-3/4 skeleton max-w-[200px]" />
                  <div className="h-3 w-1/2 skeleton max-w-[120px]" />
                  <div className="h-3 w-1/3 skeleton max-w-[80px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent">
        <p className="text-sm text-secondary">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col overflow-hidden bg-transparent">
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <MessageSquareMore className="w-12 h-12 text-neutral-300 mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900">
            No discussions yet
          </h2>
          <p className="mt-2 text-sm text-secondary max-w-[240px]">
            When feedback receives comments, they will appear here.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#155DFC] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#0F4ED1] transition"
          >
            Open Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden bg-transparent h-full">
      <div className="discussion-list-scroll flex-1 overflow-y-auto min-h-0 pl-0 pr-3 py-2">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-secondary py-4 px-2 text-center">
            No discussions match your search.
          </p>
        ) : (
          <div className="flex flex-col gap-0">
            {filteredItems.map((item) => {
              const isSelected = selectedId === item.id;
              const ts = parseUpdatedAt(item);
              const count = item.commentCount ?? 0;
              const replyLabel = count === 1 ? "1 reply" : `${count} replies`;
              const timeLabel = ts > 0 ? formatRelativeTime(new Date(ts)) : "Just now";
              const sessionDisplay = item.sessionName ?? "Session";

              const initial = (item.title || "?").charAt(0).toUpperCase();

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(item.id);
                    }
                  }}
                  className={`ticket-item flex items-center gap-2.5 pl-3 pr-3 py-3 cursor-pointer transition-colors ${
                    isSelected ? "selected bg-blue-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full bg-[#EEF3FF] text-[#155DFC] font-semibold text-sm flex items-center justify-center shrink-0"
                    aria-hidden
                  >
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                    <div className="ticket-header flex items-center justify-between gap-2">
                      <h3 className="ticket-title font-semibold text-neutral-900 truncate text-[15px] min-w-0">
                        {item.title}
                      </h3>
                      <span className="ticket-time text-xs text-meta shrink-0">
                        {timeLabel}
                      </span>
                    </div>
                    <p className="text-sm text-secondary truncate">
                      {sessionDisplay}
                    </p>
                    <p className="text-xs text-meta">
                      {replyLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
