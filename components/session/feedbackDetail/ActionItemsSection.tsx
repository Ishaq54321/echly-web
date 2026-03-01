"use client";

import { useState } from "react";
import { Section } from "./Section";
import { Plus, Trash2 } from "lucide-react";

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

  const items = actionItems.length > 0 ? actionItems : [];

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

  return (
    <Section title="Action items">
      <ul className="list-none space-y-2 p-0 m-0">
        {items.map((text, i) => (
          <li key={i} className="flex items-center gap-2 group">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--surface-3))] flex items-center justify-center text-[10px] font-medium text-[hsl(var(--text-muted))]">
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
                  className="flex-1 text-sm px-2 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)]"
                  autoFocus
                  aria-label={`Edit action item ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  className="text-xs font-medium text-[hsl(var(--brand))] hover:underline"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="flex-1 text-left text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-2))]/50 rounded px-2 py-1 -mx-2 cursor-text"
                >
                  {text}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(i)}
                  className="flex-shrink-0 p-1 rounded text-[hsl(var(--text-muted))] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--surface-3))] flex items-center justify-center text-[10px] font-medium text-[hsl(var(--text-muted))]">
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
              className="flex-1 text-sm px-2 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)]"
              autoFocus
              aria-label="New action item"
            />
          </li>
        )}
      </ul>
      {!isAdding && (
        <button
          type="button"
          onClick={startAdd}
          className="mt-2 flex items-center gap-2 text-xs font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <Plus size={14} />
          Add action item
        </button>
      )}
    </Section>
  );
}
