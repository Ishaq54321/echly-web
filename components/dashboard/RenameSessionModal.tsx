"use client";

import { useEffect, useRef, useState } from "react";

export interface RenameSessionModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  currentTitle: string;
  onSave: (title: string) => Promise<void>;
}

export function RenameSessionModal({
  open,
  onClose,
  sessionId,
  currentTitle,
  onSave,
}: RenameSessionModalProps) {
  const [value, setValue] = useState(currentTitle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(currentTitle);
    setError(null);
  }, [currentTitle, open]);

  useEffect(() => {
    if (open) {
      setValue(currentTitle);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open, currentTitle]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Title cannot be empty");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-session-title"
    >
      <div
        className="bg-[hsl(var(--surface-1))] rounded-xl shadow-xl max-w-md w-full p-6 border border-[hsl(var(--border))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-session-title"
          className="text-lg font-semibold text-[hsl(var(--text-primary))]"
        >
          Rename session
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="focus-ring-brand mt-4 w-full h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none disabled:opacity-60"
          aria-label="Session title"
          aria-invalid={!!error}
          aria-describedby={error ? "rename-error" : undefined}
        />
        {error && (
          <p id="rename-error" className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="focus-ring-brand px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-3))] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || value.trim() === ""}
            className="focus-ring-brand px-4 py-2 text-sm font-medium rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
