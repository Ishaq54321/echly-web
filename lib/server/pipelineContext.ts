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
  domPath?: string | null;
  nearbyText?: string | null;
  /** OCR text from screenshot; used when elements not available */
  visibleText?: string | null;
  /** Structured DOM elements for disambiguation; prefer over visibleText when present */
  elements?: PipelineContextElement[];
  /** Legacy/compat: same as elements if needed */
  visibleElements?: PipelineContextElement[];
  interactiveElements?: PipelineContextElement[];
  formFields?: PipelineContextElement[];
  buttons?: PipelineContextElement[];
  headings?: PipelineContextElement[];
}

const VALID_TAGS = ["UI", "Content", "UX", "Layout", "Bug", "Accessibility"] as const;
export type PipelineTag = (typeof VALID_TAGS)[number];
export function isValidPipelineTag(s: string): s is PipelineTag {
  return VALID_TAGS.includes(s as PipelineTag);
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
