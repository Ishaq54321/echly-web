import {
  uploadScreenshot as uploadScreenshotContract,
} from "@/lib/uploadScreenshot";

/**
 * Screenshot helpers for content script. No Firebase here; upload goes through background.
 */
export function generateFeedbackId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Upload screenshot and resolve with screenshotId when upload succeeds.
 */
export function uploadScreenshot(
  imageDataUrl: string,
  sessionId: string
): Promise<{ screenshotId: string; url?: string }> {
  return uploadScreenshotContract(
    {
      imageDataUrl,
      sessionId,
    },
    async (payload) =>
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "ECHLY_UPLOAD_SCREENSHOT",
            imageDataUrl: payload.imageDataUrl,
            sessionId: payload.sessionId,
            screenshotId: payload.screenshotId,
          },
          (response: { screenshotId?: string; url?: string; error?: string } | undefined) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            if (response?.error) {
              reject(new Error(response.error));
              return;
            }
            if (response?.screenshotId) {
              resolve({ screenshotId: response.screenshotId, url: response.url });
              return;
            }
            reject(new Error("No screenshotId from background"));
          }
        );
      })
  );
}
