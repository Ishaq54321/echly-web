"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Check } from "lucide-react";
import { renderHexInline } from "@/components/tickets/renderHexInline";
import { ColorPickerPopover } from "@/components/ui/ColorPickerPopover";

interface DescriptionSectionInlineProps {
  description: string;
  onSave?: (description: string) => Promise<void>;
  /** When true, show description with muted styling (resolved tickets). */
  isResolved?: boolean;
}

const cardClass = "mt-12 mb-2";
const titleClass =
  "text-[17px] font-semibold text-[var(--text-heading)] mb-3";

const HEX_LENGTH = 7; // #RRGGBB

interface HexEditState {
  hex: string;
  matchIndex: number;
  anchorEl: HTMLElement;
}

/**
 * Renders a feedback ticket's description (markdown bullets / line breaks).
 * Click-to-edit when onSave is provided; otherwise read-only.
 *
 * Note: file remains named ActionItemsSection.tsx for import stability,
 * but the component is now `DescriptionSectionInline` and renders a description string.
 */
export function ActionItemsSection({
  description,
  onSave,
  isResolved = false,
}: DescriptionSectionInlineProps) {
  const isReadOnly = typeof onSave !== "function";
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(description);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hexEdit, setHexEdit] = useState<HexEditState | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) setDraft(description);
  }, [description, isEditing]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !isEditing) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(100, el.scrollHeight)}px`;
  }, [isEditing, draft]);

  // Close hex picker if textarea editing starts or description changes underneath it.
  useEffect(() => {
    if (isEditing) setHexEdit(null);
  }, [isEditing]);

  const startEdit = () => {
    if (isReadOnly) return;
    setDraft(description);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(description);
  };

  const triggerSave = async () => {
    if (!onSave) return;
    const trimmed = draft.trim();
    if (trimmed === (description ?? "").trim()) {
      setIsEditing(false);
      return;
    }

    // Flip out of edit mode IMMEDIATELY — trust the optimistic update.
    // Parent sets description optimistically; server response syncs later.
    setIsEditing(false);
    setIsSaving(true);

    try {
      await onSave(trimmed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (err) {
      // Re-enter edit mode on failure so user can retry
      setIsEditing(true);
      console.error("Failed to save description:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void triggerSave();
    }
  };

  const handleHexEdit = ({
    hex,
    matchIndex,
    anchorEl,
  }: {
    hex: string;
    matchIndex: number;
    anchorEl: HTMLElement | null;
  }) => {
    if (!anchorEl || isReadOnly) return;
    setHexEdit({ hex, matchIndex, anchorEl });
  };

  const handleHexSave = async (newColor: string) => {
    if (!hexEdit || !onSave) {
      setHexEdit(null);
      return;
    }
    const updated = replaceHexAtMatchIndex(
      description,
      hexEdit.matchIndex,
      newColor,
    );
    setHexEdit(null);
    if (updated === description) return;
    setIsSaving(true);
    try {
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } finally {
      setIsSaving(false);
    }
  };

  if (!description.trim() && isReadOnly) {
    return (
      <div className={cardClass}>
        <h2 className={titleClass}>Description</h2>
        <p className="text-[15px] leading-[1.7] text-[var(--text-tertiary)]">
          No description
        </p>
      </div>
    );
  }

  if (isEditing && !isReadOnly) {
    return (
      <div className={cardClass}>
        <h2 className={titleClass}>Description</h2>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void triggerSave()}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[100px] rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-1-bg)] p-4 text-[15px] leading-[1.7] text-[var(--text-primary-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] resize-none overflow-hidden"
          autoFocus
          aria-label="Edit description"
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={cancelEdit}
            className="inline-flex h-[34px] items-center gap-2 px-3 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void triggerSave()}
            disabled={isSaving}
            className="inline-flex h-[34px] items-center gap-2 px-3 rounded-[var(--radius-btn)] bg-[var(--text-heading)] text-white text-[14px] font-medium hover:opacity-85 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h2 className={titleClass}>Description</h2>
      <div
        className={`group relative flex items-start justify-between gap-2 ${isReadOnly ? "" : "cursor-pointer"}`}
        onClick={isReadOnly ? undefined : startEdit}
        onKeyDown={
          isReadOnly
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  startEdit();
                }
              }
        }
        role={isReadOnly ? undefined : "button"}
        tabIndex={isReadOnly ? undefined : 0}
      >
        <DescriptionMarkdown
          text={description}
          isResolved={isResolved}
          isReadOnly={isReadOnly}
          onHexEdit={isReadOnly ? undefined : handleHexEdit}
        />
        {!isReadOnly && (
          <span className="absolute top-0 right-0 flex items-center gap-1.5">
            {saveSuccess ? (
              <span className="text-xs text-semantic-success flex items-center gap-1.5">
                <Check size={14} className="shrink-0" aria-hidden />
                Saved
              </span>
            ) : (
              <Pencil
                size={14}
                className="opacity-0 group-hover:opacity-60 transition-[opacity] duration-[120ms] ease text-[var(--text-secondary)] shrink-0"
                aria-hidden
              />
            )}
          </span>
        )}
      </div>
      {hexEdit && !isReadOnly && (
        <ColorPickerPopover
          anchorEl={hexEdit.anchorEl}
          initialColor={hexEdit.hex}
          onSave={(c) => void handleHexSave(c)}
          onCancel={() => setHexEdit(null)}
        />
      )}
    </div>
  );
}

/**
 * Replaces a hex at a specific match index with a new hex.
 * `matchIndex` is the position of the "#" in the (backtick-stripped) source text.
 * Source is stripped of any legacy backticks before matching so positions align
 * with what the renderer sees. Returns the original string unchanged if the
 * position no longer matches.
 */
function replaceHexAtMatchIndex(
  text: string,
  matchIndex: number,
  newHex: string,
): string {
  const cleaned = text.replace(/`/g, "");
  const segment = cleaned.slice(matchIndex, matchIndex + HEX_LENGTH);
  if (!/^#[0-9A-Fa-f]{6}$/.test(segment)) {
    return text;
  }
  const before = cleaned.slice(0, matchIndex);
  const after = cleaned.slice(matchIndex + HEX_LENGTH);
  return `${before}${newHex}${after}`;
}

/**
 * Minimal markdown renderer for descriptions:
 * - Lines starting with "- " become bullets
 * - Blank lines separate paragraphs
 * - All other content rendered as prose
 *
 * `onHexEdit` (when provided) makes inline hex swatches clickable. The match
 * index passed to the callback is relative to the *line/segment* that the swatch
 * appears in, since markdown lines are rendered independently. We compute an
 * absolute offset here so callers receive an index into the original `text`.
 */
type DescriptionBlock =
  | { kind: "para"; entries: { text: string; offset: number }[] }
  | { kind: "list"; items: { text: string; offset: number }[] };

const DescriptionMarkdown = memo(function DescriptionMarkdown({
  text,
  isResolved,
  isReadOnly,
  onHexEdit,
}: {
  text: string;
  isResolved: boolean;
  isReadOnly: boolean;
  onHexEdit?: (params: {
    hex: string;
    matchIndex: number;
    anchorEl: HTMLElement | null;
  }) => void;
}) {
  const blocks = useMemo<DescriptionBlock[]>(() => {
    // Normalize CRLF and strip any legacy backticks so absolute offsets we
    // compute line up with the cleaned text the renderer operates on.
    const normalized = text.replace(/\r\n/g, "\n").replace(/`/g, "");
    const lines = normalized.split("\n");

    const lineOffsets: number[] = [];
    {
      let acc = 0;
      for (const line of lines) {
        lineOffsets.push(acc);
        acc += line.length + 1; // +1 for the consumed "\n"
      }
    }

    const out: DescriptionBlock[] = [];
    let currentPara: { text: string; offset: number }[] = [];

    const flushPara = () => {
      if (currentPara.length > 0) {
        out.push({ kind: "para", entries: currentPara });
        currentPara = [];
      }
    };

    for (let li = 0; li < lines.length; li++) {
      const raw = lines[li];
      const lineStart = lineOffsets[li];
      const trimmedRight = raw.trimEnd();
      const bulletMatch = trimmedRight.match(/^(\s*[-*]\s+)(.+)$/);
      if (bulletMatch) {
        flushPara();
        const prefixIdx = raw.indexOf(bulletMatch[1]);
        const itemOffset =
          lineStart + (prefixIdx >= 0 ? prefixIdx + bulletMatch[1].length : 0);
        const last = out[out.length - 1];
        if (last && last.kind === "list") {
          last.items.push({ text: bulletMatch[2], offset: itemOffset });
        } else {
          out.push({
            kind: "list",
            items: [{ text: bulletMatch[2], offset: itemOffset }],
          });
        }
      } else if (trimmedRight.trim() === "") {
        flushPara();
      } else {
        currentPara.push({ text: trimmedRight, offset: lineStart });
      }
    }
    flushPara();
    return out;
  }, [text]);

  if (blocks.length === 0) return null;

  const proseClass = `text-[15px] leading-[1.7] flex-1 ${isReadOnly ? "pr-0" : "pr-6"} ${
    isResolved
      ? "line-through text-[var(--text-tertiary)]"
      : "text-[var(--text-primary-strong)]"
  }`;

  // Wraps the line-relative onHexEdit so callers receive absolute offsets.
  const buildLineHexEdit = (lineOffset: number) =>
    onHexEdit
      ? (params: {
          hex: string;
          matchIndex: number;
          anchorEl: HTMLElement | null;
        }) =>
          onHexEdit({
            ...params,
            matchIndex: params.matchIndex + lineOffset,
          })
      : undefined;

  return (
    <div className={proseClass}>
      {blocks.map((block, bi) => {
        if (block.kind === "list") {
          return (
            <ul
              key={bi}
              className="list-disc pl-5 my-2 space-y-1 marker:text-[var(--text-tertiary)]"
            >
              {block.items.map((item, ii) => (
                <li key={ii}>
                  {renderHexInline(item.text, `b${bi}-i${ii}-`, {
                    onHexEdit: buildLineHexEdit(item.offset),
                  })}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className={bi > 0 ? "mt-3" : ""}>
            {block.entries.map((entry, li) => (
              <span key={li}>
                {renderHexInline(entry.text, `b${bi}-l${li}-`, {
                  onHexEdit: buildLineHexEdit(entry.offset),
                })}
                {li < block.entries.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
});
