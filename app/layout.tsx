import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { EchlyExtensionTokenProvider } from "@/components/EchlyExtensionTokenProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} font-sans antialiased h-full overflow-hidden`} suppressHydrationWarning>
        <div className="env-canvas h-screen flex flex-col">
          <EchlyExtensionTokenProvider />
          {children}
        </div>
      </body>
    </html>
  );
}