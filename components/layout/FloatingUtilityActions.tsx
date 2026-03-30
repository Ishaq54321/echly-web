"use client";

import { usePathname } from "next/navigation";
import { GlobalHeader } from "@/components/layout/GlobalHeader";

export function FloatingUtilityActions() {
  const pathname = usePathname();
  const pathSegments = (pathname ?? "").split("/").filter(Boolean);
  /** Session detail / overview: session chrome (e.g. TopControlBar) replaces global header. */
  const isSessionFocusedView =
    (pathname ?? "").startsWith("/session/") ||
    (pathSegments[0] === "dashboard" &&
      pathSegments.length >= 2 &&
      !["sessions", "insights"].includes(pathSegments[1]));

  if (isSessionFocusedView) {
    return null;
  }

  return (
    <header className="sticky top-0 z-[100] w-full shrink-0 bg-white">
      <GlobalHeader />
    </header>
  );
}
