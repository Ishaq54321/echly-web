"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Expand,
  Paperclip,
  RefreshCw,
  Send,
} from "lucide-react";
import { MinimalLoader } from "@/components/ui/MinimalLoader";
import { authFetch } from "@/lib/authFetch";
import {
  addComment,
  createOptimisticComment,
  mergeRealtimeCommentsWithOptimistic,
  updateComment,
  deleteComment,
  type LocalComment,
} from "@/lib/comments";
import type { CommentAttachment } from "@/lib/domain/comment";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { CommentItem } from "@/components/comments/CommentItem";

const AttachmentUploadModal = dynamic(
  () =>
    import("@/components/discussion/AttachmentUploadModal").then(
      (m) => m.AttachmentUploadModal
    ),
  { ssr: false }
);
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { getShareToken } from "@/lib/client/shareToken";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import { useCommentsRepoSubscription } from "@/lib/hooks/useCommentsRepoSubscription";
import { useScreenshotUrl } from "@/lib/client/useScreenshotUrl";

export interface DiscussionThreadProps {
  feedbackId: string | null;
  onCommentAdded?: () => void;
  /** Toggle list row for the affected ticket; omit id to use current selection (reopen). */
  onStatusChanged?: (affectedTicketId?: string) => void;
  /**
   * Before PATCH: parent snapshots list (current still open), navigates to next open, marks row resolved optimistically.
   */
  onResolvedAdvanceQueue?: (currentFeedbackId: string) => void;
  /** PATCH failed after optimistic resolve + navigate — parent should revert list row to open. */
  onResolveFailed?: (ticketId: string) => void;
  /** When false, do not show empty-state message (e.g. while ticket list is still loading). */
  listLoaded?: boolean;
  /** Index of this thread in the full list (1-based), for the "X of Y" counter */
  threadIndex?: number;
  /** Total number of threads in the current filter view */
  threadTotal?: number;
}

interface TicketData {
  id: string;
  title?: string;
  sessionId?: string;
  screenshotId?: string | null;
  actionSteps?: string[];
  createdAt?: string;
  status?: "open" | "resolved";
  isResolved?: boolean;
}

export function DiscussionThread({
  feedbackId,
  onCommentAdded,
  onStatusChanged,
  onResolvedAdvanceQueue,
  onResolveFailed,
  listLoaded = true,
  threadIndex,
  threadTotal,
}: DiscussionThreadProps) {
  const {
    isIdentityResolved,
    authUid,
    authDisplayName,
    authPhotoUrl,
    authReady,
  } = useWorkspace();
  const sharePresent = (getShareToken()?.trim() ?? "") !== "";
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentsInitialized, setCommentsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [resolvePending, setResolvePending] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
  const { url: resolvedScreenshotSrc, loading: screenshotLoading } =
    useScreenshotUrl(ticket?.screenshotId, {
      sessionId: ticket?.sessionId?.trim() || "",
    });

  const feedbackIdRef = useRef(feedbackId);
  feedbackIdRef.current = feedbackId;

  const commentsPollEnabled = useMemo(
    () =>
      authReady &&
      Boolean(ticket?.sessionId?.trim() && feedbackId?.trim()) &&
      (Boolean(authUid?.trim()) || sharePresent),
    [authReady, ticket?.sessionId, feedbackId, authUid, sharePresent]
  );

  useEffect(() => {
    setResolvePending(false);
  }, [feedbackId]);

  useEffect(() => {
    if (!screenshotModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScreenshotModalOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [screenshotModalOpen]);

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

    // PERF R-009: AbortController cancels BOTH chained fetches when feedbackId
    // changes or component unmounts. Previously the session-name fetch could
    // complete and call setState after navigation because the `cancelled` flag
    // was only checked after the second .then() resolved, not between the two
    // chained fetches.
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);

    const run = async () => {
      try {
        const ticketRes = await authFetch(`/api/tickets/${feedbackId}`, { signal });
        if (!ticketRes || !ticketRes.ok) throw new Error("Failed to load ticket");
        if (signal.aborted) return;
        const raw: unknown = await ticketRes.json();
        if (signal.aborted) return;
        const payload = requireApiSuccessData<{ ticket: TicketData }>(raw);
        const t = payload.ticket;
        setTicket(t);

        if (t.sessionId) {
          // non-critical: session name enrichment — failure is silent
          const sessionRes = await authFetch(`/api/sessions/${t.sessionId}`, { signal });
          if (!sessionRes || !sessionRes.ok) return;
          if (signal.aborted) return;
          const sessionRaw: unknown = await sessionRes.json();
          if (signal.aborted) return;
          const sessionPayload = requireApiSuccessData<{
            session: { title?: string };
          }>(sessionRaw);
          const title = sessionPayload.session.title;
          if (typeof title === "string" && title.trim()) setSessionName(title);
        } else {
          setSessionName("");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // PERF R-009: previously silently swallowed all errors; now only aborts
        // are silently dropped — real errors are logged for debugging
        console.error("[DiscussionThread] fetch error:", err);
        setTicket(null);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [feedbackId, authUid]);

  useEffect(() => {
    if (!feedbackId || !ticket?.sessionId || !commentsPollEnabled) {
      setComments([]);
      setCommentsInitialized(false);
    }
  }, [feedbackId, ticket?.sessionId, commentsPollEnabled]);

  const { refetch: refetchComments } = useCommentsRepoSubscription({
    sessionId: ticket?.sessionId,
    feedbackId,
    enabled: commentsPollEnabled,
    onComments: (incoming) => {
      setComments((prev) => mergeRealtimeCommentsWithOptimistic(prev, incoming));
      setCommentsInitialized(true);
    },
  });

  const handleResolve = useCallback(() => {
    if (!feedbackId || !ticket) return;
    assertIdentityResolved(isIdentityResolved);
    const newStatus: "open" | "resolved" =
      ticket.status === "resolved" ? "open" : "resolved";
    const resolvingId = feedbackId;

    if (newStatus === "resolved") {
      onResolvedAdvanceQueue?.(resolvingId);
    }

    setResolvePending(true);
    void (async () => {
      try {
        const res = await authFetch(`/api/tickets/${resolvingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res || !res.ok) throw new Error("Failed to update status");
        if (feedbackIdRef.current === resolvingId) {
          setTicket((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  isResolved: newStatus === "resolved",
                }
              : prev
          );
        }
        if (newStatus === "open") {
          onStatusChanged?.();
        }
      } catch (err) {
        console.error("[DiscussionThread] resolve:", err);
        if (newStatus === "resolved") {
          onResolveFailed?.(resolvingId);
        }
        showToast("Could not update status");
      } finally {
        setResolvePending(false);
      }
    })();
  }, [
    feedbackId,
    ticket,
    isIdentityResolved,
    onStatusChanged,
    onResolvedAdvanceQueue,
    onResolveFailed,
    showToast,
  ]);

  const handleAttachmentSend = useCallback(
    async (attachment: CommentAttachment) => {
      if (!authUid || !feedbackId || !ticket?.sessionId) return;
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
          void refetchComments();
        } catch (err) {
          console.error("[DiscussionThread] send attachment comment:", err);
          setComments((prev) =>
            prev.filter((c) => c.id !== optimisticComment.id)
          );
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
      authUid,
      authDisplayName,
      authPhotoUrl,
      isIdentityResolved,
      showToast,
      refetchComments,
    ]
  );

  const handleSendComment = () => {
    const sid = ticket?.sessionId;
    if (!authUid || !feedbackId || !sid) return;
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
        void refetchComments();
      } catch (err) {
        console.error("[DiscussionThread] send comment:", err);
        setComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id)
        );
        showToast("Could not send comment");
      } finally {
        setSending(false);
      }
    })();
  };

  // ── Empty / loading states ──────────────────────────────────────────────────

  if (!feedbackId) {
    if (!listLoaded) {
      return <div className="flex-1 flex h-full min-w-0 bg-white" />;
    }
    return (
      <div className="flex-1 flex h-full items-center justify-center bg-white min-w-0">
        <div className="text-center max-w-xs px-6">
          <p className="text-[15px] font-medium text-neutral-800">
            Select a thread to view conversation
          </p>
          <p className="text-[13px] text-secondary mt-1.5">
            Choose a discussion from the list
          </p>
        </div>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center bg-white">
        <MinimalLoader label="Loading conversation…" />
      </div>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  const rootComments = comments.filter((c) => !c.threadId);
  const byThread = new Map<string, LocalComment[]>();
  comments.forEach((c) => {
    if (c.threadId) {
      const list = byThread.get(c.threadId) ?? [];
      list.push(c);
      byThread.set(c.threadId, list);
    }
  });

  const isResolved = ticket.status === "resolved" || ticket.isResolved === true;
  const hasScreenshot = Boolean(ticket.screenshotId?.trim());
  const steps = ticket.actionSteps;
  const hasSteps = steps && Array.isArray(steps) && steps.length > 0;
  const userInitial = authDisplayName?.charAt(0) ?? "?";

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-neutral-200 px-5 py-3.5 bg-white">
        <div className="flex items-start justify-between gap-4">
          {/* Title + meta */}
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-neutral-900 truncate leading-snug">
              {ticket.title?.trim() ? ticket.title : "Untitled"}
            </h2>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              {/* Status badge */}
              <span
                className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isResolved
                    ? "bg-neutral-100 text-neutral-500"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {isResolved ? "Resolved" : "Open"}
              </span>

              {/* Session link */}
              {sessionName && ticket.sessionId ? (
                <span className="text-[12px] text-secondary flex items-center gap-1">
                  {sessionName}
                </span>
              ) : null}

              {/* X of Y counter */}
              {threadIndex !== undefined && threadTotal !== undefined && (
                <span className="text-[12px] text-meta tabular-nums">
                  {threadIndex} of {threadTotal}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {ticket.sessionId && feedbackId && (
              <Link
                href={`/session/${ticket.sessionId}?ticket=${feedbackId}`}
                className="hidden sm:inline-flex items-center gap-1 text-[12px] font-medium text-secondary border border-neutral-200 rounded-lg px-3 py-1.5 hover:border-neutral-300 hover:text-neutral-900 transition-colors"
              >
                View ticket
                <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={2} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => void handleResolve()}
              disabled={resolvePending}
              className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isResolved
                  ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  : "bg-[#155DFC] text-white hover:bg-[#0F4ED1]"
              }`}
            >
              {isResolved ? (
                <>
                  <Circle className="h-3.5 w-3.5" strokeWidth={2} />
                  Reopen
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  {resolvePending ? "Resolving…" : "Resolve"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-[720px] w-full mx-auto px-5 py-5 flex flex-col gap-5">

          {/* Screenshot */}
          {hasScreenshot && (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-level-1">
              <div className="relative flex items-center justify-center bg-neutral-50">
                {resolvedScreenshotSrc ? (
                  <Image
                    src={resolvedScreenshotSrc}
                    alt="Feedback screenshot"
                    width={800}
                    height={400}
                    sizes="(max-width: 720px) 100vw, 720px"
                    className="w-full max-h-[300px] object-contain"
                    loading="lazy"
                    unoptimized={resolvedScreenshotSrc.startsWith("data:")}
                  />
                ) : screenshotLoading ? (
                  <div className="w-full h-[200px] flex items-center justify-center text-[13px] text-secondary">
                    Loading screenshot…
                  </div>
                ) : (
                  <div className="w-full h-[200px] flex items-center justify-center text-[13px] text-secondary">
                    Screenshot unavailable
                  </div>
                )}
                {resolvedScreenshotSrc && (
                  <button
                    type="button"
                    onClick={() => setScreenshotModalOpen(true)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-md bg-white/90 flex items-center justify-center border border-neutral-200/80 shadow-level-1 hover:bg-white hover:shadow-level-2 transition-all"
                    aria-label="Expand screenshot"
                  >
                    <Expand className="w-3.5 h-3.5 text-neutral-700" strokeWidth={2} />
                  </button>
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[12px] text-meta">Screenshot</span>
                {ticket.sessionId && feedbackId && (
                  <Link
                    href={`/session/${ticket.sessionId}?ticket=${feedbackId}`}
                    className="text-[12px] font-medium text-[#155DFC] hover:underline flex items-center gap-0.5"
                  >
                    View full
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Action steps */}
          {hasSteps && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-level-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-meta mb-3">
                Action Steps
              </p>
              <ul className="space-y-2">
                {steps!.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-neutral-700">
                    <span className="mt-[3px] w-[6px] h-[6px] rounded-full bg-orange-400 shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-level-1">
            {/* Comments header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <span className="text-[13px] font-medium text-neutral-900">
                Replies
                {commentsInitialized && rootComments.length > 0 && (
                  <span className="ml-1.5 text-[12px] font-normal text-meta tabular-nums">
                    · {rootComments.length}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => void refetchComments()}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#155DFC] hover:text-[#0F4EDC] transition-colors"
              >
                <RefreshCw className="h-3 w-3 shrink-0" strokeWidth={2} />
                Refresh
              </button>
            </div>

            {/* Comment list */}
            <div className="px-5 py-4">
              {!commentsInitialized ? (
                <div className="flex justify-center py-6" aria-busy="true">
                  <MinimalLoader compact label="Loading replies…" />
                </div>
              ) : rootComments.length === 0 ? (
                <p className="text-[13px] text-secondary py-2">No replies yet. Be the first to comment.</p>
              ) : (
                <div className="space-y-0">
                  {rootComments.map((root) => {
                    const replies = byThread.get(root.id) ?? [];
                    return (
                      <div key={root.id} className="mt-3.5 first:mt-0">
                        <CommentItem
                          comment={root}
                          currentUserId={authUid}
                          onUpdate={updateComment}
                          onDelete={deleteComment}
                        />
                        {replies.map((r) => (
                          <div
                            key={r.id}
                            className="mt-3 ml-4 pl-3 border-l-2 border-neutral-200"
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
                  })}
                </div>
              )}
            </div>

            {/* Compose — inside the Replies card */}
            <div className="border-t border-neutral-100 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-[28px] h-[28px] rounded-full bg-[#EEF3FF] text-[#155DFC] font-semibold text-[13px] flex items-center justify-center shrink-0 overflow-hidden">
                  {userInitial}
                </div>
                <input
                  type="text"
                  placeholder="Write a reply…"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  className="flex-1 min-w-0 h-[38px] rounded-xl border border-neutral-200 px-4 text-[13px] text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC] transition"
                />
                <button
                  type="button"
                  onClick={() => setAttachmentModalOpen(true)}
                  className="p-2 rounded-lg text-secondary hover:bg-neutral-100 hover:text-neutral-700 transition-colors shrink-0"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={sending || !commentDraft.trim()}
                  className="h-[38px] w-[38px] rounded-xl bg-[#155DFC] text-white flex items-center justify-center shadow-level-1 hover:bg-[#0F4EDC] disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                  aria-label="Send reply"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {attachmentModalOpen ? (
        <AttachmentUploadModal
          open
          onClose={() => setAttachmentModalOpen(false)}
          onSend={handleAttachmentSend}
        />
      ) : null}

      {screenshotModalOpen && resolvedScreenshotSrc && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]"
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot preview"
          onClick={() => setScreenshotModalOpen(false)}
        >
          <div
            className="max-w-[85vw] max-h-[85vh] rounded-[12px] shadow-level-5 overflow-hidden bg-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={resolvedScreenshotSrc}
              alt="Feedback screenshot"
              width={1200}
              height={800}
              sizes="85vw"
              className="w-full h-full object-contain max-w-[85vw] max-h-[85vh]"
              unoptimized={resolvedScreenshotSrc.startsWith("data:")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
