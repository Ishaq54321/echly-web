import "server-only";
import { getStorage } from "firebase-admin/storage";

export async function getSignedStorageUrl(
  storagePath: string,
  options?: {
    /** Override the default 10-year expiry — e.g. a short-lived URL handed to an external service. */
    expiresInMs?: number;
  }
): Promise<string> {
  const bucket = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
  const file = bucket.file(storagePath);

  const expiresInMs = options?.expiresInMs ?? 10 * 365 * 24 * 60 * 60 * 1000; // 10 years
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: new Date(Date.now() + expiresInMs),
  });

  return signedUrl;
}

export function extractStoragePathFromUrl(url: string): string | null {
  try {
    if (url.includes("firebasestorage.googleapis.com")) {
      const match = url.match(/\/o\/([^?]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    if (url.includes("storage.googleapis.com")) {
      const bucket = process.env.FIREBASE_STORAGE_BUCKET ?? "";
      const match = url.match(new RegExp(`${bucket}/(.+?)(?:\\?|$)`));
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}
