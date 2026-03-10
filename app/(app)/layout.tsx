import GlobalRail from "@/components/layout/GlobalRail";
import { FloatingUtilityActions } from "@/components/layout/FloatingUtilityActions";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <GlobalRail />
      <main className="relative flex flex-1 min-h-screen overflow-auto bg-white">
        <FloatingUtilityActions />
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <div className="fixed bottom-4 right-6 text-[11px] text-neutral-400 pointer-events-none">
        All changes saved • Secure session
      </div>
    </div>
  );
}
