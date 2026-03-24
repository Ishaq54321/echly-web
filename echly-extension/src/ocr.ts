/**
 * Lightweight OCR for screenshot visible text. Runs in content script only.
 * Fail-silent: returns "" on any error. Does not block; run asynchronously.
 * Result: plain text, trimmed, max 2000 characters. Not stored in Firestore.
 */

const MAX_VISIBLE_TEXT_LENGTH = 2000;

export async function getVisibleTextFromScreenshot(
  imageDataUrl: string | null
): Promise<string> {
  if (!imageDataUrl || typeof imageDataUrl !== "string") return "";

  try {
    const Tesseract = await import("tesseract.js");
    const worker = await Tesseract.createWorker("eng", undefined, {
      logger: () => {},
    });
    const {
      data: { text },
    } = await worker.recognize(imageDataUrl);
    await worker.terminate();

    if (!text || typeof text !== "string") return "";
    const trimmed = text.replace(/\s+/g, " ").trim();
    return trimmed.slice(0, MAX_VISIBLE_TEXT_LENGTH);
  } catch (err) {
    console.error("[ECHLY] OCR getVisibleTextFromScreenshot failed", err);
    return "";
  }
}
