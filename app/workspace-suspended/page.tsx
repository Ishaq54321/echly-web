"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

export default function WorkspaceSuspendedPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[var(--surface-subtle)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-hover)] text-[var(--text-secondary)]">
          <Lock className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Workspace Suspended
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Your workspace has been temporarily suspended by the administrator.
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          If you believe this is an error, please contact support.
        </p>
        <div className="mt-6">
          <Link
            href="mailto:support@echly.com"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-body)] shadow-sm transition hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
