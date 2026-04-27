import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
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
        className={`${dmSans.className} font-sans antialiased h-full overflow-y-auto`}
        suppressHydrationWarning
      >
        <div className="env-canvas h-full flex flex-col">{children}</div>
      </body>
    </html>
  );
}