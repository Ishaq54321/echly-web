"use client";

import { WorkspaceStoreProvider } from "@/lib/client/workspaceStore";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceStoreProvider>
      <div style={{ height: "100dvh", overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
      <GlobalSearch />
    </WorkspaceStoreProvider>
  );
}
