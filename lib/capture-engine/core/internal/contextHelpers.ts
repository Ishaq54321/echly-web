/**
 * Core-internal context helpers. Wraps external captureContext import
 * so core only imports from internal/*. Prepares for future decoupling.
 */
export { buildCaptureContext } from "@/lib/captureContext";
