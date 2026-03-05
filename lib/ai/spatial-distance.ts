/**
 * Spatial distance helper for the Spatial Context Anchoring System.
 * Used to discard candidates outside the capture region (~600px).
 */

export interface ElementBox {
  /** Left edge (viewport-relative or absolute). */
  x: number;
  /** Top edge. */
  y: number;
  width: number;
  height: number;
}

export interface CapturePoint {
  x: number;
  y: number;
}

/** Maximum distance (px) from capture point; candidates beyond this are discarded. */
export const SPATIAL_DISCARD_THRESHOLD_PX = 600;

/**
 * Compute distance from the center of an element box to the capture point.
 * Uses Euclidean distance. Returns distance in pixels.
 */
export function computeSpatialDistance(
  elementBox: ElementBox,
  capturePoint: CapturePoint
): number {
  const centerX = elementBox.x + elementBox.width / 2;
  const centerY = elementBox.y + elementBox.height / 2;
  const dx = centerX - capturePoint.x;
  const dy = centerY - capturePoint.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Returns true if the element is within the allowed spatial scope.
 * Use to discard candidates that are too far from the capture point.
 */
export function isWithinSpatialScope(
  elementBox: ElementBox,
  capturePoint: CapturePoint,
  maxDistancePx: number = SPATIAL_DISCARD_THRESHOLD_PX
): boolean {
  const distance = computeSpatialDistance(elementBox, capturePoint);
  return distance <= maxDistancePx;
}
