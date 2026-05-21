import { AppMobileShell } from "@/components/layout/AppMobileShell";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceStoreProvider } from "@/lib/client/workspaceStore";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";
import { WorkspaceIdentityGate } from "@/components/workspace/WorkspaceIdentityGate";
import { BillingUsageCacheInitializer } from "@/components/billing/BillingUsageCacheInitializer";
import { LazyGlobalSearch } from "@/components/search/LazyGlobalSearch";
import { AppBootReadinessBridge } from "@/components/providers/AppBootGate";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceSuspendedGuard>
      <WorkspaceIdentityGate>
        <WorkspaceStoreProvider>
          <BillingUsageCacheInitializer />
          <AppBootReadinessBridge />
          <div className="main-layout flex h-screen overflow-hidden md:p-[14px] md:gap-[10px]">
            {/* Responsive shell — renders desktop rail OR mobile drawer based
                on viewport, so GlobalRailContent only mounts once in the tree. */}
            <AppMobileShell slot="rail" />

            <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <AppMobileShell slot="header" />

              <div className="content-card flex-1 min-h-0 overflow-y-auto">
                <FloatingUtilityActions />
                <ErrorBoundary>{children}</ErrorBoundary>
              </div>
            </main>
          </div>
          <LazyGlobalSearch />
          <div className="fixed bottom-4 right-6 text-[12px] text-meta pointer-events-none">
            All changes saved • Secure session
          </div>
        </WorkspaceStoreProvider>
      </WorkspaceIdentityGate>
    </WorkspaceSuspendedGuard>
  );
}
