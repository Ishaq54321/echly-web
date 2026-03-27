import { authFetch } from "./authFetch";
import {
  uploadScreenshot as uploadScreenshotContract,
} from "./uploadScreenshot";

/** Generate a unique id for new feedback (use before upload when feedback doc does not exist yet). */
export function generateFeedbackId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Upload screenshot through the unified `/api/upload-screenshot` contract. */
export async function uploadScreenshot(
  imageDataUrl: string,
  sessionId: string,
  screenshotId?: string
): Promise<string> {
  const result = await uploadScreenshotContract(
    {
      imageDataUrl,
      sessionId,
      screenshotId,
    },
    async (payload) => {
      const res = await authFetch("/api/upload-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res) {
        return {
          screenshotId: payload.screenshotId,
          url: undefined,
        };
      }
      const data = (await res.json()) as {
        screenshotId?: string;
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      return {
        screenshotId: data.screenshotId || payload.screenshotId,
        url: data.url,
      };
    }
  );

  return result.screenshotId;
}