"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

interface WorkspaceSuspendedGuardProps {
  children: React.ReactNode;
}

/**
 * Fetches workspace status in the background. If suspended, redirects to
 * /workspace-suspended after initial render so app UI is not blocked on status fetch.
 */
export function WorkspaceSuspendedGuard({ children }: WorkspaceSuspendedGuardProps) {
  const router = useRouter();
  const [suspended, setSuspended] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch("/api/workspace/status")
      .then((res) => {
        if (!res) return Promise.resolve({ suspended: false as boolean | undefined });
        return res.json();
      })
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

  return <>{children}</>;
}
