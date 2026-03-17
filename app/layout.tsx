import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
      <body
        className={`${plusJakartaSans.className} font-sans antialiased min-h-screen overflow-y-auto`}
        suppressHydrationWarning
      >
        <div className="env-canvas min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}