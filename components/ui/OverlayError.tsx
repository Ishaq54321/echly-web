"use client";

import Link from "next/link";

export type OverlayErrorProps = {
  title: string;
  message: string;
  /** When true, show link to complete workspace onboarding. */
  showOnboardingLink?: boolean;
};

/**
 * Fixed overlay for workspace/identity errors. Does not unmount underlying UI.
 */
export function OverlayError({ title, message, showOnboardingLink }: OverlayErrorProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="echly-overlay-error-title"
    >
      <div className="w-full max-w-md rounded-[14px] border border-[var(--border)] bg-white px-6 pt-8 pb-7 text-center shadow-xl flex flex-col items-center">
        <div style={{ width: 160, height: 140, marginBottom: 20 }}>
          <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
            <g transform="translate(100 84) rotate(-3) translate(-50 -34)">
              <rect width="100" height="68" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
              <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#E5E7EB" />
              <rect x="14" y="30" width="60" height="4" rx="2" fill="#F3F4F6" />
              <rect x="14" y="40" width="48" height="4" rx="2" fill="#F3F4F6" />
            </g>
            <g transform="translate(142 108)">
              <circle cx="19" cy="19" r="16" fill="#6B7280" />
              <path d="M19 11 L28 25 H10 Z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
              <line x1="19" y1="17" x2="19" y2="21" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="19" cy="24" r="1.1" fill="#fff" />
            </g>
          </svg>
        </div>

        <p
          id="echly-overlay-error-title"
          className="text-[var(--text-heading)]"
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.005em", margin: "0 0 6px 0" }}
        >
          {title}
        </p>
        <p
          className="text-[var(--text-secondary)]"
          style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 280, margin: 0 }}
        >
          {message}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-3.5 text-[13px] font-medium text-[var(--text-heading)] hover:bg-[var(--surface-hover)]"
            style={{ height: 34 }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          {showOnboardingLink ? (
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[13px] font-medium text-white hover:opacity-90"
              style={{ height: 34 }}
            >
              Complete setup
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
