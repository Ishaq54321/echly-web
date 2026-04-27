"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useWorkspace } from "@/lib/client/workspaceContext";
import { useWorkspaceUsageRealtime } from "@/lib/hooks/useWorkspaceUsageRealtime";
import { useBillingStore } from "@/lib/store/billingStore";

export interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  upgradePlan: string | null;
}

const VALUE_BULLETS = [
  "Unlimited feedback tickets",
  "Unlimited sessions",
  "Unlimited members",
  "Custom branding (your logo)",
  "Insights & analytics",
];

export function UpgradeModal({ open, onClose, message }: UpgradeModalProps) {
  const { isIdentityReady, workspaceId } = useWorkspace();
  const { data: workspaceUsage } = useWorkspaceUsageRealtime({
    enabled: open && isIdentityReady && workspaceId != null && workspaceId.trim() !== "",
  });
  const { feedbackTicketsLimit, plan: cachedPlan } = useBillingStore();

  const currentPlan = cachedPlan ?? workspaceUsage?.plan ?? "starter";
  const planLabel =
    currentPlan === "business"
      ? "Business"
      : currentPlan === "enterprise"
      ? "Enterprise"
      : "Starter";

  const ticketsUsed = workspaceUsage?.feedbackCreatedThisMonth ?? 0;
  const ticketsLimit = feedbackTicketsLimit;
  const progressPct =
    ticketsLimit != null && ticketsLimit > 0
      ? Math.min(100, (ticketsUsed / ticketsLimit) * 100)
      : 0;
  const isFull = ticketsLimit != null && ticketsLimit > 0 && ticketsUsed >= ticketsLimit;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">

          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
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
            aria-labelledby="upgrade-modal-title"
            className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white py-8 px-7 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Illustration */}
            <div className="flex justify-center -mt-2 mb-2">
              <img
                src="/illustrations/upgrade-feedback.png"
                alt="Upgrade illustration"
                className="w-[420px] max-w-none h-auto select-none pointer-events-none"
              />
            </div>

            {/* Plan badge */}
            <div>
              <span className="inline-flex items-center rounded-full bg-[var(--surface-hover)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                Current Plan: {planLabel}
              </span>
            </div>

            {/* Title */}
            <h2
              id="upgrade-modal-title"
              className="mt-4 text-xl font-semibold tracking-tight text-[var(--text-heading)] sm:text-2xl"
            >
              {isFull
                ? "You've used all your feedback tickets this month."
                : message ?? "Upgrade to Business for unlimited feedback tickets."}
            </h2>

            {/* Description */}
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">
              {isFull
                ? "Your workspace has reached its monthly ticket limit. Upgrade to Business for unlimited feedback collection."
                : "Collect unlimited feedback, collaborate with your full team, and unlock deeper insights by upgrading your workspace."}
            </p>

            {/* Ticket usage */}
            {workspaceUsage != null && ticketsLimit != null && ticketsLimit > 0 && (
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Feedback tickets used this month</span>
                  <span className="tabular-nums font-medium text-[var(--text-heading)]">
                    {ticketsUsed} / {ticketsLimit}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: isFull ? "#1775E0" : "rgba(21, 93, 252, 0.5)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-5 rounded-xl bg-[var(--surface-subtle)]/80 p-4">
              <ul className="space-y-2.5" role="list">
                {VALUE_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2.5 text-sm text-neutral-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-secondary)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-all cursor-pointer"
              >
                Maybe Later
              </button>
              <Link href="/settings?tab=billing" onClick={onClose}>
                <button
                  type="button"
                  className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer"
                >
                  Upgrade to Business — $39/seat/mo
                </button>
              </Link>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
