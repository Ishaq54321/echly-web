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

export type StatusFilter = "all" | "open" | "resolved";

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
  { bg: "var(--brand-subtle)", text: "var(--brand-text)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" },
  { bg: "var(--color-insight-bg)", text: "var(--color-insight)" },
  { bg: "var(--brand-subtle)", text: "var(--brand-text)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" },
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

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return sessionFilteredItems;
    if (statusFilter === "open") {
      return sessionFilteredItems.filter((i) => i.status === "open");
    }
    return sessionFilteredItems.filter((i) => i.status === "resolved");
  }, [sessionFilteredItems, statusFilter]);

  const showLoading = !error && (!authUid || loading);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Filter pills — spacing only; no divider line */}
      <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-white overflow-x-auto">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setStatusFilter(pill.key)}
            className={`text-[14px] px-3 py-[5px] rounded-full border whitespace-nowrap transition-all ${
              statusFilter === pill.key
                ? "bg-[var(--brand-subtle)] text-[var(--brand)] border-[var(--brand-muted)] font-medium"
                : "bg-transparent text-discussion-supporting border-[var(--border)] hover:border-[var(--border-strong)] hover:text-discussion-title"
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
            <p className="text-[14px] text-discussion-supporting">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <MessageSquareMore className="w-10 h-10 text-[var(--text-placeholder)] mb-3" />
            <h3 className="text-[16px] font-semibold text-discussion-title">No discussions yet</h3>
            <p className="mt-1.5 text-[14px] text-discussion-supporting max-w-[240px]">
              When feedback receives comments, they will appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
            >
              Open Sessions
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <p className="text-[14px] text-discussion-supporting">No threads match this filter.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 px-3 pt-2 pb-4">
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
                  className={[
                    "flex items-start gap-3 rounded-xl px-3.5 py-3.5 cursor-pointer outline-none",
                    "transition-colors duration-150 ease-out",
                    "focus-visible:ring-2 focus-visible:ring-neutral-200/80 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
                    isSelected
                      ? "bg-[var(--surface-hover)]"
                      : "bg-transparent hover:bg-[var(--surface-hover)]",
                  ].join(" ")}
                >
                  {/* Avatar — compact so text stays primary */}
                  <div
                    className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 mt-[1px]"
                    style={{ background: palette.bg, color: palette.text }}
                    aria-hidden
                  >
                    {initial}
                  </div>

                  {/* Four-line block: title+time · workspace · preview · replies */}
                  <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <h3 className="min-w-0 flex-1 truncate text-[14px] font-medium leading-snug text-discussion-title">
                        {item.title}
                      </h3>
                      <span className="shrink-0 whitespace-nowrap pt-[1px] text-[14px] leading-snug text-discussion-supporting">
                        {timeLabel}
                      </span>
                    </div>
                    <p className="truncate text-[14px] leading-snug text-discussion-supporting">
                      {sessionDisplay}
                    </p>
                    {item.lastCommentPreview ? (
                      <p className="truncate text-[14px] leading-snug text-discussion-supporting">
                        {item.lastCommentPreview}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          item.status === "open" ? "bg-[var(--color-success)]/75" : "bg-[var(--text-tertiary)]/60"
                        }`}
                        aria-hidden
                      />
                      <span className="text-[14px] leading-snug text-meta">{replyLabel}</span>
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
