import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";
import { BillingUsageCacheInitializer } from "@/components/billing/BillingUsageCacheInitializer";
import { SessionsSearchProvider } from "@/components/dashboard/context/SessionsSearchContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceSuspendedGuard>
      <BillingUsageCacheInitializer />
      <SessionsSearchProvider>
        <div className="flex h-screen overflow-hidden">
          <GlobalRail />
          <main className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
              <FloatingUtilityActions />
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </main>
        </div>
      </SessionsSearchProvider>
      <div className="fixed bottom-4 right-6 text-[11px] text-meta pointer-events-none">
        All changes saved • Secure session
      </div>
    </WorkspaceSuspendedGuard>
  );
}
