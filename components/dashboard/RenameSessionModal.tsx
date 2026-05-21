"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";

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
    <Modal open={open} onClose={onClose} ariaLabelledBy="rename-session-title">
      <div
        className="card-depth bg-[var(--layer-1-bg)] rounded-none sm:rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] w-full sm:max-w-md h-full sm:h-auto p-5 sm:p-6 cursor-default"
      >
        <h2
          id="rename-session-title"
          className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[var(--text-primary-strong)]"
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
          className="mt-4 w-full h-11 px-4 rounded-xl border border-[var(--layer-2-border)] bg-[var(--layer-2-bg)] text-[var(--text-primary-strong)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)] disabled:opacity-50"
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
            className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || value.trim() === ""}
            className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--text-heading)] text-white text-[14px] font-medium hover:opacity-85 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
