import { Fragment, type ReactNode } from "react";
import { HexCode } from "@/components/ui/HexCode";

interface RenderHexInlineOptions {
  onHexEdit?: (params: {
    hex: string;
    matchIndex: number;
    anchorEl: HTMLElement | null;
  }) => void;
}

const HEX_PATTERN = /#[0-9A-Fa-f]{6}\b/g;
const RGB_PATTERN = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g;
const BORDER_COMBO_PATTERN = /\d+(?:\.\d+)?px\s+(?:solid|dashed|dotted)(?:\s+#[0-9A-Fa-f]{6})?/g;
const DIMENSION_PATTERN = /\b\d+x\d+px\b/g;
const MULTI_PX_PATTERN = /\b\d+(?:\.\d+)?px(?:\s+\d+(?:\.\d+)?px){1,3}\b/g;
const SINGLE_PX_PATTERN = /\b\d+(?:\.\d+)?px\b/g;
const REM_EM_PATTERN = /\b\d+(?:\.\d+)?(?:rem|em)\b/g;

type ChipType = "hex" | "rgb" | "border-combo" | "dimension" | "multi-px" | "px" | "rem-em";

const PATTERNS: Array<{ type: ChipType; regex: RegExp }> = [
  { type: "hex", regex: HEX_PATTERN },
  { type: "rgb", regex: RGB_PATTERN },
  { type: "border-combo", regex: BORDER_COMBO_PATTERN },
  { type: "dimension", regex: DIMENSION_PATTERN },
  { type: "multi-px", regex: MULTI_PX_PATTERN },
  { type: "px", regex: SINGLE_PX_PATTERN },
  { type: "rem-em", regex: REM_EM_PATTERN },
];

interface StyleMatch {
  type: ChipType;
  value: string;
  start: number;
  end: number;
  priority: number;
}

function findStyleValueMatches(text: string): StyleMatch[] {
  const matches: StyleMatch[] = [];

  PATTERNS.forEach(({ type, regex }, idx) => {
    const r = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = r.exec(text)) !== null) {
      matches.push({
        type,
        value: m[0],
        start: m.index,
        end: m.index + m[0].length,
        priority: PATTERNS.length - idx,
      });
    }
  });

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.priority - a.priority;
  });

  const filtered: StyleMatch[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }
  return filtered;
}

function stripBackticks(text: string): string {
  return text.replace(/`/g, "");
}

function StyleChip({ children }: { children: ReactNode }) {
  return (
    <span
      className={[
        "inline-flex items-center align-baseline px-1.5 py-[1px]",
        "bg-[var(--surface-subtle)] border border-[var(--hair)] rounded-[4px]",
        "text-[13px] font-mono text-[var(--text-body)]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/**
 * Splits a single line of description text into ReactNodes, replacing
 * CSS-specific style values with chips:
 * - Hex codes (#RRGGBB) → HexCode swatch chip (clickable when onHexEdit set)
 * - rgb()/rgba() colors → generic chip
 * - Pixel/rem/em values, dimensions, border combos → generic chip
 *
 * Plain English (color names, keywords, percentages, bare numbers) is left
 * untouched. Legacy backticks from older stored descriptions are stripped.
 *
 * `matchIndex` (position of the hex in the cleaned text) is forwarded to
 * onHexEdit so the same hex can appear multiple times and still be replaced
 * unambiguously.
 */
export function renderHexInline(
  text: string,
  keyPrefix = "",
  options?: RenderHexInlineOptions,
): ReactNode {
  if (!text) return text;

  const cleanText = stripBackticks(text);
  const matches = findStyleValueMatches(cleanText);

  if (matches.length === 0) return cleanText;

  const onHexEdit = options?.onHexEdit;
  const nodes: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((m, i) => {
    if (m.start > cursor) {
      nodes.push(
        <Fragment key={`${keyPrefix}t-${i}`}>
          {cleanText.slice(cursor, m.start)}
        </Fragment>,
      );
    }

    if (m.type === "hex") {
      const hex = m.value;
      const matchIndex = m.start;
      nodes.push(
        <HexCode
          key={`${keyPrefix}h-${i}`}
          hex={hex}
          onEdit={
            onHexEdit
              ? (anchorEl) => onHexEdit({ hex, matchIndex, anchorEl })
              : undefined
          }
        />,
      );
    } else {
      nodes.push(
        <StyleChip key={`${keyPrefix}c-${i}`}>{m.value}</StyleChip>,
      );
    }

    cursor = m.end;
  });

  if (cursor < cleanText.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}t-end`}>{cleanText.slice(cursor)}</Fragment>,
    );
  }

  return <>{nodes}</>;
}

export const renderStyleValues = renderHexInline;
