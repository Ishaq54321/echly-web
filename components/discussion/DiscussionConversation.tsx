"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  AtSign,
  Expand,
  Paperclip,
  Smile,
  X,
} from "lucide-react";
import { EmptyNoThreadSelectedIllustration } from "@/components/discussion/EmptyStateIllustrations";
import { Modal } from "@/components/ui/Modal";
import { authFetch } from "@/lib/authFetch";
import { handlePermissionError } from "@/lib/client/permissionError";
import {
  addComment,
  createOptimisticComment,
  isOptimisticLocalComment,
  mergeRealtimeCommentsWithOptimistic,
  updateComment,
  deleteComment,
  type LocalComment,
} from "@/lib/comments";
import type { CommentAttachment } from "@/lib/domain/comment";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { CommentItem } from "@/components/comments/CommentItem";
import {
  TiptapCommentEditor,
  extractFromDoc,
  type TiptapEditorParticipant,
} from "@/components/comments/TiptapCommentEditor";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import { requireApiSuccessData } from "@/lib/api/apiEnvelope";
import { useCommentsRepoSubscription } from "@/lib/hooks/useCommentsRepoSubscription";
import { useScreenshotUrl } from "@/lib/client/useScreenshotUrl";
import { GlobalNotificationButton } from "@/components/layout/GlobalNotificationButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { useBillingStore } from "@/lib/store/billingStore";
import { retainNotificationListener } from "@/lib/store/notificationStore";
import { retainSessionListener } from "@/lib/realtime/sessionStore";
import { ActionItemsSection } from "@/components/session/feedbackDetail/ActionItemsSection";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const AttachmentUploadModal = dynamic(
  () =>
    import("@/components/discussion/AttachmentUploadModal").then(
      (m) => m.AttachmentUploadModal
    ),
  { ssr: false }
);

const MAX_ATTACHMENTS = 5;

type PendingCommentPatch = { message?: string; resolved?: boolean };

function applyPendingCommentMutations(
  comments: LocalComment[],
  pendingDeletes: ReadonlySet<string>,
  patches: ReadonlyMap<string, PendingCommentPatch>
): LocalComment[] {
  const out = comments.filter((c) => !pendingDeletes.has(c.id));
  if (patches.size === 0) return out;
  return out.map((c) => {
    const p = patches.get(c.id);
    return p ? { ...c, ...p } : c;
  });
}

function getUploadBoxColor(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "var(--brand)";
  if (["pdf"].includes(ext)) return "var(--color-danger)";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt"].includes(ext)) return "var(--color-warning)";
  return "var(--text-secondary)";
}

export interface DiscussionConversationProps {
  feedbackId: string | null;
  onCommentAdded?: () => void;
  /** When false, do not show empty-state message (e.g. while ticket list is still loading). */
  listLoaded?: boolean;
  /**
   * Pre-seeded ticket data from the workspace-scoped discussion listener.
   * When provided AND matching feedbackId, skips the per-ticket REST fetch
   * and only fetches the session (for sessionName + access).
   */
  initialTicket?: {
    id: string;
    title?: string;
    sessionId?: string;
    screenshotId?: string | null;
    description?: string | null;
    status?: "open" | "resolved";
    isResolved?: boolean;
  } | null;
}

interface TicketData {
  id: string;
  title?: string;
  sessionId?: string;
  screenshotId?: string | null;
  description?: string;
  createdAt?: string;
  status?: "open" | "resolved";
  isResolved?: boolean;
}

interface SessionAccess {
  hasDirectSessionGrant?: boolean;
  isWorkspaceMember?: boolean;
  capabilities?: { canResolve?: boolean; canComment?: boolean };
}

function RightHeaderActions() {
  const { plan, isLoaded } = useBillingStore();
  const showUpgrade = isLoaded && plan === "starter";
  useEffect(() => {
    const release = retainNotificationListener();
    return release;
  }, []);
  return (
    <div className="flex items-center gap-3 shrink-0">
      {showUpgrade && (
        <Link href="/settings?tab=billing">
          <button
            type="button"
            className="inline-flex items-center h-[30px] px-3 rounded-[var(--radius-btn)] bg-[var(--brand)] text-white text-[12.5px] font-semibold tracking-[-0.005em] border-0 cursor-pointer hover:bg-[var(--brand-hover)] transition-colors shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(90,73,191,0.3)]"
          >
            Upgrade
          </button>
        </Link>
      )}
      <GlobalNotificationButton />
      <ProfileDropdown />
    </div>
  );
}

export function DiscussionConversation({
  feedbackId,
  onCommentAdded,
  listLoaded = true,
  initialTicket = null,
}: DiscussionConversationProps) {
  const {
    isIdentityResolved,
    authUid,
    displayName,
    authPhotoUrl,
    authReady,
  } = useWorkspace();
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [sessionName, setSessionName] = useState<string>("");
  const [sessionWorkspaceId, setSessionWorkspaceId] = useState<string>("");
  const [access, setAccess] = useState<SessionAccess | null>(null);
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [commentsInitialized, setCommentsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
  const [participants, setParticipants] = useState<TiptapEditorParticipant[]>([]);

  // Reply composer state
  const [replyHasContent, setReplyHasContent] = useState(false);
  const [replyPendingAttachments, setReplyPendingAttachments] = useState<CommentAttachment[]>([]);
  const [replyEmojiOpen, setReplyEmojiOpen] = useState(false);
  const [replyEmojiAnchorRect, setReplyEmojiAnchorRect] = useState<DOMRect | null>(null);
  const [replyFileError, setReplyFileError] = useState<string | null>(null);
  const replyEditorRef = useRef<{
    chain: () => { focus: () => { insertContent: (s: string) => { run: () => void } } };
    commands: { clearContent: () => void };
    state: { doc: Parameters<typeof extractFromDoc>[0] };
  } | null>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const replyEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const replyEmojiRef = useRef<HTMLDivElement>(null);

  // Per-thread inline reply composer
  const [replyOpenThreadId, setReplyOpenThreadId] = useState<string | null>(null);

  // Optimistic state refs (mirror useFeedbackDetailController)
  const pendingDeletedCommentIdsRef = useRef(new Set<string>());
  const pendingCommentPatchesRef = useRef(new Map<string, PendingCommentPatch>());
  const deleteRevertSnapshotRef = useRef(
    new Map<string, { comment: LocalComment; index: number }>()
  );

  const { url: resolvedScreenshotSrc, loading: screenshotLoading } =
    useScreenshotUrl(ticket?.screenshotId, {
      sessionId: ticket?.sessionId?.trim() || "",
    });

  const hasDirectSessionGrant = access?.hasDirectSessionGrant === true;

  const commentsPollEnabled = useMemo(
    () =>
      authReady &&
      Boolean(ticket?.sessionId?.trim() && feedbackId?.trim()) &&
      Boolean(authUid?.trim()),
    [authReady, ticket?.sessionId, feedbackId, authUid]
  );

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
      setSessionWorkspaceId("");
      setAccess(null);
      setLoading(false);
      return;
    }

    // Seed from the workspace-scoped discussion listener when available.
    // Skips the /api/tickets/{id} fetch and only fetches the session for
    // sessionName + access. The realtime listener will reconcile any later
    // changes to title/status/screenshotId on its own re-render path
    // (the parent re-passes initialTicket each tick — but we intentionally
    // keep this effect tied to feedbackId so we don't churn on every snapshot).
    if (initialTicket && initialTicket.id === feedbackId) {
      setTicket({
        id: initialTicket.id,
        title: initialTicket.title,
        sessionId: initialTicket.sessionId,
        screenshotId: initialTicket.screenshotId ?? null,
        description: initialTicket.description ?? undefined,
        status: initialTicket.status,
        isResolved: initialTicket.isResolved,
      });
      setSessionName("");
      setSessionWorkspaceId("");
      setAccess(null);
      setLoading(false);

      const sid = initialTicket.sessionId;
      if (!sid || !authUid) return;
      const controller = new AbortController();
      const { signal } = controller;
      void (async () => {
        try {
          const sessionRes = await authFetch(`/api/sessions/${sid}`, { signal });
          if (!sessionRes || !sessionRes.ok) return;
          if (signal.aborted) return;
          const sessionRaw: unknown = await sessionRes.json();
          if (signal.aborted) return;
          const accessRoot = sessionRaw as { access?: SessionAccess };
          setAccess(accessRoot.access ?? null);
          const sessionPayload = requireApiSuccessData<{
            session: { title?: string; workspaceId?: string | null };
          }>(sessionRaw);
          const title = sessionPayload.session.title;
          if (typeof title === "string" && title.trim()) setSessionName(title);
          const wid = sessionPayload.session.workspaceId;
          if (typeof wid === "string" && wid.trim()) setSessionWorkspaceId(wid.trim());
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("[DiscussionConversation] session fetch error:", err);
        }
      })();
      return () => controller.abort();
    }

    // Fallback: thread isn't in the listener window (or no seed provided).
    setTicket(null);
    setSessionName("");
    setSessionWorkspaceId("");
    setAccess(null);
    if (!authUid) {
      setLoading(false);
      return;
    }

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
        setTicket(payload.ticket);

        const sid = payload.ticket.sessionId;
        if (sid) {
          const sessionRes = await authFetch(`/api/sessions/${sid}`, { signal });
          if (!sessionRes || !sessionRes.ok) return;
          if (signal.aborted) return;
          const sessionRaw: unknown = await sessionRes.json();
          if (signal.aborted) return;
          const accessRoot = sessionRaw as { access?: SessionAccess };
          setAccess(accessRoot.access ?? null);
          const sessionPayload = requireApiSuccessData<{
            session: { title?: string; workspaceId?: string | null };
          }>(sessionRaw);
          const title = sessionPayload.session.title;
          if (typeof title === "string" && title.trim()) setSessionName(title);
          const wid = sessionPayload.session.workspaceId;
          if (typeof wid === "string" && wid.trim()) setSessionWorkspaceId(wid.trim());
        } else {
          setSessionName("");
          setSessionWorkspaceId("");
          setAccess(null);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("[DiscussionConversation] fetch error:", err);
        setTicket(null);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
    // initialTicket intentionally omitted — we seed on feedbackId change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackId, authUid]);

  // Fetch session participants for @mention autocomplete
  useEffect(() => {
    const sid = ticket?.sessionId?.trim();
    if (!sid) {
      setParticipants([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await authFetch(`/api/sessions/${sid}/participants`);
        if (!res || !res.ok) return;
        const json = (await res.json()) as {
          data?: { participants?: TiptapEditorParticipant[] };
        };
        if (cancelled) return;
        if (Array.isArray(json.data?.participants)) {
          setParticipants(json.data!.participants!);
        }
      } catch {
        if (!cancelled) setParticipants([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticket?.sessionId]);

  // Realtime session listener — populates sessionStore so the comments hook
  // can attach its own Firestore listener. Without this, useCommentsRepoSubscription
  // falls back to REST mode (one fetch, no auto-refetch), and optimistic comments
  // never get replaced with server-confirmed versions on this surface.
  useEffect(() => {
    const sid = ticket?.sessionId?.trim();
    if (!sid || !hasDirectSessionGrant || !sessionWorkspaceId) return;
    const release = retainSessionListener(sid, sessionWorkspaceId);
    return () => release();
  }, [ticket?.sessionId, hasDirectSessionGrant, sessionWorkspaceId]);

  useEffect(() => {
    if (!feedbackId || !ticket?.sessionId || !commentsPollEnabled) {
      setComments([]);
      setCommentsInitialized(false);
    }
  }, [feedbackId, ticket?.sessionId, commentsPollEnabled]);

  // Reset reply composer when switching threads
  useEffect(() => {
    setReplyHasContent(false);
    setReplyPendingAttachments([]);
    setReplyFileError(null);
    setReplyEmojiOpen(false);
    setReplyOpenThreadId(null);
    pendingDeletedCommentIdsRef.current.clear();
    pendingCommentPatchesRef.current.clear();
    deleteRevertSnapshotRef.current.clear();
  }, [feedbackId]);

  useEffect(() => {
    if (!replyFileError) return;
    const t = setTimeout(() => setReplyFileError(null), 4000);
    return () => clearTimeout(t);
  }, [replyFileError]);

  useEffect(() => {
    if (!replyEmojiOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        replyEmojiRef.current &&
        !replyEmojiRef.current.contains(e.target as Node) &&
        replyEmojiButtonRef.current &&
        !replyEmojiButtonRef.current.contains(e.target as Node)
      ) {
        setReplyEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [replyEmojiOpen]);

  const { refetch: refetchComments } = useCommentsRepoSubscription({
    sessionId: ticket?.sessionId,
    feedbackId,
    enabled: commentsPollEnabled,
    canSubscribeToFirestore: hasDirectSessionGrant,
    onComments: (incoming) => {
      const incomingIds = new Set(incoming.map((c) => c.id));
      for (const id of [...pendingDeletedCommentIdsRef.current]) {
        if (!incomingIds.has(id)) {
          pendingDeletedCommentIdsRef.current.delete(id);
        }
      }
      setComments((prev) => {
        const merged = mergeRealtimeCommentsWithOptimistic(prev, incoming);
        return applyPendingCommentMutations(
          merged,
          pendingDeletedCommentIdsRef.current,
          pendingCommentPatchesRef.current
        );
      });
      setCommentsInitialized(true);
    },
  });

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
          userName: displayName || "User",
          userAvatar: authPhotoUrl || "",
          message: "",
          type: "general",
          attachment,
        },
      });
      setComments((prev) => [optimisticComment, ...prev]);
      setAttachmentModalOpen(false);
      onCommentAdded?.();
      void (async () => {
        setSending(true);
        try {
          await addComment(sid, feedbackId, optimisticComment.id, {
            userId: authUid,
            userName: displayName || "User",
            userAvatar: authPhotoUrl || "",
            message: "",
            type: "general",
            attachment,
          });
        } catch (err) {
          console.error("[DiscussionConversation] send attachment:", err);
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
      displayName,
      authPhotoUrl,
      isIdentityResolved,
      showToast,
    ]
  );

  const submitReply = useCallback(
    async (text: string, mentionedUserIds: string[]) => {
      const sid = ticket?.sessionId;
      if (!authUid || !feedbackId || !sid) return;
      assertIdentityResolved(isIdentityResolved);
      const trimmed = text.trim();
      const atts = replyPendingAttachments;
      if (!trimmed && atts.length === 0) return;

      const optimisticComment = createOptimisticComment({
        sessionId: sid,
        feedbackId,
        data: {
          userId: authUid,
          userName: displayName || "User",
          userAvatar: authPhotoUrl || "",
          message: trimmed,
          type: "general",
          attachments: atts.length > 0 ? atts : undefined,
          mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
        },
      });
      setComments((prev) => [optimisticComment, ...prev]);
      setReplyPendingAttachments([]);
      setReplyHasContent(false);
      replyEditorRef.current?.commands.clearContent();
      onCommentAdded?.();
      void (async () => {
        try {
          await addComment(sid, feedbackId, optimisticComment.id, {
            userId: authUid,
            userName: displayName || "User",
            userAvatar: authPhotoUrl || "",
            message: trimmed,
            type: "general",
            attachments: atts.length > 0 ? atts : undefined,
            mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
          });
        } catch (err) {
          console.error("[DiscussionConversation] send comment:", err);
          setComments((prev) =>
            prev.filter((c) => c.id !== optimisticComment.id)
          );
          if (!handlePermissionError(err, showToast)) showToast("Could not send comment");
        }
      })();
    },
    [
      ticket?.sessionId,
      authUid,
      feedbackId,
      isIdentityResolved,
      replyPendingAttachments,
      displayName,
      authPhotoUrl,
      onCommentAdded,
      showToast,
    ]
  );

  const handleReactionsChanged = useCallback(
    (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => {
      setComments((prev) => {
        const target = prev.find((c) => c.id === commentId);
        if (!target || isOptimisticLocalComment(target)) return prev;
        return prev.map((c) => (c.id === commentId ? { ...c, reactions } : c));
      });
    },
    []
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, data: PendingCommentPatch) => {
      const trimmedMessage =
        typeof data.message === "string" ? data.message.trim() : undefined;
      const patch: PendingCommentPatch = {
        ...(trimmedMessage !== undefined ? { message: trimmedMessage } : {}),
        ...(data.resolved !== undefined ? { resolved: data.resolved } : {}),
      };
      if (trimmedMessage === undefined && data.resolved === undefined) return;

      let previousMessage: string | undefined;
      let previousResolved: boolean | undefined;
      let found = false;

      setComments((prev) => {
        const target = prev.find((c) => c.id === commentId);
        if (!target || isOptimisticLocalComment(target)) return prev;
        found = true;
        if (trimmedMessage !== undefined) previousMessage = target.message;
        if (data.resolved !== undefined) previousResolved = Boolean(target.resolved);
        const prevPatch = pendingCommentPatchesRef.current.get(commentId) ?? {};
        pendingCommentPatchesRef.current.set(commentId, { ...prevPatch, ...patch });
        return prev.map((c) => (c.id === commentId ? { ...c, ...patch } : c));
      });

      if (!found) return;

      try {
        await updateComment(commentId, patch);
        pendingCommentPatchesRef.current.delete(commentId);
      } catch (err) {
        console.error("[DiscussionConversation] updateComment failed", err);
        pendingCommentPatchesRef.current.delete(commentId);
        setComments((prev) =>
          prev.map((c) => {
            if (c.id !== commentId) return c;
            let next: LocalComment = { ...c };
            if (trimmedMessage !== undefined && previousMessage !== undefined) {
              next = { ...next, message: previousMessage };
            }
            if (data.resolved !== undefined && previousResolved !== undefined) {
              next = { ...next, resolved: previousResolved };
            }
            return next;
          })
        );
        if (!handlePermissionError(err, showToast)) showToast("Failed to update comment");
      }
    },
    [showToast]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      let wasOptimistic = false;
      pendingDeletedCommentIdsRef.current.add(commentId);
      setComments((prev) => {
        const idx = prev.findIndex((c) => c.id === commentId);
        if (idx === -1) {
          pendingDeletedCommentIdsRef.current.delete(commentId);
          return prev;
        }
        if (isOptimisticLocalComment(prev[idx])) {
          wasOptimistic = true;
          pendingDeletedCommentIdsRef.current.delete(commentId);
          return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        }
        deleteRevertSnapshotRef.current.set(commentId, {
          comment: prev[idx],
          index: idx,
        });
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
      if (wasOptimistic) return;
      try {
        await deleteComment(commentId);
        deleteRevertSnapshotRef.current.delete(commentId);
      } catch (err) {
        console.error("[DiscussionConversation] deleteComment failed", err);
        pendingDeletedCommentIdsRef.current.delete(commentId);
        const snap = deleteRevertSnapshotRef.current.get(commentId);
        deleteRevertSnapshotRef.current.delete(commentId);
        if (snap) {
          setComments((prev) => {
            if (prev.some((c) => c.id === commentId)) return prev;
            const insertAt = Math.min(snap.index, prev.length);
            const next = [...prev];
            next.splice(insertAt, 0, snap.comment);
            return next;
          });
        }
        if (!handlePermissionError(err, showToast)) showToast("Failed to delete comment");
      }
    },
    [showToast]
  );

  const submitThreadReply = useCallback(
    async (threadId: string, text: string, mentionedUserIds: string[], atts: CommentAttachment[]) => {
      const sid = ticket?.sessionId;
      if (!authUid || !feedbackId || !sid) return;
      assertIdentityResolved(isIdentityResolved);
      const trimmed = text.trim();
      if (!trimmed && atts.length === 0) return;

      const optimisticComment = createOptimisticComment({
        sessionId: sid,
        feedbackId,
        data: {
          userId: authUid,
          userName: displayName || "User",
          userAvatar: authPhotoUrl || "",
          message: trimmed,
          type: "general",
          threadId,
          attachments: atts.length > 0 ? atts : undefined,
          mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
        },
      });
      setComments((prev) => [...prev, optimisticComment]);
      setReplyOpenThreadId(null);
      onCommentAdded?.();
      void (async () => {
        try {
          await addComment(sid, feedbackId, optimisticComment.id, {
            userId: authUid,
            userName: displayName || "User",
            userAvatar: authPhotoUrl || "",
            message: trimmed,
            type: "general",
            threadId,
            attachments: atts.length > 0 ? atts : undefined,
            mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
          });
        } catch (err) {
          console.error("[DiscussionConversation] thread reply failed", err);
          setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
          if (!handlePermissionError(err, showToast)) showToast("Could not send reply");
        }
      })();
    },
    [
      ticket?.sessionId,
      authUid,
      feedbackId,
      isIdentityResolved,
      displayName,
      authPhotoUrl,
      onCommentAdded,
      showToast,
    ]
  );

  const { rootComments, byThread } = useMemo(() => {
    const getTime = (c: LocalComment) => {
      if (!c.createdAt) return 0;
      if (typeof c.createdAt === "object" && "seconds" in c.createdAt) {
        return (c.createdAt as { seconds: number }).seconds * 1000;
      }
      return new Date(c.createdAt as never).getTime();
    };
    const roots: LocalComment[] = [];
    const threads = new Map<string, LocalComment[]>();
    for (const c of comments) {
      if (c.threadId) {
        const list = threads.get(c.threadId) ?? [];
        list.push(c);
        threads.set(c.threadId, list);
      } else {
        roots.push(c);
      }
    }
    // Sort roots newest first (match session page)
    roots.sort((a, b) => getTime(b) - getTime(a));
    // Sort each thread's replies oldest first (chronological)
    threads.forEach((list) => {
      list.sort((a, b) => getTime(a) - getTime(b));
    });
    return { rootComments: roots, byThread: threads };
  }, [comments]);

  if (!feedbackId) {
    if (!listLoaded) {
      return (
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--surface-card)] shadow-[var(--shadow-panel)]">
          <div className="shrink-0 px-6 pt-4 pb-4 flex items-start justify-end">
            <RightHeaderActions />
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--surface-card)] shadow-[var(--shadow-panel)]">
        <div className="shrink-0 px-6 pt-4 pb-4 flex items-start justify-end">
          <RightHeaderActions />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="mb-4">
            <EmptyNoThreadSelectedIllustration />
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--text-heading)]">
            Select a conversation
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[260px] leading-relaxed">
            Pick a thread from the list to view the full discussion.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[var(--surface-card)] shadow-[var(--shadow-panel)]">
        <div className="shrink-0 px-6 pt-4 pb-4 flex items-start justify-end">
          <RightHeaderActions />
        </div>
        <div className="flex-1 px-6 py-4" aria-busy="true">
          <div className="h-5 skel-block rounded-md mb-2" style={{ width: "55%" }} />
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3.5 w-14 skel-block rounded-full" />
            <div className="h-3 skel-block rounded-md" style={{ width: "35%" }} />
          </div>
          <div className="h-[180px] skel-block rounded-[14px] mb-6" />
          <div className="h-3.5 w-28 skel-block rounded-md mb-3" />
          <div className="flex flex-col gap-2.5 mb-6">
            <div className="h-3 skel-block rounded-md" style={{ width: "80%" }} />
            <div className="h-3 skel-block rounded-md" style={{ width: "65%" }} />
            <div className="h-3 skel-block rounded-md" style={{ width: "70%" }} />
          </div>
          <div className="h-3.5 w-24 skel-block rounded-md mb-4" />
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full skel-block shrink-0" />
              <div className="flex-1">
                <div className="h-3 skel-block rounded-md mb-1.5" style={{ width: "25%" }} />
                <div className="h-3 skel-block rounded-md mb-1" style={{ width: "90%" }} />
                <div className="h-3 skel-block rounded-md" style={{ width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isResolved = ticket.status === "resolved" || ticket.isResolved === true;
  const hasScreenshot = Boolean(ticket.screenshotId?.trim());
  const description = typeof ticket.description === "string" ? ticket.description : "";
  const hasDescription = description.trim().length > 0;
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[var(--surface-card)] shadow-[var(--shadow-panel)]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-4 pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-semibold leading-[1.35] text-[var(--text-heading)] truncate">
              {ticket.title?.trim() ? ticket.title : "Untitled"}
            </h1>
          </div>
          <RightHeaderActions />
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          <span
            className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[12px] font-medium border ${
              isResolved
                ? "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]"
                : "bg-[var(--color-success-bg)]/70 text-[var(--color-success)] border-[var(--color-success-border)]/50"
            }`}
          >
            {isResolved ? "Resolved" : "Open"}
          </span>
          {sessionName ? (
            <span className="text-[13px] text-[var(--text-secondary)]">
              {sessionName}
            </span>
          ) : null}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Screenshot */}
        {hasScreenshot && (
          <div className="group mx-6 mt-5 rounded-[22px] border border-[var(--border)] bg-white overflow-hidden shadow-level-1">
            <div className="relative bg-[var(--surface-subtle)] flex items-center justify-center min-h-[180px] max-h-[300px] overflow-hidden">
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
                <div className="w-full h-[200px] flex items-center justify-center text-[14px] text-[var(--text-secondary)]">
                  Loading screenshot...
                </div>
              ) : (
                <div className="w-full h-[200px] flex items-center justify-center text-[14px] text-[var(--text-secondary)]">
                  Screenshot unavailable
                </div>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {resolvedScreenshotSrc && (
                  <button
                    type="button"
                    onClick={() => setScreenshotModalOpen(true)}
                    className="w-8 h-8 rounded-md bg-white/90 border border-black/10 grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-heading)] shadow-level-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Expand screenshot"
                  >
                    <Expand className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                )}
                {ticket.sessionId && feedbackId ? (
                  <Link
                    href={`/session/${ticket.sessionId}?ticket=${feedbackId}`}
                    className="inline-flex items-center h-9 px-4 rounded-md bg-white/90 border border-black/10 text-[13px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] shadow-level-1 backdrop-blur-sm transition-colors"
                  >
                    View Ticket
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Description (via shared session-page component) */}
        {hasDescription && (
          <div className="mx-6 mt-4 px-5 py-4 [&>div]:!mt-0 [&>div]:!mb-0">
            <ActionItemsSection description={description} isResolved={isResolved} />
          </div>
        )}

        {/* Comments */}
        <div className="mx-6 mt-4 mb-6">
          <div className="flex items-center px-5 py-3.5">
            <span className="text-[17px] font-semibold text-[var(--text-heading)]">
              Comments
              {commentsInitialized && rootComments.length > 0 && (
                <span className="ml-1.5 text-[17px] font-semibold text-[var(--text-tertiary)] tabular-nums">
                  · {rootComments.length}
                </span>
              )}
            </span>
          </div>

          {/* Reply composer (TiptapCommentEditor with mention/emoji/attach) */}
          <div className="px-4 py-3">
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border)] overflow-hidden focus-within:border-[var(--border-strong)] transition-colors duration-150">
              <div className="px-4 pt-3">
                <TiptapCommentEditor
                  placeholder="Leave a comment..."
                  participants={participants}
                  onSubmit={(text, mentionedUserIds) => void submitReply(text, mentionedUserIds)}
                  editorRef={replyEditorRef as never}
                  onContentChange={setReplyHasContent}
                />
              </div>

              {replyPendingAttachments.length > 0 && (
                <div className="flex flex-col gap-2 mx-4 mt-2 mb-1">
                  {replyPendingAttachments.map((att, i) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const isLoading = (att as any)._loading;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface-subtle)] rounded-xl"
                      >
                        {isLoading ? (
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: getUploadBoxColor(att.file_name) }}
                          >
                            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="62.83"
                                strokeDashoffset="62.83"
                                className="upload-ring-animate"
                              />
                            </svg>
                          </div>
                        ) : att.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={att.file_url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: getUploadBoxColor(att.file_name) }}
                          >
                            <Paperclip className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <span className="flex-1 min-w-0 text-[14px] font-medium text-[var(--text-body)] truncate">
                          {att.file_name}
                          {isLoading && (
                            <span className="ml-2 text-[12px] text-[var(--text-tertiary)]">Uploading...</span>
                          )}
                        </span>
                        <Tooltip content="Remove">
                          <button
                            type="button"
                            onClick={() =>
                              setReplyPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="p-1 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              )}

              {replyFileError && (
                <div className="flex items-center gap-2 mx-4 mb-1 px-3 py-2 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
                  <span className="text-[13px] font-medium text-[var(--color-danger)]">{replyFileError}</span>
                  <button
                    type="button"
                    onClick={() => setReplyFileError(null)}
                    className="ml-auto p-0.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-0.5">
                  <Tooltip content="Mention someone">
                    <button
                      type="button"
                      onClick={() => {
                        replyEditorRef.current?.chain().focus().insertContent("@").run();
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                    >
                      <AtSign className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Add emoji">
                    <button
                      ref={replyEmojiButtonRef}
                      type="button"
                      onClick={() => {
                        if (replyEmojiButtonRef.current) {
                          setReplyEmojiAnchorRect(replyEmojiButtonRef.current.getBoundingClientRect());
                        }
                        setReplyEmojiOpen((v) => !v);
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                    >
                      <Smile className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                  <Tooltip
                    content={
                      replyPendingAttachments.length >= MAX_ATTACHMENTS
                        ? "Maximum 5 attachments"
                        : "Attach file"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (replyPendingAttachments.length >= MAX_ATTACHMENTS) {
                          setReplyFileError("Maximum 5 attachments allowed");
                          return;
                        }
                        replyFileInputRef.current?.click();
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        replyPendingAttachments.length >= MAX_ATTACHMENTS
                          ? "text-[var(--text-tertiary)] opacity-50 cursor-not-allowed"
                          : "text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]"
                      }`}
                    >
                      <Paperclip className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                  </Tooltip>
                  <input
                    ref={replyFileInputRef}
                    type="file"
                    accept="*/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        setReplyFileError("File must be under 10 MB");
                        showToast("File must be under 10 MB");
                        e.target.value = "";
                        return;
                      }
                      if (replyPendingAttachments.length >= MAX_ATTACHMENTS) {
                        setReplyFileError("Maximum 5 attachments allowed");
                        showToast("Maximum 5 attachments allowed");
                        e.target.value = "";
                        return;
                      }
                      const placeholderId = Date.now().toString();
                      const placeholder = {
                        file_name: file.name,
                        file_url: "",
                        file_size: file.size,
                        _loading: true,
                        _id: placeholderId,
                        _progress: 0,
                      } as CommentAttachment & { _loading: boolean; _id: string };
                      setReplyPendingAttachments((prev) => [...prev, placeholder]);
                      const UPLOAD_TIMEOUT = 30000;
                      try {
                        const { uploadAttachmentWithProgress } = await import("@/lib/uploadAttachment");
                        const uploadPromise = uploadAttachmentWithProgress(file, (percent) => {
                          setReplyPendingAttachments((prev) =>
                            prev.map((att) =>
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (att as any)._id === placeholderId
                                ? { ...att, _progress: percent }
                                : att
                            )
                          );
                        });
                        const timeoutPromise = new Promise<never>((_, reject) =>
                          setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)
                        );
                        const result = await Promise.race([uploadPromise, timeoutPromise]);
                        if (!result.url) {
                          setReplyPendingAttachments((prev) =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            prev.filter((att) => (att as any)._id !== placeholderId)
                          );
                          setReplyFileError("Upload completed but file URL is missing. Please try again.");
                          showToast("Upload error");
                          e.target.value = "";
                          return;
                        }
                        setReplyPendingAttachments((prev) =>
                          prev.map((att) =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (att as any)._id === placeholderId
                              ? { file_name: result.name, file_url: result.url, file_size: result.size }
                              : att
                          )
                        );
                      } catch (err) {
                        setReplyPendingAttachments((prev) =>
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          prev.filter((att) => (att as any)._id !== placeholderId)
                        );
                        const message =
                          err instanceof Error && err.message === "Upload timed out"
                            ? "Upload timed out. Please try again."
                            : "Failed to upload file. Please try again.";
                        setReplyFileError(message);
                        showToast(message);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const ed = replyEditorRef.current;
                    if (ed) {
                      const { text, mentionedUserIds } = extractFromDoc(ed.state.doc);
                      void submitReply(text, mentionedUserIds);
                    }
                  }}
                  disabled={
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (!replyHasContent && replyPendingAttachments.length === 0) ||
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    replyPendingAttachments.some((att) => (att as any)._loading)
                  }
                  className="inline-flex h-[30px] items-center gap-1.5 px-3 rounded-[var(--radius-btn)] bg-[var(--brand)] text-white text-[12.5px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            {!commentsInitialized ? (
              <div className="px-5 py-4" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full skel-block shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 skel-block rounded-md mb-1.5" style={{ width: "20%" }} />
                      <div className="h-3 skel-block rounded-md mb-1" style={{ width: `${85 - i * 10}%` }} />
                      <div className="h-3 skel-block rounded-md" style={{ width: `${55 - i * 5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : rootComments.length === 0 ? (
              <p className="text-[13px] text-[var(--text-secondary)] py-2">
                No replies yet. Be the first to comment.
              </p>
            ) : (
              <div className="space-y-0">
                {rootComments.map((root) => {
                  const replies = byThread.get(root.id) ?? [];
                  const canResolve = access?.capabilities?.canResolve === true;
                  return (
                    <div key={root.id} className="mt-3.5 first:mt-0">
                      <CommentItem
                        comment={root}
                        currentUserId={authUid}
                        currentUserName={displayName ?? undefined}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteComment}
                        onReactionsChanged={isOptimisticLocalComment(root) ? undefined : handleReactionsChanged}
                        onResolveToggle={
                          canResolve && !isOptimisticLocalComment(root)
                            ? () => void handleUpdateComment(root.id, { resolved: !root.resolved })
                            : undefined
                        }
                      />
                      {replies.length > 0 && (
                        <div className="mt-3 ml-1 pl-4 border-l-2 border-[var(--border)]">
                          {replies.map((r) => (
                            <div key={r.id} className="mt-3 first:mt-0">
                              <CommentItem
                                comment={r}
                                currentUserId={authUid}
                                currentUserName={displayName ?? undefined}
                                onUpdate={handleUpdateComment}
                                onDelete={handleDeleteComment}
                                onReactionsChanged={isOptimisticLocalComment(r) ? undefined : handleReactionsChanged}
                                onResolveToggle={
                                  canResolve && !isOptimisticLocalComment(r)
                                    ? () => void handleUpdateComment(r.id, { resolved: !r.resolved })
                                    : undefined
                                }
                                size="compact"
                                isThreadResolved={root.resolved === true}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline per-thread reply */}
                      {replyOpenThreadId === root.id ? (
                        <div className="mt-2 ml-1 pl-4 border-l-2 border-[var(--border)]">
                          <DiscussionInlineReplyComposer
                            participants={participants}
                            currentUserAvatarUrl={authPhotoUrl ?? undefined}
                            currentUserInitial={displayName?.[0] ?? "?"}
                            onCancel={() => setReplyOpenThreadId(null)}
                            onSubmit={(text, mentionedUserIds, atts) =>
                              submitThreadReply(root.id, text, mentionedUserIds, atts)
                            }
                            showToast={showToast}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReplyOpenThreadId(root.id)}
                          className="mt-1.5 ml-[42px] text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {attachmentModalOpen ? (
        <AttachmentUploadModal
          open
          onClose={() => setAttachmentModalOpen(false)}
          onSend={handleAttachmentSend}
        />
      ) : null}

      {replyEmojiOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={replyEmojiRef}
            className="fixed z-[2147480001]"
            style={{
              bottom: replyEmojiAnchorRect ? window.innerHeight - replyEmojiAnchorRect.top + 8 : 0,
              left: replyEmojiAnchorRect ? replyEmojiAnchorRect.left : 0,
            }}
          >
            <EmojiPicker
              onEmojiClick={(data: { emoji: string }) => {
                replyEditorRef.current?.chain().focus().insertContent(data.emoji).run();
                setReplyEmojiOpen(false);
              }}
            />
          </div>,
          document.body
        )}

      {screenshotModalOpen && resolvedScreenshotSrc && (
        <Modal
          open
          onClose={() => setScreenshotModalOpen(false)}
          overlayClassName="bg-black/80 backdrop-blur-md"
          panelClassName="w-full h-full max-w-none !bg-transparent !shadow-none !rounded-none !border-0 !p-0"
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-6"
            onClick={() => setScreenshotModalOpen(false)}
          >
            <div
              className="max-w-[85vw] max-h-[85vh] rounded-[var(--radius-md)] shadow-xl overflow-hidden bg-white"
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
        </Modal>
      )}
    </div>
  );
}

interface DiscussionInlineReplyComposerProps {
  participants: TiptapEditorParticipant[];
  currentUserAvatarUrl?: string;
  currentUserInitial: string;
  onCancel: () => void;
  onSubmit: (text: string, mentionedUserIds: string[], atts: CommentAttachment[]) => Promise<void>;
  showToast: (message: string) => void;
}

function DiscussionInlineReplyComposer({
  participants,
  currentUserAvatarUrl,
  currentUserInitial,
  onCancel,
  onSubmit,
  showToast,
}: DiscussionInlineReplyComposerProps) {
  const [pendingAttachments, setPendingAttachments] = useState<CommentAttachment[]>([]);
  const [hasContent, setHasContent] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiAnchorRect, setEmojiAnchorRect] = useState<DOMRect | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const editorRef = useRef<{
    chain: () => { focus: () => { insertContent: (s: string) => { run: () => void } } };
    commands: { clearContent: () => void };
    state: { doc: Parameters<typeof extractFromDoc>[0] };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fileError) return;
    const t = setTimeout(() => setFileError(null), 4000);
    return () => clearTimeout(t);
  }, [fileError]);

  useEffect(() => {
    if (!emojiOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target as Node)
      ) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [emojiOpen]);

  const submit = useCallback(
    async (text: string, mentionedUserIds: string[]) => {
      const trimmed = text.trim();
      if (!trimmed && pendingAttachments.length === 0) return;
      const atts = pendingAttachments;
      setPendingAttachments([]);
      setHasContent(false);
      editorRef.current?.commands.clearContent();
      await onSubmit(trimmed, mentionedUserIds, atts);
    },
    [pendingAttachments, onSubmit]
  );

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border)] overflow-hidden focus-within:border-[var(--border-strong)] transition-colors duration-150">
      <div className="flex items-start gap-3 px-3 pt-3">
        <div className="w-[24px] h-[24px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[12px] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
          {currentUserAvatarUrl && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUserAvatarUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            currentUserInitial
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <TiptapCommentEditor
            placeholder="Write a reply..."
            participants={participants}
            onSubmit={(text, mentionedUserIds) => void submit(text, mentionedUserIds)}
            editorRef={editorRef as never}
            autoFocus
            onContentChange={setHasContent}
          />
        </div>
      </div>

      {pendingAttachments.length > 0 && (
        <div className="flex flex-col gap-2 mx-3 mt-2 mb-1">
          {pendingAttachments.map((att, i) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isLoading = (att as any)._loading;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface-subtle)] rounded-xl"
              >
                {isLoading ? (
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: getUploadBoxColor(att.file_name) }}
                  >
                    <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="62.83"
                        strokeDashoffset="62.83"
                        className="upload-ring-animate"
                      />
                    </svg>
                  </div>
                ) : att.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.file_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: getUploadBoxColor(att.file_name) }}
                  >
                    <Paperclip className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="flex-1 min-w-0 text-[14px] font-medium text-[var(--text-body)] truncate">
                  {att.file_name}
                  {isLoading && (
                    <span className="ml-2 text-[12px] text-[var(--text-tertiary)]">Uploading...</span>
                  )}
                </span>
                <Tooltip content="Remove">
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="p-1 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
            );
          })}
        </div>
      )}

      {fileError && (
        <div className="flex items-center gap-2 mx-3 mb-1 px-3 py-2 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
          <span className="text-[13px] font-medium text-[var(--color-danger)]">{fileError}</span>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="ml-auto p-0.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-0.5">
          <Tooltip content="Mention someone">
            <button
              type="button"
              onClick={() => {
                editorRef.current?.chain().focus().insertContent("@").run();
              }}
              className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
            >
              <AtSign className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </Tooltip>
          <Tooltip content="Add emoji">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => {
                if (emojiButtonRef.current) {
                  setEmojiAnchorRect(emojiButtonRef.current.getBoundingClientRect());
                }
                setEmojiOpen((v) => !v);
              }}
              className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
            >
              <Smile className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </Tooltip>
          <Tooltip
            content={
              pendingAttachments.length >= MAX_ATTACHMENTS
                ? "Maximum 5 attachments"
                : "Attach file"
            }
          >
            <button
              type="button"
              onClick={() => {
                if (pendingAttachments.length >= MAX_ATTACHMENTS) {
                  setFileError("Maximum 5 attachments allowed");
                  return;
                }
                fileInputRef.current?.click();
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                pendingAttachments.length >= MAX_ATTACHMENTS
                  ? "text-[var(--text-tertiary)] opacity-50 cursor-not-allowed"
                  : "text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]"
              }`}
            >
              <Paperclip className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </Tooltip>
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                setFileError("File must be under 10 MB");
                showToast("File must be under 10 MB");
                e.target.value = "";
                return;
              }
              if (pendingAttachments.length >= MAX_ATTACHMENTS) {
                setFileError("Maximum 5 attachments allowed");
                showToast("Maximum 5 attachments allowed");
                e.target.value = "";
                return;
              }
              const placeholderId = Date.now().toString();
              const placeholder = {
                file_name: file.name,
                file_url: "",
                file_size: file.size,
                _loading: true,
                _id: placeholderId,
                _progress: 0,
              } as CommentAttachment & { _loading: boolean; _id: string };
              setPendingAttachments((prev) => [...prev, placeholder]);
              const UPLOAD_TIMEOUT = 30000;
              try {
                const { uploadAttachmentWithProgress } = await import("@/lib/uploadAttachment");
                const uploadPromise = uploadAttachmentWithProgress(file, (percent) => {
                  setPendingAttachments((prev) =>
                    prev.map((att) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (att as any)._id === placeholderId
                        ? { ...att, _progress: percent }
                        : att
                    )
                  );
                });
                const timeoutPromise = new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)
                );
                const result = await Promise.race([uploadPromise, timeoutPromise]);
                if (!result.url) {
                  setPendingAttachments((prev) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    prev.filter((att) => (att as any)._id !== placeholderId)
                  );
                  setFileError("Upload completed but file URL is missing. Please try again.");
                  showToast("Upload error");
                  e.target.value = "";
                  return;
                }
                setPendingAttachments((prev) =>
                  prev.map((att) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (att as any)._id === placeholderId
                      ? { file_name: result.name, file_url: result.url, file_size: result.size }
                      : att
                  )
                );
              } catch (err) {
                setPendingAttachments((prev) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  prev.filter((att) => (att as any)._id !== placeholderId)
                );
                const message =
                  err instanceof Error && err.message === "Upload timed out"
                    ? "Upload timed out. Please try again."
                    : "Failed to upload file. Please try again.";
                setFileError(message);
                showToast(message);
              }
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPendingAttachments([]);
              setHasContent(false);
              editorRef.current?.commands.clearContent();
              onCancel();
            }}
            className="text-[12px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const ed = editorRef.current;
              if (ed) {
                const { text, mentionedUserIds } = extractFromDoc(ed.state.doc);
                void submit(text, mentionedUserIds);
              }
            }}
            disabled={
              (!hasContent && pendingAttachments.length === 0) ||
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pendingAttachments.some((att) => (att as any)._loading)
            }
            className="inline-flex h-[30px] items-center gap-1.5 px-3 rounded-[var(--radius-btn)] bg-[var(--brand)] text-white text-[12.5px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Reply
          </button>
        </div>
      </div>

      {emojiOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={emojiRef}
            className="fixed z-[2147480001]"
            style={{
              top: (emojiAnchorRect?.bottom ?? 0) + 4,
              left: Math.min(emojiAnchorRect?.left ?? 0, window.innerWidth - 320),
            }}
          >
            <EmojiPicker
              onEmojiClick={(data: { emoji: string }) => {
                editorRef.current?.chain().focus().insertContent(data.emoji).run();
                setEmojiOpen(false);
              }}
              width={300}
              height={380}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
