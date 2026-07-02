import React from "react";

/**
 * Shared marketing nav destinations — the single source of truth for both the
 * desktop header (MarketingHeader) and the mobile full-screen menu
 * (MarketingMobileNav), so the two can never drift out of sync.
 *
 * Plain data module (no "use client", no server-only): safe to import from
 * both server and client components.
 */

export type UseCase = {
  label: string;
  href: string;
  desc: string;
  icon: React.ReactNode;
};

// "Use cases" group — the three reviewer-facing pages. Agencies and Teams stay
// as their own top-level items (see NAV_LINKS).
export const USE_CASES: ReadonlyArray<UseCase> = [
  {
    label: "QA testing",
    href: "/use-cases/qa-testing",
    desc: "Bug reports with the console, network, and steps attached.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2v3M16 2v3M9 9h6M9 13h6M9 17h3" />
        <rect x="4" y="5" width="16" height="17" rx="2" />
      </svg>
    ),
  },
  {
    label: "Design review",
    href: "/use-cases/design-review",
    desc: "Feedback pinned to the exact element on the live page.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    label: "Client feedback",
    href: "/use-cases/client-feedback",
    desc: "One link your client opens — no account, no install.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
      </svg>
    ),
  },
];

export const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Agencies", href: "/use-cases/agencies" },
  { label: "Teams", href: "/use-cases/teams" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];
