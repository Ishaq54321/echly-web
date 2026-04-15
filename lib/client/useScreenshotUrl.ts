"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveScreenshotUrl } from "@/lib/client/screenshotResolver";

export function useScreenshotUrl(screenshotId: string | null | undefined) {
  const normalizedScreenshotId = useMemo(
    () => (typeof screenshotId === "string" ? screenshotId.trim() : ""),
    [screenshotId]
  );
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!normalizedScreenshotId) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void resolveScreenshotUrl(normalizedScreenshotId)
      .then((resolved) => {
        if (cancelled) return;
        setUrl((prev) => (prev === resolved ? prev : resolved));
        if (!resolved) {
          setError((prev) => (prev === "Screenshot unavailable" ? prev : "Screenshot unavailable"));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setUrl(null);
        setError((prev) => (prev === "Failed to load screenshot" ? prev : "Failed to load screenshot"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedScreenshotId]);

  return { url, loading, error };
}
