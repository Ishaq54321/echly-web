import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceProvider } from "@/lib/client/workspaceContext";
import { WorkspaceOverviewProvider } from "@/lib/client/workspaceOverviewContext";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";
import { WorkspaceIdentityGate } from "@/components/workspace/WorkspaceIdentityGate";
import { BillingUsageCacheInitializer } from "@/components/billing/BillingUsageCacheInitializer";
import { SessionsSearchProvider } from "@/components/dashboard/context/SessionsSearchContext";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <WorkspaceSuspendedGuard>
      <WorkspaceIdentityGate>
        <BillingUsageCacheInitializer />
        <WorkspaceOverviewProvider>
          <SessionsSearchProvider>
            <div className="main-layout flex h-screen overflow-hidden">
              <GlobalRail />
              <div className="content-divider shrink-0" aria-hidden />
              <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
                <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                  <FloatingUtilityActions />
                  <ErrorBoundary>{children}</ErrorBoundary>
                </div>
              </main>
            </div>
            <GlobalSearch />
          </SessionsSearchProvider>
        </WorkspaceOverviewProvider>
        <div className="fixed bottom-4 right-6 text-[11px] text-meta pointer-events-none">
          All changes saved • Secure session
        </div>
      </WorkspaceIdentityGate>
      </WorkspaceSuspendedGuard>
    </WorkspaceProvider>
  );
}
