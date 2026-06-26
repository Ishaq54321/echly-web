"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AtSign, Smile, Paperclip, X } from "lucide-react";
import type { Comment, CommentAttachment, CommentPosition } from "@/lib/domain/comment";
import { CommentItem } from "@/components/comments/CommentItem";
import { extractFromDoc } from "@/lib/tiptap/extractFromDoc";
import { Tooltip } from "@/components/ui/Tooltip";

const TiptapCommentEditor = dynamic(
  () =>
    import("@/components/comments/TiptapCommentEditor").then(
      (m) => m.TiptapCommentEditor
    ),
  { ssr: false }
);

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const MAX_ATTACHMENTS = 5;

const EMOJI_PICKER_WIDTH = 320;
const EMOJI_PICKER_HEIGHT = 400;

/** Place the emoji picker so it always stays inside the viewport.
 *  Prefer below the anchor; flip to above if there isn't room below AND
 *  more space exists above. Horizontally clamped. */
function computeEmojiPosition(
  anchor: DOMRect,
  pickerWidth = EMOJI_PICKER_WIDTH,
  pickerHeight = EMOJI_PICKER_HEIGHT
): { top: number; left: number } {
  if (typeof window === "undefined") return { top: 0, left: 0 };
  const GAP = 6;
  const MARGIN = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceAbove = anchor.top;
  const spaceBelow = vh - anchor.bottom;
  const placeBelow =
    spaceBelow >= pickerHeight + GAP || spaceBelow >= spaceAbove;

  let top = placeBelow
    ? anchor.bottom + GAP
    : anchor.top - pickerHeight - GAP;
  top = Math.max(MARGIN, Math.min(top, vh - pickerHeight - MARGIN));

  let left = anchor.left;
  left = Math.max(MARGIN, Math.min(left, vw - pickerWidth - MARGIN));

  return { top, left };
}

type Participant = {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
};

function getUploadBoxColor(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "var(--brand)";
  if (["pdf"].includes(ext)) return "var(--color-danger)";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt"].includes(ext)) return "var(--color-warning)";
  return "var(--text-secondary)";
}

function AttachmentChips({
  attachments,
  onRemove,
}: {
  attachments: CommentAttachment[];
  onRemove: (index: number) => void;
}) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mx-4 mt-2 mb-1">
      {attachments.map((att, i) => {
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
                <span className="ml-2 text-[12px] text-[var(--text-tertiary)]">
                  Uploading...
                </span>
              )}
            </span>
            <Tooltip content="Remove">
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="p-1 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

function FileError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-2 mx-4 mb-1 px-3 py-2 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
      <svg
        className="h-4 w-4 text-[var(--color-danger)] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="text-[14px] font-medium text-[var(--color-danger)]">
        {message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto p-0.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

async function handleFileSelection(opts: {
  file: File;
  current: CommentAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<CommentAttachment[]>>;
  setError: (msg: string) => void;
}): Promise<void> {
  const { file, current, setAttachments, setError } = opts;
  if (file.size > 10 * 1024 * 1024) {
    setError("File must be under 10 MB");
    return;
  }
  if (current.length >= MAX_ATTACHMENTS) {
    setError("Maximum 5 attachments allowed");
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
  setAttachments((prev) => [...prev, placeholder]);
  const UPLOAD_TIMEOUT = 30000;
  try {
    const { uploadAttachmentWithProgress } = await import("@/lib/uploadAttachment");
    const uploadPromise = uploadAttachmentWithProgress(file, (percent) => {
      setAttachments((prev) =>
        prev.map((att) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (att as any)._id === placeholderId ? { ...att, _progress: percent } : att
        )
      );
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)
    );
    const result = await Promise.race([uploadPromise, timeoutPromise]);
    if (!result.url) {
      setAttachments((prev) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prev.filter((att) => (att as any)._id !== placeholderId)
      );
      setError("Upload completed but file URL is missing. Please try again.");
      return;
    }
    setAttachments((prev) =>
      prev.map((att) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att as any)._id === placeholderId
          ? { file_name: result.name, file_url: result.url, file_size: result.size }
          : att
      )
    );
  } catch (err) {
    setAttachments((prev) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prev.filter((att) => (att as any)._id !== placeholderId)
    );
    const message =
      err instanceof Error && err.message === "Upload timed out"
        ? "Upload timed out. Please try again."
        : "Failed to upload file. Please try again.";
    setError(message);
  }
}

function IconToolbar({
  attachments,
  onInsertMention,
  onOpenEmoji,
  emojiButtonRef,
  fileInputRef,
  onPickFile,
  onFileChange,
}: {
  attachments: CommentAttachment[];
  onInsertMention: () => void;
  onOpenEmoji: () => void;
  emojiButtonRef: React.RefObject<HTMLButtonElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPickFile: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const atMax = attachments.length >= MAX_ATTACHMENTS;
  return (
    <div className="flex items-center gap-0.5">
      <Tooltip content="Mention someone">
        <button
          type="button"
          onClick={onInsertMention}
          className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
        >
          <AtSign className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </Tooltip>
      <Tooltip content="Add emoji">
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={onOpenEmoji}
          className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
        >
          <Smile className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </Tooltip>
      <Tooltip content={atMax ? "Maximum 5 attachments" : "Attach file"}>
        <button
          type="button"
          onClick={onPickFile}
          className={`p-1.5 rounded-lg transition-colors ${
            atMax
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
        onChange={onFileChange}
      />
    </div>
  );
}

export interface CommentsSectionProps {
  selectedTicketId: string;
  comments: Comment[];
  loading: boolean;
  sendComment?: (
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    position?: CommentPosition,
    mentionedUserIds?: string[]
  ) => Promise<string>;
  sendReply?: (
    threadId: string,
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    mentionedUserIds?: string[]
  ) => Promise<void>;
  updateComment?: (
    commentId: string,
    data: { message?: string; resolved?: boolean }
  ) => Promise<void>;
  deleteComment?: (commentId: string) => Promise<void>;
  onReactionsChanged?: (
    commentId: string,
    reactions: Record<string, { userIds: string[]; userNames: string[] }>
  ) => void;
  currentUserId?: string | null;
  currentUserName?: string;
  currentUserInitial?: string;
  currentUserAvatarUrl?: string;
  participants?: Participant[];
  showToast?: (msg: string) => void;
  /**
   * Phase 26.7: clicking a screenshot pin scrolls the matching comment
   * into view here and briefly highlights it. The parent owns this
   * state and auto-clears it after ~2s.
   */
  highlightedCommentId?: string | null;
}

function getCommentTimeMs(c: Comment): number {
  const createdAt = c.createdAt as unknown;
  if (!createdAt) return 0;
  if (typeof createdAt === "object" && createdAt !== null && "seconds" in createdAt) {
    return (createdAt as { seconds: number }).seconds * 1000;
  }
  return new Date(createdAt as string | number | Date).getTime();
}

function ThreadBlock({
  root,
  replies,
  currentUserId,
  currentUserName,
  currentUserInitial,
  currentUserAvatarUrl,
  updateComment,
  deleteComment,
  onReactionsChanged,
  sendReply,
  participants,
  showToast,
  rowRef,
  isHighlighted,
}: {
  root: Comment;
  replies: Comment[];
  rowRef?: (el: HTMLDivElement | null) => void;
  isHighlighted?: boolean;
  currentUserId: string | null;
  currentUserName?: string;
  currentUserInitial?: string;
  currentUserAvatarUrl?: string;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  onReactionsChanged?: (
    commentId: string,
    reactions: Record<string, { userIds: string[]; userNames: string[] }>
  ) => void;
  sendReply?: (
    threadId: string,
    message: string,
    attachment?: CommentAttachment,
    attachments?: CommentAttachment[],
    mentionedUserIds?: string[]
  ) => Promise<void>;
  participants?: Participant[];
  showToast?: (msg: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyHasContent, setReplyHasContent] = useState(false);
  const [replyPendingAttachments, setReplyPendingAttachments] = useState<CommentAttachment[]>([]);
  const [replyFileError, setReplyFileError] = useState<string | null>(null);
  const [replyEmojiOpen, setReplyEmojiOpen] = useState(false);
  const [replyEmojiAnchorRect, setReplyEmojiAnchorRect] = useState<DOMRect | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replyEditorRef = useRef<any>(null);
  const replyEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const replyEmojiRef = useRef<HTMLDivElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => setAvatarError(false), [currentUserAvatarUrl]);

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
    function handleScroll(e: Event) {
      // Ignore scroll inside the picker itself (emoji list)
      if (replyEmojiRef.current && replyEmojiRef.current.contains(e.target as Node)) return;
      setReplyEmojiOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [replyEmojiOpen]);

  const handleSubmitReply = async (text?: string, mentionedUserIds?: string[]) => {
    const trimmed = (text ?? "").trim();
    const atts = replyPendingAttachments;
    if (!trimmed && atts.length === 0) return;
    if (!sendReply) return;
    setReplyPendingAttachments([]);
    setReplyHasContent(false);
    setReplyOpen(false);
    await sendReply(
      root.id,
      trimmed,
      undefined,
      atts.length > 0 ? atts : undefined,
      mentionedUserIds
    );
  };

  const onResolveToggle = updateComment
    ? () => void updateComment(root.id, { resolved: !root.resolved })
    : undefined;

  const someUploading = replyPendingAttachments.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (att) => (att as any)._loading
  );

  return (
    <div
      ref={rowRef}
      className={`comment-row rounded-xl px-3 py-2 min-w-0 ${
        isHighlighted ? "comment-row--highlighted" : ""
      }`}
    >
      <CommentItem
        comment={root}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onUpdate={updateComment}
        onDelete={deleteComment}
        onResolveToggle={onResolveToggle}
        onReactionsChanged={onReactionsChanged}
        size="default"
      />
      {replies.length > 0 && (
        <div className="ml-[19px] mt-3 pl-[21px] border-l border-[var(--text-tertiary)]/20 space-y-1.5">
          {replies.map((r) => (
            <div key={r.id} className="py-2">
              <CommentItem
                comment={r}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onUpdate={updateComment}
                onDelete={deleteComment}
                onReactionsChanged={onReactionsChanged}
                size="compact"
                isThreadResolved={root.resolved === true}
              />
            </div>
          ))}
        </div>
      )}
      {sendReply && (
        <>
          {!replyOpen ? (
            <div className="ml-10 mt-1">
              <button
                type="button"
                onClick={() => setReplyOpen(true)}
                className="text-[13px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] hover:underline cursor-pointer"
              >
                Reply
              </button>
            </div>
          ) : (
            <div
              className="mt-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border)] overflow-hidden">
                <div className="flex items-start gap-3 px-4 pt-4">
                  <div className="w-[24px] h-[24px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[12px] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                    {currentUserAvatarUrl && !avatarError ? (
                      <img
                        src={currentUserAvatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      currentUserInitial || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1.5">
                    <TiptapCommentEditor
                      placeholder="Write a reply..."
                      participants={(participants ?? []).map((p) => ({
                        uid: p.uid,
                        displayName: p.displayName,
                        email: p.email,
                        avatarUrl: p.avatarUrl ?? null,
                      }))}
                      onSubmit={(text, mentionedUserIds) =>
                        void handleSubmitReply(text, mentionedUserIds)
                      }
                      editorRef={replyEditorRef}
                      autoFocus
                      onContentChange={setReplyHasContent}
                    />
                  </div>
                </div>

                <AttachmentChips
                  attachments={replyPendingAttachments}
                  onRemove={(i) =>
                    setReplyPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />

                {replyFileError && (
                  <FileError
                    message={replyFileError}
                    onDismiss={() => setReplyFileError(null)}
                  />
                )}

                <div className="flex items-center justify-between px-4 py-3">
                  <IconToolbar
                    attachments={replyPendingAttachments}
                    onInsertMention={() => {
                      const ed = replyEditorRef.current;
                      if (ed) ed.chain().focus().insertContent("@").run();
                    }}
                    onOpenEmoji={() => {
                      if (replyEmojiButtonRef.current) {
                        setReplyEmojiAnchorRect(
                          replyEmojiButtonRef.current.getBoundingClientRect()
                        );
                      }
                      setReplyEmojiOpen((v) => !v);
                    }}
                    emojiButtonRef={replyEmojiButtonRef}
                    fileInputRef={replyFileInputRef}
                    onPickFile={() => {
                      if (replyPendingAttachments.length >= MAX_ATTACHMENTS) {
                        setReplyFileError("Maximum 5 attachments allowed");
                        return;
                      }
                      replyFileInputRef.current?.click();
                    }}
                    onFileChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleFileSelection({
                        file,
                        current: replyPendingAttachments,
                        setAttachments: setReplyPendingAttachments,
                        setError: (m) => {
                          setReplyFileError(m);
                          showToast?.(m);
                        },
                      });
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyPendingAttachments([]);
                        setReplyHasContent(false);
                        replyEditorRef.current?.commands.clearContent();
                        setReplyOpen(false);
                      }}
                      className="text-[14px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ed = replyEditorRef.current;
                        if (ed) {
                          const { text, mentionedUserIds } = extractFromDoc(ed.state.doc);
                          void handleSubmitReply(text, mentionedUserIds);
                        } else {
                          void handleSubmitReply();
                        }
                      }}
                      disabled={
                        (!replyHasContent && replyPendingAttachments.length === 0) ||
                        someUploading
                      }
                      className="inline-flex h-[34px] items-center gap-1.5 px-3 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[13px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {replyEmojiOpen &&
                typeof document !== "undefined" &&
                replyEmojiAnchorRect &&
                createPortal(
                  <div
                    ref={replyEmojiRef}
                    className="fixed z-[2147480001]"
                    style={computeEmojiPosition(replyEmojiAnchorRect)}
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        replyEditorRef.current
                          ?.chain()
                          .focus()
                          .insertContent(emojiData.emoji)
                          .run();
                        setReplyEmojiOpen(false);
                      }}
                      width={EMOJI_PICKER_WIDTH}
                      height={EMOJI_PICKER_HEIGHT}
                      searchPlaceHolder="Search emoji..."
                      previewConfig={{ showPreview: false }}
                    />
                  </div>,
                  document.body
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function CommentsSection({
  selectedTicketId,
  comments,
  loading,
  sendComment,
  sendReply,
  updateComment,
  deleteComment,
  onReactionsChanged,
  currentUserId = null,
  currentUserName,
  currentUserInitial,
  currentUserAvatarUrl,
  participants,
  showToast,
  highlightedCommentId,
}: CommentsSectionProps) {
  // Phase 26.7: maps a root comment id → its rendered row, so a pin
  // click in the parent can scroll the matching comment into view.
  const commentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [composeExpanded, setComposeExpanded] = useState(false);
  const [composeHasContent, setComposeHasContent] = useState(false);
  const [composePendingAttachments, setComposePendingAttachments] = useState<CommentAttachment[]>([]);
  const [composeFileError, setComposeFileError] = useState<string | null>(null);
  const [composeEmojiOpen, setComposeEmojiOpen] = useState(false);
  const [composeEmojiAnchorRect, setComposeEmojiAnchorRect] = useState<DOMRect | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composeEditorRef = useRef<any>(null);
  const composeEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const composeEmojiRef = useRef<HTMLDivElement>(null);
  const composeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setAvatarError(false), [currentUserAvatarUrl]);

  useEffect(() => {
    if (!composeFileError) return;
    const t = setTimeout(() => setComposeFileError(null), 4000);
    return () => clearTimeout(t);
  }, [composeFileError]);

  useEffect(() => {
    if (!composeEmojiOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        composeEmojiRef.current &&
        !composeEmojiRef.current.contains(e.target as Node) &&
        composeEmojiButtonRef.current &&
        !composeEmojiButtonRef.current.contains(e.target as Node)
      ) {
        setComposeEmojiOpen(false);
      }
    }
    function handleScroll(e: Event) {
      if (composeEmojiRef.current && composeEmojiRef.current.contains(e.target as Node)) return;
      setComposeEmojiOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [composeEmojiOpen]);

  // Phase 26.7: when a pin is clicked in the parent, scroll the matching
  // comment row into view. The brief highlight visual is driven by
  // `highlightedCommentId` directly in the row's className below.
  useEffect(() => {
    if (!highlightedCommentId) return;
    const el = commentRefs.current.get(highlightedCommentId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCommentId]);

  const scoped = useMemo(
    () => comments.filter((c) => c.feedbackId === selectedTicketId),
    [comments, selectedTicketId]
  );

  const { roots, repliesByThread } = useMemo(() => {
    const rootList = scoped.filter((c) => !c.threadId);
    rootList.sort((a, b) => getCommentTimeMs(b) - getCommentTimeMs(a));
    const byThread = new Map<string, Comment[]>();
    for (const c of scoped) {
      if (!c.threadId) continue;
      const list = byThread.get(c.threadId) ?? [];
      list.push(c);
      byThread.set(c.threadId, list);
    }
    byThread.forEach((list) =>
      list.sort((a, b) => getCommentTimeMs(a) - getCommentTimeMs(b))
    );
    return { roots: rootList, repliesByThread: byThread };
  }, [scoped]);

  const handleTopLevelComment = async (text?: string, mentionedUserIds?: string[]) => {
    const trimmed = (text ?? "").trim();
    const atts = composePendingAttachments;
    if (!trimmed && atts.length === 0) return;
    if (!sendComment) return;
    setComposePendingAttachments([]);
    setComposeHasContent(false);
    setComposeExpanded(false);
    await sendComment(
      trimmed,
      undefined,
      atts.length > 0 ? atts : undefined,
      undefined,
      mentionedUserIds
    );
  };

  const editorParticipants = useMemo(
    () =>
      (participants ?? []).map((p) => ({
        uid: p.uid,
        displayName: p.displayName,
        email: p.email,
        avatarUrl: p.avatarUrl ?? null,
      })),
    [participants]
  );

  const composeSomeUploading = composePendingAttachments.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (att) => (att as any)._loading
  );

  // Don't render the section (incl. the "Comments" title) when there is
  // nothing to show: no composer (non-commenting viewer) and no existing
  // comments. Keeps anonymous/view-only viewers from seeing an orphan
  // header. `loading` is intentionally NOT part of this guard: for anon
  // viewers the comments subscription is gated off, so `loading` latches
  // true after the first ticket change and never clears. Authed commenters
  // always have a truthy `sendComment`, so the section stays visible
  // mid-fetch for them regardless.
  if (!sendComment && roots.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 min-w-0">
      <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-3">
        Comments
      </h2>

      {/* Composer */}
      {sendComment && (
        <div className={`min-w-0 ${roots.length > 0 ? "pb-4 mb-4 border-b border-[var(--hair)]" : "mb-4"}`}>
          {!composeExpanded ? (
            <div
              role="button"
              tabIndex={0}
              data-comment-composer
              className="flex items-center gap-3 border border-[var(--hair-strong)] rounded-[var(--radius-md)] px-4 bg-white transition-colors duration-150 cursor-text hover:border-[var(--border-strong)]"
              style={{ minHeight: 56 }}
              onClick={() => setComposeExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setComposeExpanded(true);
                }
              }}
            >
              <div className="w-[26px] h-[26px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[10.5px] flex items-center justify-center shrink-0 overflow-hidden">
                {currentUserAvatarUrl && !avatarError ? (
                  <img
                    src={currentUserAvatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  currentUserInitial || "?"
                )}
              </div>
              <span className="flex-1 min-w-0 truncate text-[13.5px] text-[var(--text-tertiary)]">
                Leave a comment...
              </span>
              {/* Default (unfocused) state: icons are purely indicative —
                  no hover effect, no tooltip, no pointer cursor. They become
                  interactive only once the composer is clicked (expanded).
                  pointer-events:none keeps clicks/hover from reaching the
                  icons; the click falls through to the parent row which
                  expands the composer. */}
              <span
                className="flex items-center gap-0.5 shrink-0"
                style={{ pointerEvents: "none" }}
                aria-hidden="true"
              >
                <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
                  <AtSign className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
                <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
                  <Smile className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
                <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--text-tertiary)]">
                  <Paperclip className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
              </span>
            </div>
          ) : (
            <div
              data-comment-composer
              className="rounded-[var(--radius-md)] bg-white border border-[var(--hair-strong)] overflow-hidden focus-within:border-[var(--border-strong)] transition-colors duration-150"
            >
              <div className="flex items-start gap-3 px-4 pt-4">
                <div className="w-[26px] h-[26px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[10.5px] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                  {currentUserAvatarUrl && !avatarError ? (
                    <img
                      src={currentUserAvatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    currentUserInitial || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1.5">
                  <TiptapCommentEditor
                    placeholder="Leave a comment..."
                    participants={editorParticipants}
                    onSubmit={(text, mentionedUserIds) =>
                      void handleTopLevelComment(text, mentionedUserIds)
                    }
                    editorRef={composeEditorRef}
                    autoFocus
                    onContentChange={setComposeHasContent}
                    onEscape={() => {
                      composeEditorRef.current?.commands.clearContent();
                      setComposePendingAttachments([]);
                      setComposeHasContent(false);
                      setComposeExpanded(false);
                    }}
                  />
                </div>
              </div>

              <AttachmentChips
                attachments={composePendingAttachments}
                onRemove={(i) =>
                  setComposePendingAttachments((prev) =>
                    prev.filter((_, idx) => idx !== i)
                  )
                }
              />

              {composeFileError && (
                <FileError
                  message={composeFileError}
                  onDismiss={() => setComposeFileError(null)}
                />
              )}

              <div className="flex items-center justify-between px-4 py-3">
                <IconToolbar
                  attachments={composePendingAttachments}
                  onInsertMention={() => {
                    const ed = composeEditorRef.current;
                    if (ed) ed.chain().focus().insertContent("@").run();
                  }}
                  onOpenEmoji={() => {
                    if (composeEmojiButtonRef.current) {
                      setComposeEmojiAnchorRect(
                        composeEmojiButtonRef.current.getBoundingClientRect()
                      );
                    }
                    setComposeEmojiOpen((v) => !v);
                  }}
                  emojiButtonRef={composeEmojiButtonRef}
                  fileInputRef={composeFileInputRef}
                  onPickFile={() => {
                    if (composePendingAttachments.length >= MAX_ATTACHMENTS) {
                      setComposeFileError("Maximum 5 attachments allowed");
                      return;
                    }
                    composeFileInputRef.current?.click();
                  }}
                  onFileChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleFileSelection({
                      file,
                      current: composePendingAttachments,
                      setAttachments: setComposePendingAttachments,
                      setError: (m) => {
                        setComposeFileError(m);
                        showToast?.(m);
                      },
                    });
                    e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      composeEditorRef.current?.commands.clearContent();
                      setComposePendingAttachments([]);
                      setComposeHasContent(false);
                      setComposeExpanded(false);
                    }}
                    className="text-[14px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ed = composeEditorRef.current;
                      if (ed) {
                        const { text, mentionedUserIds } = extractFromDoc(ed.state.doc);
                        void handleTopLevelComment(text, mentionedUserIds);
                      } else {
                        void handleTopLevelComment();
                      }
                    }}
                    disabled={
                      (!composeHasContent && composePendingAttachments.length === 0) ||
                      composeSomeUploading
                    }
                    className="inline-flex h-[34px] items-center gap-1.5 px-3 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[13px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {composeEmojiOpen &&
            typeof document !== "undefined" &&
            composeEmojiAnchorRect &&
            createPortal(
              <div
                ref={composeEmojiRef}
                className="fixed z-[2147480001]"
                style={computeEmojiPosition(composeEmojiAnchorRect)}
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    composeEditorRef.current
                      ?.chain()
                      .focus()
                      .insertContent(emojiData.emoji)
                      .run();
                    setComposeEmojiOpen(false);
                  }}
                  width={EMOJI_PICKER_WIDTH}
                  height={EMOJI_PICKER_HEIGHT}
                  searchPlaceHolder="Search emoji..."
                  previewConfig={{ showPreview: false }}
                />
              </div>,
              document.body
            )}
        </div>
      )}

      {/* Thread list */}
      {roots.length === 0 ? null : (
        <div className="flex flex-col gap-1 min-w-0">
          {roots.map((root) => (
            <ThreadBlock
              key={root.id}
              root={root}
              replies={repliesByThread.get(root.id) ?? []}
              rowRef={(el) => {
                if (el) commentRefs.current.set(root.id, el);
                else commentRefs.current.delete(root.id);
              }}
              isHighlighted={highlightedCommentId === root.id}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserInitial={currentUserInitial}
              currentUserAvatarUrl={currentUserAvatarUrl}
              updateComment={updateComment}
              deleteComment={deleteComment}
              onReactionsChanged={onReactionsChanged}
              sendReply={sendReply}
              participants={participants}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </section>
  );
}
