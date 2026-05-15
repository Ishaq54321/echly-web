export type ImproveAction =
  | "improve"
  | "polish"
  | "spelling"
  | "tone-professional"
  | "tone-casual"
  | "shorter"
  | "longer";

export const ACTION_LABELS: Record<ImproveAction, string> = {
  improve: "Improve description",
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
  improve:
    "Rewrite as a clear, useful ticket someone can act on. Fix grammar and tighten phrasing. Group related items so the structure tells a story. Lead with what's broken or needed; details follow. Keep every fact, number, name, version, URL, and error message exactly. Don't add information, requirements, or assumptions that aren't in the original.",

  polish:
    "Tighten the writing without restructuring. Improve word choices, smooth awkward phrasing, fix grammar. Keep the original order, voice, and length. Don't move sentences around or merge points. Don't add or remove information. Think of it as a final pass — keep what's there, just say it better.",

  spelling:
    "Fix only spelling, grammar, and punctuation. Don't rephrase, restructure, or expand. Keep the original voice including informal language, slang, and abbreviations. Keep all technical terms exact (function names, error codes, file paths). When in doubt, leave it.",

  "tone-professional":
    "Rewrite in clear, professional English. Replace casual language with precise equivalents. Avoid jargon and corporate filler (\"leverage\", \"circle back\", \"synergies\") — aim for direct and competent, not stiff. Don't restructure. No emojis. Keep the same approximate length. Keep every fact, measurement, and technical reference exactly. Don't add information.",

  "tone-casual":
    "Rewrite like you're explaining this to a teammate over Slack. Use contractions and everyday words. Stay clear and grounded — friendly, not goofy. No emojis. Don't restructure. Keep the same approximate length and every fact intact.",

  shorter:
    "Cut filler, hedging, and repetition. Compress multi-sentence points into single sentences where possible. Keep every number, name, version, URL, and error message. Keep the same structure and order. If the text is already concise or under 20 words, return it mostly unchanged — don't cut for the sake of cutting.",

  longer:
    "Add clarity where it helps the reader: spell out abbreviations, replace pronouns with specific names, briefly explain why something matters. Don't invent facts, examples, people, or details that aren't in the original. Don't pad — if the text is already clear, return it mostly unchanged. Keep the same structure.",
};

export function buildSystemPrompt(action: ImproveAction): string {
  return `You improve text. ${ACTION_INSTRUCTIONS[action]}

Preserve all formatting from the input exactly: bold, italic, strikethrough, bullet lists, ordered lists, task lists, inline code, code blocks, links, images, blockquotes, @mentions.

Do not use headings (#, ##, ###), tables, or horizontal rules. They are not supported and will render as plain text.

For multi-topic content, separate each topic with a bold label on its own line, followed by a blank line, then the related bullet list. Use blank lines between topic sections.

Example multi-topic format:

**Login issues**

- Cannot log in on iOS
- Reset password link broken

**Performance**

- App is slow on Android
- Crashes on launch

Preserve image markdown ![alt](url) and @mention text exactly.
Return ONLY the improved text. No commentary, no explanation, no code fences.`;
}
