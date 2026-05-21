"use client";

import { useState } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import GlobalRail from "./GlobalRail";
import { MobileAppHeader } from "./MobileAppHeader";
import { MobileNavDrawer } from "./MobileNavDrawer";

export interface AppMobileShellProps {
  /** Rendered slot for "above the content card" placement (header on mobile). */
  slot?: "rail" | "header";
}

/**
 * Single responsive shell. Renders the desktop rail OR the mobile header+drawer
 * based on viewport, so GlobalRailContent only mounts once in the tree.
 *
 * SSR caveat: on first paint useIsMobile() returns false, so mobile devices see
 * a brief flash of the desktop rail during hydration (~50-200ms). This matches
 * the documented tradeoff in useIsMobile.
 */
export function AppMobileShell({ slot = "rail" }: AppMobileShellProps = {}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    if (slot === "header") {
      return (
        <>
          <MobileAppHeader onMenuClick={() => setOpen(true)} />
          <MobileNavDrawer open={open} onClose={() => setOpen(false)} />
        </>
      );
    }
    return null;
  }

  if (slot === "rail") {
    return <GlobalRail />;
  }
  return null;
}
