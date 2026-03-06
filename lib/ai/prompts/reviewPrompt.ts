/**
 * Review prompt for low-confidence feedback pass.
 * Enforces strict interpreter rules — remove invented actions.
 */

export const REVIEW_PROMPT = `Review the transcript and the list of actions. Apply strict interpreter rules: remove any actions that contain content the user did not say (no invented text, headlines, or descriptions). Add only actions that were clearly in the transcript. Fix wording to reflect the user's words only; do not invent or guess. Return the same JSON shape: {"actions":[{"step":1,"description":"...","entity":"...","confidence":0.9}],"confidence":0.9,"notes":"..."}. JSON only.`;
