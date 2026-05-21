import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
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
    default: "Annote — Feedback at the speed of seeing it",
    template: "%s · Annote",
  },
  description:
    "Click anywhere on any site. Speak in your own words. Annote turns it into a structured ticket inside a session you can share with one link.",
  openGraph: {
    title: "Annote",
    description: "Feedback at the speed of seeing it.",
    url: "/",
    siteName: "Annote",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annote",
    description: "Feedback at the speed of seeing it.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
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
      </body>
    </html>
  );
}