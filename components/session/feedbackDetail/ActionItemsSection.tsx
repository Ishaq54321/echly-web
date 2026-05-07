"use client";

import { useState } from "react";
import { formatActionStep } from "@/lib/formatters/formatActionStep";
import { Plus, Trash2 } from "lucide-react";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActionStepsIllu } from "@/components/empty/canvasIllustrations";

interface ActionStepsSectionProps {
  actionSteps: string[];
  onSave?: (steps: string[]) => Promise<void>;
  /** When true, show items as resolved (line-through, muted). */
  isResolved?: boolean;
}

const cardClass = "mt-12 mb-2";

const titleClass =
  "text-[17px] font-semibold text-[var(--text-heading)] mb-3";

export function ActionItemsSection({
  actionSteps,
  onSave,
  isResolved = false,
}: ActionStepsSectionProps) {
  const isReadOnly = typeof onSave !== "function";
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [newItemDraft, setNewItemDraft] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const items = actionSteps.length > 0 ? actionSteps : [];

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraft(items[index] ?? "");
  };

  const saveEdit = async () => {
    if (editingIndex === null || !onSave) return;
    const next = [...items];
    const value = draft.trim();
    if (value) {
      next[editingIndex] = value;
      await onSave(next);
    }
    setEditingIndex(null);
    setDraft("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraft("");
  };

  const removeItem = async (index: number) => {
    if (!onSave) return;
    const next = items.filter((_, i) => i !== index);
    await onSave(next);
    if (editingIndex === index) {
      setEditingIndex(null);
      setDraft("");
    } else if (editingIndex != null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setNewItemDraft("");
  };

  const saveNew = async () => {
    if (!onSave) return;
    const value = newItemDraft.trim();
    setNewItemDraft("");
    setIsAdding(false);
    if (value) {
      await onSave([...items, value]);
    }
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewItemDraft("");
  };

  if (items.length === 0) {
    if (isReadOnly) {
      return (
        <div className={cardClass}>
          <h2 className={titleClass}>What to change</h2>
          <div className="py-6">
            <CanvasEmptyState
              density="compact"
              illustration={<NoActionStepsIllu />}
              title="Nothing to change"
              description="Changes will appear here when added."
            />
          </div>
        </div>
      );
    }
    return (
      <div className={cardClass}>
        <h2 className={titleClass}>What to change</h2>
        {!isAdding ? (
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-2 px-1 py-1.5 text-[17px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors duration-150 cursor-pointer"
          >
            <Plus size={14} />
            Add a change
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemDraft}
              onChange={(e) => setNewItemDraft(e.target.value)}
              onBlur={() => void saveNew()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveNew();
                if (e.key === "Escape") cancelAdd();
              }}
              placeholder="New change…"
              className="flex-1 min-w-0 text-[17px] leading-relaxed px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-colors"
              autoFocus
              aria-label="New change"
            />
          </div>
        )}
      </div>
    );
  }

  const numberClass = "font-sans font-semibold text-[var(--text-tertiary)] text-[17px] tabular-nums min-w-[18px] pt-px";
  return (
    <div className={cardClass}>
      <h2 className={titleClass}>What to change</h2>
      <ul className="list-none space-y-0 p-0 m-0 text-base leading-relaxed text-[var(--text-heading)] w-full">
        {items.map((text, i) => (
          <li key={i} className="group flex items-start gap-3 py-2.5">
            <span className={numberClass}>{i + 1}.</span>
            {isReadOnly ? (
              <span
                className={`flex-1 min-w-0 text-[17px] leading-[1.55] ${
                  isResolved
                    ? "line-through text-[var(--text-tertiary)]"
                    : "text-[var(--text-body)] font-[450]"
                }`}
              >
                {formatActionStep(text)}
              </span>
            ) : editingIndex === i ? (
              <div className="flex-1 flex gap-2 items-center min-w-0">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => void saveEdit()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 min-w-0 text-[17px] leading-relaxed px-2 py-1 rounded border border-[var(--border)] bg-white text-[var(--text-primary-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-operational)]/20 transition-[box-shadow] duration-[120ms]"
                  autoFocus
                  aria-label={`Edit change ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  className="text-sm font-medium text-[var(--text-secondary-soft)] hover:text-[var(--text-primary-strong)] hover:underline cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className={`flex-1 text-left px-0 py-0 min-w-0 cursor-pointer text-[17px] leading-[1.55] ${
                    isResolved
                      ? "line-through text-[var(--text-tertiary)]"
                      : "text-[var(--text-body)] font-[450]"
                  }`}
                >
                  {formatActionStep(text)}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(i)}
                  className="flex-shrink-0 p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-secondary-soft)] hover:bg-[var(--layer-2-hover-bg)] opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label={`Remove change ${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </li>
        ))}
        {isAdding && (
          <li className="flex items-start gap-3 py-2.5 w-full">
            <span className={numberClass}>{items.length + 1}.</span>
            <input
              type="text"
              value={newItemDraft}
              onChange={(e) => setNewItemDraft(e.target.value)}
              onBlur={() => void saveNew()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveNew();
                if (e.key === "Escape") cancelAdd();
              }}
              placeholder="New change…"
              className="flex-1 min-w-0 text-[17px] leading-relaxed px-2 py-1 rounded border border-[var(--border)] bg-white text-[var(--text-primary-strong)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-operational)]/20 transition-[box-shadow] duration-[120ms]"
              autoFocus
              aria-label="New change"
            />
          </li>
        )}
      </ul>
      {!isReadOnly && !isAdding && (
        <button
          type="button"
          onClick={startAdd}
          className="mt-3 flex items-center gap-2 px-1 py-1.5 text-[17px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-heading)] cursor-pointer transition-colors"
        >
          <Plus size={14} />
          Add a change
        </button>
      )}
    </div>
  );
}
