"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { ColorPickerPopover } from "@/components/ui/ColorPickerPopover";
import { DescriptionEditor } from "./DescriptionEditor/DescriptionEditor";
import { DescriptionMarkdown } from "./DescriptionMarkdown";
import type { MentionParticipant } from "@/lib/tiptap/mentionSuggestion";

interface DescriptionSectionInlineProps {
  description: string;
  onSave?: (description: string) => Promise<void>;
  /** When true, show description with muted styling (resolved tickets). */
  isResolved?: boolean;
  /** Workspace + session participants for @mention suggestions while editing. */
  participants?: MentionParticipant[];
}

export interface ActionItemsSectionHandle {
  /** Returns whether it's safe to navigate away. */
  canLeave(): { ok: true } | { ok: false; reason: "dirty" | "streaming" };
  /** Force-discard unsaved changes and close edit mode. */
  discardAndClose(): void;
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
 * Inline description editing section for a ticket. Renders the description
 * display (markdown) and toggles into edit mode via DescriptionEditor.
 * Click-to-edit when onSave is provided; otherwise read-only.
 */
export const ActionItemsSection = forwardRef<
  ActionItemsSectionHandle,
  DescriptionSectionInlineProps
>(function ActionItemsSection(
  { description, onSave, isResolved = false, participants },
  ref,
) {
  const isReadOnly = typeof onSave !== "function";
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hexEdit, setHexEdit] = useState<HexEditState | null>(null);

  const heading = (
    <h2 className="text-[17px] font-semibold text-[var(--text-heading)] mb-3">
      Description
    </h2>
  );

  // Baseline = markdown TipTap emits on mount (after its own normalization).
  // Compare current against baseline rather than the raw `description` prop so
  // whitespace/format normalization isn't mistaken for user edits.
  const baselineMarkdownRef = useRef<string | null>(null);
  const currentMarkdownRef = useRef<string>(description ?? "");
  const isAiStreamingRef = useRef<boolean>(false);

  // Reset baseline whenever we leave edit mode or the saved description changes
  // out from under us.
  useEffect(() => {
    if (!isEditing) {
      baselineMarkdownRef.current = null;
      currentMarkdownRef.current = description ?? "";
    }
  }, [description, isEditing]);

  useImperativeHandle(
    ref,
    () => ({
      canLeave() {
        if (!isEditing) return { ok: true };
        if (isAiStreamingRef.current) {
          return { ok: false, reason: "streaming" };
        }
        const baseline = (baselineMarkdownRef.current ?? description ?? "").trim();
        const current = (currentMarkdownRef.current ?? "").trim();
        if (current !== baseline) {
          return { ok: false, reason: "dirty" };
        }
        return { ok: true };
      },
      discardAndClose() {
        setIsEditing(false);
      },
    }),
    [isEditing, description],
  );

  // Close hex picker if editing starts.
  useEffect(() => {
    if (isEditing) setHexEdit(null);
  }, [isEditing]);

  const startEdit = () => {
    if (isReadOnly) return;
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditorSave = async (next: string) => {
    if (!onSave) return;
    const trimmed = next.trim();
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
    } catch (err) {
      setIsEditing(true);
      console.error("Failed to save description:", err);
    } finally {
      setIsSaving(false);
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
    } finally {
      setIsSaving(false);
    }
  };

  if (!description.trim() && isReadOnly) {
    return (
      <div className={cardClass}>
        {heading}
        <p className="text-[15px] leading-[1.7] text-[var(--text-tertiary)]">
          No description
        </p>
      </div>
    );
  }

  if (isEditing && !isReadOnly) {
    return (
      <div className={cardClass}>
        {heading}
        <DescriptionEditor
          value={description}
          onSave={handleEditorSave}
          onCancel={cancelEdit}
          autoFocus
          participants={participants}
          isEditing={isEditing}
          onContentChange={(md) => {
            if (baselineMarkdownRef.current === null) {
              baselineMarkdownRef.current = md;
            }
            currentMarkdownRef.current = md;
          }}
          onStreamingChange={(streaming) => {
            isAiStreamingRef.current = streaming;
          }}
        />
      </div>
    );
  }

  return (
    <div className={cardClass}>
      {heading}
      <div
        className={`group relative flex items-start justify-between gap-2 ${
          isReadOnly
            ? ""
            : "cursor-pointer -mx-3 px-3 -my-2 py-2 transition-all duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--surface-hover)] hover:translate-x-[3px]"
        }`}
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
        {!isReadOnly && !isSaving && (
          <span className="absolute top-2 right-2 flex items-center gap-1.5">
            <Pencil
              size={14}
              className="opacity-0 group-hover:opacity-80 transition-[opacity] duration-[120ms] ease text-[var(--text-secondary)] shrink-0"
              aria-hidden
            />
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
});

function replaceHexAtMatchIndex(
  text: string,
  matchIndex: number,
  newHex: string,
): string {
  const segment = text.slice(matchIndex, matchIndex + HEX_LENGTH);
  if (!/^#[0-9A-Fa-f]{6}$/.test(segment)) {
    return text;
  }
  return `${text.slice(0, matchIndex)}${newHex}${text.slice(matchIndex + HEX_LENGTH)}`;
}
