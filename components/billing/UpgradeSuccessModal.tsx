"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import { useWorkspaceRealtimeStore } from "@/lib/realtime/workspaceStore";

export interface UpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Plan the user upgraded to. Drives the heading copy. */
  planName?: string;
}

// Once Firestore confirms, show the success state briefly before dismissing
// so the transition reads as "done" rather than a flash.
const SUCCESS_HOLD_MS = 800;

// Safety cap: webhook normally lands in 1-3s, but never trap the user. After
// this we dismiss regardless — the view router self-corrects when/if the
// webhook eventually lands (or the user can refresh).
const FALLBACK_TIMEOUT_MS = 15000;

/**
 * Post-checkout bridge state. Opens immediately on Paddle's
 * `checkout.completed` (from BillingTab — see settings/page.tsx), then acts
 * as a redirecting/loading screen until Firestore catches up.
 *
 * This is NOT a dismissible celebration. There's no Continue button, close
 * button, Escape handler, or backdrop-click — it's a bridge that covers the
 * Firestore-catchup window so the user never glimpses the stale Plans view
 * mid-transition. Lifecycle is driven purely by `isOpen` + the live workspace
 * doc; it dismisses itself once state is consistent.
 *
 * Flow the user sees:
 *   spinner ("Setting up your Business plan")
 *     → webhook flips billing.plan starter → business in Firestore
 *     → success ("Welcome to Business") for ~800ms
 *     → auto-dismiss; BillingManagementView is already rendered behind it
 *
 * Rendered through {@link ModalPortal} into document.body so it's decoupled
 * from BillingTab's view-router re-render: when the webhook flips the plan,
 * BillingTab swaps PlansAndPricingView → BillingManagementView, and the
 * portal keeps this mounted at the canonical modal layer regardless.
 */
export function UpgradeSuccessModal({
  isOpen,
  onClose,
  planName = "Business",
}: UpgradeSuccessModalProps) {
  const { workspace } = useWorkspaceRealtimeStore();

  const plan = workspace?.billing?.plan;
  // Bridge holds until the webhook flips the plan. The webhook writes plan and
  // subscriptionId in one atomic Firestore update, so an extra subscriptionId
  // check adds no real protection — it only widens the spinner window.
  const isPlanConfirmed = plan === "business" || plan === "enterprise";

  // Auto-dismiss once Firestore confirms — hold the success state briefly so
  // the handoff reads as intentional, not a flicker. Gated on isOpen so an
  // unrelated workspace update (already-business workspace, another tab's
  // write) can't fire this when the modal isn't even up.
  useEffect(() => {
    if (!isOpen || !isPlanConfirmed) return;
    const timeout = setTimeout(onClose, SUCCESS_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [isOpen, isPlanConfirmed, onClose]);

  // Safety fallback: never trap the user if the webhook is slow or fails.
  useEffect(() => {
    if (!isOpen) return;
    const fallback = setTimeout(onClose, FALLBACK_TIMEOUT_MS);
    return () => clearTimeout(fallback);
  }, [isOpen, onClose]);

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: MODAL_LAYER_Z_INDEX }}
          >
            {/* Backdrop — fully blocks underlying UI; NOT click-to-dismiss. */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "var(--surface-overlay)" }}
              aria-hidden
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
            >
              {!isPlanConfirmed ? (
                <>
                  {/* Bridge / loading state — Firestore hasn't caught up yet. */}
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
                    Setting up your {planName} plan
                  </h2>

                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    This will only take a moment.
                  </p>
                </>
              ) : (
                <>
                  {/* Success state — shown briefly before auto-dismiss. */}
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

                  <h2
                    id="upgrade-success-title"
                    className="mb-2 text-2xl font-semibold"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Welcome to {planName}
                  </h2>

                  <p
                    className="text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    You&apos;re all set.
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
