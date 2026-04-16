/**
 * Content-side OCR bridge.
 * OCR execution (tesseract.js) lives in background so content bundle stays slim.
 */

const MAX_VISIBLE_TEXT_LENGTH = 2000;

type OcrResponse = { success?: boolean; text?: string; error?: string } | undefined;

export async function getVisibleTextFromScreenshot(imageDataUrl: string | null): Promise<string> {
  if (!imageDataUrl || typeof imageDataUrl !== "string") return "";

  try {
    const response = (await chrome.runtime.sendMessage({
      type: "ECHLY_OCR_VISIBLE_TEXT",
      imageDataUrl,
    })) as OcrResponse;

    if (!response?.success || typeof response.text !== "string") return "";
    const trimmed = response.text.replace(/\s+/g, " ").trim();
    return trimmed.slice(0, MAX_VISIBLE_TEXT_LENGTH);
  } catch (err) {
    console.error("[ECHLY] OCR getVisibleTextFromScreenshot failed", err);
    return "";
  }
}
