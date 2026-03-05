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
  /** Structured DOM elements for disambiguation; prefer over visibleText when present */
  elements?: PipelineContextElement[];
  /** Legacy/compat: same as elements if needed */
  visibleElements?: PipelineContextElement[];
  interactiveElements?: PipelineContextElement[];
  formFields?: PipelineContextElement[];
  buttons?: PipelineContextElement[];
  headings?: PipelineContextElement[];
}

/**
 * Build a single elements list from context for prompts (DOM over OCR).
 */
export function getElementsForPrompt(ctx: PipelineContext | null | undefined): PipelineContextElement[] {
  if (!ctx) return [];
  const from =
    ctx.elements ??
    ctx.visibleElements ??
    [
      ...(ctx.formFields ?? []),
      ...(ctx.buttons ?? []),
      ...(ctx.headings ?? []),
      ...(ctx.interactiveElements ?? []),
    ].filter(Boolean);
  if (from.length > 0) return from;
  return [];
}

/**
 * Text context for prompts: prefer visibleText; if not available use nearbyText or domPath.
 */
export function getTextContextForPrompt(ctx: PipelineContext | null | undefined): string {
  if (!ctx) return "";
  if (ctx.visibleText && ctx.visibleText.trim()) return ctx.visibleText.trim();
  const parts: string[] = [];
  if (ctx.nearbyText && ctx.nearbyText.trim()) parts.push(ctx.nearbyText.trim());
  if (ctx.domPath && ctx.domPath.trim()) parts.push(`DOM path: ${ctx.domPath.trim()}`);
  return parts.join("\n");
}

/**
 * Extract DOM phrases (labels, text) for grounding: entity matching against transcript clauses.
 * Used by the Grounding step between Perception and Understanding.
 */
export function getDomPhrasesFromContext(ctx: PipelineContext | null | undefined): string[] {
  const elements = getElementsForPrompt(ctx);
  const seen = new Set<string>();
  const phrases: string[] = [];
  for (const el of elements) {
    for (const raw of [el.label, el.text]) {
      if (raw == null || typeof raw !== "string") continue;
      const p = raw.trim();
      if (!p || p.length < 2) continue;
      const key = p.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      phrases.push(p);
    }
  }
  // Fallback: tokenize visibleText into short phrases (e.g. "Submit button" -> "Submit button", "button")
  const textContext = getTextContextForPrompt(ctx);
  if (phrases.length === 0 && textContext) {
    const words = textContext.split(/\s+/).filter((w) => w.length >= 2);
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/[^\w\s-]/g, "").trim();
      if (w && !seen.has(w.toLowerCase())) {
        seen.add(w.toLowerCase());
        phrases.push(w);
      }
      if (i < words.length - 1) {
        const two = `${words[i]} ${words[i + 1]}`.replace(/[^\w\s-]/g, "").trim();
        if (two.length >= 3 && !seen.has(two.toLowerCase())) {
          seen.add(two.toLowerCase());
          phrases.push(two);
        }
      }
    }
  }
  return phrases;
}
