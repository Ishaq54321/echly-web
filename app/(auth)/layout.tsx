import "./auth.css";
import { DM_Sans, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
      {children}
    </div>
  );
}
