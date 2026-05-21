import { MarketingHeader } from "./_components/MarketingHeader";
import { MarketingFooter } from "./_components/MarketingFooter";

// Marketing route group. Deliberately does NOT mount RootProviders or any
// auth/workspace provider — logged-out visitors should never trigger Firebase
// init or workspace fetches. The smart root in app/page.tsx redirects
// logged-in users to /dashboard before they reach any marketing surface.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--surface-page)" }}
    >
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
