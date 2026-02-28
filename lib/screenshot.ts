import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadScreenshot(
  imageDataUrl: string,
  sessionId: string
): Promise<string> {
  const screenshotRef = ref(
    storage,
    `screenshots/${sessionId}/${Date.now()}.webp`
  );

  await uploadString(
    screenshotRef,
    imageDataUrl,
    "data_url",
    {
      contentType: "image/webp",
    }
  );

  return await getDownloadURL(screenshotRef);
}