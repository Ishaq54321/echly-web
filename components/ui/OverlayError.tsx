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
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-xl">
        <p id="echly-overlay-error-title" className="text-lg font-medium text-gray-900">
          {title}
        </p>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {showOnboardingLink ? (
            <Link
              href="/onboarding"
              className="rounded-lg bg-[#466EFF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Complete setup
            </Link>
          ) : null}
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
