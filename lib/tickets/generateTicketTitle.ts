const FILLER_VERBS = new Set([
  "increase",
  "decrease",
  "change",
  "update",
  "adjust",
  "move",
  "make",
  "add",
  "remove",
  "set",
  "modify",
]);

const LAYOUT_CUES = new Set([
  "spacing",
  "space",
  "gap",
  "gaps",
  "margin",
  "margins",
  "padding",
  "paddings",
  "align",
  "alignment",
  "position",
  "positions",
  "higher",
  "lower",
  "left",
  "right",
  "up",
  "down",
  "between",
]);

function normalizeToTokens(actionSteps: string[]): string[] {
  const combined = actionSteps.join(" ");
  const normalized = combined
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  return normalized
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !FILLER_VERBS.has(t));
}

function findFirstIndex(tokens: string[], candidates: string[]): number {
  let best = -1;
  for (const c of candidates) {
    const idx = tokens.indexOf(c);
    if (idx !== -1 && (best === -1 || idx < best)) best = idx;
  }
  return best;
}

function detectChangeType(normalizedText: string): "Update" | "Adjustment" | "Addition" | "Fix" {
  if (/\bfix\b/.test(normalizedText)) return "Fix";
  if (/\badd\b/.test(normalizedText)) return "Addition";
  if (/\b(increase|decrease|resize)\b/.test(normalizedText)) return "Adjustment";
  if (/\b(change|remove|update|modify|replace|move|set)\b/.test(normalizedText)) return "Update";
  return "Update";
}

function titleCaseWords(phrase: string): string {
  if (phrase === "UI") return "UI";
  return phrase
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pickNoun(tokens: string[], normalizedText: string): string {
  type Candidate = { noun: string; pos: number };
  const candidates: Candidate[] = [];

  const heroIdx = findFirstIndex(tokens, ["hero"]);
  const imageIdx = findFirstIndex(tokens, ["image"]);
  const videoIdx = findFirstIndex(tokens, ["video"]);
  if (heroIdx !== -1 && imageIdx !== -1) candidates.push({ noun: "hero image", pos: heroIdx });
  if (heroIdx !== -1 && videoIdx !== -1) candidates.push({ noun: "hero video", pos: heroIdx });

  const headlineIdx = findFirstIndex(tokens, ["headline"]);
  if (headlineIdx !== -1) candidates.push({ noun: "headline", pos: headlineIdx });

  const footerIdx = findFirstIndex(tokens, ["footer"]);
  const sectionIdx = findFirstIndex(tokens, ["section"]);
  if (footerIdx !== -1 && sectionIdx !== -1) candidates.push({ noun: "footer section", pos: footerIdx });
  if (footerIdx !== -1) candidates.push({ noun: "footer", pos: footerIdx });

  const pricingIdx = findFirstIndex(tokens, ["pricing"]);
  const tableIdx = findFirstIndex(tokens, ["table"]);
  if (pricingIdx !== -1 && tableIdx !== -1) candidates.push({ noun: "pricing table", pos: pricingIdx });
  if (tableIdx !== -1) candidates.push({ noun: "table", pos: tableIdx });

  const navIdx = findFirstIndex(tokens, ["navigation"]);
  const menuIdx = findFirstIndex(tokens, ["menu"]);
  if (navIdx !== -1 && menuIdx !== -1) candidates.push({ noun: "navigation menu", pos: Math.min(navIdx, menuIdx) });
  if (navIdx !== -1) candidates.push({ noun: "navigation", pos: navIdx });
  if (menuIdx !== -1) candidates.push({ noun: "menu", pos: menuIdx });

  const cardIdx = findFirstIndex(tokens, ["card", "cards"]);
  if (cardIdx !== -1) {
    const hasLayoutCue = tokens.some((t) => LAYOUT_CUES.has(t)) || /\b(spacing|gap|margin|padding)\b/.test(normalizedText);
    candidates.push({ noun: hasLayoutCue ? "card layout" : "card", pos: cardIdx });
  }

  const titleIdx = findFirstIndex(tokens, ["title"]);
  if (titleIdx !== -1) candidates.push({ noun: "title", pos: titleIdx });

  const buttonIdx = findFirstIndex(tokens, ["button"]);
  if (buttonIdx !== -1) candidates.push({ noun: "button", pos: buttonIdx });

  const formIdx = findFirstIndex(tokens, ["form"]);
  if (formIdx !== -1) candidates.push({ noun: "form", pos: formIdx });

  const logoIdx = findFirstIndex(tokens, ["logo"]);
  if (logoIdx !== -1) candidates.push({ noun: "logo", pos: logoIdx });

  const iconIdx = findFirstIndex(tokens, ["icon"]);
  if (iconIdx !== -1) candidates.push({ noun: "icon", pos: iconIdx });

  const imageOnlyIdx = findFirstIndex(tokens, ["image"]);
  if (imageOnlyIdx !== -1) candidates.push({ noun: "image", pos: imageOnlyIdx });

  const layoutIdx = findFirstIndex(tokens, ["layout"]);
  if (layoutIdx !== -1) candidates.push({ noun: "layout", pos: layoutIdx });

  const textIdx = findFirstIndex(tokens, ["text", "paragraph"]);
  if (textIdx !== -1) candidates.push({ noun: "text", pos: textIdx });

  const sectionOnlyIdx = findFirstIndex(tokens, ["section"]);
  if (sectionOnlyIdx !== -1) candidates.push({ noun: "section", pos: sectionOnlyIdx });

  if (candidates.length === 0) return "UI";

  candidates.sort((a, b) => a.pos - b.pos || a.noun.length - b.noun.length);
  return titleCaseWords(candidates[0].noun);
}

export function generateTicketTitle(actionSteps: string[]): string {
  const safeSteps = Array.isArray(actionSteps) ? actionSteps.filter((s): s is string => typeof s === "string") : [];
  const combined = safeSteps.join(" ");
  const normalizedText = combined
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = normalizeToTokens(safeSteps);
  const noun = pickNoun(tokens, normalizedText);
  const changeType = detectChangeType(normalizedText);

  const nounWords = noun.split(" ").filter(Boolean);
  const limitedNoun = nounWords.length > 3 ? nounWords.slice(0, 3).join(" ") : noun;
  const title = `${limitedNoun} ${changeType}`.trim();

  const words = title.split(" ").filter(Boolean);
  if (words.length <= 4) return title;

  return `${words.slice(0, 3).join(" ")} ${words[words.length - 1]}`.trim();
}

