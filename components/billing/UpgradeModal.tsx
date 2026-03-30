"use client";

import { useRouter } from "next/navigation";
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

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  business: "Business",
  enterprise: "Enterprise",
};

function currentPlanFromUpgrade(upgradePlan: string | null): string {
  if (upgradePlan === "starter") return "free";
  if (upgradePlan === "business") return "starter";
  if (upgradePlan === "enterprise") return "business";
  return "free";
}

const VALUE_BULLETS = [
  "Unlimited sessions",
  "Advanced insights dashboard",
  "Team collaboration",
  "Faster feedback cycles",
];

export function UpgradeModal({ open, onClose, message, upgradePlan }: UpgradeModalProps) {
  const router = useRouter();
  const { isIdentityReady, workspaceId } = useWorkspace();
  const currentPlan = currentPlanFromUpgrade(upgradePlan);
  const currentPlanLabel = PLAN_LABEL[currentPlan] ?? currentPlan;
  const { data: workspaceUsage } = useWorkspaceUsageRealtime({
    enabled:
      open &&
      isIdentityReady &&
      workspaceId != null &&
      workspaceId.trim() !== "",
  });
  const { maxSessions } = useBillingStore();

  const ctaLabel =
    currentPlan === "starter"
      ? "Upgrade to Business"
      : currentPlan === "business"
      ? "Upgrade to Enterprise"
      : "View Plans";

  const handlePrimary = () => {
    onClose();
    router.push("/settings?tab=billing");
  };

  const sessionsUsed = workspaceUsage?.sessionUsed ?? 0;
  const sessionsMax = maxSessions;

  const progressPct =
    sessionsMax != null && sessionsMax > 0
      ? Math.min(100, (sessionsUsed / sessionsMax) * 100)
      : 0;

  const isFull =
    sessionsMax != null && sessionsMax > 0 && sessionsUsed >= sessionsMax;
  const isOverLimit =
    sessionsMax != null && sessionsMax > 0 && sessionsUsed > sessionsMax;

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
            className="relative w-full max-w-lg rounded-2xl border border-neutral-200/80 bg-white py-8 px-7 shadow-2xl"
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
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                Current Plan: {currentPlanLabel}
              </span>
            </div>

            {/* Title */}
            <h2
              id="upgrade-modal-title"
              className="mt-4 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl"
            >
              {isOverLimit
                ? "You have exceeded your plan limit."
                : `You've reached the ${currentPlanLabel.toLowerCase()} workspace limit`}
            </h2>

            {/* Description */}
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">
              {isOverLimit
                ? "Existing sessions remain available. Delete sessions or upgrade to create new ones."
                : "Create unlimited feedback sessions, collaborate with your team, and unlock deeper insights by upgrading your workspace."}
            </p>

            {/* Usage */}
            {workspaceUsage != null && sessionsMax != null && sessionsMax > 0 && (
              <div className="mt-5">

                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-neutral-600">Sessions used</span>

                  <span className="tabular-nums font-medium text-neutral-900">
                    {sessionsUsed} / {sessionsMax} sessions
                  </span>
                </div>

                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: isFull
                        ? "#155DFC"
                        : "rgba(21, 93, 252, 0.5)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>

              </div>
            )}

            {/* Benefits */}
            <div className="mt-5 rounded-xl bg-neutral-50/80 p-4">
              <ul className="space-y-2.5" role="list">
                {VALUE_BULLETS.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2.5 text-sm text-neutral-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#155DFC]/10 text-[#155DFC]">
                      <Check
                        className="h-3 w-3"
                        strokeWidth={2.5}
                        aria-hidden
                      />
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
                className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition"
              >
                Maybe Later
              </button>

              <button
                type="button"
                onClick={handlePrimary}
                className="rounded-xl bg-[#155DFC] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0F4ED1] focus:outline-none focus:ring-2 focus:ring-[#155DFC] focus:ring-offset-2 transition"
              >
                {ctaLabel}
              </button>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}