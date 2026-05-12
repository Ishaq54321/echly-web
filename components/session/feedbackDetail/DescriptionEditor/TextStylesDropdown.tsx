"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { Type } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import {
  ToolbarMenu,
  ToolbarMenuItem,
} from "./ToolbarMenu";

const LEVELS: Array<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  marker: string;
  shortcut: string;
  cls: string;
}> = [
  { level: 1, label: "Heading 1", marker: "H1", shortcut: "⌃⌥1", cls: "text-[17px] font-bold tracking-tight" },
  { level: 2, label: "Heading 2", marker: "H2", shortcut: "⌃⌥2", cls: "text-[15px] font-bold tracking-tight" },
  { level: 3, label: "Heading 3", marker: "H3", shortcut: "⌃⌥3", cls: "text-[14px] font-semibold" },
  { level: 4, label: "Heading 4", marker: "H4", shortcut: "⌃⌥4", cls: "text-[13px] font-semibold" },
  { level: 5, label: "Heading 5", marker: "H5", shortcut: "⌃⌥5", cls: "text-[12px] font-semibold" },
  { level: 6, label: "Heading 6", marker: "H6", shortcut: "⌃⌥6", cls: "text-[11px] font-semibold" },
];

export function TextStylesDropdown({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        isParagraph: e.isActive("paragraph") && !e.isActive("heading"),
        isH1: e.isActive("heading", { level: 1 }),
        isH2: e.isActive("heading", { level: 2 }),
        isH3: e.isActive("heading", { level: 3 }),
        isH4: e.isActive("heading", { level: 4 }),
        isH5: e.isActive("heading", { level: 5 }),
        isH6: e.isActive("heading", { level: 6 }),
      };
    },
  });

  const activeByLevel: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> = {
    1: !!state?.isH1,
    2: !!state?.isH2,
    3: !!state?.isH3,
    4: !!state?.isH4,
    5: !!state?.isH5,
    6: !!state?.isH6,
  };
  const isParagraph = !!state?.isParagraph;

  return (
    <ToolbarMenu
      minWidth={240}
      trigger={
        <ToolbarButton tooltip="Text styles" icon onMouseDown={(e) => e.preventDefault()}>
          <Type size={16} strokeWidth={2} />
        </ToolbarButton>
      }
    >
      {(close) => {
        if (!editor) return null;
        return (
          <>
            <ToolbarMenuItem
              isActive={isParagraph}
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                close();
              }}
              shortcut="⌃⌥0"
            >
              <span className="inline-flex items-center justify-center w-[15px] h-[15px] flex-shrink-0">
                <Type size={15} strokeWidth={2} />
              </span>
              <span className="flex-1 font-normal">Normal text</span>
            </ToolbarMenuItem>
            {LEVELS.map(({ level, label, marker, shortcut, cls }) => {
              const active = activeByLevel[level];
              return (
                <ToolbarMenuItem
                  key={level}
                  isActive={active}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level }).run();
                    close();
                  }}
                  shortcut={shortcut}
                >
                  <span className="inline-flex items-center justify-center w-[15px] h-[15px] text-[9px] font-bold font-mono text-[var(--text-tertiary)] flex-shrink-0">
                    {marker}
                  </span>
                  <span className={`flex-1 ${cls}`}>{label}</span>
                </ToolbarMenuItem>
              );
            })}
          </>
        );
      }}
    </ToolbarMenu>
  );
}
