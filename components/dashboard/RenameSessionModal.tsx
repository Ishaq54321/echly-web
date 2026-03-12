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
        className="card-depth bg-[var(--layer-1-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] max-w-md w-full p-6 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-session-title"
          className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))]"
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
          className="mt-4 w-full h-11 px-4 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-2-bg)] text-[hsl(var(--text-primary-strong))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-[var(--motion-duration)] disabled:opacity-60"
          aria-label="Session title"
          aria-invalid={!!error}
          aria-describedby={error ? "rename-error" : undefined}
        />
        {error && (
          <p id="rename-error" className="mt-2 text-[14px] text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 text-[14px] font-medium rounded-xl bg-[var(--layer-2-bg)] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-[var(--motion-duration)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || value.trim() === ""}
            className="primary-cta px-4 py-2.5 text-[14px] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-[var(--motion-duration)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
