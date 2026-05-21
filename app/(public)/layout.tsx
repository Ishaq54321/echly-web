"use client";

import { WorkspaceStoreProvider } from "@/lib/client/workspaceStore";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { RootProviders } from "@/components/providers/RootProviders";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // RootProviders supplies WorkspaceProvider so the guest viewer's
  // useWorkspace() call resolves. Previously inherited from the root layout.
  return (
    <RootProviders>
      <WorkspaceStoreProvider>
        <div style={{ height: "100dvh", overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
        <GlobalSearch />
      </WorkspaceStoreProvider>
    </RootProviders>
  );
}
