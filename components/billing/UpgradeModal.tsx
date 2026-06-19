"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useWorkspaceUsageRealtime } from "@/lib/hooks/useWorkspaceUsageRealtime";
import { usePlanCatalog } from "@/lib/hooks/usePlanCatalog";
import { openUpgradeCheckout } from "@/lib/billing/openUpgradeCheckout";

export interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  upgradePlan: string | null;
  /**
   * Seat count to bill for. Optional — defaults to the workspace member
   * count when omitted (e.g. opened from a plain "Upgrade" button). When the
   * modal is opened from the Plans view the user's chosen count flows in
   * here. The server still enforces the member-count floor.
   */
  seatCount?: number;
}

const EASE_OUT_200 = "200ms ease-out";

const VALUE_BULLETS = [
  "Unlimited team members",
  "1,500 AI improvements per month",
  "Unlimited feedback tickets",
  "Priority support",
];

export function UpgradeModal({
  open,
  onClose,
  seatCount: seatCountProp,
}: UpgradeModalProps) {
  const { isIdentityReady, workspaceId, isWorkspaceOwner, memberCount } =
    useWorkspace();
  // Kept for parity with the prior wiring (realtime workspace doc); the
  // redesign no longer renders a usage meter but the subscription is cheap
  // and other surfaces rely on it being warmed.
  useWorkspaceUsageRealtime({
    enabled:
      open &&
      isIdentityReady &&
      workspaceId != null &&
      workspaceId.trim() !== "",
  });
  const { plans: planCatalog } = usePlanCatalog();
  const businessPlan = planCatalog?.find((p) => p.id === "business");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ── Pricing math ────────────────────────────────────────────────────
  // Prefer the caller-supplied seat count (e.g. from the Plans view), but
  // never below the member-count floor. Falls back to the floor when no
  // explicit count was passed. The server re-enforces this regardless.
  const memberFloor = memberCount > 0 ? memberCount : 1;
  const seatCount =
    seatCountProp != null
      ? Math.max(seatCountProp, memberFloor)
      : memberFloor;
  const pricePerSeat = businessPlan?.pricePerSeat ?? 24;
  const annualPricePerSeat = businessPlan?.annualPricePerSeat ?? 19;

  const monthlyTotal = (seatCount * pricePerSeat).toFixed(2);
  const annualTotal = (seatCount * annualPricePerSeat * 12).toFixed(2);
  const monthlyOverYear = seatCount * pricePerSeat * 12;
  const savings = monthlyOverYear - parseFloat(annualTotal);

  const seatNoun = seatCount === 1 ? "seat" : "seats";

  async function handleUpgradeClick() {
    if (!isWorkspaceOwner) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      await openUpgradeCheckout({ billingCycle, seatCount });
      // On success, the browser is redirecting to Stripe — no further state change needed.
      // Loading state shows briefly during the XHR window.
    } catch (err) {
      console.error("[upgrade] failed to start checkout:", err);
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to start checkout. Try again."
      );
      setCheckoutLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabelledBy="upgrade-modal-title">
      <motion.div
        className="relative w-full sm:max-w-md h-full sm:h-auto rounded-none sm:rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-2xl"
        style={{ background: "var(--surface)" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
            {/* Header */}
            <div className="flex items-start justify-between">
              <h2
                id="upgrade-modal-title"
                className="text-xl font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                Upgrade to Business
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-tertiary)";
                }}
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            {isWorkspaceOwner ? (
              <>
                {/* Cycle toggle */}
                <div className="mt-6">
                  <div
                    className="inline-flex items-center gap-1 rounded-[var(--radius-btn)] p-1"
                    style={{ background: "var(--surface-subtle)" }}
                    role="tablist"
                    aria-label="Billing cycle"
                  >
                    <CycleButton
                      label="Monthly"
                      active={billingCycle === "monthly"}
                      onClick={() => setBillingCycle("monthly")}
                    />
                    <CycleButton
                      label="Annual"
                      active={billingCycle === "annual"}
                      onClick={() => setBillingCycle("annual")}
                      suffix={
                        <span
                          className="ml-1.5 text-xs font-medium"
                          style={{ color: "var(--color-success)" }}
                        >
                          Save 20%
                        </span>
                      }
                    />
                  </div>
                </div>

                {/* Math summary — fixed min-height so toggling never shifts layout */}
                <div
                  className="mt-6 mb-6"
                  style={{ minHeight: 104 }}
                >
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {billingCycle === "monthly" ? (
                      <>
                        {seatCount} {seatNoun} &times; ${pricePerSeat} /seat /mo
                      </>
                    ) : (
                      <>
                        {seatCount} {seatNoun} &times; ${annualPricePerSeat}{" "}
                        /seat /mo billed annually
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Total
                    </div>
                    <div>
                      <span
                        className="text-3xl font-bold"
                        style={{ color: "var(--text-heading)" }}
                      >
                        ${billingCycle === "monthly" ? monthlyTotal : annualTotal}
                      </span>
                      <span
                        className="ml-1 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {billingCycle === "monthly" ? "/mo" : "/year"}
                      </span>
                    </div>
                  </div>
                  {/* Savings line — space reserved in both states (no jump) */}
                  <div
                    className="mt-2 text-sm"
                    style={{
                      color: "var(--color-success)",
                      visibility:
                        billingCycle === "annual" ? "visible" : "hidden",
                    }}
                    aria-hidden={billingCycle !== "annual"}
                  >
                    You save ${savings.toFixed(2)} per year
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{ borderTop: "1px solid var(--border)" }}
                  aria-hidden
                />

                {/* What you get */}
                <div className="mt-6 mb-6">
                  <div
                    className="mb-3 text-sm font-medium"
                    style={{ color: "var(--text-heading)" }}
                  >
                    What you get
                  </div>
                  <ul className="space-y-2" role="list">
                    {VALUE_BULLETS.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Check
                          size={16}
                          strokeWidth={2.5}
                          aria-hidden
                          style={{
                            color: "var(--color-success)",
                            flexShrink: 0,
                          }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => void handleUpgradeClick()}
                  disabled={checkoutLoading}
                  className="h-12 w-full rounded-[var(--radius-btn)] text-base font-medium text-white disabled:pointer-events-none"
                  style={{
                    background: "var(--brand)",
                    opacity: checkoutLoading ? 0.7 : 1,
                    transition: `opacity ${EASE_OUT_200}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!checkoutLoading)
                      e.currentTarget.style.opacity = "0.95";
                  }}
                  onMouseLeave={(e) => {
                    if (!checkoutLoading) e.currentTarget.style.opacity = "1";
                  }}
                >
                  {checkoutLoading ? "Loading…" : "Continue to checkout"}
                </button>

                {/* Error */}
                {checkoutError && (
                  <div
                    className="mt-3 flex items-start gap-2 rounded-[var(--radius-btn)] p-3 text-sm"
                    style={{
                      background: "var(--color-danger-bg)",
                      color: "var(--color-danger)",
                    }}
                    role="alert"
                  >
                    <AlertCircle
                      size={16}
                      aria-hidden
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full text-sm"
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
                  Cancel
                </button>
              </>
            ) : (
              /* Non-owner: cannot self-serve checkout */
              <>
                <p
                  className="mt-6 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Contact your workspace owner to upgrade to Business.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 h-12 w-full rounded-[var(--radius-btn)] text-base font-medium"
                  style={{
                    background: "var(--surface-subtle)",
                    color: "var(--text-heading)",
                    transition: `background-color ${EASE_OUT_200}`,
                  }}
                >
                  Close
                </button>
              </>
            )}
      </motion.div>
    </Modal>
  );
}

function CycleButton({
  label,
  active,
  onClick,
  suffix,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  suffix?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
      style={{
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text-heading)" : "var(--text-secondary)",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
        transition: `background-color ${EASE_OUT_200}, color ${EASE_OUT_200}`,
      }}
    >
      {label}
      {suffix}
    </button>
  );
}
