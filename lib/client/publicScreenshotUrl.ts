/**
 * Builds a public read URL for a feedback screenshot via the Firebase Storage JSON API.
 * Requires {@link process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET} (see `.env.example`).
 * Throws if the bucket env is missing; callers should catch and treat as unavailable.
 * Storage rules must allow public read for `sessions/{sessionId}/screenshots/{file}`.
 */
export function buildPublicScreenshotUrl(sessionId: string, screenshotId: string): string {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!bucket) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  }

  const path = `sessions/${sessionId}/screenshots/${screenshotId}.png`;
  const encodedPath = encodeURIComponent(path);

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
}
