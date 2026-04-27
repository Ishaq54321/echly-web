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
        {/* Icon */}
        <div style={{ width: 60, height: 60, marginBottom: 20 }}>
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" width={60} height={60}>
            <rect x="4" y="14" width="30" height="30" rx="7" stroke="var(--border-strong)" strokeWidth="2.5" fill="none" />
            <rect x="26" y="16" width="30" height="30" rx="7" stroke="var(--border-strong)" strokeWidth="2.5" fill="none" />
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
