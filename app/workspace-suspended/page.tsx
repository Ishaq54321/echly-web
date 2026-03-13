"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

export default function WorkspaceSuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Lock className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Workspace Suspended
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Your workspace has been temporarily suspended by the administrator.
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          If you believe this is an error, please contact support.
        </p>
        <div className="mt-6">
          <Link
            href="mailto:support@echly.com"
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
