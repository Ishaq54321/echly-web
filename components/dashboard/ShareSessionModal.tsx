"use client";

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
  sessionId,
  sessionTitle,
}: ShareSessionModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-session-title"
    >
      <div
        className="bg-[hsl(var(--surface-1))] rounded-xl shadow-xl max-w-md w-full p-6 border border-[hsl(var(--border))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="share-session-title"
          className="text-[20px] font-medium leading-[1.35] text-neutral-900"
        >
          Share session
        </h2>
        <p className="mt-2 text-[15px] text-[hsl(var(--text-secondary))]">
          {sessionTitle || "Session"}
        </p>
        <p className="mt-4 text-[15px] text-[hsl(var(--text-secondary))]">
          Invite by email — coming soon.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring-brand px-4 py-2 text-[14px] font-medium rounded-md bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-3))] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
