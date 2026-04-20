"use client";

import { WorkspaceProvider } from "@/lib/client/workspaceContext";
import { WorkspaceStoreProvider } from "@/lib/client/workspaceStore";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceStoreProvider>
        <div style={{ height: "100dvh", overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
        <GlobalSearch />
      </WorkspaceStoreProvider>
    </WorkspaceProvider>
  );
}
