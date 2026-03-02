import GlobalRail from "@/components/layout/GlobalRail";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <GlobalRail />
      <main className="flex flex-1 min-h-0 overflow-auto">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <div className="fixed bottom-4 right-6 text-[11px] text-neutral-400 pointer-events-none">
        All changes saved • Secure session
      </div>
    </div>
  );
}
