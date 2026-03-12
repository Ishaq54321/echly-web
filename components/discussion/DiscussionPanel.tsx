"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { auth } from "@/lib/firebase";
import { addComment } from "@/lib/comments";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import type { Comment } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

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
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [sending, setSending] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!feedbackId) {
      setTicket(null);
      setSessionName("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    authFetch(`/api/tickets/${feedbackId}`)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: { success?: boolean; ticket?: TicketData }) => {
        if (cancelled) return;
        const t = data.ticket;
        if (t) {
          setTicket(t);
          if (t.sessionId) {
            authFetch(`/api/sessions/${t.sessionId}`)
              .then((r) => r.json())
              .then((d: { session?: { title?: string } }) => {
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
  }, [feedbackId]);

  useEffect(() => {
    if (!feedbackId || !ticket?.sessionId) {
      setComments([]);
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const unsubscribe = listenToCommentsRepo(
      ticket.sessionId,
      feedbackId,
      (incoming) => setComments([...incoming])
    );
    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [feedbackId, ticket?.sessionId]);

  const handleSendComment = async () => {
    const user = auth.currentUser;
    if (!user || !feedbackId || !ticket?.sessionId) return;
    const trimmed = commentDraft.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
      await addComment(workspaceId, ticket.sessionId, feedbackId, {
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL || "",
        message: trimmed,
        type: "general",
      });
      setCommentDraft("");
      onCommentAdded?.();
    } catch (err) {
      console.error("[DiscussionPanel] send comment:", err);
    } finally {
      setSending(false);
    }
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
          <h2 className="text-sm font-semibold text-[#111111]">Discussion</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#111111] hover:bg-[#E9ECEB] transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading || !ticket ? (
            <div className="p-6 space-y-4">
              <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-neutral-100 rounded animate-pulse" />
              <div className="h-24 bg-neutral-100 rounded animate-pulse" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#111111]">
                  {ticket.title}
                </h3>
                <div className="mt-1 text-sm text-[#111111]">
                  Session:{" "}
                  {sessionName ? (
                    <Link
                      href={`/dashboard/${ticket.sessionId}`}
                      className="text-[#111111] hover:underline"
                    >
                      {sessionName}
                    </Link>
                  ) : (
                    "Loading…"
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] mb-3">
                  Comment thread
                </h4>
                <div className="space-y-4">
                  {rootComments.length === 0 ? (
                    <p className="text-sm text-[#111111]">No comments yet.</p>
                  ) : (
                    rootComments.map((root) => {
                      const replies = byThread.get(root.id) ?? [];
                      return (
                        <div key={root.id} className="space-y-2">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F1F3F2] border border-[#E3E6E5] flex items-center justify-center text-xs font-medium text-[#111111] shrink-0">
                              {root.userName?.charAt(0) ?? "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 text-xs">
<span className="font-medium text-[#111111]">
                                {root.userName ?? "User"}
                              </span>
                                <span className="text-meta">
                                  {formatCommentDate(root.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-[#111111] mt-0.5">
                                {root.message}
                              </p>
                              {replies.map((r) => (
                                <div
                                  key={r.id}
                                  className="mt-3 ml-4 pl-3 border-l-2 border-neutral-200"
                                >
                                  <div className="flex items-center gap-2 text-xs">
<span className="font-medium text-[#111111]">
                                    {r.userName ?? "User"}
                                  </span>
                                    <span className="text-meta">
                                      {formatCommentDate(r.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[#111111] mt-0.5">
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
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-[#D1D5DB] transition"
              />
              <button
                type="button"
                onClick={handleSendComment}
                disabled={sending || !commentDraft.trim()}
                className="primary-cta px-4 py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
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
