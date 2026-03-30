"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { authFetch } from "@/lib/authFetch";
import AdminLayout from "@/components/admin/AdminLayout";
import { WorkspaceProvider, useWorkspace } from "@/lib/client/workspaceContext";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthGuard({ router, useReplace: true });
  const { authUid } = useWorkspace();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authUid) return;
    let cancelled = false;
    setError(null);
    authFetch("/api/admin/me")
      .then((res) => {
        if (!res) return { isAdmin: false };
        return res.json();
      })
      .then((envelope: { data?: { isAdmin?: boolean } | null }) => {
        if (!cancelled) {
          setAdminChecked(true);
          setIsAdmin(envelope?.data?.isAdmin === true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAdminChecked(true);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authUid]);

  useEffect(() => {
    if (authLoading || !adminChecked || !user || error) return;
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, adminChecked, error, isAdmin, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  if (!adminChecked) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-neutral-50 px-6">
        <div className="text-sm font-medium text-red-600">Could not verify admin access</div>
        <div className="max-w-md text-center text-sm text-neutral-600">{error.message}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </WorkspaceProvider>
  );
}
