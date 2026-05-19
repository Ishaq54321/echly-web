"use client";

import dynamic from "next/dynamic";

// PERF: GlobalSearch is only visible on user action (Cmd+K / OPEN_SEARCH_EVENT).
// Defer its chunk out of the initial dashboard bundle. `ssr: false` requires a
// Client Component boundary, which this wrapper provides for the Server
// Component app layout.
const GlobalSearch = dynamic(
  () => import("./GlobalSearch").then((m) => ({ default: m.GlobalSearch })),
  { ssr: false }
);

export function LazyGlobalSearch() {
  return <GlobalSearch />;
}
