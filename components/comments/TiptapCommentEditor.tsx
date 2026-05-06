"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";

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
            let currentItems: TiptapEditorParticipant[] = [];
            let selectedIndex = 0;
            let savedCommand: ((attrs: { id: string; label: string }) => void) | null = null;

            function renderDropdownItems(
              items: TiptapEditorParticipant[],
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
                currentItems = (props.items as TiptapEditorParticipant[]) ?? [];
                selectedIndex = 0;
                const rect = props.clientRect?.() as DOMRect | null;
                if (rect && dropdownEl) {
                  dropdownEl.style.position = "fixed";
                  dropdownEl.style.left = `${rect.left}px`;
                  dropdownEl.style.bottom = `${window.innerHeight - rect.top + 4}px`;
                  dropdownEl.style.top = "auto";
                  dropdownEl.style.zIndex = "2147480001";
                }
                savedCommand = props.command;
                renderDropdownItems(currentItems, selectedIndex, props.command);
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onUpdate(props: any) {
                currentItems = (props.items as TiptapEditorParticipant[]) ?? [];
                selectedIndex = 0;
                const rect = props.clientRect?.() as DOMRect | null;
                if (rect && dropdownEl) {
                  dropdownEl.style.left = `${rect.left}px`;
                  dropdownEl.style.bottom = `${window.innerHeight - rect.top + 4}px`;
                  dropdownEl.style.top = "auto";
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
