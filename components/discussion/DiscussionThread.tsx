"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Expand, Paperclip, Send } from "lucide-react";
import { DiscussionThreadBodySkeleton } from "@/components/discussion/discussionSkeletons";
import { authFetch } from "@/lib/authFetch";
import {
  addComment,
  createOptimisticComment,
  mergeRealtimeCommentsWithOptimistic,
  updateComment,
  deleteComment,
  type LocalComment,
} from "@/lib/comments";
import type { Comment, CommentAttachment } from "@/lib/domain/comment";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { AttachmentUploadModal } from "@/components/discussion/AttachmentUploadModal";
import { CommentItem } from "@/components/comments/CommentItem";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { useCommentsRepoSubscription } from "@/lib/hooks/useCommentsRepoSubscription";

export interface DiscussionThreadProps {
  feedbackId: string | null;
  onCommentAdded?: () => void;
  /** When false, do not show empty-state message (e.g. while ticket list is still loading). */
  listLoaded?: boolean;
}

interface TicketData {
  id: string;
  title?: string;
  sessionId?: string;
  screenshotUrl?: string | null;
  actionSteps?: string[];
  createdAt?: string;
}

export function DiscussionThread({
  feedbackId,
  onCommentAdded,
  listLoaded = true,
}: DiscussionThreadProps) {
  const {
    workspaceId,
    isIdentityResolved,
    authUid,
    authDisplayName,
    authPhotoUrl,
  } = useWorkspace();
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentsInitialized, setCommentsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

  useEffect(() => {
    if (!screenshotModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScreenshotModalOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [screenshotModalOpen]);

  const handleAttachmentSend = useCallback(
    async (attachment: CommentAttachment) => {
      if (!authUid || !feedbackId || !ticket?.sessionId || !workspaceId) return;
      assertIdentityResolved(isIdentityResolved);
      const sid = ticket.sessionId;
      const optimisticComment = createOptimisticComment({
        sessionId: sid,
        feedbackId,
        data: {
          userId: authUid,
          userName: authDisplayName || "User",
          userAvatar: authPhotoUrl || "",
          message: "",
          type: "general",
          attachment,
        },
      });
      setComments((prev) => [...prev, optimisticComment]);
      setAttachmentModalOpen(false);
      onCommentAdded?.();
      void (async () => {
        setSending(true);
        try {
          await addComment(sid, feedbackId, {
            userId: authUid,
            userName: authDisplayName || "User",
            userAvatar: authPhotoUrl || "",
            message: "",
            type: "general",
            attachment,
          });
        } catch (err) {
          console.error("[DiscussionThread] send attachment comment:", err);
          setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
          showToast("Could not send attachment");
        } finally {
          setSending(false);
        }
      })();
    },
    [
      feedbackId,
      ticket?.sessionId,
      onCommentAdded,
      workspaceId,
      authUid,
      authDisplayName,
      authPhotoUrl,
      isIdentityResolved,
      showToast,
    ]
  );

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
        setTicket(t ?? null);
        if (t?.sessionId) {
          authFetch(`/api/sessions/${t.sessionId}`)
            .then((r) => {
              if (!r || !r.ok) return null;
              return r.json();
            })
            .then((d: { session?: { title?: string } } | null) => {
              if (cancelled || !d) return;
              if (d.session?.title) setSessionName(d.session.title);
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
  }, [feedbackId, authUid]);

  useEffect(() => {
    if (!workspaceId || !feedbackId || !ticket?.sessionId || !authUid) {
      setComments([]);
      setCommentsInitialized(false);
    }
  }, [workspaceId, feedbackId, ticket?.sessionId, authUid]);

  useCommentsRepoSubscription({
    workspaceId,
    sessionId: ticket?.sessionId,
    feedbackId,
    onComments: (incoming) => {
      setComments((prev) => mergeRealtimeCommentsWithOptimistic(prev, incoming));
      setCommentsInitialized(true);
    },
  });

  const handleSendComment = () => {
    const sid = ticket?.sessionId;
    if (!authUid || !feedbackId || !sid || !workspaceId) return;
    assertIdentityResolved(isIdentityResolved);
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    const optimisticComment = createOptimisticComment({
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
    setComments((prev) => [...prev, optimisticComment]);
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
        console.error("[DiscussionThread] send comment:", err);
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        showToast("Could not send comment");
      } finally {
        setSending(false);
      }
    })();
  };

  if (!feedbackId) {
    if (!listLoaded) {
      return <div className="flex-1 flex h-full min-w-0 bg-white" />;
    }
    return (
      <div className="flex-1 flex h-full items-center justify-center bg-white min-w-0">
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium text-neutral-800">
            Select a ticket to view conversation
          </p>
          <p className="text-sm text-secondary mt-2">
            Choose a discussion from the middle panel
          </p>
        </div>
      </div>
    );
  }

  if (loading || !ticket) {
    return <DiscussionThreadBodySkeleton />;
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
  const userInitial = authDisplayName?.charAt(0) ?? "?";

  const contentClass = "max-w-[720px] w-full mx-auto";
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white">
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className={`w-full ${contentClass} flex flex-col text-left`}>
          {/* Ticket header: title (left) + View feedback ticket (right) */}
          <div className="mt-5 first:mt-0">
            <div className="ticket-header flex items-center justify-between gap-4">
              <h2 className="ticket-title text-lg font-semibold text-neutral-900 truncate min-w-0">
                {ticket.title?.trim() ? ticket.title : null}
              </h2>
              {ticket.sessionId && feedbackId ? (
                <Link
                  href={`/dashboard/${ticket.sessionId}?ticket=${feedbackId}`}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex gap-1 items-center shrink-0 hover:underline"
                >
                  View feedback ticket
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                </Link>
              ) : null}
            </div>
            {sessionName && ticket.sessionId && (
              <p className="text-sm text-secondary mt-1">
                {sessionName}
              </p>
            )}
          </div>

          {(hasScreenshot || hasSteps) && (
            <div className="flex flex-col mt-5">
              {/* Screenshot — primary artifact; no overlay */}
              {hasScreenshot && (
                <div className="w-full screenshot-container relative">
                  <div className="relative rounded-xl border border-[#e5e7eb] bg-white overflow-hidden flex items-center justify-center">
                    <Image
                      src={ticket.screenshotUrl!}
                      alt="Feedback screenshot"
                      width={800}
                      height={400}
                      sizes="(max-width: 720px) 100vw, 720px"
                      className="w-full max-h-[320px] object-contain"
                      loading="lazy"
                      unoptimized={ticket.screenshotUrl!.startsWith("data:")}
                    />
                    <button
                      type="button"
                      onClick={() => setScreenshotModalOpen(true)}
                      className="expand-button absolute top-[10px] right-[10px] w-7 h-7 rounded-md bg-white/85 flex items-center justify-center cursor-pointer border-0 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-150"
                      aria-label="Expand screenshot"
                    >
                      <Expand className="w-3.5 h-3.5 text-neutral-700" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action steps */}
              {hasSteps && (
                <div className="w-full mt-5">
                  <p className="font-semibold text-orange-600 text-sm tracking-[0.02em] mb-2">
                    Action Steps
                  </p>
                  <ul className="list-disc pl-[18px] leading-[1.6] text-neutral-700 space-y-1">
                    {steps!.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6 mt-5">
            <div className="space-y-0">
              {!commentsInitialized ? (
                <div className="space-y-4 py-4" aria-busy="true" aria-label="Loading comments">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200/80 animate-pulse" />
                      <div className="flex-1 space-y-2 pt-0.5">
                        <div className="h-3 w-24 rounded-md bg-neutral-200/80 animate-pulse" />
                        <div className="h-3 w-full rounded-md bg-neutral-200/70 animate-pulse" />
                        <div className="h-3 w-[88%] rounded-md bg-neutral-200/70 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : rootComments.length === 0 ? (
                <p className="text-sm text-secondary">No comments yet.</p>
              ) : (
                rootComments.map((root) => {
                  const replies = byThread.get(root.id) ?? [];
                  return (
                    <div key={root.id} className="mt-[14px] first:mt-0">
                      <CommentItem
                        comment={root}
                        currentUserId={authUid}
                        onUpdate={updateComment}
                        onDelete={deleteComment}
                      />
                      {replies.map((r) => (
                        <div
                          key={r.id}
                          className="mt-[14px] ml-4 pl-3 border-l-2 border-neutral-200"
                        >
                          <CommentItem
                            comment={r}
                            currentUserId={authUid}
                            onUpdate={updateComment}
                            onDelete={deleteComment}
                            size="compact"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer: Avatar | Input | Attach | Send — no border under last comment */}
            <div className="pt-5">
              <div className="flex items-center gap-3">
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
                className="flex-1 min-w-0 h-[44px] rounded-xl border border-neutral-200 px-4 text-[14px] font-normal text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition"
              />
              <button
                type="button"
                onClick={() => setAttachmentModalOpen(true)}
                className="p-2.5 rounded-lg text-secondary hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0"
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

      <AttachmentUploadModal
        open={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        onSend={handleAttachmentSend}
      />

      {/* Screenshot modal overlay */}
      {screenshotModalOpen && ticket?.screenshotUrl && (
        <div
          className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000]"
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
          onClick={() => setScreenshotModalOpen(false)}
        >
          <div
            className="max-w-[85vw] max-h-[85vh] rounded-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden bg-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={ticket.screenshotUrl}
              alt="Feedback screenshot"
              width={1200}
              height={800}
              className="w-full h-full object-contain max-w-[85vw] max-h-[85vh]"
              unoptimized={ticket.screenshotUrl.startsWith("data:")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
