/**
 * Intent-based ticket title generator.
 * Summarizes the core change from entity + action steps instead of concatenating steps.
 * Titles are short (~60 chars), readable, and PM-quality.
 *
 * Rules:
 * 1. Limit titles to ~60 characters.
 * 2. Use entity + action summary.
 * 3. If multiple actions exist, summarize the theme.
 */

const MAX_TITLE_LENGTH = 60;

/** Title-case entity for display (e.g. "present button" → "Present Button"). */
function capitalizeEntity(entity: string): string {
  const t = entity.trim();
  if (!t) return t;
  return t
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function truncateToMaxLen(s: string, maxLen: number): string {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen).trim();
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) return cut.slice(0, lastSpace);
  return cut;
}

/**
 * Generates a short, intent-based ticket title from primary entity and action steps.
 */
export function generateTicketTitle(entity: string, actionSteps: string[]): string {
  const stepText = actionSteps.join(" ").toLowerCase();
  const entityNorm = entity.trim().toLowerCase();
  const entityLabel = entityNorm ? capitalizeEntity(entityNorm) : "Layout";

  let title: string;

  const isFormValidation =
    stepText.includes("validation") ||
    stepText.includes("empty field") ||
    stepText.includes("show validation") ||
    ((stepText.includes("block") && stepText.includes("submission")) ||
      (stepText.includes("block") && (stepText.includes("email") || stepText.includes("password"))));
  const isImageLoading =
    stepText.includes("lazy load") ||
    stepText.includes("lazy loading") ||
    stepText.includes("compress") ||
    stepText.includes("loading skeleton");

  if (isFormValidation) {
    title = "Add validation for required form fields";
  } else if (isImageLoading) {
    title = "Optimize image loading performance";
  } else if (stepText.includes("move") || stepText.includes("layout") || (stepText.includes("reduce") && stepText.includes("hero")) || stepText.includes("signup button")) {
    title = entityNorm ? `Adjust ${entityLabel} layout` : "Adjust layout";
  } else if (stepText.includes("animation") || stepText.includes("speed")) {
    title = entityNorm ? `Optimize ${entityLabel} performance` : "Optimize performance";
  } else if (stepText.includes("visibility") || stepText.includes("increase") && stepText.includes("visibility")) {
    title = entityNorm ? `Increase ${entityLabel} visibility` : "Increase visibility";
  } else if (stepText.includes("size") && (stepText.includes("reduce") || stepText.includes("decrease"))) {
    title = entityNorm ? `Reduce ${entityLabel} size` : "Reduce size";
  } else if (
    stepText.includes("tracking") &&
    (stepText.includes("visibility") ||
      stepText.includes("prominence") ||
      stepText.includes("noticeable"))
  ) {
    title = entityNorm ? `Improve visibility and tracking for ${entityLabel}` : "Improve visibility and tracking";
  } else if (stepText.includes("tracking")) {
    title = entityNorm ? `Add analytics tracking for ${entityLabel}` : "Add analytics tracking";
  } else {
    title = entityNorm ? `${entityLabel} improvements` : "Requested UI changes";
  }

  return truncateToMaxLen(title, MAX_TITLE_LENGTH);
}
