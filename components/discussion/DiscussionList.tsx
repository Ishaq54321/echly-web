"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { MessageSquareMore } from "lucide-react";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
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

export type StatusFilter = "all" | "open" | "review" | "resolved";

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
  /** Optional controlled list state; when provided, fetch updates this instead of internal state */
  items?: DiscussionItem[];
  setItems?: React.Dispatch<React.SetStateAction<DiscussionItem[]>>;
}

// Deterministic avatar palette derived from item id
const AVATAR_PALETTES = [
  { bg: "#EEF3FF", text: "#1e40af" },
  { bg: "#F0FDF4", text: "#166534" },
  { bg: "#FFF7ED", text: "#9A3412" },
  { bg: "#FDF4FF", text: "#7E22CE" },
  { bg: "#F0F9FF", text: "#0C4A6E" },
  { bg: "#FEFCE8", text: "#854D0E" },
];

function getAvatarPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
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

const FILTER_PILLS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "review", label: "In review" },
  { key: "resolved", label: "Resolved" },
];

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
  const { authUid } = useWorkspace();
  const [internalItems, setInternalItems] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const onEmptyChangeRef = useRef(onEmptyChange);
  onEmptyChangeRef.current = onEmptyChange;
  const onProjectsLoadedRef = useRef(onProjectsLoaded);
  onProjectsLoadedRef.current = onProjectsLoaded;

  const items = controlledItems !== undefined ? controlledItems : internalItems;
  const setItems = controlledSetItems ?? setInternalItems;

  useEffect(() => {
    if (!authUid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = "/api/feedback?conversationsOnly=true&limit=20";
    void (async () => {
      try {
        const res = await authFetch(url, { cache: "no-store" });
        if (!res || !res.ok) throw new Error("Failed to load feedback");
        const inner = requireApiSuccessData<{ feedback: unknown[] }>(await res.json());
        if (cancelled) return;
        if (!Array.isArray(inner.feedback)) {
          throw new Error("Invalid API response: feedback must be an array");
        }
        const raw = inner.feedback;
        onEmptyChangeRef.current?.(raw.length === 0);
        const list: DiscussionItem[] = raw.map((f: unknown) => {
          const item = f as Record<string, unknown>;
          const status = (item.status as string) ?? "open";
          const isResolved = status === "resolved" || item.isResolved === true;
          const titleStr = typeof item.title === "string" ? item.title.trim() : "";
          return {
            id: String(item.id ?? ""),
            title: titleStr,
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
            projectMap.set(i.sessionId, i.sessionName ?? "");
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
    return () => { cancelled = true; };
  }, [refreshKey, authUid]);

  // Counts for header (before status filter)
  const sessionFilteredItems = useMemo(() => {
    let list = items;
    if (filterBySessionId) {
      list = list.filter((i) => i.sessionId === filterBySessionId);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.sessionName ?? "").toLowerCase().includes(q) ||
        (i.lastCommentPreview ?? "").toLowerCase().includes(q)
    );
  }, [items, search, filterBySessionId]);

  const openCount = useMemo(
    () => sessionFilteredItems.filter((i) => i.status === "open").length,
    [sessionFilteredItems]
  );

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return sessionFilteredItems;
    if (statusFilter === "open") return sessionFilteredItems.filter((i) => i.status === "open");
    if (statusFilter === "resolved") return sessionFilteredItems.filter((i) => i.status === "resolved");
    // "review" — no such status in API; returns empty
    return [];
  }, [sessionFilteredItems, statusFilter]);

  const showLoading = !error && (!authUid || loading);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Sticky header */}
      <div className="shrink-0 px-4 py-4 border-b border-neutral-200 flex items-start justify-between gap-3 bg-white">
        <div>
          <h2 className="text-[15px] font-semibold text-neutral-900 leading-tight">Discussions</h2>
          <p className="text-[12px] text-meta mt-0.5 tabular-nums">
            {showLoading
              ? "Loading…"
              : `${sessionFilteredItems.length} thread${sessionFilteredItems.length !== 1 ? "s" : ""} · ${openCount} open`}
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-100 bg-white overflow-x-auto">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setStatusFilter(pill.key)}
            className={`text-[12px] px-3 py-[5px] rounded-full border whitespace-nowrap transition-all ${
              statusFilter === pill.key
                ? "bg-[#EEF3FF] text-[#155DFC] border-[#bfdbfe] font-medium"
                : "bg-transparent text-secondary border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* List body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {showLoading ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center" aria-busy="true" aria-live="polite">
            <MinimalLoader label="Loading discussions…" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-secondary">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <MessageSquareMore className="w-10 h-10 text-neutral-300 mb-3" />
            <h3 className="text-[15px] font-semibold text-neutral-900">No discussions yet</h3>
            <p className="mt-1.5 text-[13px] text-secondary max-w-[220px]">
              When feedback receives comments, they will appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#155DFC] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#0F4ED1] transition"
            >
              Open Sessions
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <p className="text-[13px] text-secondary">No threads match this filter.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredItems.map((item) => {
              const isSelected = selectedId === item.id;
              const ts = parseUpdatedAt(item);
              const count = item.commentCount ?? 0;
              const replyLabel = count === 1 ? "1 reply" : `${count} replies`;
              const timeLabel = ts > 0 ? formatRelativeTime(new Date(ts)) : "Just now";
              const sessionDisplay = item.sessionName ?? "Session";
              const initial = (item.title || "?").charAt(0).toUpperCase();
              const palette = getAvatarPalette(item.id);

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
                  className={`flex items-start gap-2.5 px-4 py-3.5 cursor-pointer border-b border-neutral-100 transition-colors ${
                    isSelected ? "bg-blue-50" : "hover:bg-neutral-50/80"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 mt-0.5"
                    style={{ background: palette.bg, color: palette.text }}
                    aria-hidden
                  >
                    {initial}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Title + timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className="text-[13px] font-medium text-neutral-900 truncate leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-meta shrink-0">{timeLabel}</span>
                    </div>

                    {/* Row 2: Session name */}
                    <p className="text-[12px] text-secondary truncate mb-1">{sessionDisplay}</p>

                    {/* Row 3: Preview */}
                    {item.lastCommentPreview && (
                      <p className="text-[12px] text-meta truncate mb-1.5">
                        {item.lastCommentPreview}
                      </p>
                    )}

                    {/* Footer: status dot + reply count */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-[6px] h-[6px] rounded-full shrink-0 ${
                          item.status === "open" ? "bg-green-500" : "bg-neutral-400"
                        }`}
                      />
                      <span className="text-[11px] text-meta">{replyLabel}</span>
                    </div>
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
