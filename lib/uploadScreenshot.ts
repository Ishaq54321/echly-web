export type UploadScreenshotPayload = {
  imageDataUrl: string;
  sessionId: string;
  screenshotId: string;
};

export type UploadScreenshotResponse = {
  screenshotId: string;
  url?: string;
};

export type UploadScreenshotExecutor = (
  payload: UploadScreenshotPayload
) => Promise<UploadScreenshotResponse>;

export function createScreenshotId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function uploadScreenshot(
  input: {
    imageDataUrl: string;
    sessionId: string;
    screenshotId?: string;
  },
  executeUpload: UploadScreenshotExecutor
): Promise<UploadScreenshotResponse> {
  const imageDataUrl = typeof input.imageDataUrl === "string" ? input.imageDataUrl.trim() : "";
  const sessionId = typeof input.sessionId === "string" ? input.sessionId.trim() : "";

  if (!imageDataUrl) {
    throw new Error("Missing required field: imageDataUrl");
  }
  if (!sessionId) {
    throw new Error("Missing required field: sessionId");
  }

  const screenshotIdRaw =
    typeof input.screenshotId === "string" ? input.screenshotId.trim() : "";
  const screenshotId = screenshotIdRaw || createScreenshotId();

  const response = await executeUpload({
    screenshotId,
    imageDataUrl,
    sessionId,
  });

  const resolvedScreenshotId =
    typeof response?.screenshotId === "string" && response.screenshotId.trim()
      ? response.screenshotId.trim()
      : screenshotId;

  return {
    screenshotId: resolvedScreenshotId,
    url: response?.url,
  };
}
