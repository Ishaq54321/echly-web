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
          className="text-[20px] font-medium leading-[1.35] text-neutral-900"
        >
          Delete session permanently?
        </h2>
        <p className="mt-2 text-[14px] text-neutral-500">
          This action cannot be undone. This will permanently remove this session and all associated feedback.
        </p>
        {sessionTitle && (
          <p className="mt-2 text-[14px] text-neutral-500 font-medium truncate">
            &ldquo;{sessionTitle}&rdquo;
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-[14px] font-medium rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 text-[14px] font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:ring-offset-1 transition-colors disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
