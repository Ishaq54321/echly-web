import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastProvider } from "@/components/dashboard/context/ToastContext";

// RootProviders intentionally NOT mounted at the root.
// It contains AppBootGate + WorkspaceProvider; the latter calls
// onAuthStateChanged on mount and fetches workspace data. Mounting it
// for logged-out marketing visitors would trigger Firebase init and
// stray fetches. Instead, RootProviders is mounted inside every
// authenticated-or-workspace-needing surface:
//   - app/(app)/layout.tsx
//   - app/admin/layout.tsx
//   - app/onboarding/layout.tsx
//   - app/(public)/layout.tsx
//   - app/invite/[token]/page.tsx (wraps page component)
//   - app/workspace-suspended/page.tsx (wraps page component)
// Marketing routes under app/(marketing)/ deliberately do NOT mount it.

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

const DEFAULT_BASE_URL = "https://annote.ai";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Annote — Report Bugs Fast, Fix Them Faster",
    template: "%s · Annote",
  },
  description:
    "Click anywhere on any site. Speak in your own words. Annote turns it into a structured ticket inside a session you can share with one link.",
  openGraph: {
    title: "Annote",
    description: "Report Bugs Fast, Fix Them Faster",
    url: "/",
    siteName: "Annote",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annote",
    description: "Report Bugs Fast, Fix Them Faster",
  },
  // TODO(manual): paste the Google Search Console HTML-tag verification code
  // here (search.google.com/search-console → Add property → annote.ai →
  // "HTML tag" method → copy just the `content="..."` value, not the whole
  // tag). Next injects it as <meta name="google-site-verification">.
  verification: {
    google: "PASTE_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE",
  },
};

// Organization schema — site-wide brand identity for Google's knowledge
// graph. Kept to fields we can state as fact; no invented ratings/reviews.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Annote",
  url: baseUrl,
  logo: `${baseUrl}/annote-logo-full.svg`,
  description:
    "Annote turns in-context feedback — a click and a voice note — into a structured, AI-diagnosed ticket your team can act on.",
  sameAs: ["https://www.linkedin.com/company/annoteai"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${dmSans.className} font-sans antialiased h-full overflow-y-auto`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <div className="env-canvas h-full flex flex-col">{children}</div>
        </ToastProvider>
        <Toaster
          position="bottom-right"
          expand={false}
          closeButton
          toastOptions={{
            style: {
              background: "var(--surface-card)",
              color: "var(--text-heading)",
              border: "1px solid var(--border)",
            },
          }}
        />
        {/* PERF (Batch 0.1): Vercel Speed Insights — real field metrics (LCP,
            INP, TTFB, CLS) once deployed. No-ops outside Vercel. */}
        <SpeedInsights />
      </body>
      {/* GA4 — loads site-wide only when NEXT_PUBLIC_GA_ID is set (no-op in
          local dev / preview where the env var is absent). */}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}