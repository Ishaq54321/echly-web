"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

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
  const [isPermissionError, setIsPermissionError] = useState(false);

  const handleClose = () => {
    setIsPermissionError(false);
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const isAccessError =
        message.toLowerCase().includes("access") ||
        message.toLowerCase().includes("permission") ||
        message.toLowerCase().includes("forbidden");

      if (isAccessError) {
        setIsPermissionError(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to delete the session. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} ariaLabelledBy="delete-session-title" role="alertdialog">
      <div
        className="card-depth bg-[var(--layer-1-bg)] rounded-none sm:rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] w-full sm:max-w-md h-full sm:h-auto cursor-default"
      >
        {isPermissionError ? (
          <div className="flex flex-col items-center text-center px-10 py-10 gap-5">
            <div className="w-20 h-20 rounded-full bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-10 w-10 text-[var(--color-warning)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[17px] font-semibold text-[var(--text-heading)]">
                Permission required
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-[300px]">
                Only the session creator or workspace owner can delete a session. Contact your workspace owner to remove it.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--text-heading)] text-white text-[14px] font-medium hover:opacity-85 transition-all cursor-pointer mt-2"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <h2
              id="delete-session-title"
              className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[var(--text-primary-strong)]"
            >
              Delete session permanently?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.5] text-[var(--text-tertiary)]">
              This action cannot be undone. This will permanently remove this session and all associated feedback.
            </p>
            {sessionTitle && (
              <p className="mt-2 text-[14px] text-[var(--text-secondary-soft)] font-medium truncate">
                &ldquo;{sessionTitle}&rdquo;
              </p>
            )}
            <div className="mt-6 flex gap-3 justify-end">
              {error && (
                <p className="mr-auto text-[14px] text-[var(--color-danger)]" role="alert">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleClose}
                disabled={deleting}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={deleting}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--color-danger)] text-white text-[14px] font-medium hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
