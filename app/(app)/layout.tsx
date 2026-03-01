import GlobalRail from "@/components/layout/GlobalRail";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <GlobalRail />
      <main className="flex flex-1 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
