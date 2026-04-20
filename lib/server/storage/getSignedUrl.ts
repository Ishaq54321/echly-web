import "server-only";
import { getStorage } from "firebase-admin/storage";

export async function getSignedStorageUrl(storagePath: string): Promise<string> {
  const bucket = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
  const file = bucket.file(storagePath);

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
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
