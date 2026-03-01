/**
 * Screenshot capture. We do not use getDisplayMedia (screen-sharing API).
 * - In Chrome extension: capture is done in the background script via
 *   chrome.tabs.captureVisibleTab; content script requests it with CAPTURE_TAB.
 * - In web app: returns null (no screen capture without getDisplayMedia).
 */
export const captureScreenshot = async (): Promise<string | null> => {
  return null;
};
