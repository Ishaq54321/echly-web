"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Paperclip, Send } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { auth } from "@/lib/firebase";
import { addComment } from "@/lib/comments";
import { listenToCommentsRepo } from "@/lib/repositories/commentsRepository";
import type { Comment } from "@/lib/domain/comment";
import { formatCommentDate } from "@/lib/utils/formatCommentDate";

export interface DiscussionThreadProps {
  feedbackId: string | null;
  onCommentAdded?: () => void;
}

interface TicketData {
  id: string;
  title?: string;
  sessionId?: string;
  screenshotUrl?: string | null;
  actionSteps?: string[];
}

export function DiscussionThread({
  feedbackId,
  onCommentAdded,
}: DiscussionThreadProps) {
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
        setTicket(t ?? null);
        if (t?.sessionId) {
          authFetch(`/api/sessions/${t.sessionId}`)
            .then((r) => r.json())
            .then((d: { session?: { title?: string } }) => {
              if (!cancelled && d.session?.title) setSessionName(d.session.title);
            })
            .catch(() => {});
        } else {
          setSessionName("");
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
      await addComment(ticket.sessionId, feedbackId, {
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL || "",
        message: trimmed,
        type: "general",
      });
      setCommentDraft("");
      onCommentAdded?.();
    } catch (err) {
      console.error("[DiscussionThread] send comment:", err);
    } finally {
      setSending(false);
    }
  };

  if (!feedbackId) {
    return (
      <div className="flex-1 flex h-full items-center justify-center bg-white min-w-0 font-sans">
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium text-neutral-800">
            Select a ticket to view conversation
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Choose a discussion from the left panel
          </p>
        </div>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="flex-1 flex flex-col p-8 bg-white overflow-auto min-w-0 font-sans">
        <div className="w-full space-y-4">
          <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
          <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse" />
          <div className="h-20 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const rootComments = comments.filter((c) => !c.threadId);
  const byThread = new Map<string, Comment[]>();
  comments.forEach((c) => {
    if (c.threadId) {
      const list = byThread.get(c.threadId) ?? [];
      list.push(c);
      byThread.set(c.threadId, list);
    }
  });

  const hasScreenshot = Boolean(ticket.screenshotUrl?.trim());
  const steps = ticket.actionSteps;
  const hasSteps = steps && Array.isArray(steps) && steps.length > 0;
  const user = auth.currentUser;
  const userInitial = user?.displayName?.charAt(0) ?? "?";

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white font-sans">
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="w-full flex flex-col gap-5">
          <div>
            {/* Workspace header: Ticket title + Session reference */}
            <h2 className="text-[18px] font-semibold text-neutral-900">
              {ticket.title ?? "Untitled"}
            </h2>
            {ticket.sessionId && (
              <p className="mt-1 text-[13px]">
                <Link
                  href={`/dashboard/${ticket.sessionId}`}
                  className="text-[#155DFC] hover:underline"
                >
                  {sessionName || "Session"}
                </Link>
              </p>
            )}
          </div>

          {(hasScreenshot || hasSteps) && (
            <div className="flex flex-col gap-4">
              {/* Screenshot context card */}
              {hasScreenshot && (
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center justify-center">
                  <Image
                    src={ticket.screenshotUrl!}
                    alt="Feedback screenshot"
                    width={800}
                    height={400}
                    sizes="(max-width: 880px) 100vw, 880px"
                    className="w-full max-h-[200px] object-contain mx-auto"
                    loading="lazy"
                    unoptimized={ticket.screenshotUrl!.startsWith("data:")}
                  />
                </div>
              )}

              {/* Action steps card */}
              {hasSteps && (
                <div className="px-1 py-2 transition-all duration-150 ease-out">
                  <p className="text-xs uppercase tracking-wide font-semibold text-neutral-500 mb-2">
                    Action steps
                  </p>
                  <ul className="text-[14px] leading-relaxed text-neutral-700 space-y-1 list-disc list-inside">
                    {steps!.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Conversation container */}
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6">
            {/* Thread: Avatar | Name | Timestamp / Message */}
            <div className="mb-5">
              {rootComments.length === 0 ? (
                <p className="text-sm text-neutral-500 font-normal">No comments yet.</p>
              ) : (
                rootComments.map((root) => {
                  const replies = byThread.get(root.id) ?? [];
                  return (
                    <div key={root.id} className="mb-5 last:mb-0">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600 shrink-0 overflow-hidden">
                          {root.userAvatar?.trim() ? (
                            <img
                              src={root.userAvatar}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            root.userName?.charAt(0) ?? "?"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[14px] font-medium text-neutral-900">
                              {root.userName ?? "User"}
                            </span>
                            <span className="text-[12px] text-neutral-400">
                              {formatCommentDate(root.createdAt)}
                            </span>
                          </div>
                          <p className="text-[15px] leading-relaxed text-neutral-700 mt-1">
                            {root.message}
                          </p>
                          {replies.map((r) => (
                            <div
                              key={r.id}
                              className="mt-4 ml-4 pl-3 border-l-2 border-neutral-200"
                            >
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="text-[14px] font-medium text-neutral-900">
                                  {r.userName ?? "User"}
                                </span>
                                <span className="text-[12px] text-neutral-400">
                                  {formatCommentDate(r.createdAt)}
                                </span>
                              </div>
                              <p className="text-[15px] leading-relaxed text-neutral-700 mt-1">
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

            {/* Composer: Avatar | Input | Attach | Send — 24px above */}
            <div className="flex items-center gap-3 pt-5 border-t border-neutral-100">
              <div className="w-[30px] h-[30px] rounded-full bg-[#EEF3FF] text-[#155DFC] font-semibold flex items-center justify-center shrink-0 overflow-hidden">
                {userInitial}
              </div>
              <input
                type="text"
                placeholder="Write a reply..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                className="flex-1 min-w-0 h-[44px] rounded-xl border border-neutral-200 px-4 text-[14px] font-normal text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition"
              />
              <button
                type="button"
                className="p-2.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={handleSendComment}
                disabled={sending || !commentDraft.trim()}
                className="h-[40px] px-5 rounded-xl bg-[#155DFC] text-white text-sm font-medium shadow-sm hover:bg-[#0F4EDC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out shrink-0 inline-flex items-center gap-2"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
