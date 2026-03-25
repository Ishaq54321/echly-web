"use client";

import { Modal } from "@/components/ui/Modal";

/**
 * Placeholder modal for sharing a session.
 * Future: invite users by email.
 */
export interface ShareSessionModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
}

export function ShareSessionModal({
  open,
  onClose,
  sessionId: _sessionId,
  sessionTitle,
}: ShareSessionModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} ariaLabelledBy="share-session-title">
      <div
        className="card-depth bg-[var(--layer-1-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] max-w-md w-full p-6 cursor-default"
      >
        <h2
          id="share-session-title"
          className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))]"
        >
          Share session
        </h2>
        <p className="mt-2 text-[15px] text-[hsl(var(--text-secondary-soft))]">
          {sessionTitle || "Session"}
        </p>
        <p className="mt-4 text-[15px] text-[hsl(var(--text-tertiary))]">
          Invite by email — coming soon.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-[14px] font-medium rounded-xl bg-[var(--layer-2-bg)] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration)] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
