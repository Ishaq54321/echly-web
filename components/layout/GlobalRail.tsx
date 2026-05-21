"use client";

import GlobalRailContent from "./GlobalRailContent";

interface GlobalRailProps {
  forceExpanded?: boolean;
  expandedWidthClass?: string;
  onForceClose?: () => void;
}

export default function GlobalRail(props: GlobalRailProps = {}) {
  return <GlobalRailContent variant="rail" {...props} />;
}
