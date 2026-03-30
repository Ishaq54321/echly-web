"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";
import {
  addComment,
  createOptimisticComment,
  mergeRealtimeCommentsWithOptimistic,
  type LocalComment,
} from "@/lib/comments";
import type { Comment } from "@/lib/domain/comment";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useCommentsRepoSubscription } from "@/lib/hooks/useCommentsRepoSubscription";

const PANEL_WIDTH = 420;

export interface DiscussionPanelProps {
  feedbackId: string | null;
  onClose: () => void;
  onCommentAdded?: () => void;
}

interface TicketData {
  id: string;
  title: string;
  sessionId?: string;
}

export function DiscussionPanel({
  feedbackId,
  onClose,
  onCommentAdded,
}: DiscussionPanelProps) {
  const { isIdentityResolved, authUid, authDisplayName, authPhotoUrl } = useWorkspace();
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!feedbackId) {
      setTicket(null);
      setSessionName("");
      setLoading(false);
      return;
    }

    setTicket(null);
    setSessionName("");
    if (!authUid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    authFetch(`/api/tickets/${feedbackId}`)
      .then((res) => {
        if (cancelled) return;
        if (!res || !res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: { success?: boolean; ticket?: TicketData }) => {
        if (cancelled) return;
        const t = data.ticket;
        if (t) {
          setTicket(t);
          if (t.sessionId) {
            authFetch(`/api/sessions/${t.sessionId}`)
              .then((r) => {
                if (!r || !r.ok) return null;
                return r.json();
              })
              .then((d: { session?: { title?: string } } | null) => {
                if (!d) return;
                if (!cancelled && d.session?.title) {
                  setSessionName(d.session.title);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTicket(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feedbackId, authUid]);

  useEffect(() => {
    if (!feedbackId || !ticket?.sessionId || !authUid) {
      setComments([]);
    }
  }, [feedbackId, ticket?.sessionId, authUid]);

  useCommentsRepoSubscription({
    sessionId: ticket?.sessionId,
    feedbackId,
    onComments: (incoming) =>
      setComments((prev) => mergeRealtimeCommentsWithOptimistic(prev, incoming)),
  });

  const handleSendComment = () => {
    const sid = ticket?.sessionId;
    if (!authUid || !feedbackId || !sid) return;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = commentDraft.trim();
    if (!trimmed) return;

    const optimistic = createOptimisticComment({
      sessionId: sid,
      feedbackId,
      data: {
        userId: authUid,
        userName: authDisplayName || "User",
        userAvatar: authPhotoUrl || "",
        message: trimmed,
        type: "general",
      },
    });
    setComments((prev) => [...prev, optimistic]);
    setCommentDraft("");
    onCommentAdded?.();

    void (async () => {
      setSending(true);
      try {
        await addComment(sid, feedbackId, {
          userId: authUid,
          userName: authDisplayName || "User",
          userAvatar: authPhotoUrl || "",
          message: trimmed,
          type: "general",
        });
      } catch (err) {
        console.error("[DiscussionPanel] send comment:", err);
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        showToast("Could not send comment");
      } finally {
        setSending(false);
      }
    })();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!feedbackId) return null;

  const rootComments = comments.filter((c) => !c.threadId);
  const byThread = new Map<string, Comment[]>();
  comments.forEach((c) => {
    if (c.threadId) {
      const list = byThread.get(c.threadId) ?? [];
      list.push(c);
      byThread.set(c.threadId, list);
    }
  });

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 cursor-pointer"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Discussion"
        style={{ width: PANEL_WIDTH }}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white border-l border-neutral-200 shadow-xl overflow-hidden discussion-panel-slide-in"
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-900">Discussion</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-secondary hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading || !ticket ? (
            <div className="flex min-h-[240px] items-center justify-center p-6">
              <MinimalLoader label="Loading discussion…" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {ticket.title}
                </h3>
                <div className="mt-1 text-sm text-secondary">
                  Session:{" "}
                  {sessionName ? (
                    <Link
                      href={`/session/${ticket.sessionId}`}
                      className="text-[#155DFC] hover:underline"
                    >
                      {sessionName}
                    </Link>
                  ) : (
                    <span className="text-sm text-neutral-400" aria-busy="true">
                      Loading…
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-3">
                  Comment thread
                </h4>
                <div className="space-y-4">
                  {rootComments.length === 0 ? (
                    <p className="text-sm text-secondary">No comments yet.</p>
                  ) : (
                    rootComments.map((root) => {
                      const replies = byThread.get(root.id) ?? [];
                      return (
                        <div key={root.id} className="space-y-2">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-secondary shrink-0">
                              {root.userName?.charAt(0) ?? "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-medium text-neutral-900">
                                  {root.userName ?? "User"}
                                </span>
                                <span className="text-meta">
                                  {formatCommentDate(root.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-700 mt-0.5">
                                {root.message}
                              </p>
                              {replies.map((r) => (
                                <div
                                  key={r.id}
                                  className="mt-3 ml-4 pl-3 border-l-2 border-neutral-200"
                                >
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="font-medium text-neutral-900">
                                      {r.userName ?? "User"}
                                    </span>
                                    <span className="text-meta">
                                      {formatCommentDate(r.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-secondary mt-0.5">
                                    {r.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {ticket && (
          <div className="shrink-0 border-t border-neutral-200 p-4 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition"
              />
              <button
                type="button"
                onClick={handleSendComment}
                disabled={sending || !commentDraft.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#155DFC] text-white text-sm font-medium hover:bg-[#0F4ED1] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
