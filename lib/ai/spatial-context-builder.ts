/**
 * Spatial Context Builder — Generates spatially filtered context for AI reasoning.
 * Scopes all resolution to: DOM subtree → nearby → viewport → OCR fallback.
 */

import { echlyDebug } from "@/lib/utils/logger";

/** Input for building spatial context (from pipeline context + optional OCR). */
export interface SpatialContextInput {
  domPath?: string | null;
  visibleText?: string | null;
  /** From extension: string or array of text snippets near capture point. */
  nearbyText?: string | string[] | null;
  viewportWidth?: number;
  viewportHeight?: number;
  scrollX?: number;
  scrollY?: number;
  /** OCR text from screenshot; may be same as visibleText when OCR is the source. */
  screenshotOCRText?: string | null;
  /** Optional: client-sent text for the DOM subtree at domPath (most accurate). */
  subtreeText?: string | null;
}

/** Spatially scoped text regions for resolution priority. */
export interface SpatialContext {
  /** Text from the DOM subtree of the captured element (most accurate). */
  domScopeText: string;
  /** Text from elements within ~600px of capture point. */
  nearbyScopeText: string;
  /** Text inside the current viewport (scrollY to scrollY + viewportHeight). */
  viewportScopeText: string;
  /** OCR from screenshot (fallback only). */
  screenshotOCRText: string;
}

function safeTrim(s: string | null | undefined): string {
  if (s == null || typeof s !== "string") return "";
  return s.trim();
}

/** Normalize whitespace to single spaces and trim. */
function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const MIN_NEARBY_CHUNK_LENGTH = 4;

/**
 * Extract visible text from the DOM subtree at domPath.
 * Runs only in a DOM environment (browser/extension); returns [] on server.
 * Steps: locate element by domPath → traverse subtree → collect visible text → normalize.
 */
export function extractDomSubtreeText(domPath: string): string[] {
  if (typeof document === "undefined" || !domPath || !domPath.trim()) return [];
  try {
    const el = document.querySelector(domPath.trim());
    if (!el) return [];
    const raw =
      (el as HTMLElement).innerText ?? (el as HTMLElement).textContent ?? "";
    const lines = raw
      .split(/\n+/)
      .map((s) => normalizeWhitespace(s))
      .filter((s) => s.length > 0);
    return lines;
  } catch {
    return [];
  }
}

/**
 * Build nearby scope from extension nearbyText (string or array).
 * Normalizes and filters out very short chunks (length <= 3).
 */
function buildNearbyScopeText(nearbyText: string | string[] | null | undefined): string {
  if (nearbyText == null) return "";
  const rawChunks = Array.isArray(nearbyText)
    ? nearbyText.map((s) => normalizeWhitespace(String(s)).trim()).filter(Boolean)
    : normalizeWhitespace(String(nearbyText))
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
  const filtered = rawChunks.filter((s) => s.length > MIN_NEARBY_CHUNK_LENGTH);
  return filtered.join("\n");
}

/**
 * Build minimal spatial context for early extraction (Phase A).
 * Uses only context fields: no DOM access (extractDomSubtreeText), no async work.
 * Same shape as SpatialContext so extraction receives identical data structure.
 */
export function buildMinimalSpatialContext(input: SpatialContextInput | null | undefined): SpatialContext {
  if (!input || typeof input !== "object") {
    return {
      domScopeText: "",
      nearbyScopeText: "",
      viewportScopeText: "",
      screenshotOCRText: "",
    };
  }
  const domScopeText = safeTrim(input.subtreeText) || buildNearbyScopeText(input.nearbyText) || "";
  const nearbyScopeText = buildNearbyScopeText(input.nearbyText);
  const viewportScopeText = safeTrim(input.visibleText);
  const screenshotOCRText = safeTrim(input.screenshotOCRText) || safeTrim(input.visibleText) || "";
  return {
    domScopeText,
    nearbyScopeText,
    viewportScopeText,
    screenshotOCRText,
  };
}

/**
 * Build spatially filtered context from pipeline/context input.
 * All filtering is local; no network or DOM access.
 */
export function buildSpatialContext(input: SpatialContextInput | null | undefined): SpatialContext {
  if (!input || typeof input !== "object") {
    return {
      domScopeText: "",
      nearbyScopeText: "",
      viewportScopeText: "",
      screenshotOCRText: "",
    };
  }

  // DOM scope: prefer client-sent subtree text; else try extractDomSubtreeText(domPath); else fallback to nearby.
  let domScopeText = safeTrim(input.subtreeText);
  if (!domScopeText && input.domPath && input.domPath.trim()) {
    const subtreeLines = extractDomSubtreeText(input.domPath);
    domScopeText = subtreeLines.join("\n");
  }
  if (!domScopeText) {
    domScopeText = buildNearbyScopeText(input.nearbyText) || "";
  }

  // Nearby scope: from extension (string or array); normalize and drop chunks length <= 3.
  const nearbyScopeText = buildNearbyScopeText(input.nearbyText);

  // Viewport scope: filter visibleText to viewport when we have scroll/viewport.
  const rawVisible = safeTrim(input.visibleText);
  const viewportScopeText = rawVisible;

  // Screenshot OCR: explicit OCR field or visibleText when it comes from OCR.
  const screenshotOCRText =
    safeTrim(input.screenshotOCRText) || safeTrim(input.visibleText) || "";

  const result: SpatialContext = {
    domScopeText,
    nearbyScopeText,
    viewportScopeText,
    screenshotOCRText,
  };

  if (process.env.NODE_ENV === "development") {
    echlyDebug("SPATIAL DOM SCOPE SIZE", domScopeText.length);
    echlyDebug("NEARBY SCOPE SIZE", nearbyScopeText.length);
    echlyDebug("VIEWPORT SCOPE SIZE", viewportScopeText.length);
    echlyDebug("OCR SCOPE SIZE", screenshotOCRText.length);
    echlyDebug("DOM SCOPE SAMPLE", domScopeText.slice(0, 200) || "(empty)");
    echlyDebug("NEARBY SCOPE SAMPLE", nearbyScopeText.slice(0, 200) || "(empty)");
    echlyDebug("VIEWPORT SCOPE SAMPLE", viewportScopeText.slice(0, 200) || "(empty)");
  }

  return result;
}

/**
 * Return combined text from all scopes for search, in priority order.
 * Used by downstream AI text-matching helpers.
 */
export function getSpatialScopeLines(ctx: SpatialContext): { text: string; source: "dom" | "nearby" | "viewport" | "ocr" }[] {
  const lines: { text: string; source: "dom" | "nearby" | "viewport" | "ocr" }[] = [];
  if (ctx.domScopeText) lines.push({ text: ctx.domScopeText, source: "dom" });
  if (ctx.nearbyScopeText) lines.push({ text: ctx.nearbyScopeText, source: "nearby" });
  if (ctx.viewportScopeText) lines.push({ text: ctx.viewportScopeText, source: "viewport" });
  if (ctx.screenshotOCRText) lines.push({ text: ctx.screenshotOCRText, source: "ocr" });
  return lines;
}
