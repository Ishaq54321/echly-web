/**
 * Core-internal DOM helpers. Wraps external @/components/CaptureWidget imports
 * so core only imports from internal/*. Prepares for future decoupling.
 */
export { hideEchlyUI, restoreEchlyUI } from "@/components/CaptureWidget/hideEchlyUI";
export {
  detectVisualContainer,
  clampRect,
  cropImageToRegion,
} from "@/components/CaptureWidget/RegionCaptureOverlay";
export {
  createMarker,
  removeAllMarkers,
  updateMarker,
  removeMarker,
} from "@/components/CaptureWidget/session/feedbackMarkers";
