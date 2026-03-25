"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SystemNavigationRail } from "./operating-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CommandPalette from "@/components/system/CommandPalette";

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);

  const commandItems = [
    { id: "dashboard", title: "Go to Dashboard", meta: "/dashboard" },
    { id: "new-session", title: "New Session", meta: "Create a session" },
  ];

  const handleCommandSelect = useCallback(
    (id: string) => {
      if (id === "dashboard") router.push("/dashboard");
      if (id === "new-session") router.push("/dashboard?new=1");
      setCommandOpen(false);
    },
    [router]
  );

  return (
    <div className="flex flex-1 min-h-0">
      <SystemNavigationRail onOpenCommandPalette={() => setCommandOpen(true)} />
      <main className="relative z-0 flex-1 min-h-0 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <CommandPalette
        items={commandItems}
        onSelect={handleCommandSelect}
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
      <div className="fixed bottom-4 right-6 text-[11px] text-meta pointer-events-none">
        All changes saved • Secure session
      </div>
    </div>
  );
}
