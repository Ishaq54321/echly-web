"use client";

import { usePathname } from "next/navigation";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

export function FloatingUtilityActions() {
  const pathname = usePathname();
  const pathSegments = (pathname ?? "").split("/").filter(Boolean);
  const isDashboardSessionRoute =
    pathSegments[0] === "dashboard" &&
    pathSegments.length >= 2 &&
    !["sessions", "insights"].includes(pathSegments[1]);

  if (isDashboardSessionRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-[100] w-full shrink-0 bg-white">
      <GlobalHeader />
    </header>
  );
}
