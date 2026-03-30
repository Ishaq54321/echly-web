"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";
import { formatRelativeTime } from "@/lib/utils/time";
import { getTicketStatus } from "@/lib/domain/feedback";
import { useWorkspace } from "@/lib/client/workspaceContext";

export interface DiscussionFeedItem {
  id: string;
  title: string;
  sessionId: string;
  sessionName?: string;
  commentCount?: number;
  lastCommentPreview?: string;
  status: "open" | "resolved";
  updatedAt?: string;
  lastCommentAt?: { seconds?: number } | string;
  createdAt?: { seconds?: number } | string;
}

export interface DiscussionFeedProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  refreshKey?: number;
}

function parseTimestamp(item: DiscussionFeedItem): number {
  const la = item.lastCommentAt;
  if (la && typeof la === "object" && typeof (la as { seconds?: number }).seconds === "number") {
    return ((la as { seconds: number }).seconds) * 1000;
  }
  if (typeof la === "string") return new Date(la).getTime();
  const u = item.updatedAt;
  if (typeof u === "string") return new Date(u).getTime();
  const c = item.createdAt;
  if (c && typeof c === "object" && typeof (c as { seconds?: number }).seconds === "number") {
    return ((c as { seconds: number }).seconds) * 1000;
  }
  if (typeof c === "string") return new Date(c).getTime();
  return 0;
}

export function DiscussionFeed({
  selectedId,
  onSelect,
  refreshKey = 0,
}: DiscussionFeedProps) {
  const { authUid } = useWorkspace();
  const [items, setItems] = useState<DiscussionFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUid) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const url = "/api/feedback?conversationsOnly=true&limit=100";
        const res = await authFetch(url, { cache: "no-store" });
        if (!res?.ok) throw new Error("Failed to load discussions");
        const data = (await res.json().catch(() => ({}))) as {
          data?: { feedback?: unknown[] };
          feedback?: unknown[];
        };
        if (cancelled) return;
        const raw = Array.isArray(data.data?.feedback)
          ? data.data.feedback
          : Array.isArray(data.feedback)
            ? data.feedback
            : [];
        const list: DiscussionFeedItem[] = raw.map((row: unknown) => {
          const item = row as Record<string, unknown>;
          const status = (item.status as string) ?? "open";
          const isResolved = status === "resolved" || item.isResolved === true;
          return {
            id: String(item.id ?? ""),
            title: typeof item.title === "string" ? item.title.trim() : "",
            sessionId: String(item.sessionId ?? ""),
            sessionName: typeof item.sessionName === "string" ? item.sessionName : undefined,
            commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
            lastCommentPreview:
              typeof item.lastCommentPreview === "string" ? item.lastCommentPreview : undefined,
            status: getTicketStatus({ isResolved }),
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
            lastCommentAt: item.lastCommentAt as DiscussionFeedItem["lastCommentAt"],
            createdAt: item.createdAt as DiscussionFeedItem["createdAt"],
          };
        });
        setItems(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load discussions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUid, refreshKey]);

  const showLoading = !error && (!authUid || loading);

  if (showLoading) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center py-12">
        <MinimalLoader label="Loading discussions…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-secondary">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquare className="w-12 h-12 text-neutral-300 mb-4" />
        <h2 className="text-lg font-semibold text-neutral-900">
          No discussions yet
        </h2>
        <p className="mt-2 text-sm text-secondary max-w-[280px]">
          When people comment on feedback, conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        const ts = parseTimestamp(item);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`
              w-full text-left rounded-xl border p-4 transition-all duration-200
              bg-white
              border-neutral-200
              hover:border-[#155DFC80]
              hover:shadow-md
              hover:-translate-y-[1px]
              ${isSelected ? "border-[#155DFC] ring-1 ring-[#155DFC40] shadow-md" : ""}
            `}
          >
            {item.title ? (
              <h3 className="font-medium text-neutral-900 text-[15px] leading-tight line-clamp-2">
                {item.title}
              </h3>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
              {item.sessionName?.trim() ? <span>{item.sessionName}</span> : null}
              {item.commentCount != null && item.commentCount > 0 && (
                <span>· {item.commentCount} comments</span>
              )}
            </div>
            {item.lastCommentPreview && (
              <p className="mt-2 text-sm text-secondary line-clamp-2">
                {item.lastCommentPreview}
              </p>
            )}
            {ts > 0 && (
              <p className="mt-1.5 text-[11px] text-meta">
                Updated {formatRelativeTime(new Date(ts))}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
