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
  sessionId: _sessionId,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-session-title"
    >
      <div
        className="bg-[hsl(var(--surface-1))] rounded-xl shadow-xl max-w-md w-full p-6 border border-[hsl(var(--border))] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-session-title"
          className="text-[20px] font-medium leading-[1.35] text-neutral-900"
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
          className="focus-ring-brand mt-4 w-full h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-all duration-150 disabled:opacity-60"
          aria-label="Session title"
          aria-invalid={!!error}
          aria-describedby={error ? "rename-error" : undefined}
        />
        {error && (
          <p id="rename-error" className="mt-2 text-[14px] text-neutral-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="focus-ring-brand px-4 py-2 text-[14px] font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:bg-neutral-100 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || value.trim() === ""}
            className="focus-ring-brand px-4 py-2 text-[14px] font-medium rounded-md bg-neutral-900 text-white hover:opacity-90 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
