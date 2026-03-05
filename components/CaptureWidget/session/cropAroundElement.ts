/**
 * Crop a full-tab screenshot around an element with padding.
 * Reuses cropImageToRegion from RegionCaptureOverlay.
 */

import { cropImageToRegion } from "../RegionCaptureOverlay";
import type { Region } from "../RegionCaptureOverlay";

const DEFAULT_PADDING = 40;

/**
 * Compute crop region in viewport coordinates (CSS pixels) for an element, with padding.
 * Clamped to viewport.
 */
export function getCropRegionForElement(
  element: Element,
  paddingPx: number = DEFAULT_PADDING,
  viewportWidth?: number,
  viewportHeight?: number
): Region {
  const rect = element.getBoundingClientRect();
  const vw = viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 0);
  const vh = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 0);
  const x = Math.max(0, rect.left - paddingPx);
  const y = Math.max(0, rect.top - paddingPx);
  const maxW = vw - x;
  const maxH = vh - y;
  const w = Math.min(rect.width + paddingPx * 2, maxW);
  const h = Math.min(rect.height + paddingPx * 2, maxH);
  return {
    x,
    y,
    w: Math.max(1, w),
    h: Math.max(1, h),
  };
}

/**
 * Crop full-tab image to region around element (with padding).
 */
export async function cropScreenshotAroundElement(
  fullImageDataUrl: string,
  element: Element,
  paddingPx: number = DEFAULT_PADDING
): Promise<string> {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const region = getCropRegionForElement(element, paddingPx);
  return cropImageToRegion(fullImageDataUrl, region, dpr);
}
