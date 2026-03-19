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
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("Failed to delete the session. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-session-title"
    >
      <div
        className="card-depth bg-[var(--layer-1-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] max-w-md w-full p-6 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="delete-session-title"
          className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))]"
        >
          Delete session permanently?
        </h2>
        <p className="mt-2 text-[14px] leading-[1.5] text-[hsl(var(--text-tertiary))]">
          This action cannot be undone. This will permanently remove this session and all associated feedback.
        </p>
        {sessionTitle && (
          <p className="mt-2 text-[14px] text-[hsl(var(--text-secondary-soft))] font-medium truncate">
            &ldquo;{sessionTitle}&rdquo;
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          {error && (
            <p className="mr-auto text-[13px] text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 text-[14px] font-medium rounded-xl bg-[var(--layer-2-bg)] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2.5 text-[14px] font-semibold rounded-xl bg-[var(--color-danger)] text-white shadow-[0_2px_8px_rgba(185,28,28,0.25)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
