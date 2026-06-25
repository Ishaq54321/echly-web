"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBillingStore } from "@/lib/store/billingStore";

const TIERS = {
  1: {
    title: "Your team's been productive!",
    desc: "You've used over half your monthly tickets. Upgrade to Business for unlimited tickets and never hit a wall.",
    cta: "See Business plan",
  },
  2: {
    title: "Heads up — you're running low",
    desc: "You're close to your monthly limit. Upgrade now to keep capturing feedback without interruption.",
    cta: "Upgrade to Business",
  },
  3: {
    title: "You've reached your monthly limit",
    desc: "Upgrade to Business for unlimited feedback tickets, easier team collaboration, and priority support.",
    cta: "Upgrade to Business",
  },
} as const;

export function DashboardUpgradeBanner() {
  const router = useRouter();
  const { isLoaded, feedbackTicketsUsed, feedbackTicketsLimit } = useBillingStore();
  const [dismissed, setDismissed] = useState(false);

  if (!isLoaded || feedbackTicketsLimit === null || dismissed) return null;

  const usagePercent = (feedbackTicketsUsed / feedbackTicketsLimit) * 100;
  const tier =
    usagePercent >= 100 ? 3 :
    usagePercent >= 80  ? 2 :
    usagePercent >= 60  ? 1 :
    null;

  if (tier === null) return null;

  const { title, desc, cta } = TIERS[tier];

  return (
    <>
      <style>{`
        @keyframes dash-sparkle-pop {
          0%, 100% { transform: scale(0); opacity: 0; }
          20%       { transform: scale(1.2); opacity: 1; }
          40%       { transform: scale(0.8); opacity: 0.6; }
          60%       { transform: scale(0); opacity: 0; }
        }
        @keyframes dash-icon-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes dash-ring-pulse {
          0%   { transform: scale(0.92); opacity: 0.5; }
          100% { transform: scale(1.1);  opacity: 0; }
        }
        @keyframes dash-icon-sparkle {
          0%, 100% { transform: rotate(0deg)  scale(1);    }
          25%       { transform: rotate(3deg)  scale(1.05); }
          75%       { transform: rotate(-3deg) scale(1.02); }
        }
        .dash-upgrade-icon-wrap {
          animation: dash-icon-float 3s ease-in-out infinite;
        }
        .dash-upgrade-icon-wrap::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 20px;
          border: 2px solid var(--color-amber);
          opacity: 0;
          animation: dash-ring-pulse 3s ease-out infinite;
        }
        .dash-upgrade-icon-wrap svg.dash-crown {
          animation: dash-icon-sparkle 3s ease-in-out infinite;
        }
        .dash-upgrade-sparkle:nth-child(1) { top: 2px;   left: 50%;  animation: dash-sparkle-pop 3s ease-in-out infinite 0s;   }
        .dash-upgrade-sparkle:nth-child(2) { top: 30%;   right: 0;   animation: dash-sparkle-pop 3s ease-in-out infinite 0.5s; }
        .dash-upgrade-sparkle:nth-child(3) { bottom: 2px; left: 30%; animation: dash-sparkle-pop 3s ease-in-out infinite 1s;   }
        .dash-upgrade-sparkle:nth-child(4) { top: 40%;   left: 0;    animation: dash-sparkle-pop 3s ease-in-out infinite 1.5s; }
      `}</style>

      <div
        className="relative flex items-center gap-5 overflow-hidden rounded-[14px] border my-4"
        style={{
          padding: "20px 24px",
          background: "var(--surface-card)",
          borderColor: "rgba(28,25,23,0.06)",
          boxShadow: "0 1px 3px rgba(28,25,23,0.04), 0 4px 12px -2px rgba(28,25,23,0.06)",
          minHeight: "88px",
        }}
      >
        {/* Dismiss button */}
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={() => setDismissed(true)}
          className="absolute flex items-center justify-center rounded-[6px] border-none bg-transparent transition-colors duration-[120ms] cursor-pointer hover:bg-[var(--surface-hover)]"
          style={{
            top: "10px",
            right: "10px",
            width: "24px",
            height: "24px",
            color: "var(--text-tertiary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-heading)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "14px", height: "14px" }}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div
          className="dash-upgrade-icon-wrap relative flex-shrink-0 grid place-items-center rounded-[16px]"
          style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, var(--color-amber-soft) 0%, #FDE68A 100%)",
          }}
        >
          {/* Sparkle dots */}
          <div className="pointer-events-none absolute" style={{ inset: "-10px" }}>
            <span className="dash-upgrade-sparkle absolute rounded-full" style={{ width: "5px", height: "5px", background: "var(--color-amber)" }} />
            <span className="dash-upgrade-sparkle absolute rounded-full" style={{ width: "5px", height: "5px", background: "var(--color-amber)" }} />
            <span className="dash-upgrade-sparkle absolute rounded-full" style={{ width: "5px", height: "5px", background: "var(--color-amber)" }} />
            <span className="dash-upgrade-sparkle absolute rounded-full" style={{ width: "5px", height: "5px", background: "var(--color-amber)" }} />
          </div>

          {/* Crown SVG */}
          <svg
            className="dash-crown"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "26px", height: "26px", color: "var(--color-amber-ink)" }}
          >
            <path d="M2 20h20" />
            <path d="M4 20V10l4 4 4-8 4 8 4-4v10" />
            <circle cx="4"  cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="6"  r="1" fill="currentColor" stroke="none" />
            <circle cx="20" cy="10" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-[10px]">
            <span
              className="text-[15px] font-bold tracking-[-0.01em]"
              style={{ color: "var(--text-heading)" }}
            >
              {title}
            </span>

            {/* Counter badge */}
            <span
              className="inline-flex flex-shrink-0 items-center gap-[6px] rounded-full text-[11px] font-semibold tracking-[-0.005em]"
              style={{
                padding: "5px 14px",
                background: "var(--color-amber-soft)",
                border: "1px solid rgba(245,158,11,0.2)",
                color: "var(--color-amber-ink)",
              }}
            >
              <span
                className="rounded-full flex-shrink-0"
                style={{ width: "6px", height: "6px", background: "var(--color-amber)" }}
              />
              {feedbackTicketsUsed} of {feedbackTicketsLimit} tickets used
            </span>
          </div>

          <p
            className="text-[14px] font-normal leading-[1.55]"
            style={{ color: "var(--text-secondary)" }}
          >
            {desc}
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => router.push("/settings?tab=billing")}
          className="relative z-10 inline-flex flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[12px] border-none text-[14px] font-semibold text-white transition-[transform,box-shadow] duration-[120ms] hover:-translate-y-px active:translate-y-0"
          style={{
            height: "42px",
            padding: "0 22px",
            background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-mid) 100%)",
            fontFamily: "inherit",
            letterSpacing: "-0.005em",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px -2px rgba(217,119,6,0.4)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px -2px rgba(217,119,6,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px -2px rgba(217,119,6,0.4)";
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "16px", height: "16px" }}
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          {cta}
        </button>
      </div>
    </>
  );
}
