"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export interface LeaveSessionModalProps {
  open: boolean;
  onClose: () => void;
  sessionTitle?: string;
  onConfirm: () => Promise<void>;
}

export function LeaveSessionModal({
  open,
  onClose,
  sessionTitle,
  onConfirm,
}: LeaveSessionModalProps) {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setLeaving(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to leave the session. Please try again."
      );
    } finally {
      setLeaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabelledBy="leave-session-title"
      role="alertdialog"
    >
      <div className="card-depth bg-[var(--layer-1-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] max-w-md w-full cursor-default">
        <div className="p-6">
          <h2
            id="leave-session-title"
            className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[var(--text-primary-strong)]"
          >
            Leave shared session?
          </h2>
          <p className="mt-2 text-[14px] leading-[1.5] text-[var(--text-tertiary)]">
            You&apos;ll no longer have access to this session. You can ask the
            owner to share it again.
          </p>
          {sessionTitle && (
            <p className="mt-2 text-[14px] text-[var(--text-secondary-soft)] font-medium truncate">
              &ldquo;{sessionTitle}&rdquo;
            </p>
          )}
          <div className="mt-6 flex gap-3 justify-end">
            {error && (
              <p
                className="mr-auto text-[14px] text-[var(--color-danger)]"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleClose}
              disabled={leaving}
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={leaving}
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--color-danger)] text-white text-[14px] font-medium hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {leaving ? "Leaving…" : "Leave Session"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
