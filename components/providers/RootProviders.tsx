"use client";

import { AppBootGate } from "@/components/providers/AppBootGate";
import { WorkspaceProvider } from "@/lib/client/workspaceContext";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppBootGate>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </AppBootGate>
  );
}
