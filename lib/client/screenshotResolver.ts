import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// \uD83D\uDEA8 ARCHITECTURE RULE:
// This is the ONLY place where getDownloadURL is allowed.
// Do NOT move this logic to components or backend.
const screenshotResolvedUrlCache = new Map<string, string | null>();
const screenshotResolvePromiseCache = new Map<string, Promise<string | null>>();

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
  const hasWorkspaceId =
    typeof workspaceId === "string" && workspaceId.trim() !== "";
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

export async function resolveScreenshotUrl(
  screenshotId: string | null | undefined
): Promise<string | null> {
  const id = typeof screenshotId === "string" ? screenshotId.trim() : "";
  if (!id) return null;

  if (screenshotResolvedUrlCache.has(id)) {
    return screenshotResolvedUrlCache.get(id) ?? null;
  }

  const inFlight = screenshotResolvePromiseCache.get(id);
  if (inFlight) return inFlight;

  const next = (async () => {
    try {
      const storagePath = await fetchScreenshotStoragePath(id);
      if (!storagePath) {
        screenshotResolvedUrlCache.set(id, null);
        return null;
      }

      try {
        console.log("\uD83E\uDDE0 [DEBUG] START RESOLVE", {
          screenshotId: id,
        });

        console.log("\uD83E\uDDE0 [DEBUG] STORAGE CONFIG", {
          bucket: storage?.app?.options?.storageBucket,
          projectId: storage?.app?.options?.projectId,
        });

        console.log("\uD83E\uDDE0 [DEBUG] STORAGE PATH", storagePath);

        const manualUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media`;

        console.log("\uD83E\uDDE0 [DEBUG] MANUAL URL", manualUrl);

        const fileRef = ref(storage, storagePath);

        console.log("\uD83E\uDDE0 [DEBUG] FILE REF", {
          fullPath: fileRef.fullPath,
          bucket: fileRef.bucket,
        });

        const url = await getDownloadURL(fileRef);

        console.log("\uD83E\uDDE0 [DEBUG] SUCCESS URL", url);

        screenshotResolvedUrlCache.set(id, url);
        return url;
      } catch (error: unknown) {
        logResolverFailure(id, error);

        screenshotResolvedUrlCache.set(id, null);
        return null;
      }
    } catch (error) {
      logResolverFailure(id, error);
      screenshotResolvedUrlCache.set(id, null);
      return null;
    } finally {
      screenshotResolvePromiseCache.delete(id);
    }
  })();

  screenshotResolvePromiseCache.set(id, next);
  return next;
}

export function clearScreenshotUrlCache(screenshotId?: string): void {
  if (!screenshotId) {
    screenshotResolvedUrlCache.clear();
    screenshotResolvePromiseCache.clear();
    return;
  }
  const id = screenshotId.trim();
  if (!id) return;
  screenshotResolvedUrlCache.delete(id);
  screenshotResolvePromiseCache.delete(id);
}
