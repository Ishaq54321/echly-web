import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/dashboard/context/ToastContext";
import { RootProviders } from "@/components/providers/RootProviders";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Annote",
  description: "Structured AI-powered feedback workspace",
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
          <RootProviders>
            <div className="env-canvas h-full flex flex-col">{children}</div>
          </RootProviders>
        </ToastProvider>
      </body>
    </html>
  );
}