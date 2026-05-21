import { AppMobileShell } from "@/components/layout/AppMobileShell";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceStoreProvider } from "@/lib/client/workspaceStore";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";
import { WorkspaceIdentityGate } from "@/components/workspace/WorkspaceIdentityGate";
import { BillingUsageCacheInitializer } from "@/components/billing/BillingUsageCacheInitializer";
import { LazyGlobalSearch } from "@/components/search/LazyGlobalSearch";
import { AppBootReadinessBridge } from "@/components/providers/AppBootGate";
import { RootProviders } from "@/components/providers/RootProviders";

// RootProviders is mounted here (was previously at the root layout). It
// contains AppBootGate (boot-readiness chrome context) + WorkspaceProvider
// (Firebase auth listener, workspace doc subscription, member fetches).
// Marketing routes under app/(marketing)/ deliberately don't mount it so
// logged-out visitors don't trigger Firebase init. The other authenticated
// surfaces (admin, onboarding, (public), invite, workspace-suspended) each
// mount RootProviders themselves so useWorkspace() works in those trees.

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProviders>
    <WorkspaceSuspendedGuard>
      <WorkspaceIdentityGate>
        <WorkspaceStoreProvider>
          <BillingUsageCacheInitializer />
          <AppBootReadinessBridge />
          <div className="main-layout flex h-[100dvh] overflow-hidden md:p-[14px] md:gap-[10px]">
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
    </RootProviders>
  );
}
