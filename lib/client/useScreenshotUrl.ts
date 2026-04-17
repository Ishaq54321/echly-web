"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getShareToken } from "@/lib/client/shareToken";
import {
  getScreenshotUrlSyncIfAvailable,
  mergeScreenshotResolveOpts,
  resolveScreenshotUrl,
  type ResolveScreenshotUrlOptions,
} from "@/lib/client/screenshotResolver";

function optionsKey(o: ResolveScreenshotUrlOptions | undefined): string {
  if (!o) return "";
  return [
    o.useClientFirebaseUrl ? "1" : "0",
    o.useSessionCookieProxy ? "1" : "0",
    o.shareToken?.trim() ?? "",
  ].join("|");
}

export function useScreenshotUrl(
  screenshotId: string | null | undefined,
  options?: ResolveScreenshotUrlOptions
) {
  const searchParams = useSearchParams();
  const querySignature = searchParams.toString();
  const sessionStoredShare = getShareToken()?.trim() ?? "";

  const effectiveOptions = useMemo(
    () => mergeScreenshotResolveOpts(options, searchParams),
    [
      options?.useClientFirebaseUrl,
      options?.useSessionCookieProxy,
      options?.shareToken,
      querySignature,
      sessionStoredShare,
    ]
  );

  const normalizedScreenshotId = useMemo(
    () => (typeof screenshotId === "string" ? screenshotId.trim() : ""),
    [screenshotId]
  );

  const resolveOptionsKey = useMemo(
    () => optionsKey(effectiveOptions),
    [effectiveOptions]
  );

  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!normalizedScreenshotId) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }
    const sync = getScreenshotUrlSyncIfAvailable(normalizedScreenshotId, effectiveOptions);
    if (sync) {
      setUrl(sync);
      setLoading(false);
      setError(null);
    } else {
      setUrl(null);
      setError(null);
    }
  }, [normalizedScreenshotId, resolveOptionsKey, effectiveOptions]);

  useEffect(() => {
    if (!normalizedScreenshotId) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    const sync = getScreenshotUrlSyncIfAvailable(normalizedScreenshotId, effectiveOptions);
    if (sync) {
      setUrl((prev) => (prev === sync ? prev : sync));
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void resolveScreenshotUrl(normalizedScreenshotId, effectiveOptions)
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
  }, [normalizedScreenshotId, resolveOptionsKey, effectiveOptions]);

  return { url, loading, error };
}
