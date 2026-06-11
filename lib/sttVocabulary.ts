/**
 * STT vocabulary seeding (the words the user is most likely to say are known
 * client-side before they speak).
 *
 * Builds the optional `prompt` sent with /api/transcribe-audio: a base
 * UI/dev vocabulary plus the clicked element's name and its neighborhood
 * names. Biases the transcription model toward "padding", "hex", "CTA",
 * "Choose Pro" instead of mangling them. Degrades to the base vocabulary
 * when no element context exists.
 */

import type { CaptureContext } from "@/lib/captureContext";

/** Keep comfortably under the STT model's ~224-token prompt window. */
const MAX_STT_PROMPT_CHARS = 600;
const MAX_ELEMENT_NAMES = 8;
const MAX_NAME_CHARS = 40;

/**
 * Terms real users dictate in UI feedback that generic STT mangles most:
 * CSS property names, units, and component vocabulary.
 */
const BASE_UI_VOCABULARY =
  "Feedback about a web page UI. Terms: padding, margin, font size, font weight, " +
  "pixels, px, rem, hex color, hashtag F F zero zero zero zero, CTA, call to action, " +
  "modal, tooltip, dropdown, placeholder, hover state, focus ring, breadcrumb, " +
  "viewport, z-index, border radius, box shadow, contrast, alignment, whitespace, " +
  "accordion, carousel, checkbox, toggle, nav bar, class name, btn-primary.";

/** Pull quoted names out of childrenList/siblingsList entries ('button: "Sign up"'). */
function extractQuotedNames(listText: string | null | undefined): string[] {
  if (!listText) return [];
  const names: string[] = [];
  const re = /"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(listText)) !== null) {
    const name = match[1].trim();
    if (!name || name === "(no label)") continue;
    names.push(name.slice(0, MAX_NAME_CHARS));
  }
  return names;
}

/**
 * Builds the transcription prompt. Pass the capture context when an element
 * was clicked before recording; null/undefined yields the base vocabulary.
 */
export function buildSttVocabularyPrompt(
  context?: Partial<CaptureContext> | null
): string {
  const names: string[] = [];
  if (context) {
    if (context.semanticIdentifier) {
      names.push(context.semanticIdentifier.slice(0, MAX_NAME_CHARS));
    }
    names.push(...extractQuotedNames(context.childrenList));
    names.push(...extractQuotedNames(context.siblingsList));
    if (context.pageH1) names.push(context.pageH1.slice(0, MAX_NAME_CHARS));
  }

  const unique = [...new Set(names)].slice(0, MAX_ELEMENT_NAMES);
  const prompt =
    unique.length > 0
      ? `${BASE_UI_VOCABULARY} On-page names: ${unique.map((n) => `"${n}"`).join(", ")}.`
      : BASE_UI_VOCABULARY;
  return prompt.slice(0, MAX_STT_PROMPT_CHARS);
}
