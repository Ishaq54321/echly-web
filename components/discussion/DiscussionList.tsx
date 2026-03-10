"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { MessageSquareMore, ArrowUpRight } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { formatRelativeTime } from "@/lib/utils/time";
import { getTicketStatus } from "@/lib/domain/feedback";

export interface DiscussionItem {
  id: string;
  title: string;
  sessionId: string;
  sessionName?: string;
  commentCount?: number;
  lastCommentPreview?: string;
  status: "open" | "resolved" | "skipped";
  updatedAt?: string;
  createdAt?: { seconds?: number } | string;
  lastCommentAt?: { seconds?: number } | string;
  isUnread?: boolean;
}

export interface DiscussionListProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  search?: string;
  refreshKey?: number;
  /** Called when loading completes with whether there are any discussions */
  onEmptyChange?: (isEmpty: boolean) => void;
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
  onEmptyChange,
}: DiscussionListProps) {
  const [items, setItems] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onEmptyChangeRef = useRef(onEmptyChange);
  onEmptyChangeRef.current = onEmptyChange;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authFetch("/api/feedback?conversationsOnly=true&limit=100")
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to load feedback");
        return res.json();
      })
      .then((data: { feedback?: unknown[] }) => {
        if (cancelled) return;
        const raw = Array.isArray(data.feedback) ? data.feedback : [];
        onEmptyChangeRef.current?.(raw.length === 0);
        const list: DiscussionItem[] = raw.map((f: unknown) => {
          const item = f as Record<string, unknown>;
          const status = (item.status as string) ?? "open";
          const isResolved = status === "resolved" || item.isResolved === true;
          const isSkipped = status === "skipped" || item.isSkipped === true;
          return {
            id: String(item.id ?? ""),
            title: String(item.title ?? "Untitled"),
            sessionId: String(item.sessionId ?? ""),
            sessionName: typeof item.sessionName === "string" ? item.sessionName : undefined,
            commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
            lastCommentPreview: typeof item.lastCommentPreview === "string" ? item.lastCommentPreview : undefined,
            status: getTicketStatus({ isResolved, isSkipped }),
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
            createdAt: item.createdAt as DiscussionItem["createdAt"],
            lastCommentAt: item.lastCommentAt as DiscussionItem["lastCommentAt"],
            isUnread: item.isUnread === true,
          };
        });
        setItems(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.sessionName ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  if (loading) {
    return (
      <div
        className="w-[320px] shrink-0 flex flex-col overflow-hidden bg-[#F8FAFC] border-r border-neutral-200"
        style={{ minHeight: 200 }}
      >
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-200/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[320px] shrink-0 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC] border-r border-neutral-200">
        <p className="text-sm text-neutral-600">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-[320px] shrink-0 flex flex-col overflow-hidden bg-[#F8FAFC] border-r border-neutral-200">
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <MessageSquareMore className="w-12 h-12 text-neutral-300 mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900">
            No discussions yet
          </h2>
          <p className="mt-2 text-sm text-neutral-500 max-w-[240px]">
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
    <div className="w-[320px] shrink-0 flex flex-col overflow-hidden bg-[#F8FAFC] border-r border-neutral-200 font-sans">
      <div className="flex-1 overflow-y-auto p-2">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-neutral-500 py-4 px-4 text-center">
            No discussions match your search.
          </p>
        ) : (
          <div className="space-y-1">
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
                  className={`px-4 py-[14px] rounded-xl transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#EEF3FF] border-l-[3px] border-[#155DFC]"
                      : "hover:bg-[#F6F8FF] hover:translate-x-[2px]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-[30px] h-[30px] rounded-full bg-[#EEF3FF] text-[#155DFC] font-semibold flex items-center justify-center shrink-0"
                      aria-hidden
                    >
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[15px] font-semibold text-neutral-900 truncate">
                          {item.title}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden />
                      </div>
                      <p className="mt-0.5 text-[12px] text-neutral-500 truncate">
                        {sessionDisplay}
                      </p>
                      <p className="mt-0.5 text-[12px] text-neutral-400">
                        {replyLabel} • {timeLabel}
                      </p>
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
