"use client";

import { useMemo } from "react";
import {
  getScreenshotUrl,
  type ResolveScreenshotUrlOptions,
} from "@/lib/client/screenshotResolver";

export function useScreenshotUrl(
  screenshotId: string | null | undefined,
  options?: ResolveScreenshotUrlOptions
) {
  const sessionId = options?.sessionId?.trim() ?? "";

  // PERF R-016: single useMemo instead of three chained ones — same deps, one evaluation
  const { url, error } = useMemo(() => {
    const sid = typeof screenshotId === "string" ? screenshotId.trim() : "";
    const resolvedUrl = getScreenshotUrl(sid, { sessionId });
    const resolvedError =
      sid && sessionId && !resolvedUrl ? "Screenshot unavailable" : null;
    return { url: resolvedUrl, error: resolvedError };
  }, [screenshotId, sessionId]);

  return { url, loading: false, error };
}
