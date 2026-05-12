"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  Subscript as SubIcon,
  Superscript as SupIcon,
  RemoveFormatting,
} from "lucide-react";
import { SplitButton } from "./SplitButton";
import {
  ToolbarMenuItem,
  ToolbarMenuSeparator,
} from "./ToolbarMenu";

export function FormattingDropdown({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isUnderline: e.isActive("underline"),
        isStrike: e.isActive("strike"),
        isCode: e.isActive("code"),
        isSubscript: e.isActive("subscript"),
        isSuperscript: e.isActive("superscript"),
      };
    },
  });

  const isBoldActive = !!state?.isBold;
  const isItalicActive = !!state?.isItalic;
  const isUnderlineActive = !!state?.isUnderline;
  const isStrikeActive = !!state?.isStrike;
  const isCodeActive = !!state?.isCode;
  const isSubscriptActive = !!state?.isSubscript;
  const isSuperscriptActive = !!state?.isSuperscript;

  return (
    <SplitButton
      tooltip="Bold"
      icon={<Bold size={16} strokeWidth={2} />}
      isActive={isBoldActive}
      disabled={!editor}
      onMainClick={() => editor?.chain().focus().toggleBold().run()}
      menuMinWidth={220}
      menu={(close) => {
        if (!editor) return null;
        const run = (fn: () => void) => {
          fn();
          close();
        };
        return (
          <>
            <ToolbarMenuItem
              isActive={isBoldActive}
              shortcut="⌘B"
              onClick={() => run(() => editor.chain().focus().toggleBold().run())}
            >
              <Bold size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Bold</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isItalicActive}
              shortcut="⌘I"
              onClick={() => run(() => editor.chain().focus().toggleItalic().run())}
            >
              <Italic size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Italic</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isUnderlineActive}
              shortcut="⌘U"
              onClick={() => run(() => editor.chain().focus().toggleUnderline().run())}
            >
              <UnderlineIcon size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Underline</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isStrikeActive}
              shortcut="⌘⇧S"
              onClick={() => run(() => editor.chain().focus().toggleStrike().run())}
            >
              <Strikethrough size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Strikethrough</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isCodeActive}
              shortcut="⌘E"
              onClick={() => run(() => editor.chain().focus().toggleCode().run())}
            >
              <CodeIcon size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Inline code</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isSubscriptActive}
              shortcut="⌘⇧,"
              onClick={() => run(() => editor.chain().focus().toggleSubscript().run())}
            >
              <SubIcon size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Subscript</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isSuperscriptActive}
              shortcut="⌘⇧."
              onClick={() => run(() => editor.chain().focus().toggleSuperscript().run())}
            >
              <SupIcon size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Superscript</span>
            </ToolbarMenuItem>
            <ToolbarMenuSeparator />
            <ToolbarMenuItem
              shortcut="⌘\\"
              onClick={() =>
                run(() => editor.chain().focus().unsetAllMarks().clearNodes().run())
              }
            >
              <RemoveFormatting size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Clear formatting</span>
            </ToolbarMenuItem>
          </>
        );
      }}
    />
  );
}
