"use client";

import { useState } from "react";
import { Section } from "./Section";
import { Plus, Trash2 } from "lucide-react";

const MAX_VISIBLE = 3;

interface ActionItemsSectionProps {
  actionItems: string[];
  onSave: (items: string[]) => Promise<void>;
}

export function ActionItemsSection({
  actionItems,
  onSave,
}: ActionItemsSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [newItemDraft, setNewItemDraft] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const items = actionItems.length > 0 ? actionItems : [];
  const visibleItems = items.length > MAX_VISIBLE && !showAll ? items.slice(0, MAX_VISIBLE) : items;
  const hasCollapsed = items.length > MAX_VISIBLE;

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
    if (value) {
      await onSave([...items, value]);
      setNewItemDraft("");
    }
    setIsAdding(false);
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
            className="flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors duration-150"
          >
            <Plus size={14} />
            Add action item
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
              placeholder="New action item…"
              className="flex-1 font-mono text-[13px] px-3 py-2 rounded-md border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 transition-all duration-150"
              autoFocus
              aria-label="New action item"
            />
          </div>
        )}
      </section>
    );
  }

  return (
    <Section title="Action items">
      <ul className="list-none space-y-2 p-0 m-0">
        {visibleItems.map((text, i) => (
          <li key={i} className="flex items-center gap-2 group">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-medium text-neutral-400">
              {i + 1}
            </span>
            {editingIndex === i ? (
              <div className="flex-1 flex gap-2 items-center">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => void saveEdit()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 font-mono text-[13px] px-2 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 transition-all duration-150"
                  autoFocus
                  aria-label={`Edit action item ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  className="text-[13px] font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="flex-1 text-left font-mono text-[13px] text-neutral-900 bg-neutral-100 px-2 py-1 rounded-md hover:bg-neutral-200/80 -mx-2 cursor-text transition-colors duration-150"
                >
                  {text}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(i)}
                  className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove action item ${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </li>
        ))}
        {isAdding && (
          <li className="flex items-center gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-medium text-neutral-400">
              {items.length + 1}
            </span>
            <input
              type="text"
              value={newItemDraft}
              onChange={(e) => setNewItemDraft(e.target.value)}
              onBlur={() => void saveNew()}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveNew();
                if (e.key === "Escape") cancelAdd();
              }}
              placeholder="New action item…"
              className="flex-1 font-mono text-[13px] px-2 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 transition-all duration-150"
              autoFocus
              aria-label="New action item"
            />
          </li>
        )}
      </ul>
      {hasCollapsed && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-2 text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors duration-150"
        >
          Show all
        </button>
      )}
      {!isAdding && (
        <button
          type="button"
          onClick={startAdd}
          className="mt-2 flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <Plus size={14} />
          Add action item
        </button>
      )}
    </Section>
  );
}
