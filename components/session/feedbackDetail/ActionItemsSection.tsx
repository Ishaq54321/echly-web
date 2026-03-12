"use client";

import { useState } from "react";
import { formatActionStep } from "@/lib/formatters/formatActionStep";
import { Section } from "./Section";
import { Plus, Trash2 } from "lucide-react";

interface ActionStepsSectionProps {
  actionSteps: string[];
  onSave: (steps: string[]) => Promise<void>;
  /** When true, show items as resolved (line-through, muted). */
  isResolved?: boolean;
}

export function ActionItemsSection({
  actionSteps,
  onSave,
  isResolved = false,
}: ActionStepsSectionProps) {
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
    if (editingIndex === null) return;
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
    return (
      <section className="my-6">
        {!isAdding ? (
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-2 px-3 py-2 text-[13px] text-secondary hover:text-neutral-700 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={14} />
            Add action step
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
              placeholder="New action step…"
              className="flex-1 min-w-0 font-mono text-[13px] px-3 py-2 rounded-lg border border-neutral-200/80 bg-white text-[hsl(var(--text-primary-strong))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-[box-shadow] duration-[120ms]"
              autoFocus
              aria-label="New action step"
            />
          </div>
        )}
      </section>
    );
  }

  const numberClass =
    "flex-shrink-0 text-[14px] font-semibold tabular-nums text-[#111111] leading-[1.6] mr-1.5";
  return (
    <Section title="ACTION STEPS" titleSemantic="attention">
      <ul className="list-none space-y-2 p-0 m-0">
        {items.map((text, i) => (
          <li key={i} className="group flex items-start gap-2">
            <span className={numberClass}>{i + 1}.</span>
            {editingIndex === i ? (
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
                  className="flex-1 min-w-0 font-mono text-[13px] px-2 py-1 rounded border border-neutral-200/80 bg-white text-[hsl(var(--text-primary-strong))] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-[box-shadow] duration-[120ms]"
                  autoFocus
                  aria-label={`Edit action step ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  className="text-[13px] font-medium text-[hsl(var(--text-secondary-soft))] hover:text-[hsl(var(--text-primary-strong))] hover:underline cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className={`flex-1 text-left text-[14px] font-medium leading-[1.6] px-0 py-0 min-w-0 cursor-pointer ${
                    isResolved
                      ? "line-through text-[hsl(var(--text-tertiary))]"
                      : "text-[#111111]"
                  }`}
                >
                  {formatActionStep(text)}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(i)}
                  className="flex-shrink-0 p-1 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary-soft))] hover:bg-[var(--layer-2-hover-bg)] opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label={`Remove action step ${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </li>
        ))}
        {isAdding && (
          <li className="flex items-start gap-2">
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
              placeholder="New action step…"
              className="flex-1 min-w-0 font-mono text-[13px] px-2 py-1 rounded border border-neutral-200/80 bg-white text-[hsl(var(--text-primary-strong))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-[box-shadow] duration-[120ms]"
              autoFocus
              aria-label="New action step"
            />
          </li>
        )}
      </ul>
      {!isAdding && (
        <button
          type="button"
          onClick={startAdd}
          className="mt-2 flex items-center gap-2 px-0 py-1 text-[13px] font-medium text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary-strong))] cursor-pointer"
        >
          <Plus size={14} />
          Add action step
        </button>
      )}
    </Section>
  );
}
