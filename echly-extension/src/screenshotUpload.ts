import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

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
    { contentType: "image/png" }
  );

  return await getDownloadURL(screenshotRef);
}
