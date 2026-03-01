"use client";

import { useState } from "react";

export interface DeleteSessionModalProps {
  open: boolean;
  onClose: () => void;
  sessionTitle: string;
  onConfirm: () => Promise<void>;
}

export function DeleteSessionModal({
  open,
  onClose,
  sessionTitle,
  onConfirm,
}: DeleteSessionModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-session-title"
    >
      <div
        className="bg-[hsl(var(--surface-1))] rounded-xl shadow-xl max-w-md w-full p-6 border border-[hsl(var(--border))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="delete-session-title"
          className="text-lg font-semibold text-[hsl(var(--text-primary))]"
        >
          Delete session?
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
          This will permanently delete this session and all associated tickets.
          This action cannot be undone.
        </p>
        {sessionTitle && (
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] font-medium truncate">
            &ldquo;{sessionTitle}&rdquo;
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="focus-ring-brand px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-3))] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="focus-ring-brand px-4 py-2 text-sm font-medium rounded-lg bg-brand-primary text-white hover:brightness-95 active:scale-[0.98] transition-transform duration-100 ease-out disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
