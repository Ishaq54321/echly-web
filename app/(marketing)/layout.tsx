// Marketing route group. Deliberately does NOT mount RootProviders or any
// auth/workspace provider — logged-out visitors should never trigger Firebase
// init or workspace fetches. The smart root in app/page.tsx redirects
// logged-in users to /dashboard before they reach any marketing surface.
//
// Phase 2A: the home page (rendered from app/page.tsx) composes its own
// chrome (AnnouncementBar + MarketingHeader + MarketingFooter) inside the
// .marketing-root wrapper. Future routes under (marketing)/ should also
// compose their own chrome — this layout is a deliberate pass-through so
// each page owns its top-level styling decisions.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
