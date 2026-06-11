/**
 * Shared context type for the Echly AI feedback pipeline.
 * Used by structure-feedback API, extension, and dashboard.
 */

export interface PipelineContext {
  url?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  /** Scroll position (for spatial viewport filtering). */
  scrollX?: number;
  scrollY?: number;
  devicePixelRatio?: number;
  /** Client-sent text for the DOM subtree of the selected element (spatial scope). */
  subtreeText?: string | null;
  /** Semantic type of the clicked element (button, link, input, heading, paragraph, image, icon, card, section). */
  semanticType?: "button" | "link" | "input" | "heading" | "paragraph" | "image" | "icon" | "card" | "section" | null;
  /** Best human-readable name for the clicked element (aria-label/alt/title/placeholder/innerText). */
  semanticIdentifier?: string | null;
  /** Computed styles for the clicked element (color, background, font-size, padding, size). */
  computedStyles?: string | null;
  /** Structured list of meaningful direct children (tag, name, brief styles) for disambiguation. */
  childrenList?: string | null;
  /** ARIA state of the clicked element (checked, expanded, selected, pressed, current). */
  elementState?: string;
  /** "disabled" if element has disabled or aria-disabled, otherwise empty. */
  disabledState?: string;
  /** Modal/dialog/popover context when element is inside one. */
  modalContext?: string;
  /** Current value of the input element (with privacy filtering). */
  inputValue?: string;
}
