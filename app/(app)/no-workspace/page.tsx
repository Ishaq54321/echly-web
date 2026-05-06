"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function NoWorkspacePage() {
  const handleSignOut = async () => {
    await signOut(auth).catch(() => void 0);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] flex flex-col items-center text-center">
        {/* Illustration */}
        <div style={{ width: 200, height: 160, marginBottom: 20 }}>
          <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
            <g transform="translate(100 86) translate(-40 -38)">
              <rect width="80" height="76" rx="6" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
              <rect x="12" y="14" width="14" height="14" rx="2" fill="#E5E7EB" />
              <rect x="34" y="14" width="14" height="14" rx="2" fill="#E5E7EB" />
              <rect x="56" y="14" width="14" height="14" rx="2" fill="#E5E7EB" />
              <rect x="12" y="36" width="14" height="14" rx="2" fill="#E5E7EB" />
              <rect x="34" y="36" width="14" height="14" rx="2" fill="#E5E7EB" />
              <rect x="56" y="36" width="14" height="14" rx="2" fill="#E5E7EB" />
              <rect x="32" y="58" width="16" height="18" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
            </g>
            <g transform="translate(146 112)">
              <circle cx="17" cy="17" r="14" fill="#6B7280" />
              <path d="M13 14 Q13 10 17 10 Q21 10 21 14 Q21 17 17 18 V20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="17" cy="23" r="1.4" fill="#fff" />
            </g>
          </svg>
        </div>

        <h1
          className="text-[var(--text-heading)] font-semibold"
          style={{ fontSize: 24, letterSpacing: "-0.3px", marginBottom: 12 }}
        >
          You&apos;re not in any workspace
        </h1>

        <p
          className="text-[var(--text-tertiary)]"
          style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 340, marginBottom: 28 }}
        >
          You&apos;ve been removed from your workspace, or your invitation has expired.
          Create your own workspace to get started, or ask someone to invite you.
        </p>

        <div className="w-full flex flex-col" style={{ gap: 10 }}>
          <Link
            href="/onboarding"
            className="w-full flex items-center justify-center text-white font-medium rounded-xl transition hover:brightness-105"
            style={{ height: 44, background: "var(--brand)", fontSize: 15 }}
          >
            Create a workspace
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center text-[var(--text-body)] font-medium rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--surface-hover)] transition"
            style={{ height: 40, fontSize: 15 }}
          >
            Sign out
          </button>
        </div>

        <p className="text-[var(--text-tertiary)] mt-8" style={{ fontSize: 13 }}>
          Need help?{" "}
          <a
            href="mailto:support@echly.com"
            className="hover:underline"
            style={{ color: "var(--brand-text)" }}
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
