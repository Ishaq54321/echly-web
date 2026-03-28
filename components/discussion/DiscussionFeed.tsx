"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { MessageSquare } from "lucide-react";
import { db } from "@/lib/firebase";
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
  user: User | null;
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
  user,
  selectedId,
  onSelect,
  refreshKey = 0,
}: DiscussionFeedProps) {
  const { workspaceId, claimsReady } = useWorkspace();
  const [items, setItems] = useState<DiscussionFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CRITICAL: Do not run query until workspaceId is resolved
    // Prevents Firestore permission errors
    if (!claimsReady || !user || !workspaceId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const discussionsQuery = query(
          collection(db, "feedback"),
          where("workspaceId", "==", workspaceId),
          where("commentCount", ">", 0),
          orderBy("commentCount", "desc"),
          limit(100)
        );
        const snapshot = await getDocs(discussionsQuery);
        if (cancelled) return;

        type RawDiscussionDoc = Record<string, unknown> & {
          id: string;
          lastCommentAt?: { seconds?: number } | string;
          sessionId?: string;
        };

        const raw: RawDiscussionDoc[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Record<string, unknown>),
        }));

        // Sort by lastCommentAt descending (newest first)
        const sorted = [...raw].sort((a, b) => {
          const aLa = a.lastCommentAt;
          const bLa = b.lastCommentAt;
          const aTs =
            typeof aLa === "string"
              ? new Date(aLa).getTime()
              : aLa?.seconds != null
                ? aLa.seconds * 1000
                : 0;
          const bTs =
            typeof bLa === "string"
              ? new Date(bLa).getTime()
              : bLa?.seconds != null
                ? bLa.seconds * 1000
                : 0;
          return bTs - aTs;
        });

        const sessionIds = [...new Set(sorted.map((f) => f.sessionId as string).filter(Boolean))];
        const sessionMap = new Map<string, string>();
        if (sessionIds.length > 0) {
          const sessionChunks: string[][] = [];
          for (let i = 0; i < sessionIds.length; i += 10) {
            sessionChunks.push(sessionIds.slice(i, i + 10));
          }
          await Promise.all(
            sessionChunks.map(async (chunk) => {
              const sessionDocs = await Promise.all(
                chunk.map(async (sessionId) => {
                  try {
                    const ref = doc(db, "sessions", sessionId);
                    const snap = await getDoc(ref);

                    if (!snap.exists()) return null;

                    const data = snap.data();

                    if (data.workspaceId !== workspaceId) return null;

                    return {
                      id: snap.id,
                      title: data.title as string | undefined,
                    };
                  } catch (error) {
                    console.error("[DISCUSSION] session read failed", {
                      sessionId,
                      error,
                    });
                    return null;
                  }
                })
              );

              for (const s of sessionDocs) {
                if (s) {
                  sessionMap.set(s.id, s.title ?? "Unknown Session");
                }
              }
            })
          );
        }
        if (cancelled) return;

        const list: DiscussionFeedItem[] = sorted.map((item) => {
          const status = (item.status as string) ?? "open";
          const isResolved = status === "resolved" || item.isResolved === true;
          return {
            id: String(item.id ?? ""),
            title: String(item.title ?? "Untitled"),
            sessionId: String(item.sessionId ?? ""),
            sessionName: sessionMap.get(item.sessionId as string) ?? "Unknown Session",
            commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
            lastCommentPreview: typeof item.lastCommentPreview === "string" ? item.lastCommentPreview : undefined,
            status: getTicketStatus({ isResolved }),
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
            lastCommentAt: item.lastCommentAt as DiscussionFeedItem["lastCommentAt"],
            createdAt: item.createdAt as DiscussionFeedItem["createdAt"],
          };
        });
        setItems(list);
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load discussions. Please refresh the page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [claimsReady, user, workspaceId, refreshKey]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-neutral-200/60 animate-pulse"
          />
        ))}
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
            <h3 className="font-medium text-neutral-900 text-[15px] leading-tight line-clamp-2">
              {item.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
              <span>{item.sessionName ?? "Unknown Session"}</span>
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
