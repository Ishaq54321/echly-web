import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/** Generate a unique id for new feedback (use before upload when feedback doc does not exist yet). */
export function generateFeedbackId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Upload a screenshot to Firebase Storage.
 * Path format: sessions/{sessionId}/feedback/{feedbackId}/{timestamp}.png
 * @param feedbackId - Must be the Firestore feedback doc id (existing or pre-generated via generateFeedbackId()).
 */
export async function uploadScreenshot(
  imageDataUrl: string,
  sessionId: string,
  feedbackId: string
): Promise<string> {
  const timestamp = Date.now();
  const path = `sessions/${sessionId}/feedback/${feedbackId}/${timestamp}.png`;

  const screenshotRef = ref(storage, path);

  await uploadString(
    screenshotRef,
    imageDataUrl,
    "data_url",
    {
      contentType: "image/png",
    }
  );

  return await getDownloadURL(screenshotRef);
}