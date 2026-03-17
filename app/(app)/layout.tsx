import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkspaceSuspendedGuard } from "@/components/workspace/WorkspaceSuspendedGuard";
import { BillingUsageProvider } from "@/lib/billing/BillingUsageProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceSuspendedGuard>
      <BillingUsageProvider>
        <div className="flex">
          <GlobalRail />
          <main className="flex-1 py-8 relative min-h-screen overflow-auto bg-white">
            <FloatingUtilityActions />
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
        <div className="fixed bottom-4 right-6 text-[11px] text-meta pointer-events-none">
          All changes saved • Secure session
        </div>
      </BillingUsageProvider>
    </WorkspaceSuspendedGuard>
  );
}
