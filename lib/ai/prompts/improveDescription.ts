export type ImproveAction =
  | "polish"
  | "spelling"
  | "tone-professional"
  | "tone-casual"
  | "shorter"
  | "longer";

export const ACTION_LABELS: Record<ImproveAction, string> = {
  polish: "Add polish",
  spelling: "Fix spelling & grammar",
  "tone-professional": "More professional",
  "tone-casual": "More casual",
  shorter: "Make shorter",
  longer: "Make longer",
};

export function isImproveAction(v: unknown): v is ImproveAction {
  return typeof v === "string" && (v as string) in ACTION_LABELS;
}

const ACTION_INSTRUCTIONS: Record<ImproveAction, string> = {
  polish:
    "Improve the writing. Fix grammar issues. Keep the meaning, facts, and approximate length.",
  spelling:
    "Fix spelling and grammar errors only. Do not rephrase or change wording unless grammatically incorrect. Preserve informal language, slang, and stylistic choices like 'lol' or 'tbh'.",
  "tone-professional":
    "Rewrite in a professional tone. Replace casual phrases and slang with formal equivalents. Avoid corporate jargon. Keep facts, technical terms, and approximate length.",
  "tone-casual":
    "Rewrite in a casual, conversational tone. Use contractions and everyday language. No slang or emojis. Keep facts and approximate length.",
  shorter:
    "Make it 30-40% shorter. Keep all numbers, names, dates, versions, file paths, URLs, and key conditions (when/where/who). Cut filler and redundancy.",
  longer:
    "Expand by 50-70%. Use transitions and clearer pronoun references. Do NOT invent facts or speculate. If too brief to expand faithfully, expand only as far as the facts allow.",
};

export function buildSystemPrompt(action: ImproveAction): string {
  return `You improve text. ${ACTION_INSTRUCTIONS[action]}

Preserve markdown formatting exactly (headings, lists, bold, italic, links, inline code, code blocks).
Preserve image markdown ![alt](url) and @mention text exactly.
Return ONLY the improved text. No commentary, no explanation, no code fences.`;
}
