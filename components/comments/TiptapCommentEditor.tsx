"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import { createMentionSuggestion } from "@/lib/tiptap/mentionSuggestion";

export type TiptapEditorParticipant = {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
};

export interface TiptapCommentEditorProps {
  placeholder?: string;
  participants: TiptapEditorParticipant[];
  onSubmit: (text: string, mentionedUserIds: string[]) => void;
  editorRef?: React.MutableRefObject<Editor | null>;
  autoFocus?: boolean;
  onContentChange?: (hasContent: boolean) => void;
  onEscape?: () => void;
  className?: string;
}

export function extractFromDoc(doc: {
  toJSON: () => {
    content?: Array<{
      content?: Array<{ type?: string; text?: string; attrs?: { label?: string; id?: string } }>;
    }>;
  };
}): { text: string; mentionedUserIds: string[] } {
  const json = doc.toJSON();
  const blocks = json.content ?? [];
  const mentionedUserIds: string[] = [];

  const text = blocks
    .map((block) =>
      (block.content ?? [])
        .map((node) => {
          if (node.type === "mention") {
            if (node.attrs?.id) mentionedUserIds.push(node.attrs.id);
            return `@${node.attrs?.label ?? node.attrs?.id ?? ""}`;
          }
          return node.text ?? "";
        })
        .join("")
    )
    .join("\n")
    .trim();

  return { text, mentionedUserIds: [...new Set(mentionedUserIds)] };
}

export function TiptapCommentEditor({
  placeholder = "",
  participants,
  onSubmit,
  editorRef,
  autoFocus,
  onContentChange,
  onEscape,
  className,
}: TiptapCommentEditorProps) {
  const onSubmitRef = useRef(onSubmit);
  useLayoutEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

  const onContentChangeRef = useRef(onContentChange);
  useLayoutEffect(() => { onContentChangeRef.current = onContentChange; }, [onContentChange]);

  const onEscapeRef = useRef(onEscape);
  useLayoutEffect(() => { onEscapeRef.current = onEscape; }, [onEscape]);

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
        // Refs are captured by closure and only read inside event-driven callbacks
        // (items/onStart/onUpdate/onKeyDown/onExit), never during render.
        // eslint-disable-next-line react-hooks/refs
        suggestion: createMentionSuggestion({ participantsRef, mentionOpenRef }),
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
        if (event.key === "Escape") {
          onEscapeRef.current?.();
          return true;
        }
        if (event.key === "Enter" && !event.shiftKey) {
          if (mentionOpenRef.current) return false;
          const { text, mentionedUserIds } = extractFromDoc(_view.state.doc);
          if (text.trim()) {
            event.preventDefault();
            onSubmitRef.current(text, mentionedUserIds);
            const { tr, schema } = _view.state;
            const emptyParagraph = schema.nodes.paragraph?.create();
            if (emptyParagraph) {
              _view.dispatch(tr.replaceWith(0, tr.doc.content.size, emptyParagraph));
            }
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

  return <EditorContent editor={editor} className={className} />;
}
