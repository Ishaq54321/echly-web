"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { useWorkspaceRealtimeStore } from "@/lib/realtime/workspaceStore";

export interface UpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Plan the user upgraded to. Drives the heading copy. */
  planName?: string;
}

const EASE_OUT_200 = "200ms ease-out";

// Max wait once the user clicks through but Firestore hasn't flipped yet.
const FINALIZE_TIMEOUT_MS = 10000;

const UNLOCKS = [
  "Unlimited team members",
  "1,500 AI improvements per month",
  "Unlimited feedback tickets",
  "Priority support",
];

/**
 * Post-checkout celebration. Fires immediately on Paddle's
 * `checkout.completed` (opened from BillingTab — see settings/page.tsx),
 * independent of the Firestore webhook landing.
 *
 * Flicker fix: rendered through {@link ModalPortal} into document.body so
 * it's decoupled from BillingTab's view-router re-render. When the webhook
 * flips `billing.plan` (starter → business), BillingTab swaps
 * PlansAndPricingView → BillingManagementView; before this change the modal
 * lived inside that subtree at z-index 1000 and got unmounted / painted
 * under the sidebar. Now it portals to body at the canonical modal layer,
 * so its lifecycle is driven ONLY by `isOpen` + user dismissal — never by
 * `billing.plan`.
 *
 * Timing reality: the success state shows right away and does NOT
 * auto-dismiss — it stays until the user clicks "Get started" or X. When
 * the user clicks through we check the live workspace doc: if the webhook
 * already flipped the plan, dismiss; otherwise show a brief "Finalizing"
 * spinner that auto-dismisses the moment Firestore catches up (10s cap).
 */
export function UpgradeSuccessModal({
  isOpen,
  onClose,
  planName = "Business",
}: UpgradeSuccessModalProps) {
  const { workspace } = useWorkspaceRealtimeStore();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const plan = workspace?.billing?.plan;
  const isPlanConfirmed = plan === "business" || plan === "enterprise";

  // Reset finalizing state whenever the modal is (re)opened, so a later
  // checkout doesn't inherit a stale spinner. Deferred out of the effect's
  // synchronous body via rAF so the setState doesn't run during commit
  // (react-hooks/set-state-in-effect) — matches the codebase convention.
  useEffect(() => {
    if (!isOpen) return;
    const t = requestAnimationFrame(() => setIsFinalizing(false));
    return () => cancelAnimationFrame(t);
  }, [isOpen]);

  const handleContinue = () => {
    if (isPlanConfirmed) {
      onClose();
    } else {
      setIsFinalizing(true);
    }
  };

  // While finalizing: dismiss as soon as Firestore confirms, or after the
  // 10s cap regardless (the view router self-corrects when the webhook lands).
  useEffect(() => {
    if (!isFinalizing) return;
    if (isPlanConfirmed) {
      onClose();
      return;
    }
    const timeout = setTimeout(onClose, FINALIZE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isFinalizing, isPlanConfirmed, onClose]);

  // Escape-key dismissal (backdrop + X handled inline) — matches UpgradeModal.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: MODAL_LAYER_Z_INDEX }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "var(--surface-overlay)" }}
              aria-hidden
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />

            {/* Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="upgrade-success-title"
              className="relative w-full max-w-md rounded-[var(--radius-lg)] p-10 text-center shadow-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md"
                style={{
                  color: "var(--text-tertiary)",
                  transition: `color ${EASE_OUT_200}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-tertiary)";
                }}
              >
                <X size={18} aria-hidden />
              </button>

              {!isFinalizing ? (
                <>
                  {/* Success icon */}
                  <div
                    className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "var(--color-success-bg)" }}
                  >
                    <CheckCircle2
                      size={40}
                      aria-hidden
                      style={{ color: "var(--color-success)" }}
                    />
                  </div>

                  {/* Heading */}
                  <h2
                    id="upgrade-success-title"
                    className="mb-2 text-2xl font-semibold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Welcome to {planName}!
                  </h2>

                  <p
                    className="mb-8 text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your upgrade is complete. Here&apos;s what you unlocked:
                  </p>

                  {/* Unlocks list */}
                  <ul className="mb-8 space-y-3 text-left" role="list">
                    {UNLOCKS.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm"
                        style={{ color: "var(--text-heading)" }}
                      >
                        <Sparkles
                          size={16}
                          aria-hidden
                          style={{ color: "var(--brand)", flexShrink: 0 }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="h-12 w-full rounded-[var(--radius-btn)] text-base font-medium text-white"
                    style={{
                      background: "var(--brand)",
                      transition: `opacity ${EASE_OUT_200}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.95";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Get started
                  </button>
                </>
              ) : (
                <>
                  {/* Finalizing state */}
                  <div
                    className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "var(--surface-subtle)" }}
                  >
                    <div
                      className="h-8 w-8 animate-spin rounded-full"
                      style={{
                        border: "3px solid var(--border)",
                        borderTopColor: "var(--brand)",
                      }}
                    />
                  </div>

                  <h2
                    id="upgrade-success-title"
                    className="mb-2 text-xl font-semibold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Finalizing your upgrade
                  </h2>

                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Just a moment while we set everything up.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
