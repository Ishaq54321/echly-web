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
//
// Editorial fonts (Caveat / Fraunces / JetBrains Mono) are loaded here and
// exposed as CSS vars on the wrapper so any marketing section can reach for
// them without re-importing.

import { Caveat, Fraunces, JetBrains_Mono } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-caveat",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${caveat.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  );
}
