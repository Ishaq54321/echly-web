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
        className="card-depth bg-[var(--layer-1-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] max-w-md w-full cursor-default"
      >
        {isPermissionError ? (
          <div className="flex flex-col items-center text-center px-10 py-10 gap-5">
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-10 w-10 text-amber-500" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[17px] font-semibold text-foreground">
                Permission required
              </h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[300px]">
                Only the session creator or workspace owner can delete a session. Contact your workspace owner to remove it.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 h-11 px-10 text-[14px] font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="p-6">
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
                onClick={handleClose}
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
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
