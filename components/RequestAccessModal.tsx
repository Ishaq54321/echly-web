"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export interface RequestAccessModalProps {
  open: boolean;
  onClose: () => void;
  /** Runs the existing POST /request-access flow; parent handles errors/toasts. */
  onConfirm: () => void | Promise<void>;
  submitting: boolean;
}

export function RequestAccessModal({
  open,
  onClose,
  onConfirm,
  submitting,
}: RequestAccessModalProps) {
  const titleId = useId();

  const safeClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Modal open={open} onClose={safeClose} ariaLabelledBy={titleId} role="dialog">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="card-depth bg-[var(--layer-1-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-level-5)] max-w-md w-full p-6 cursor-default"
      >
        <h2
          id={titleId}
          className="text-[20px] font-semibold leading-[1.35] tracking-[-0.02em] text-[hsl(var(--text-primary-strong))]"
        >
          Request resolve access
        </h2>
        <p className="mt-2 text-[14px] leading-[1.5] text-[hsl(var(--text-tertiary))]">
          You&apos;ll be able to resolve and manage feedback once approved.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={safeClose}
            disabled={submitting}
            className="px-4 py-2.5 text-[14px] font-medium rounded-xl bg-[var(--layer-2-bg)] text-[hsl(var(--text-primary-strong))] hover:bg-[var(--layer-2-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-colors duration-[var(--motion-duration)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-semibold rounded-xl border border-[var(--border-subtle)] bg-[hsl(var(--surface-2))] text-[hsl(var(--text-primary-strong))] hover:bg-[hsl(var(--surface-3))] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] transition-all duration-[var(--motion-duration)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                <span>Requesting…</span>
              </>
            ) : (
              "Request access"
            )}
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}
