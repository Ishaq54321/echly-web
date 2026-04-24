"use client";

import React, { useState, useEffect, useRef, useCallback, memo, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X, CheckCircle2, RotateCcw, RefreshCw, Paperclip, Smile, MessageSquare, AtSign } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import type { Comment, CommentAttachment } from "@/lib/domain/comment";
import { CommentItem } from "@/components/comments/CommentItem";

const AttachmentUploadModal = dynamic(
  () => import("@/components/discussion/AttachmentUploadModal").then((m) => m.AttachmentUploadModal),
  { ssr: false }
);

const PANEL_WIDTH = 380;
const MAX_ATTACHMENTS = 5;

export type CommentFilterTab = "all" | "unresolved" | "resolved";

export type CommentPanelThreadCounts = {
  total: number;
  open: number;
  resolved: number;
};

export interface CommentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  loading: boolean;
  sendReply: (threadId: string, message: string, attachment?: CommentAttachment, attachments?: CommentAttachment[]) => Promise<void>;
  sendComment?: (message: string, attachment?: CommentAttachment, attachments?: CommentAttachment[]) => Promise<void>;
  currentUserInitial?: string;
  currentUserName?: string;
  currentUserAvatarUrl?: string;
  activeThreadId?: string | null;
  onSelectThread?: (threadId: string) => void;
  variant?: "overlay" | "sidebar";
  currentUserId?: string | null;
  updateComment?: (commentId: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (commentId: string) => Promise<void>;
  onReactionsChanged?: (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => void;
  threadCounts?: CommentPanelThreadCounts | null;
  onRefreshComments?: () => void;
  participants?: { uid: string; displayName: string; email: string; avatarUrl: string | null }[];
  showToast?: (message: string) => void;
}

type Participant = { uid: string; displayName: string; email: string; avatarUrl: string | null };

// ── Extract plain text with @mention labels from a ProseMirror doc node ──
function extractTextFromDoc(doc: {
  toJSON: () => {
    content?: Array<{
      content?: Array<{ type?: string; text?: string; attrs?: { label?: string; id?: string } }>;
    }>;
  };
}): string {
  const json = doc.toJSON();
  const blocks = json.content ?? [];
  return blocks
    .map((block) =>
      (block.content ?? [])
        .map((node) => {
          if (node.type === "mention") return `@${node.attrs?.label ?? node.attrs?.id ?? ""}`;
          return node.text ?? "";
        })
        .join("")
    )
    .join("\n")
    .trim();
}

// ── TiptapCommentEditor ──
interface TiptapCommentEditorProps {
  placeholder: string;
  participants: Participant[];
  onSubmit: (text: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorRef?: React.MutableRefObject<any>;
  autoFocus?: boolean;
  onContentChange?: (hasContent: boolean) => void;
}

function TiptapCommentEditor({
  placeholder,
  participants,
  onSubmit,
  editorRef,
  autoFocus,
  onContentChange,
}: TiptapCommentEditorProps) {
  const onSubmitRef = useRef(onSubmit);
  useLayoutEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

  const onContentChangeRef = useRef(onContentChange);
  useLayoutEffect(() => { onContentChangeRef.current = onContentChange; }, [onContentChange]);

  const participantsRef = useRef(participants);
  useLayoutEffect(() => { participantsRef.current = participants; }, [participants]);

  const mentionOpenRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      Mention.configure({
        HTMLAttributes: { class: "mention-chip" },
        suggestion: {
          items: ({ query }: { query: string }) =>
            participantsRef.current
              .filter(
                (p) =>
                  p.displayName.toLowerCase().includes(query.toLowerCase()) ||
                  p.email.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (): any => {
            let dropdownEl: HTMLDivElement | null = null;
            let currentItems: Participant[] = [];
            let selectedIndex = 0;
            let savedCommand: ((attrs: { id: string; label: string }) => void) | null = null;

            function renderDropdownItems(
              items: Participant[],
              selected: number,
              command: (attrs: { id: string; label: string }) => void
            ) {
              if (!dropdownEl) return;
              dropdownEl.innerHTML = "";
              if (items.length === 0) {
                dropdownEl.style.display = "none";
                return;
              }
              dropdownEl.style.display = "block";

              items.forEach((item, i) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = `mention-dropdown-item${i === selected ? " active" : ""}`;

                const avatarDiv = document.createElement("div");
                avatarDiv.className = "mention-dropdown-avatar";
                if (item.avatarUrl) {
                  const img = document.createElement("img");
                  img.src = item.avatarUrl;
                  img.alt = "";
                  avatarDiv.appendChild(img);
                } else {
                  avatarDiv.textContent = item.displayName.charAt(0).toUpperCase();
                }
                btn.appendChild(avatarDiv);

                const infoDiv = document.createElement("div");
                infoDiv.className = "mention-dropdown-info";

                const nameDiv = document.createElement("div");
                nameDiv.className = "mention-dropdown-name";
                nameDiv.textContent = item.displayName;
                infoDiv.appendChild(nameDiv);

                const emailDiv = document.createElement("div");
                emailDiv.className = "mention-dropdown-email";
                emailDiv.textContent = item.email;
                infoDiv.appendChild(emailDiv);

                btn.appendChild(infoDiv);

                btn.onmousedown = (e) => {
                  e.preventDefault();
                  command({ id: item.uid, label: item.displayName });
                };

                dropdownEl!.appendChild(btn);
              });
            }

            return {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onStart(props: any) {
                mentionOpenRef.current = true;
                dropdownEl = document.createElement("div");
                dropdownEl.className = "mention-dropdown";
                document.body.appendChild(dropdownEl);
                currentItems = (props.items as Participant[]) ?? [];
                selectedIndex = 0;
                const rect = props.clientRect?.() as DOMRect | null;
                if (rect && dropdownEl) {
                  dropdownEl.style.position = "fixed";
                  dropdownEl.style.left = `${rect.left}px`;
                  dropdownEl.style.top = `${rect.bottom + 4}px`;
                  dropdownEl.style.zIndex = "2147480001";
                }
                savedCommand = props.command;
                renderDropdownItems(currentItems, selectedIndex, props.command);
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onUpdate(props: any) {
                currentItems = (props.items as Participant[]) ?? [];
                selectedIndex = 0;
                const rect = props.clientRect?.() as DOMRect | null;
                if (rect && dropdownEl) {
                  dropdownEl.style.left = `${rect.left}px`;
                  dropdownEl.style.top = `${rect.bottom + 4}px`;
                }
                savedCommand = props.command;
                renderDropdownItems(currentItems, selectedIndex, props.command);
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onKeyDown(props: any) {
                if ((props.event as KeyboardEvent).key === "ArrowUp") {
                  selectedIndex = Math.max(selectedIndex - 1, 0);
                  renderDropdownItems(currentItems, selectedIndex, props.command ?? (() => {}));
                  return true;
                }
                if ((props.event as KeyboardEvent).key === "ArrowDown") {
                  selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
                  renderDropdownItems(currentItems, selectedIndex, props.command ?? (() => {}));
                  return true;
                }
                if ((props.event as KeyboardEvent).key === "Enter") {
                  const item = currentItems[selectedIndex];
                  if (item && savedCommand) {
                    savedCommand({ id: item.uid, label: item.displayName });
                  }
                  return true;
                }
                return false;
              },
              onExit() {
                mentionOpenRef.current = false;
                dropdownEl?.remove();
                dropdownEl = null;
                savedCommand = null;
              },
            };
          },
        },
      }),
    ],
    autofocus: autoFocus ?? false,
    onUpdate: ({ editor: ed }) => {
      const cb = onContentChangeRef.current;
      if (!cb) return;
      const json = ed.getJSON();
      const hasContent = (json.content ?? []).some((block) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (block.content ?? []).some((node: any) => {
          if (node.type === "mention") return true;
          if (node.type === "text") return (node.text ?? "").trim().length > 0;
          return false;
        })
      );
      cb(hasContent);
    },
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          if (mentionOpenRef.current) return false;
          const text = extractTextFromDoc(_view.state.doc);
          if (text.trim()) {
            event.preventDefault();
            onSubmitRef.current(text);
            // Clear via ProseMirror transaction
            const { tr, schema } = _view.state;
            const emptyParagraph = schema.nodes.paragraph?.create();
            if (emptyParagraph) {
              _view.dispatch(tr.replaceWith(0, tr.doc.content.size, emptyParagraph));
            }
            // Notify parent that content is now empty
            onContentChangeRef.current?.(false);
            return true;
          }
        }
        return false;
      },
      attributes: { class: "tiptap-comment-editor" },
    },
  });

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
  }, [editor, editorRef]);

  return <EditorContent editor={editor} />;
}

// ── CommentRow ──
const CommentRow = memo(function CommentRow({
  comment,
  size,
  currentUserId,
  currentUserName,
  updateComment,
  deleteComment,
  onReactionsChanged,
  showResolve,
}: {
  comment: Comment;
  size: "root" | "reply";
  currentUserId: string | null;
  currentUserName?: string;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  onReactionsChanged?: (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => void;
  showResolve?: boolean;
}) {
  const onResolveToggle =
    showResolve && updateComment
      ? () => void updateComment(comment.id, { resolved: !comment.resolved })
      : undefined;

  return (
    <div className="py-2">
      <CommentItem
        comment={comment}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onUpdate={updateComment}
        onDelete={deleteComment}
        onResolveToggle={onResolveToggle}
        onReactionsChanged={onReactionsChanged}
        size={size === "root" ? "default" : "compact"}
      />
    </div>
  );
});

// ── ThreadBlock ──
const ThreadBlock = memo(function ThreadBlock({
  root,
  replies,
  isActive,
  isHighlighted,
  threadRef,
  currentUserId,
  currentUserName,
  currentUserInitial,
  currentUserAvatarUrl,
  updateComment,
  deleteComment,
  onReactionsChanged,
  sendReply,
  onSelectThread,
  replyOpen,
  onReplyToggle,
  participants,
  showToast,
}: {
  root: Comment;
  replies: Comment[];
  isActive: boolean;
  isHighlighted: boolean;
  threadRef: (el: HTMLDivElement | null) => void;
  currentUserId: string | null;
  currentUserName?: string;
  currentUserInitial?: string;
  currentUserAvatarUrl?: string;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  onReactionsChanged?: (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => void;
  sendReply?: (threadId: string, message: string, attachment?: CommentAttachment, attachments?: CommentAttachment[]) => Promise<void>;
  onSelectThread?: (threadId: string) => void;
  replyOpen: boolean;
  onReplyToggle: (open: boolean) => void;
  participants?: Participant[];
  showToast?: (message: string) => void;
}) {
  const [replyPendingAttachments, setReplyPendingAttachments] = useState<CommentAttachment[]>([]);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [replyEmojiOpen, setReplyEmojiOpen] = useState(false);
  const [replyHasContent, setReplyHasContent] = useState(false);
  const replyEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const replyEmojiRef = useRef<HTMLDivElement>(null);
  const [replyEmojiAnchorRect, setReplyEmojiAnchorRect] = useState<DOMRect | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replyEditorRef = useRef<any>(null);
  const [replyFileError, setReplyFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!replyFileError) return;
    const t = setTimeout(() => setReplyFileError(null), 4000);
    return () => clearTimeout(t);
  }, [replyFileError]);

  const handleSubmitReply = useCallback(
    async (text?: string) => {
      const message = text ?? "";
      const trimmed = message.trim();
      const atts = replyPendingAttachments;
      if (!trimmed && atts.length === 0) return;
      if (!sendReply) return;
      setReplyPendingAttachments([]);
      setReplyHasContent(false);
      onReplyToggle(false);
      await sendReply(root.id, trimmed, undefined, atts.length > 0 ? atts : undefined);
    },
    [replyPendingAttachments, sendReply, root.id, onReplyToggle]
  );

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

  return (
    <div
      ref={threadRef}
      data-thread-id={root.id}
      role="button"
      tabIndex={0}
      onClick={() => onSelectThread?.(root.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectThread?.(root.id);
        }
      }}
      className={`relative w-full box-border rounded-xl px-3 py-3 min-w-0 overflow-visible transition-colors duration-[var(--motion-duration)] cursor-pointer ${isActive ? "bg-[var(--layer-2-hover-bg)]" : "hover:bg-[var(--layer-2-hover-bg)]"} ${root.resolved ? "opacity-90" : ""} ${isHighlighted ? "bg-[var(--color-primary-soft)]" : ""}`}
      style={{ boxSizing: "border-box" }}
    >
      <CommentRow
        comment={root}
        size="root"
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        updateComment={updateComment}
        deleteComment={deleteComment}
        onReactionsChanged={onReactionsChanged}
        showResolve={Boolean(updateComment)}
      />
      {replies.length > 0 && (
        <div className="ml-[19px] mt-1 pl-[21px] border-l-2 border-[var(--border)] space-y-0.5">
          {replies.map((r) => (
            <CommentRow
              key={r.id}
              comment={r}
              size="reply"
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              updateComment={updateComment}
              deleteComment={deleteComment}
              onReactionsChanged={onReactionsChanged}
            />
          ))}
        </div>
      )}
      {sendReply && (
        <>
          {!replyOpen && (
            <div className="ml-10 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplyToggle(true);
                }}
                className="text-[12px] font-medium text-[var(--text-body)] hover:text-[var(--text-heading)] hover:underline cursor-pointer"
              >
                Reply
              </button>
            </div>
          )}
          {replyOpen && (
            <div
              className="mt-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] overflow-hidden focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20 transition-colors">

                {/* Row 1: Avatar + Tiptap Editor */}
                <div className="flex items-start gap-3 px-4 pt-4">
                  <div className="w-[24px] h-[24px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[11px] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                    {currentUserAvatarUrl ? (
                      <img src={currentUserAvatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      currentUserInitial || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1.5">
                    <TiptapCommentEditor
                      placeholder="Write a reply..."
                      participants={participants ?? []}
                      onSubmit={(text) => void handleSubmitReply(text)}
                      editorRef={replyEditorRef}
                      autoFocus
                      onContentChange={setReplyHasContent}
                    />
                  </div>
                </div>

                {/* Attachment chips */}
                {replyPendingAttachments.length > 0 && (
                  <div className="flex flex-col gap-2 mx-4 mt-2 mb-1">
                    {replyPendingAttachments.map((att, i) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const isLoading = (att as any)._loading;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl"
                        >
                          {isLoading ? (
                            <div className="h-10 w-10 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0">
                              <div className="h-5 w-5 border-2 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin" />
                            </div>
                          ) : att.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name) ? (
                            <img
                              src={att.file_url}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
                              <Paperclip className="h-4 w-4 text-[var(--brand)]" />
                            </div>
                          )}
                          <span className="flex-1 min-w-0 text-[13px] font-medium text-[var(--text-body)] truncate">
                            {att.file_name}
                            {isLoading && <span className="ml-2 text-[11px] text-[var(--text-tertiary)]">Uploading...</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="p-1 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors shrink-0"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replyFileError && (
                  <div className="flex items-center gap-2 mx-4 mb-1 px-3 py-2 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
                    <svg className="h-4 w-4 text-[var(--color-danger)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span className="text-[13px] font-medium text-[var(--color-danger)]">{replyFileError}</span>
                    <button type="button" onClick={() => setReplyFileError(null)} className="ml-auto p-0.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Row 2: Icon toolbar | Action buttons */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const ed = replyEditorRef.current;
                        if (ed) ed.chain().focus().insertContent("@").run();
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                      title="Mention someone"
                    >
                      <AtSign className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                    <span className="w-px h-4 bg-[var(--border)] mx-1" />
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
                      title="Add emoji"
                    >
                      <Smile className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                    <span className="w-px h-4 bg-[var(--border)] mx-1" />
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
                      title={replyPendingAttachments.length >= MAX_ATTACHMENTS ? "Maximum 5 attachments" : "Attach file"}
                    >
                      <Paperclip className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>
                    <input
                      ref={replyFileInputRef}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 15 * 1024 * 1024) {
                          setReplyFileError("File must be under 15 MB");
                          showToast?.("File must be under 15 MB");
                          e.target.value = "";
                          return;
                        }
                        if (replyPendingAttachments.length >= MAX_ATTACHMENTS) {
                          setReplyFileError("Maximum 5 attachments allowed");
                          showToast?.("Maximum 5 attachments allowed");
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
                        } as CommentAttachment & { _loading: boolean; _id: string };
                        setReplyPendingAttachments((prev) => [...prev, placeholder]);
                        const UPLOAD_TIMEOUT = 30000;
                        try {
                          const { uploadAttachmentWithProgress } = await import("@/lib/uploadAttachment");
                          const uploadPromise = uploadAttachmentWithProgress(file, () => {});
                          const timeoutPromise = new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)
                          );
                          const result = await Promise.race([uploadPromise, timeoutPromise]);
                          if (!result.url) {
                            setReplyPendingAttachments((prev) => prev.filter((att) => (att as any)._id !== placeholderId));
                            setReplyFileError("Upload completed but file URL is missing. Please try again.");
                            showToast?.("Upload error");
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
                            prev.filter((att) => (att as any)._id !== placeholderId)
                          );
                          const message = err instanceof Error && err.message === "Upload timed out"
                            ? "Upload timed out. Please try again."
                            : "Failed to upload file. Please try again.";
                          setReplyFileError(message);
                          showToast?.(message);
                        }
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyPendingAttachments([]);
                        setReplyHasContent(false);
                        replyEditorRef.current?.commands.clearContent();
                        onReplyToggle(false);
                      }}
                      className="text-[13px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ed = replyEditorRef.current;
                        if (ed) {
                          const text = extractTextFromDoc(ed.state.doc);
                          void handleSubmitReply(text);
                        } else {
                          void handleSubmitReply();
                        }
                      }}
                      disabled={(!replyHasContent && replyPendingAttachments.length === 0) || replyPendingAttachments.some(att => (att as any)._loading)}
                      className="text-[13px] font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] px-4 py-1.5 rounded-full disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {attachmentModalOpen && (
        <AttachmentUploadModal
          open
          onClose={() => setAttachmentModalOpen(false)}
          onSend={(attachment) => {
            setAttachmentModalOpen(false);
            if (replyPendingAttachments.length >= MAX_ATTACHMENTS) return;
            setReplyPendingAttachments((prev) => [...prev, attachment]);
          }}
        />
      )}
      {replyEmojiOpen &&
        createPortal(
          <div
            ref={replyEmojiRef}
            className="fixed z-[2147480001]"
            style={{
              top: (replyEmojiAnchorRect?.bottom ?? 0) + 4,
              left: Math.min(replyEmojiAnchorRect?.left ?? 0, window.innerWidth - 320),
            }}
          >
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                replyEditorRef.current?.chain().focus().insertContent(emojiData.emoji).run();
                setReplyEmojiOpen(false);
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
});

// ── CommentThreadList ──
const CommentThreadList = memo(function CommentThreadList({
  comments,
  loading,
  activeThreadId,
  highlightThreadId,
  threadRefs,
  filterTab,
  currentUserId,
  currentUserName,
  currentUserInitial,
  currentUserAvatarUrl,
  updateComment,
  deleteComment,
  onReactionsChanged,
  sendReply,
  onSelectThread,
  participants,
  showToast,
}: {
  comments: Comment[];
  loading: boolean;
  activeThreadId?: string | null;
  highlightThreadId?: string | null;
  threadRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  filterTab: CommentFilterTab;
  currentUserId: string | null;
  currentUserName?: string;
  currentUserInitial?: string;
  currentUserAvatarUrl?: string;
  updateComment?: (id: string, data: { message?: string; resolved?: boolean }) => Promise<void>;
  deleteComment?: (id: string) => Promise<void>;
  onReactionsChanged?: (commentId: string, reactions: Record<string, { userIds: string[]; userNames: string[] }>) => void;
  sendReply?: (threadId: string, message: string, attachment?: CommentAttachment, attachments?: CommentAttachment[]) => Promise<void>;
  onSelectThread?: (threadId: string) => void;
  participants?: Participant[];
  showToast?: (message: string) => void;
}) {
  const roots = comments.filter((c) => !c.threadId);
  roots.sort((a, b) => {
    const aTime = a.createdAt
      ? typeof a.createdAt === "object" && "seconds" in a.createdAt
        ? (a.createdAt as { seconds: number }).seconds * 1000
        : new Date(a.createdAt as never).getTime()
      : 0;
    const bTime = b.createdAt
      ? typeof b.createdAt === "object" && "seconds" in b.createdAt
        ? (b.createdAt as { seconds: number }).seconds * 1000
        : new Date(b.createdAt as never).getTime()
      : 0;
    return bTime - aTime;
  });
  const byThreadId = new Map<string, Comment[]>();
  comments.forEach((c) => {
    if (c.threadId) {
      const list = byThreadId.get(c.threadId) ?? [];
      list.push(c);
      byThreadId.set(c.threadId, list);
    }
  });

  const unresolvedRoots = roots.filter((r) => !r.resolved);
  const resolvedRoots = roots.filter((r) => r.resolved);
  const [resolvedCollapsed, setResolvedCollapsed] = useState(true);
  const [openReplyThreadId, setOpenReplyThreadId] = useState<string | null>(null);

  if (loading && roots.length === 0) {
    return null;
  }

  if (roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <MessageSquare className="h-10 w-10 text-[var(--text-tertiary)] mb-3" strokeWidth={1} />
        <p className="text-[15px] font-medium text-[var(--text-heading)]">No comments yet</p>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Leave a comment above to start a conversation.
        </p>
      </div>
    );
  }

  const threadBlockProps = (root: Comment) => ({
    root,
    replies: byThreadId.get(root.id) ?? [],
    isActive: activeThreadId === root.id,
    isHighlighted: activeThreadId === root.id && highlightThreadId === root.id,
    threadRef: (el: HTMLDivElement | null) => { threadRefs.current.set(root.id, el); },
    currentUserId,
    currentUserName,
    currentUserInitial,
    currentUserAvatarUrl,
    updateComment,
    deleteComment,
    onReactionsChanged,
    sendReply,
    onSelectThread,
    replyOpen: openReplyThreadId === root.id,
    onReplyToggle: (open: boolean) => setOpenReplyThreadId(open ? root.id : null),
    participants,
    showToast,
  });

  return (
    <div className="space-y-1 min-w-0">
      {(filterTab === "unresolved" || filterTab === "all") &&
        unresolvedRoots.map((root) => (
          <ThreadBlock key={root.id} {...threadBlockProps(root)} />
        ))}
      {filterTab === "all" && resolvedRoots.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--layer-2-border)]">
          <button
            type="button"
            onClick={() => setResolvedCollapsed((c) => !c)}
            className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-heading)] cursor-pointer"
          >
            <CheckCircle2 className="h-[18px] w-[18px] text-[var(--color-success)]" />
            Resolved ({resolvedRoots.length})
          </button>
          {!resolvedCollapsed && (
            <div className="mt-2 space-y-1">
              {resolvedRoots.map((root) => (
                <ThreadBlock key={root.id} {...threadBlockProps(root)} />
              ))}
            </div>
          )}
        </div>
      )}
      {filterTab === "resolved" &&
        resolvedRoots.map((root) => (
          <ThreadBlock key={root.id} {...threadBlockProps(root)} />
        ))}
    </div>
  );
});

// ── CommentPanel ──
export function CommentPanel({
  isOpen,
  onClose,
  comments,
  loading,
  sendReply,
  sendComment,
  activeThreadId,
  onSelectThread,
  variant = "sidebar",
  currentUserId = null,
  currentUserInitial,
  currentUserName,
  currentUserAvatarUrl,
  updateComment,
  deleteComment,
  onReactionsChanged,
  threadCounts: threadCountsProp,
  onRefreshComments,
  participants,
  showToast,
}: CommentPanelProps) {
  const [filterTab, setFilterTab] = useState<CommentFilterTab>("all");
  const [highlightThreadId, setHighlightThreadId] = useState<string | null>(null);
  const [composeEmojiOpen, setComposeEmojiOpen] = useState(false);
  const threadRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const composeEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const composeEmojiRef = useRef<HTMLDivElement>(null);
  const [composeEmojiAnchorRect, setComposeEmojiAnchorRect] = useState<DOMRect | null>(null);
  const [composeAttachmentModalOpen, setComposeAttachmentModalOpen] = useState(false);
  const [composeExpanded, setComposeExpanded] = useState(false);
  const [composePendingAttachments, setComposePendingAttachments] = useState<CommentAttachment[]>([]);
  const [composeHasContent, setComposeHasContent] = useState(false);
  const [composeFileError, setComposeFileError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composeEditorRef = useRef<any>(null);
  const composeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !activeThreadId) return;
    setHighlightThreadId(activeThreadId);
    const el = threadRefs.current.get(activeThreadId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    const t = setTimeout(() => setHighlightThreadId(null), 2000);
    return () => clearTimeout(t);
  }, [isOpen, activeThreadId]);

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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [composeEmojiOpen]);

  useEffect(() => {
    if (!composeFileError) return;
    const t = setTimeout(() => setComposeFileError(null), 4000);
    return () => clearTimeout(t);
  }, [composeFileError]);

  const handleTopLevelComment = useCallback(
    async (text?: string) => {
      const message = text ?? "";
      const trimmed = message.trim();
      const atts = composePendingAttachments;
      if (!trimmed && atts.length === 0) return;
      if (!sendComment) return;
      setComposePendingAttachments([]);
      setComposeHasContent(false);
      setComposeExpanded(false);
      await sendComment(trimmed, undefined, atts.length > 0 ? atts : undefined);
    },
    [composePendingAttachments, sendComment]
  );

  if (!isOpen) return null;

  const rootsForCounts = comments.filter((c) => !c.threadId);
  let openC = 0;
  let resolvedC = 0;
  for (const r of rootsForCounts) {
    if (r.resolved) resolvedC += 1;
    else openC += 1;
  }
  const fallbackCounts: CommentPanelThreadCounts = {
    total: rootsForCounts.length,
    open: openC,
    resolved: resolvedC,
  };
  const displayThreadCounts = threadCountsProp ?? fallbackCounts;
  void displayThreadCounts;

  const panelContent = (
    <>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--layer-2-border)]">
        <h2 className="text-[14px] font-semibold text-[var(--text-heading)] tracking-[-0.01em]">
          Comments ({comments.length})
        </h2>
        <div className="flex items-center gap-0.5">
          {onRefreshComments ? (
            <button
              type="button"
              onClick={onRefreshComments}
              className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-[var(--motion-duration)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] cursor-pointer"
              aria-label="Refresh comments"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:bg-[var(--layer-2-hover-bg)] hover:text-[hsl(var(--text-primary-strong))] transition-colors duration-[var(--motion-duration)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] cursor-pointer"
            aria-label="Close comment panel"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Top-level compose */}
      {!composeExpanded ? (
        <div className="shrink-0 px-4 py-4 border-b border-[var(--border)]">
          <div
            className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 cursor-text"
            onClick={() => setComposeExpanded(true)}
          >
            <div className="w-[28px] h-[28px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[13px] flex items-center justify-center shrink-0 overflow-hidden">
              {currentUserAvatarUrl ? (
                <img src={currentUserAvatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                currentUserInitial || "?"
              )}
            </div>
            <span className="text-[14px] text-[var(--text-secondary)] flex-1">Leave a comment...</span>
            <div className="flex items-center gap-2.5">
              <AtSign className="h-[18px] w-[18px] text-[var(--text-body)]" strokeWidth={1.5} />
              <Smile className="h-[18px] w-[18px] text-[var(--text-body)]" strokeWidth={1.5} />
              <Paperclip className="h-[18px] w-[18px] text-[var(--text-body)]" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      ) : (
        <div className="shrink-0 px-4 py-4 border-b border-[var(--border)]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] overflow-hidden focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/20 transition-colors">

            {/* Row 1: Avatar + Tiptap editor */}
            <div className="flex items-start gap-3 px-4 pt-4">
              <div className="w-[28px] h-[28px] rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold text-[13px] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                {currentUserAvatarUrl ? (
                  <img src={currentUserAvatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  currentUserInitial || "?"
                )}
              </div>
              <div className="flex-1 min-w-0 py-1.5">
                <TiptapCommentEditor
                  placeholder="Leave a comment..."
                  participants={participants ?? []}
                  onSubmit={(text) => void handleTopLevelComment(text)}
                  editorRef={composeEditorRef}
                  autoFocus
                  onContentChange={setComposeHasContent}
                />
              </div>
            </div>

            {/* Attachment chips */}
            {composePendingAttachments.length > 0 && (
              <div className="flex flex-col gap-2 mx-4 mt-2 mb-1">
                {composePendingAttachments.map((att, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const isLoading = (att as any)._loading;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl"
                    >
                      {isLoading ? (
                        <div className="h-10 w-10 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0">
                          <div className="h-5 w-5 border-2 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin" />
                        </div>
                      ) : att.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_name) ? (
                        <img
                          src={att.file_url}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
                          <Paperclip className="h-4 w-4 text-[var(--brand)]" />
                        </div>
                      )}
                      <span className="flex-1 min-w-0 text-[13px] font-medium text-[var(--text-body)] truncate">
                        {att.file_name}
                        {isLoading && <span className="ml-2 text-[11px] text-[var(--text-tertiary)]">Uploading...</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setComposePendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="p-1 rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors shrink-0"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {composeFileError && (
              <div className="flex items-center gap-2 mx-4 mb-1 px-3 py-2 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-xl">
                <svg className="h-4 w-4 text-[var(--color-danger)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-[13px] font-medium text-[var(--color-danger)]">{composeFileError}</span>
                <button type="button" onClick={() => setComposeFileError(null)} className="ml-auto p-0.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Row 2: Icon toolbar | Action buttons */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const ed = composeEditorRef.current;
                    if (ed) ed.chain().focus().insertContent("@").run();
                  }}
                  className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                  title="Mention someone"
                >
                  <AtSign className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>

                <span className="w-px h-4 bg-[var(--border)] mx-1" />

                <button
                  ref={composeEmojiButtonRef}
                  type="button"
                  onClick={() => {
                    if (composeEmojiButtonRef.current) {
                      setComposeEmojiAnchorRect(
                        composeEmojiButtonRef.current.getBoundingClientRect()
                      );
                    }
                    setComposeEmojiOpen((v) => !v);
                  }}
                  className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors"
                  title="Add emoji"
                >
                  <Smile className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>

                <span className="w-px h-4 bg-[var(--border)] mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    if (composePendingAttachments.length >= MAX_ATTACHMENTS) {
                      setComposeFileError("Maximum 5 attachments allowed");
                      return;
                    }
                    composeFileInputRef.current?.click();
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    composePendingAttachments.length >= MAX_ATTACHMENTS
                      ? "text-[var(--text-tertiary)] opacity-50 cursor-not-allowed"
                      : "text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)]"
                  }`}
                  title={composePendingAttachments.length >= MAX_ATTACHMENTS ? "Maximum 5 attachments" : "Attach file"}
                >
                  <Paperclip className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
                <input
                  ref={composeFileInputRef}
                  type="file"
                  accept="*/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 15 * 1024 * 1024) {
                      setComposeFileError("File must be under 15 MB");
                      showToast?.("File must be under 15 MB");
                      e.target.value = "";
                      return;
                    }
                    if (composePendingAttachments.length >= MAX_ATTACHMENTS) {
                      setComposeFileError("Maximum 5 attachments allowed");
                      showToast?.("Maximum 5 attachments allowed");
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
                    } as CommentAttachment & { _loading: boolean; _id: string };
                    setComposePendingAttachments((prev) => [...prev, placeholder]);
                    const UPLOAD_TIMEOUT = 30000;
                    try {
                      const { uploadAttachmentWithProgress } = await import("@/lib/uploadAttachment");
                      const uploadPromise = uploadAttachmentWithProgress(file, () => {});
                      const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("Upload timed out")), UPLOAD_TIMEOUT)
                      );
                      const result = await Promise.race([uploadPromise, timeoutPromise]);
                      if (!result.url) {
                        setComposePendingAttachments((prev) => prev.filter((att) => (att as any)._id !== placeholderId));
                        setComposeFileError("Upload completed but file URL is missing. Please try again.");
                        showToast?.("Upload error");
                        e.target.value = "";
                        return;
                      }
                      setComposePendingAttachments((prev) =>
                        prev.map((att) =>
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (att as any)._id === placeholderId
                            ? { file_name: result.name, file_url: result.url, file_size: result.size }
                            : att
                        )
                      );
                    } catch (err) {
                      setComposePendingAttachments((prev) =>
                        prev.filter((att) => (att as any)._id !== placeholderId)
                      );
                      const message = err instanceof Error && err.message === "Upload timed out"
                        ? "Upload timed out. Please try again."
                        : "Failed to upload file. Please try again.";
                      setComposeFileError(message);
                      showToast?.(message);
                    }
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setComposePendingAttachments([]);
                    setComposeHasContent(false);
                    composeEditorRef.current?.commands.clearContent();
                    setComposeExpanded(false);
                  }}
                  className="text-[13px] font-semibold text-[var(--text-body)] hover:text-[var(--text-heading)] px-2 py-1 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ed = composeEditorRef.current;
                    if (ed) {
                      const text = extractTextFromDoc(ed.state.doc);
                      void handleTopLevelComment(text);
                    } else {
                      void handleTopLevelComment();
                    }
                  }}
                  disabled={(!composeHasContent && composePendingAttachments.length === 0) || composePendingAttachments.some(att => (att as any)._loading)}
                  className="text-[13px] font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] px-4 py-1.5 rounded-full disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {composeEmojiOpen &&
            createPortal(
              <div
                ref={composeEmojiRef}
                className="fixed z-[2147480001]"
                style={{
                  top: composeEmojiAnchorRect?.bottom ?? 0,
                  right: window.innerWidth - (composeEmojiAnchorRect?.right ?? 0),
                }}
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
                  width={320}
                  height={400}
                  searchPlaceHolder="Search emoji..."
                  previewConfig={{ showPreview: false }}
                />
              </div>,
              document.body
            )}
        </div>
      )}

      {/* Scrollable comment list */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden box-border"
      >
        <div className="px-4 py-4 min-w-0 box-border">
          <CommentThreadList
            comments={comments}
            loading={loading}
            activeThreadId={activeThreadId}
            highlightThreadId={highlightThreadId}
            threadRefs={threadRefs}
            filterTab={filterTab}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserInitial={currentUserInitial}
            currentUserAvatarUrl={currentUserAvatarUrl}
            updateComment={updateComment}
            deleteComment={deleteComment}
            onReactionsChanged={onReactionsChanged}
            sendReply={sendReply}
            onSelectThread={onSelectThread}
            participants={participants}
            showToast={showToast}
          />
        </div>
      </div>
    </>
  );

  if (variant === "sidebar") {
    return (
      <aside
        role="complementary"
        aria-label="Comments"
        className="h-full min-w-0 flex flex-col bg-[var(--canvas-base)] border-l border-[var(--layer-2-border)] box-border overflow-x-hidden"
      >
        {panelContent}
      </aside>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 cursor-pointer"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Comments"
        style={{ width: PANEL_WIDTH }}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-[var(--canvas-base)] border-l border-[var(--layer-2-border)] shadow-[var(--elevation-2)] box-border overflow-x-hidden min-w-0 animate-in slide-in-from-right duration-200"
      >
        {panelContent}
      </aside>
    </>
  );
}
