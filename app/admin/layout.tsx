"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { authFetch } from "@/lib/authFetch";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthGuard({ router, useReplace: true });
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    authFetch("/api/admin/me")
      .then((res) => res.json())
      .then((data: { isAdmin?: boolean }) => {
        if (!cancelled) {
          setAdminChecked(true);
          setIsAdmin(data.isAdmin === true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAdminChecked(true);
          setIsAdmin(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (authLoading || !adminChecked || !user) return;
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, adminChecked, isAdmin, user, router]);

  if (authLoading || !adminChecked || !user || !isAdmin) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
