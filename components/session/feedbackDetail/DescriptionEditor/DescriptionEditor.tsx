"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { buildDescriptionExtensions } from "./extensions";
import { Toolbar } from "./Toolbar";
import { LinkPopover } from "./LinkPopover";
import { setFakeSelection } from "./FakeSelection";
import { useAiImprove } from "./useAiImprove";
import { uploadAttachmentWithProgress } from "@/lib/uploadAttachment";
import type { MentionParticipant } from "@/lib/tiptap/mentionSuggestion";

interface DescriptionEditorProps {
  /** Current saved markdown content. */
  value: string;
  /** Save handler — receives the new markdown. */
  onSave: (newValue: string) => Promise<void>;
  /** Called when the user cancels the edit. */
  onCancel: () => void;
  /** Placeholder for empty state. */
  placeholder?: string;
  /** When true, the editor is rendered read-only without toolbar/actions. */
  disabled?: boolean;
  /** Auto-focus the editor on mount. */
  autoFocus?: boolean;
  /** Workspace + session participants for @mention suggestions. */
  participants?: MentionParticipant[];
  /** When true, the editor is the source of truth and external value syncs are ignored. */
  isEditing?: boolean;
  /** Called with the current markdown on every editor transaction. Use for dirty tracking. */
  onContentChange?: (markdown: string) => void;
  /** Called when the AI improve stream starts/stops. Use for guarding navigation. */
  onStreamingChange?: (isStreaming: boolean) => void;
}

interface MarkdownStorage {
  getMarkdown(): string;
}

interface LinkPopoverState {
  open: boolean;
  anchorEl: HTMLElement | null;
  initialUrl: string;
  hasSelection: boolean;
  selectedText: string;
  savedRange: { from: number; to: number } | null;
}

function getMarkdown(editor: Editor): string {
  const storage = (editor.storage as unknown as Record<string, unknown>)
    .markdown as MarkdownStorage | undefined;
  return storage?.getMarkdown() ?? "";
}

function replacePlaceholderWithImage(
  editor: Editor,
  uploadId: string,
  url: string,
  alt: string,
  aspect: number | null,
) {
  let pos: number | null = null;
  let size = 0;
  editor.state.doc.descendants((node, p) => {
    if (
      node.type.name === "imageUploadPlaceholder" &&
      node.attrs.uploadId === uploadId
    ) {
      pos = p;
      size = node.nodeSize;
      return false;
    }
    return true;
  });
  if (pos === null) return;

  const attrs: Record<string, string> = { src: url, alt };
  if (aspect && Number.isFinite(aspect)) {
    attrs["data-aspect"] = String(aspect);
  }

  editor
    .chain()
    .focus()
    .setTextSelection({ from: pos, to: pos + size })
    .deleteSelection()
    .insertContent({ type: "image", attrs })
    .run();
}

function removePlaceholder(editor: Editor, uploadId: string) {
  let pos: number | null = null;
  let size = 0;
  editor.state.doc.descendants((node, p) => {
    if (
      node.type.name === "imageUploadPlaceholder" &&
      node.attrs.uploadId === uploadId
    ) {
      pos = p;
      size = node.nodeSize;
      return false;
    }
    return true;
  });
  if (pos === null) return;
  editor
    .chain()
    .focus()
    .setTextSelection({ from: pos, to: pos + size })
    .deleteSelection()
    .run();
}

export function DescriptionEditor({
  value,
  onSave,
  onCancel,
  placeholder = "Write a description...",
  disabled = false,
  autoFocus = true,
  participants,
  isEditing = true,
  onContentChange,
  onStreamingChange,
}: DescriptionEditorProps) {
  const onContentChangeRef = useRef(onContentChange);
  useLayoutEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);
  const participantsRef = useRef<MentionParticipant[]>(participants ?? []);
  useLayoutEffect(() => {
    participantsRef.current = participants ?? [];
  }, [participants]);
  const [isSaving, setIsSaving] = useState(false);
  // Track the latest value so reset-on-failure has the right baseline.
  const valueRef = useRef(value);
  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  const onSaveRef = useRef(onSave);
  useLayoutEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const onCancelRef = useRef(onCancel);
  useLayoutEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const editorRef = useRef<Editor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const handleLinkPromptRef = useRef<(anchor?: HTMLElement | null) => void>(() => {});
  const handleImageUploadRef = useRef<(file: File) => void>(() => {});

  const [linkPopoverState, setLinkPopoverState] = useState<LinkPopoverState>({
    open: false,
    anchorEl: null,
    initialUrl: "",
    hasSelection: false,
    selectedText: "",
    savedRange: null,
  });

  const [uploadingImages, setUploadingImages] = useState<Array<{ id: string }>>([]);

  const handleImageUpload = useCallback(async (file: File) => {
    const ed = editorRef.current;
    if (!ed) return;

    const uploadId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Collapse the selection before inserting so we never replace existing
    // content (e.g. when a node like an image is selected, or text is highlighted).
    const { selection } = ed.state;
    const insertPos = selection.empty ? selection.from : selection.to;

    ed.chain()
      .focus()
      .setTextSelection(insertPos)
      .insertContent({
        type: "imageUploadPlaceholder",
        attrs: { uploadId },
      })
      .run();

    setUploadingImages((prev) => [...prev, { id: uploadId }]);

    try {
      const result = await uploadAttachmentWithProgress(file, () => {
        // Progress reserved for future use; spinner is indeterminate.
      });

      if (result?.url) {
        const url = result.url;
        const probe = new window.Image();
        const aspect = await new Promise<number | null>((resolve) => {
          probe.onload = () => {
            if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
              resolve(probe.naturalWidth / probe.naturalHeight);
            } else {
              resolve(null);
            }
          };
          probe.onerror = () => resolve(null);
          probe.src = url;
        });

        const current = editorRef.current;
        if (current) {
          replacePlaceholderWithImage(current, uploadId, url, file.name, aspect);
        }
      } else {
        const current = editorRef.current;
        if (current) removePlaceholder(current, uploadId);
      }
    } catch (err) {
      const current = editorRef.current;
      if (current) removePlaceholder(current, uploadId);
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImages((prev) => prev.filter((u) => u.id !== uploadId));
    }
  }, []);

  useLayoutEffect(() => {
    handleImageUploadRef.current = (file: File) => {
      void handleImageUpload(file);
    };
  });

  const extensions = useMemo(
    () => buildDescriptionExtensions({ placeholder, participantsRef }),
    [placeholder],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions,
    content: value || "",
    autofocus: autoFocus ? "end" : false,
    onUpdate: ({ editor: ed }) => {
      onContentChangeRef.current?.(getMarkdown(ed as Editor));
    },
    editorProps: {
      attributes: {
        class: "description-editor-content",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancelRef.current?.();
          return true;
        }
        if (event.key === "Enter" && event.shiftKey && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          editorRef.current?.commands.splitBlock();
          return true;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          void handleSave();
          return true;
        }
        if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K") && !event.shiftKey) {
          event.preventDefault();
          handleLinkPromptRef.current(null);
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              handleImageUploadRef.current(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const dt = (event as DragEvent).dataTransfer;
        const files = dt?.files;
        if (!files || files.length === 0) return false;
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUploadRef.current(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  useLayoutEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // PHASE_13_6_DIAG: expose editor for browser console debugging
  useEffect(() => {
    if (typeof window !== "undefined" && editor) {
      (window as unknown as { __editor: Editor }).__editor = editor;
    }
  }, [editor]);

  const { isStreaming, performImprove } = useAiImprove(editor);

  useEffect(() => {
    onStreamingChange?.(isStreaming);
  }, [isStreaming, onStreamingChange]);

  // Emit the initial markdown once on mount so the parent's dirty-tracking ref
  // matches the editor's actual content (TipTap may normalize whitespace).
  useEffect(() => {
    if (!editor) return;
    onContentChangeRef.current?.(getMarkdown(editor));
    // Only on editor instance change (mount). value updates are handled via onUpdate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Sync external value changes (e.g. listener reconciliation) into the editor.
  // Guarded against AI streaming so we don't clobber an in-flight improvement.
  useEffect(() => {
    if (!editor) return;
    // PHASE_13_6_DIAG
    console.log("[AI-DIAG]", "VALUE-SYNC-EFFECT-FIRED", {
      isStreaming,
      isEditing,
      valueLength: (value ?? "").length,
      currentMarkdownLength: editor ? getMarkdown(editor).length : 0,
      willSkipBecauseStreaming: isStreaming,
      willSkipBecauseEditing: isEditing,
    });
    if (isStreaming) return;
    if (isEditing) return;
    const current = getMarkdown(editor).trim();
    if (current === (value ?? "").trim()) {
      // PHASE_13_6_DIAG
      console.log("[AI-DIAG]", "VALUE-SYNC-NO-CHANGE-NEEDED");
      return;
    }
    // PHASE_13_6_DIAG: setContent is about to fire — this CLEARS HISTORY
    console.log("[AI-DIAG]", "VALUE-SYNC-CALLING-SETCONTENT", {
      currentPreview: current.slice(0, 100),
      newValuePreview: (value ?? "").slice(0, 100),
    });
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value, isStreaming, isEditing]);

  const openLinkPopover = useCallback((anchor?: HTMLElement | null) => {
    const ed = editorRef.current;
    if (!ed) return;

    const { from, to } = ed.state.selection;
    const hasSelection = from !== to;
    const previousUrl = (ed.getAttributes("link").href as string | undefined) || "";

    // If editing an existing link, extend selection to cover the whole link.
    let selectedText = "";
    let rangeFrom = from;
    let rangeTo = to;
    if (hasSelection) {
      selectedText = ed.state.doc.textBetween(from, to, " ");
    } else if (previousUrl) {
      // Cursor sits inside a link — find the link mark range.
      const $pos = ed.state.doc.resolve(from);
      const linkMark = ed.schema.marks.link;
      if (linkMark) {
        const node = $pos.parent;
        const parentStart = $pos.start();
        const offsetInParent = $pos.parentOffset;
        let startOffset = offsetInParent;
        let endOffset = offsetInParent;
        node.descendants((child, pos) => {
          if (!child.isText) return;
          const start = pos;
          const end = pos + child.nodeSize;
          if (start <= offsetInParent && offsetInParent <= end) {
            const mark = child.marks.find((m) => m.type === linkMark);
            if (mark) {
              startOffset = start;
              endOffset = end;
            }
          }
        });
        if (startOffset !== endOffset) {
          selectedText = node.textBetween(startOffset, endOffset, " ");
          rangeFrom = parentStart + startOffset;
          rangeTo = parentStart + endOffset;
        }
      }
    }

    const savedRange =
      rangeFrom !== rangeTo ? { from: rangeFrom, to: rangeTo } : null;

    if (savedRange) {
      setFakeSelection(ed, savedRange.from, savedRange.to, true);
    }

    const anchorEl =
      anchor ??
      editorContainerRef.current ??
      null;

    setLinkPopoverState({
      open: true,
      anchorEl,
      initialUrl: previousUrl,
      hasSelection,
      selectedText,
      savedRange,
    });
  }, []);

  useLayoutEffect(() => {
    handleLinkPromptRef.current = openLinkPopover;
  });

  const handleLinkSave = useCallback(
    (url: string, text?: string) => {
      const ed = editorRef.current;
      if (!ed) return;

      const savedRange = linkPopoverState.savedRange;
      const isEditing = !!linkPopoverState.initialUrl;
      const hasSavedSelection = !!savedRange && savedRange.from !== savedRange.to;

      // Clear the fake-selection decoration before mutating the doc.
      setFakeSelection(ed, 0, 0, false);

      if (isEditing && savedRange) {
        const chain = ed
          .chain()
          .focus()
          .setTextSelection(savedRange)
          .extendMarkRange("link");
        if (text && text !== linkPopoverState.selectedText) {
          chain.insertContent({
            type: "text",
            text,
            marks: [{ type: "link", attrs: { href: url } }],
          });
        } else {
          chain.setLink({ href: url });
        }
        chain.run();
      } else if (hasSavedSelection && savedRange) {
        const chain = ed
          .chain()
          .focus()
          .setTextSelection(savedRange)
          .extendMarkRange("link");
        if (text && text !== linkPopoverState.selectedText) {
          chain.insertContent({
            type: "text",
            text,
            marks: [{ type: "link", attrs: { href: url } }],
          });
        } else {
          chain.setLink({ href: url });
        }
        chain.run();
      } else {
        ed
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: text || url,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run();
      }

      setLinkPopoverState((s) => ({
        ...s,
        open: false,
        anchorEl: null,
        savedRange: null,
      }));
    },
    [
      linkPopoverState.initialUrl,
      linkPopoverState.selectedText,
      linkPopoverState.savedRange,
    ],
  );

  const handleLinkRemove = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const savedRange = linkPopoverState.savedRange;

    setFakeSelection(ed, 0, 0, false);

    const chain = ed.chain().focus();
    if (savedRange) {
      chain.setTextSelection(savedRange);
    }
    chain.extendMarkRange("link").unsetLink().run();

    setLinkPopoverState((s) => ({
      ...s,
      open: false,
      anchorEl: null,
      savedRange: null,
    }));
  }, [linkPopoverState.savedRange]);

  const handleLinkCancel = useCallback(() => {
    const ed = editorRef.current;
    if (ed) {
      setFakeSelection(ed, 0, 0, false);
    }
    setLinkPopoverState((s) => ({
      ...s,
      open: false,
      anchorEl: null,
      savedRange: null,
    }));
    ed?.commands.focus();
  }, []);

  const handleSave = async () => {
    if (!editor) return;
    if (uploadingImages.length > 0) return;
    const next = getMarkdown(editor).trim();
    const prev = (valueRef.current ?? "").trim();
    if (next === prev) {
      onCancelRef.current();
      return;
    }
    // Parent is expected to flip out of edit mode immediately and handle the
    // optimistic update / error reconciliation. We just hand off the markdown.
    setIsSaving(true);
    try {
      await onSaveRef.current(next);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  if (disabled) {
    return (
      <div className="description-editor-shell description-editor-shell--readonly">
        <div className="px-[18px] py-4">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="description-editor-shell"
      ref={editorContainerRef}
    >
      <Toolbar
        editor={editor}
        onLink={(anchor) => openLinkPopover(anchor)}
        onImageUpload={(file) => void handleImageUpload(file)}
        onAiAction={performImprove}
        aiIsImproving={isStreaming}
      />
      <div
        className="description-editor-content-wrapper px-[18px] py-4 relative"
      >
        <EditorContent editor={editor} />
      </div>
      <div className="description-editor-actions flex items-center gap-2 px-[18px] pb-3">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex h-[32px] items-center px-3.5 rounded-md border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-heading)] text-[13px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || uploadingImages.length > 0 || isStreaming}
          className="inline-flex h-[32px] items-center px-3.5 rounded-md bg-[var(--text-heading)] text-white text-[13px] font-medium hover:opacity-85 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {uploadingImages.length > 0 ? "Uploading..." : isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <LinkPopover
        anchorEl={linkPopoverState.anchorEl}
        open={linkPopoverState.open}
        initialUrl={linkPopoverState.initialUrl}
        hasSelection={linkPopoverState.hasSelection}
        selectedText={linkPopoverState.selectedText}
        onSave={handleLinkSave}
        onRemove={linkPopoverState.initialUrl ? handleLinkRemove : undefined}
        onCancel={handleLinkCancel}
      />
    </div>
  );
}
