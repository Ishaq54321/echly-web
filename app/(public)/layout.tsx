"use client";

import { WorkspaceProvider } from "@/lib/client/workspaceContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div style={{ height: "100dvh", overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
    </WorkspaceProvider>
  );
}
