/**
 * Screenshot helpers for content script. No Firebase here; upload goes through background.
 */
export function generateFeedbackId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function uploadScreenshot(
  imageDataUrl: string,
  sessionId: string,
  feedbackId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "ECHLY_UPLOAD_SCREENSHOT", imageDataUrl, sessionId, feedbackId },
      (response: { url?: string; error?: string } | undefined) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.error) {
          reject(new Error(response.error));
          return;
        }
        if (response?.url) {
          resolve(response.url);
          return;
        }
        reject(new Error("No URL from background"));
      }
    );
  });
}
