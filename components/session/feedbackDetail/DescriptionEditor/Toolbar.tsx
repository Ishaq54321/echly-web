"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Smile as SmileIcon,
  Image as ImageIcon,
  Code2,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Baseline,
  Sparkles,
  Wand2,
  SpellCheck,
  BookType,
  ArrowUpWideNarrow,
  ArrowDownNarrowWide,
  BriefcaseBusiness,
  Laugh,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import {
  ToolbarMenu,
  ToolbarMenuItem,
  ToolbarMenuLabel,
  ToolbarMenuSeparator,
} from "./ToolbarMenu";
import { FormattingDropdown } from "./FormattingDropdown";
import { ListsDropdown } from "./ListsDropdown";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import { SplitButton } from "./SplitButton";
import type { ImproveAction } from "@/lib/ai/prompts/improveDescription";

interface ToolbarProps {
  editor: Editor | null;
  onLink?: (anchorEl: HTMLElement) => void;
  onImageUpload?: (file: File) => void;
  /** When provided, renders an inline "Improve description" split-button at
   *  the top-right of the toolbar (dashboard appearance). The extension
   *  appearance leaves this undefined and uses the floating pill instead. */
  onAiAction?: (action: ImproveAction) => void;
  aiIsImproving?: boolean;
}

function ToneSubmenuItem({
  onClose,
  onChoose,
}: {
  onClose: () => void;
  onChoose: (action: ImproveAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);
  const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number } | null>(null);
  // Grace timer so the cursor can travel from the parent row to the
  // floating submenu without it snapping closed in transit.
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = (delay: number) => {
    cancelHide();
    hideTimerRef.current = setTimeout(() => setOpen(false), delay);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const openSubmenu = () => {
    cancelHide();
    const el = itemRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSubmenuPos({ top: r.top, left: r.right + 4 });
    setOpen(true);
  };

  const choose = (action: ImproveAction) => {
    cancelHide();
    onChoose(action);
    setOpen(false);
    onClose();
  };

  return (
    <div
      className="relative"
      onMouseEnter={openSubmenu}
      onMouseLeave={() => scheduleHide(200)}
    >
      <button
        ref={itemRef}
        type="button"
        role="menuitem"
        onMouseDown={(e) => e.preventDefault()}
        onFocus={openSubmenu}
        className="flex items-center gap-2.5 w-full px-2 py-[7px] rounded-[5px] text-left text-[13px] font-normal text-[var(--text-heading)] hover:bg-[var(--surface-hover)]"
      >
        <BookType size={15} strokeWidth={2} className="text-[var(--brand)]" />
        <span className="flex-1 font-medium">Change tone</span>
        <span className="ml-auto text-[var(--text-tertiary)] text-[12px]">›</span>
      </button>
      {/* Invisible bridge over the 4px gap between the parent item and the
          submenu so the cursor never lands on "neither" while crossing. */}
      {open ? (
        <div
          aria-hidden
          className="absolute"
          style={{ left: "100%", top: 0, width: 12, height: "100%" }}
          onMouseEnter={cancelHide}
        />
      ) : null}
      {open && submenuPos && typeof document !== "undefined" ? (
        <div
          role="menu"
          className="fixed rounded-lg border border-[var(--border)] bg-[var(--surface-card)] shadow-lg p-1"
          style={{
            zIndex: 1000,
            top: submenuPos.top,
            left: submenuPos.left,
            minWidth: 200,
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={() => scheduleHide(150)}
        >
          <ToolbarMenuItem onClick={() => choose("tone-professional")}>
            <BriefcaseBusiness size={15} strokeWidth={2} className="text-[var(--brand)]" />
            <span className="flex-1 font-medium">More professional</span>
          </ToolbarMenuItem>
          <ToolbarMenuItem onClick={() => choose("tone-casual")}>
            <Laugh size={15} strokeWidth={2} className="text-[var(--brand)]" />
            <span className="flex-1 font-medium">More casual</span>
          </ToolbarMenuItem>
        </div>
      ) : null}
    </div>
  );
}

function AiImproveButton({
  editor,
  onAiAction,
  aiIsImproving,
}: {
  editor: Editor | null;
  onAiAction?: (action: ImproveAction) => void;
  aiIsImproving?: boolean;
}) {
  const trigger = (action: ImproveAction) => {
    if (aiIsImproving) return;
    onAiAction?.(action);
  };
  return (
    <SplitButton
      isAi
      labelled
      tooltip={aiIsImproving ? "Improving..." : "Improve description"}
      chevronTooltip="More AI options"
      disabled={!editor || !onAiAction || aiIsImproving}
      chevronDisabled={!editor || !onAiAction || aiIsImproving}
      onMainClick={() => trigger("improve")}
      menuMinWidth={248}
      icon={
        <>
          <Sparkles
            size={15}
            strokeWidth={2}
            className={
              aiIsImproving
                ? "animate-pulse"
                : "animate-[shimmer_2s_ease-in-out_infinite]"
            }
          />
          <span className="font-medium">
            {aiIsImproving ? "Improving..." : "Improve description"}
          </span>
        </>
      }
      menu={(close) => (
        <>
          <ToolbarMenuItem onClick={() => { trigger("polish"); close(); }}>
            <Wand2 size={15} strokeWidth={2} className="text-[var(--brand)]" />
            <span className="flex-1 font-medium">Add polish</span>
          </ToolbarMenuItem>
          <ToolbarMenuSeparator />
          <ToolbarMenuItem onClick={() => { trigger("spelling"); close(); }}>
            <SpellCheck size={15} strokeWidth={2} className="text-[var(--brand)]" />
            <span className="flex-1 font-medium">Fix spelling &amp; grammar</span>
          </ToolbarMenuItem>
          <ToolbarMenuSeparator />
          <ToneSubmenuItem onClose={close} onChoose={trigger} />
          <ToolbarMenuSeparator />
          <ToolbarMenuItem onClick={() => { trigger("shorter"); close(); }}>
            <ArrowUpWideNarrow size={15} strokeWidth={2} className="text-[var(--brand)]" />
            <span className="flex-1 font-medium">Make shorter</span>
          </ToolbarMenuItem>
          <ToolbarMenuItem onClick={() => { trigger("longer"); close(); }}>
            <ArrowDownNarrowWide size={15} strokeWidth={2} className="text-[var(--brand)]" />
            <span className="flex-1 font-medium">Make longer</span>
          </ToolbarMenuItem>
        </>
      )}
    />
  );
}

function Divider() {
  return <div className="w-px h-[18px] bg-[var(--border)] mx-1.5" />;
}

export const TEXT_COLORS: Array<{
  key: string;
  bg: string;
  title: string;
  none?: boolean;
  value?: string;
}> = [
  { key: "none", bg: "#ffffff", title: "None", none: true },
  { key: "default", bg: "#15101F", title: "Default", value: "#15101F" },
  { key: "gray", bg: "#54495F", title: "Gray", value: "#54495F" },
  { key: "red", bg: "#E5484D", title: "Red", value: "#E5484D" },
  { key: "orange", bg: "#F77E2C", title: "Orange", value: "#F77E2C" },
  { key: "yellow", bg: "#EAB308", title: "Yellow", value: "#EAB308" },
  { key: "green", bg: "#18794E", title: "Green", value: "#18794E" },
  { key: "brand", bg: "#5A49BF", title: "Brand", value: "#5A49BF" },
];

export const BG_COLORS: Array<{
  key: string;
  bg: string;
  title: string;
  none?: boolean;
  value?: string;
}> = [
  { key: "none", bg: "#ffffff", title: "None", none: true },
  { key: "gray", bg: "#F5F5F5", title: "Light gray", value: "#F5F5F5" },
  { key: "red", bg: "#FECACA", title: "Light red", value: "#FECACA" },
  { key: "orange", bg: "#FED7AA", title: "Light orange", value: "#FED7AA" },
  { key: "yellow", bg: "#FEF08A", title: "Light yellow", value: "#FEF08A" },
  { key: "green", bg: "#A7F3D0", title: "Light green", value: "#A7F3D0" },
  { key: "brand", bg: "#DCD5F0", title: "Light brand", value: "#DCD5F0" },
  { key: "purple", bg: "#DDD6FE", title: "Light purple", value: "#DDD6FE" },
];

function ColorSwatch({
  bg,
  title,
  none,
  onClick,
}: {
  bg: string;
  title: string;
  none?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-[22px] h-[22px] rounded-[5px] border border-black/[0.06] hover:scale-110 hover:border-black/20 transition-transform relative overflow-hidden cursor-pointer"
      style={{ background: bg }}
    >
      {none ? (
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, transparent 47%, var(--color-danger) 47%, var(--color-danger) 53%, transparent 53%)",
          }}
        />
      ) : null}
    </button>
  );
}

function ColorPicker({ editor }: { editor: Editor | null }) {
  return (
    <ToolbarMenu
      minWidth={232}
      trigger={
        <ToolbarButton
          tooltip="Text color"
          icon
          disabled={!editor}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Baseline size={16} strokeWidth={2} />
        </ToolbarButton>
      }
    >
      {(close) => (
        <>
          <ToolbarMenuLabel>Text color</ToolbarMenuLabel>
          <div className="grid grid-cols-8 gap-1 p-1">
            {TEXT_COLORS.map((c) => (
              <ColorSwatch
                key={`tc-${c.key}`}
                bg={c.bg}
                title={c.title}
                none={c.none}
                onClick={() => {
                  if (!editor) return;
                  if (c.none || !c.value) {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().setColor(c.value).run();
                  }
                  close();
                }}
              />
            ))}
          </div>
          <ToolbarMenuSeparator />
          <ToolbarMenuLabel>Background</ToolbarMenuLabel>
          <div className="grid grid-cols-8 gap-1 p-1">
            {BG_COLORS.map((c) => (
              <ColorSwatch
                key={`bg-${c.key}`}
                bg={c.bg}
                title={c.title}
                none={c.none}
                onClick={() => {
                  if (!editor) return;
                  if (c.none || !c.value) {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor.chain().focus().toggleHighlight({ color: c.value }).run();
                  }
                  close();
                }}
              />
            ))}
          </div>
        </>
      )}
    </ToolbarMenu>
  );
}

export function Toolbar({
  editor,
  onLink,
  onImageUpload,
  onAiAction,
  aiIsImproving,
}: ToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        isCodeBlock: e.isActive("codeBlock"),
      };
    },
  });

  const canUndo = !!editorState?.canUndo;
  const canRedo = !!editorState?.canRedo;
  const isCodeBlock = !!editorState?.isCodeBlock;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);

  const [emojiOpen, setEmojiOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    // Allow re-selecting the same file later
    e.target.value = "";
  };

  return (
    <div
      role="toolbar"
      aria-label="Description formatting"
      className="flex items-center gap-0.5 flex-wrap px-2.5 py-2 border-b border-[var(--border)] rounded-t-[12px]"
    >
      {onAiAction ? (
        <div className="pr-2 mr-1 border-r border-[var(--border)]">
          <AiImproveButton
            editor={editor}
            onAiAction={onAiAction}
            aiIsImproving={aiIsImproving}
          />
        </div>
      ) : null}
      <FormattingDropdown editor={editor} />
      <ListsDropdown editor={editor} />
      <Divider />
      <ColorPicker editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <ToolbarButton
        tooltip="Image"
        icon
        disabled={!editor || !onImageUpload}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={16} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Code block"
        icon
        isActive={isCodeBlock}
        disabled={!editor}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={16} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton
        ref={setEmojiAnchor}
        tooltip="Emoji"
        icon
        disabled={!editor}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setEmojiOpen((v) => !v)}
      >
        <SmileIcon size={16} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton
        ref={linkButtonRef}
        tooltip="Link"
        icon
        disabled={!editor || !onLink}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (linkButtonRef.current) onLink?.(linkButtonRef.current);
        }}
      >
        <LinkIcon size={16} strokeWidth={2} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        tooltip="Undo"
        icon
        disabled={!canUndo}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().undo().run()}
      >
        <Undo2 size={16} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Redo"
        icon
        disabled={!canRedo}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().redo().run()}
      >
        <Redo2 size={16} strokeWidth={2} />
      </ToolbarButton>

      <EmojiPickerPopover
        anchorEl={emojiAnchor}
        open={emojiOpen}
        onSelect={(emoji) => {
          editor?.chain().focus().insertContent(emoji).run();
          setEmojiOpen(false);
        }}
        onClose={() => setEmojiOpen(false)}
      />
    </div>
  );
}
