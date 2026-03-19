import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";
import { BillingUsageCacheInitializer } from "@/components/billing/BillingUsageCacheInitializer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceSuspendedGuard>
      <BillingUsageCacheInitializer />
      <div className="flex h-screen overflow-hidden">
        <GlobalRail />
        <main className="flex-1 h-full overflow-y-auto min-h-0 relative bg-white">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto min-h-0">
              <FloatingUtilityActions />
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
      <div className="fixed bottom-4 right-6 text-[11px] text-meta pointer-events-none">
        All changes saved • Secure session
      </div>
    </WorkspaceSuspendedGuard>
  );
}
