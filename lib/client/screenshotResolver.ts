import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { getActiveShareToken } from "@/lib/client/shareToken";
import { db, storage } from "@/lib/firebase";

/**
 * How to turn a screenshotId into a browser-usable image URL.
 * - When `shareToken` is set: always same-origin `/api/screenshot/:id?token=...` (images cannot send Bearer headers).
 * - useClientFirebaseUrl: Firebase Web SDK {@link getDownloadURL} (viewer is signed in and in-bucket rules allow read).
 * - Otherwise: same-origin `/api/screenshot/:id` (session cookie).
 */
export type ResolveScreenshotUrlOptions = {
  useClientFirebaseUrl?: boolean;
  shareToken?: string;
  useSessionCookieProxy?: boolean;
};

const firebaseResolvedCache = new Map<string, string | null>();
const firebaseResolveInflight = new Map<string, Promise<string | null>>();

/** In-memory URL cache (proxy + Firebase) so revisiting a ticket skips resolver delay. */
const resolvedUrlMemoryCache = new Map<string, string>();

function resolveOptionsCacheKey(options?: ResolveScreenshotUrlOptions): string {
  if (!options) return "";
  return [
    options.useClientFirebaseUrl ? "1" : "0",
    options.useSessionCookieProxy ? "1" : "0",
    options.shareToken?.trim() ?? "",
  ].join("|");
}

function memoryCacheKey(screenshotId: string, options?: ResolveScreenshotUrlOptions): string {
  return `${screenshotId.trim()}|${resolveOptionsCacheKey(options)}`;
}

/**
 * Synchronous URL when no async work is needed, or when a prior resolve populated caches.
 * Used to paint the &lt;img&gt; src on the same frame as ticket selection.
 */
export function getScreenshotUrlSyncIfAvailable(
  screenshotId: string,
  options?: ResolveScreenshotUrlOptions
): string | null {
  const id = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!id) return null;

  const memHit = resolvedUrlMemoryCache.get(memoryCacheKey(id, options));
  if (memHit) return memHit;

  if (options?.useClientFirebaseUrl) {
    const fb = firebaseResolvedCache.get(id);
    return typeof fb === "string" && fb ? fb : null;
  }

  const proxyUrl = buildProxyScreenshotPath(id, options);
  resolvedUrlMemoryCache.set(memoryCacheKey(id, options), proxyUrl);
  return proxyUrl;
}

type ScreenshotDoc = {
  storagePath?: unknown;
  workspaceId?: unknown;
};

function logResolverFailure(screenshotId: string, error: unknown): void {
  const err = error as { code?: string; message?: string } | undefined;
  const errorCode = String(err?.code ?? err?.message ?? "");

  const isExpected =
    errorCode.includes("permission-denied") ||
    errorCode.includes("not-found") ||
    errorCode.includes("object-not-found");

  if (!isExpected) {
    console.error("[screenshotResolver] unexpected failure", {
      screenshotId,
      error,
    });
  } else {
    console.warn("[screenshotResolver] skipped (expected)", {
      screenshotId,
      reason: errorCode,
    });
  }
}

async function fetchScreenshotStoragePath(screenshotId: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "screenshots", screenshotId));
  if (!snap.exists()) return null;
  const data = snap.data() as ScreenshotDoc;
  const workspaceId = data.workspaceId;
  const hasWorkspaceId = typeof workspaceId === "string" && workspaceId.trim() !== "";
  if (!hasWorkspaceId) {
    return null;
  }
  const storagePath =
    typeof data.storagePath === "string" && data.storagePath.trim() !== ""
      ? data.storagePath
      : null;
  if (!storagePath) {
    console.error("[screenshotResolver] missing storagePath for screenshotId", {
      screenshotId,
    });
    return null;
  }
  return storagePath;
}

function buildProxyScreenshotPath(
  screenshotId: string,
  options?: ResolveScreenshotUrlOptions
): string {
  const path = `/api/screenshot/${encodeURIComponent(screenshotId)}`;
  const token = options?.shareToken?.trim();
  if (!token) return path;
  return `${path}?${new URLSearchParams({ token }).toString()}`;
}

/**
 * Merge router query + {@link getActiveShareToken} into resolve options so every
 * `/api/screenshot` request includes `?token=` when a share link is active.
 */
export function mergeScreenshotResolveOpts(
  options: ResolveScreenshotUrlOptions | undefined,
  searchParams: Pick<URLSearchParams, "get"> | null
): ResolveScreenshotUrlOptions | undefined {
  const qsTok =
    searchParams?.get("token")?.trim() ||
    searchParams?.get("shareToken")?.trim() ||
    "";
  const active = getActiveShareToken()?.trim() ?? "";
  const mergedShare =
    (active || qsTok || options?.shareToken?.trim() || "") || undefined;

  if (!options && !mergedShare) return undefined;

  const out: ResolveScreenshotUrlOptions = { ...(options ?? {}) };
  if (mergedShare) {
    out.shareToken = mergedShare;
  } else {
    delete out.shareToken;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

async function resolveViaFirebaseClient(screenshotId: string): Promise<string | null> {
  if (firebaseResolvedCache.has(screenshotId)) {
    return firebaseResolvedCache.get(screenshotId) ?? null;
  }

  const inFlight = firebaseResolveInflight.get(screenshotId);
  if (inFlight) return inFlight;

  const next = (async () => {
    try {
      const storagePath = await fetchScreenshotStoragePath(screenshotId);
      if (!storagePath) {
        firebaseResolvedCache.set(screenshotId, null);
        return null;
      }

      try {
        const fileRef = ref(storage, storagePath);
        const url = await getDownloadURL(fileRef);
        firebaseResolvedCache.set(screenshotId, url);
        return url;
      } catch (error: unknown) {
        logResolverFailure(screenshotId, error);
        firebaseResolvedCache.set(screenshotId, null);
        return null;
      }
    } catch (error) {
      logResolverFailure(screenshotId, error);
      firebaseResolvedCache.set(screenshotId, null);
      return null;
    } finally {
      firebaseResolveInflight.delete(screenshotId);
    }
  })();

  firebaseResolveInflight.set(screenshotId, next);
  return next;
}

export async function resolveScreenshotUrl(
  screenshotId: string | null | undefined,
  options?: ResolveScreenshotUrlOptions
): Promise<string | null> {
  const id = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!id) return null;

  const key = memoryCacheKey(id, options);
  const cached = resolvedUrlMemoryCache.get(key);
  if (cached) return cached;

  let resolved: string | null = null;
  const shareTok = options?.shareToken?.trim();
  if (shareTok) {
    resolved = buildProxyScreenshotPath(id, options);
  } else if (options?.useClientFirebaseUrl) {
    resolved = await resolveViaFirebaseClient(id);
  } else {
    resolved = buildProxyScreenshotPath(id, options);
  }

  if (resolved) {
    resolvedUrlMemoryCache.set(key, resolved);
  }
  return resolved;
}

export function clearScreenshotUrlCache(screenshotId?: string): void {
  if (!screenshotId) {
    firebaseResolvedCache.clear();
    firebaseResolveInflight.clear();
    resolvedUrlMemoryCache.clear();
    return;
  }
  const trimmed = screenshotId.trim();
  if (!trimmed) return;
  firebaseResolvedCache.delete(trimmed);
  firebaseResolveInflight.delete(trimmed);
  for (const k of resolvedUrlMemoryCache.keys()) {
    if (k.startsWith(`${trimmed}|`)) {
      resolvedUrlMemoryCache.delete(k);
    }
  }
}
