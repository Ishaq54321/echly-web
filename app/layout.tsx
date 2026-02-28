import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { GlobalNavBar } from "@/components/layout/GlobalNavBar";

export const metadata: Metadata = {
  title: "Echly",
  description: "Structured AI-powered feedback workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full overflow-hidden">
        <div className="h-screen overflow-hidden flex flex-col">
          <GlobalNavBar />
          <main className="flex-1 min-h-0 pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}