"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { List, ListOrdered, ListChecks } from "lucide-react";
import { SplitButton } from "./SplitButton";
import { ToolbarMenuItem } from "./ToolbarMenu";

export function ListsDropdown({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isTaskList: e.isActive("taskList"),
      };
    },
  });

  const isBulletActive = !!state?.isBulletList;
  const isOrderedActive = !!state?.isOrderedList;
  const isTaskActive = !!state?.isTaskList;

  return (
    <SplitButton
      tooltip="Bulleted list"
      icon={<List size={16} strokeWidth={2} />}
      isActive={isBulletActive}
      disabled={!editor}
      onMainClick={() => editor?.chain().focus().toggleBulletList().run()}
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
              isActive={isBulletActive}
              shortcut="⌘⇧8"
              onClick={() =>
                run(() => editor.chain().focus().toggleBulletList().run())
              }
            >
              <List size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Bulleted list</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isOrderedActive}
              shortcut="⌘⇧7"
              onClick={() =>
                run(() => editor.chain().focus().toggleOrderedList().run())
              }
            >
              <ListOrdered size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Numbered list</span>
            </ToolbarMenuItem>
            <ToolbarMenuItem
              isActive={isTaskActive}
              shortcut="⌘⇧6"
              onClick={() =>
                run(() => editor.chain().focus().toggleTaskList().run())
              }
            >
              <ListChecks size={15} strokeWidth={2} className="text-[var(--text-secondary)]" />
              <span className="flex-1 font-medium">Task list</span>
            </ToolbarMenuItem>
          </>
        );
      }}
    />
  );
}
