/**
 * Shared context type for the Echly AI feedback pipeline.
 * Used by structure-feedback API, extension, and dashboard.
 * When DOM context (elements) exists, prefer it over OCR (visibleText).
 */

export interface PipelineContextElement {
  type: string;
  label?: string | null;
  text?: string | null;
  /** e.g. "button", "input", "heading" */
  role?: string | null;
}

export interface PipelineContext {
  url?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  /** Scroll position (for spatial viewport filtering). */
  scrollX?: number;
  scrollY?: number;
  devicePixelRatio?: number;
  domPath?: string | null;
  nearbyText?: string | null;
  /** OCR text from screenshot; used when elements not available */
  visibleText?: string | null;
  /** OCR text from screenshot when sent separately from visibleText. */
  screenshotOCRText?: string | null;
  /** Client-sent text for the DOM subtree at domPath (spatial scope). */
  subtreeText?: string | null;
  /** Weak selected element type hint for wording only. */
  elementType?: string | null;
  /** Structured DOM elements for disambiguation; prefer over visibleText when present */
  elements?: PipelineContextElement[];
  /** Legacy/compat: same as elements if needed */
  visibleElements?: PipelineContextElement[];
  interactiveElements?: PipelineContextElement[];
  formFields?: PipelineContextElement[];
  buttons?: PipelineContextElement[];
  headings?: PipelineContextElement[];
}
