export type SupportedBrowser = "chrome" | "edge" | "other";

/**
 * Detect the host browser for showing the correct address-bar permission
 * affordance. We only special-case Chrome and Edge (the two we ship icons
 * for); everything else falls through to generic copy. Brave/Arc are
 * intentionally not detected — they don't expose themselves reliably in the
 * UA and we don't ship icons for them.
 */
export function detectBrowser(): SupportedBrowser {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  // Edge must be checked BEFORE Chrome — Edge's UA also contains "Chrome".
  if (/Edg\//.test(ua)) return "edge";
  if (/Chrome\//.test(ua) && !/OPR\//.test(ua) && !/Brave/i.test(ua)) {
    return "chrome";
  }
  return "other";
}
