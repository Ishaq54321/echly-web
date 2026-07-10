// Marketing route group. Deliberately does NOT mount RootProviders or any
// auth/workspace provider — logged-out visitors should never trigger Firebase
// init or workspace fetches. The smart root in app/page.tsx redirects
// logged-in users to /dashboard before they reach any marketing surface.
//
// This layout is a deliberate pass-through: each marketing page composes its
// own chrome (MarketingHeader + MarketingFooter) inside the .marketing-root
// wrapper. What the layout DOES own is typography:
//
//   • Google Sans Flex — the display/body variable font of the redesigned
//     marketing surface (same face antigravity.google uses). Served from
//     fonts.googleapis.com; React 19 hoists the <link precedence> tags into
//     <head>. next/font can't load it (not in its manifest), hence the links.
//   • Google Sans Code — the mono "annotation" face for eyebrows/special text.
//   • Caveat / Fraunces / JetBrains Mono — legacy editorial fonts still used
//     by interior pages (docs, use-cases); kept as CSS vars.

import { Caveat, Fraunces, JetBrains_Mono } from "next/font/google";
import { MarketingFonts } from "./_components/MarketingFonts";

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
      <MarketingFonts />
      {children}
    </div>
  );
}
