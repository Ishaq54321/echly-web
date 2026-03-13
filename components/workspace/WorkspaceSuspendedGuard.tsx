"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

interface WorkspaceSuspendedGuardProps {
  children: React.ReactNode;
}

/**
 * Fetches current workspace status. If suspended, redirects to /workspace-suspended
 * so no workspace UI renders. Used in (app) layout.
 */
export function WorkspaceSuspendedGuard({ children }: WorkspaceSuspendedGuardProps) {
  const router = useRouter();
  const [suspended, setSuspended] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/workspace/status")
      .then((res) => res.json())
      .then((data: { suspended?: boolean }) => {
        if (!cancelled) setSuspended(data.suspended === true);
      })
      .catch(() => {
        if (!cancelled) setSuspended(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (suspended === true) {
      router.replace("/workspace-suspended");
    }
  }, [suspended, router]);

  if (suspended === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  if (suspended) {
    return null;
  }

  return <>{children}</>;
}
