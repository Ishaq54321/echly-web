import { Fragment, type ReactNode } from "react";
import { renderHexInline } from "./renderHexInline";

interface RenderMarkdownInlineOptions {
  onHexEdit?: (params: {
    hex: string;
    matchIndex: number;
    anchorEl: HTMLElement | null;
  }) => void;
  /** Absolute offset of this segment within the source. Hex chips in the
   *  rendered output use absolute offsets so the save handler can replace
   *  the right occurrence. */
  lineOffset?: number;
}

type Mark = "bold" | "italic" | "strike" | "code" | "underline";

interface InlineToken {
  type: "text" | "link";
  /** Text content with markdown delimiters already stripped. */
  text: string;
  /** Offset of this token's first character in the source segment. */
  start: number;
  marks: Mark[];
  /** Link href, only set when type === "link". */
  href?: string;
}

/**
 * Whitelisted text colors — must match Toolbar.tsx TEXT_COLORS values.
 * Stored uppercase for comparison.
 */
const ALLOWED_TEXT_COLORS = new Set<string>([
  "#15101F",
  "#54495F",
  "#E5484D",
  "#F77E2C",
  "#EAB308",
  "#18794E",
  "#5A49BF",
]);

/**
 * Whitelisted background (highlight) colors — must match Toolbar.tsx BG_COLORS.
 */
const ALLOWED_BG_COLORS = new Set<string>([
  "#F5F5F5",
  "#FECACA",
  "#FED7AA",
  "#FEF08A",
  "#A7F3D0",
  "#DCD5F0",
  "#DDD6FE",
]);

/**
 * Parses a single line of inline markdown into a flat list of tokens with
 * active marks. Tokens preserve their `start` offset relative to the input,
 * so downstream code (hex-chip detection) can produce absolute offsets that
 * still address the raw markdown source.
 *
 * Supported syntax (mirrors what the editor produces):
 *  - **bold**
 *  - *italic* / _italic_
 *  - ~~strike~~
 *  - `inline code`
 *  - [text](href)
 *
 * Unmatched delimiters are treated as literal text.
 */
function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const marks: Mark[] = [];
  let buf = "";
  let bufStart = 0;
  let i = 0;

  const flushBuf = () => {
    if (buf.length === 0) return;
    tokens.push({ type: "text", text: buf, start: bufStart, marks: [...marks] });
    buf = "";
  };

  const startBuf = (pos: number) => {
    if (buf.length === 0) bufStart = pos;
  };

  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];

    // ** bold **
    if (c === "*" && next === "*") {
      const close = text.indexOf("**", i + 2);
      if (close > i + 1) {
        flushBuf();
        marks.push("bold");
        startBuf(i + 2);
        buf = text.slice(i + 2, close);
        flushBuf();
        marks.pop();
        i = close + 2;
        continue;
      }
    }

    // ~~ strike ~~
    if (c === "~" && next === "~") {
      const close = text.indexOf("~~", i + 2);
      if (close > i + 1) {
        flushBuf();
        marks.push("strike");
        startBuf(i + 2);
        buf = text.slice(i + 2, close);
        flushBuf();
        marks.pop();
        i = close + 2;
        continue;
      }
    }

    // * italic * (single asterisk; must not be inside word in a sloppy way —
    // we accept it as long as the closer exists)
    if (c === "*" && next !== "*") {
      const close = text.indexOf("*", i + 1);
      if (close > i) {
        const inner = text.slice(i + 1, close);
        // Avoid matching an empty pair as italic.
        if (inner.length > 0) {
          flushBuf();
          marks.push("italic");
          startBuf(i + 1);
          buf = inner;
          flushBuf();
          marks.pop();
          i = close + 1;
          continue;
        }
      }
    }

    // _italic_ — only when delimiter is at word boundary on both sides.
    if (c === "_") {
      const before = text[i - 1];
      const isBoundaryBefore = i === 0 || /[\s\W]/.test(before ?? "");
      if (isBoundaryBefore) {
        const close = text.indexOf("_", i + 1);
        if (close > i) {
          const after = text[close + 1];
          const isBoundaryAfter = close === text.length - 1 || /[\s\W]/.test(after ?? "");
          const inner = text.slice(i + 1, close);
          if (isBoundaryAfter && inner.length > 0) {
            flushBuf();
            marks.push("italic");
            startBuf(i + 1);
            buf = inner;
            flushBuf();
            marks.pop();
            i = close + 1;
            continue;
          }
        }
      }
    }

    // `code` — exception: hex chip detection should not run inside code, so we
    // emit a token with `code` mark and special-case rendering below.
    if (c === "`") {
      const close = text.indexOf("`", i + 1);
      if (close > i) {
        flushBuf();
        marks.push("code");
        startBuf(i + 1);
        buf = text.slice(i + 1, close);
        flushBuf();
        marks.pop();
        i = close + 1;
        continue;
      }
    }

    // [text](href)
    if (c === "[") {
      const labelEnd = text.indexOf("]", i + 1);
      if (labelEnd > i && text[labelEnd + 1] === "(") {
        const hrefEnd = text.indexOf(")", labelEnd + 2);
        if (hrefEnd > labelEnd + 1) {
          flushBuf();
          tokens.push({
            type: "link",
            text: text.slice(i + 1, labelEnd),
            start: i + 1,
            marks: [...marks],
            href: text.slice(labelEnd + 2, hrefEnd),
          });
          i = hrefEnd + 1;
          continue;
        }
      }
    }

    startBuf(i);
    buf += c;
    i++;
  }
  flushBuf();
  return tokens;
}

function wrapWithMarks(node: ReactNode, marks: Mark[], key: string): ReactNode {
  let out = node;
  // Apply marks innermost → outermost so DOM nesting reflects the order.
  // The visual result is the same regardless of order, but using a stable
  // order keeps React keys consistent on re-render.
  if (marks.includes("code")) {
    out = (
      <code
        key={`${key}-code`}
        className="font-mono text-[13px] text-[var(--text-secondary)]"
      >
        {out}
      </code>
    );
  }
  if (marks.includes("strike")) {
    out = <s key={`${key}-strike`}>{out}</s>;
  }
  if (marks.includes("underline")) {
    out = <u key={`${key}-u`}>{out}</u>;
  }
  if (marks.includes("italic")) {
    out = <em key={`${key}-em`}>{out}</em>;
  }
  if (marks.includes("bold")) {
    out = <strong key={`${key}-b`}>{out}</strong>;
  }
  return out;
}

interface ColorSpanSegment {
  kind: "color";
  property: "color" | "background-color";
  hex: string;
  inner: string;
}

interface PlainSegment {
  kind: "plain";
  text: string;
}

interface MentionSegment {
  kind: "mention";
  id: string;
  /** Display label including the leading "@" character (matches the editor output). */
  label: string;
  /** Raw markup span length, used to advance segOffset. */
  rawLength: number;
}

type Segment = ColorSpanSegment | PlainSegment | MentionSegment;

/**
 * Pre-scan for mention spans emitted by the TipTap Mention extension:
 *   <span ... data-type="mention" ... data-id="UID" ... data-label="Name" ... >@Name</span>
 *
 * Attribute order is not guaranteed (mergeAttributes from @tiptap/core), so we
 * match any `<span>` opening tag, then check its attribute soup for
 * `data-type="mention"` and capture `data-id` + the inner text. Non-matching
 * spans (e.g. color spans) are left untouched for the next pass.
 *
 * Returns a flat list of `mention` + `plain` segments covering the full input.
 */
function extractMentionSpans(text: string): Array<MentionSegment | PlainSegment> {
  const SPAN_OPEN_RE = /<span\b([^>]*)>/gi;
  const CLOSE_TAG = "</span>";

  const out: Array<MentionSegment | PlainSegment> = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  SPAN_OPEN_RE.lastIndex = 0;
  while ((match = SPAN_OPEN_RE.exec(text)) !== null) {
    const openStart = match.index;
    const openEnd = openStart + match[0].length;
    const attrs = match[1] ?? "";

    // Only handle mention spans here. Anything else is left as plain text
    // (color spans get picked up by the next pre-pass).
    if (!/\bdata-type\s*=\s*"mention"/i.test(attrs)) continue;

    const closeIdx = text.indexOf(CLOSE_TAG, openEnd);
    if (closeIdx === -1) continue; // no closer — let it fall through as plain text

    const idMatch = attrs.match(/\bdata-id\s*=\s*"([^"]*)"/i);
    const labelAttrMatch = attrs.match(/\bdata-label\s*=\s*"([^"]*)"/i);
    const innerText = text.slice(openEnd, closeIdx);
    // Inner text from renderHTML is "@Label". Prefer the inner text for display
    // (it's what was actually serialized) and fall back to data-label.
    const displayLabel = innerText || `@${labelAttrMatch?.[1] ?? ""}`;
    const id = idMatch?.[1] ?? "";

    if (openStart > cursor) {
      out.push({ kind: "plain", text: text.slice(cursor, openStart) });
    }
    const rawLength = closeIdx + CLOSE_TAG.length - openStart;
    out.push({ kind: "mention", id, label: displayLabel, rawLength });
    cursor = closeIdx + CLOSE_TAG.length;
    SPAN_OPEN_RE.lastIndex = cursor;
  }

  if (cursor < text.length) {
    out.push({ kind: "plain", text: text.slice(cursor) });
  }
  if (out.length === 0) {
    out.push({ kind: "plain", text });
  }
  return out;
}

/**
 * Pre-scan the input for whitelisted `<span style="color|background-color: #RRGGBB">…</span>`
 * patterns. Returns a flat list of segments where color spans are isolated
 * from surrounding plain text. This MUST run before hex-chip detection so the
 * #RRGGBB inside the `style=` attribute isn't accidentally rendered as a chip.
 *
 * Any HTML that does NOT match the strict whitelist (different property,
 * non-palette color, different format) is left in the plain text and will
 * fall through to be rendered as literal text by the inline tokenizer.
 */
function extractColorSpans(text: string): Segment[] {
  // Match opening color span: <span style="color: #RRGGBB"> or background-color
  const OPEN_RE = /<span\s+style\s*=\s*"(color|background-color)\s*:\s*(#[0-9A-Fa-f]{6})\s*"\s*>/i;
  const CLOSE_TAG = "</span>";

  const segments: Segment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const slice = text.slice(cursor);
    const openMatch = slice.match(OPEN_RE);
    if (!openMatch || openMatch.index === undefined) {
      segments.push({ kind: "plain", text: slice });
      break;
    }

    const openStart = cursor + openMatch.index;
    const openEnd = openStart + openMatch[0].length;

    // Plain text before the span.
    if (openStart > cursor) {
      segments.push({ kind: "plain", text: text.slice(cursor, openStart) });
    }

    // Find matching close tag (no nesting support — color spans don't nest).
    const closeIdx = text.indexOf(CLOSE_TAG, openEnd);
    if (closeIdx === -1) {
      // No closer — treat the opener as literal text and stop scanning.
      segments.push({ kind: "plain", text: text.slice(openStart) });
      break;
    }

    const property = openMatch[1].toLowerCase() as "color" | "background-color";
    const hex = openMatch[2].toUpperCase();
    const allowedSet =
      property === "color" ? ALLOWED_TEXT_COLORS : ALLOWED_BG_COLORS;

    if (!allowedSet.has(hex)) {
      // Whitelist failure — render the span markup as literal text.
      segments.push({
        kind: "plain",
        text: text.slice(openStart, closeIdx + CLOSE_TAG.length),
      });
      cursor = closeIdx + CLOSE_TAG.length;
      continue;
    }

    const innerText = text.slice(openEnd, closeIdx);
    segments.push({
      kind: "color",
      property,
      hex,
      inner: innerText,
    });

    cursor = closeIdx + CLOSE_TAG.length;
  }

  // If we exited normally with cursor at end and no segments yet, push empty.
  if (segments.length === 0) {
    segments.push({ kind: "plain", text });
  }
  return segments;
}

function renderTokens(
  tokens: InlineToken[],
  keyPrefix: string,
  lineOffset: number,
  onHexEdit: RenderMarkdownInlineOptions["onHexEdit"],
): ReactNode[] {
  const nodes: ReactNode[] = [];

  tokens.forEach((tok, idx) => {
    const tokenAbsoluteOffset = lineOffset + tok.start;

    if (tok.type === "link") {
      const inner = renderHexInline(tok.text, `${keyPrefix}lk${idx}-`, {
        onHexEdit: onHexEdit
          ? (p) =>
              onHexEdit({ ...p, matchIndex: p.matchIndex + tokenAbsoluteOffset })
          : undefined,
      });
      nodes.push(
        <a
          key={`${keyPrefix}lk-${idx}`}
          href={tok.href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[var(--brand-text)] underline hover:opacity-80"
        >
          {wrapWithMarks(inner, tok.marks, `${keyPrefix}lkw-${idx}`)}
        </a>,
      );
      return;
    }

    let inner: ReactNode;
    if (tok.marks.includes("code")) {
      inner = tok.text;
    } else {
      inner = renderHexInline(tok.text, `${keyPrefix}t${idx}-`, {
        onHexEdit: onHexEdit
          ? (p) =>
              onHexEdit({ ...p, matchIndex: p.matchIndex + tokenAbsoluteOffset })
          : undefined,
      });
    }
    nodes.push(
      <Fragment key={`${keyPrefix}t-${idx}`}>
        {wrapWithMarks(inner, tok.marks, `${keyPrefix}tw-${idx}`)}
      </Fragment>,
    );
  });

  return nodes;
}

function renderPlainOrColorSegments(
  text: string,
  keyPrefix: string,
  startOffset: number,
  lineOffset: number,
  onHexEdit: RenderMarkdownInlineOptions["onHexEdit"],
): { nodes: ReactNode[]; consumed: number } {
  const segments = extractColorSpans(text);
  const nodes: ReactNode[] = [];
  let segOffset = startOffset;

  segments.forEach((seg, si) => {
    if (seg.kind === "plain") {
      const tokens = tokenizeInline(seg.text);
      nodes.push(
        <Fragment key={`${keyPrefix}s-${si}`}>
          {renderTokens(tokens, `${keyPrefix}s${si}-`, lineOffset + segOffset, onHexEdit)}
        </Fragment>,
      );
      segOffset += seg.text.length;
    } else if (seg.kind === "color") {
      const openTagApprox =
        seg.property === "background-color"
          ? `<span style="background-color: ${seg.hex}">`.length
          : `<span style="color: ${seg.hex}">`.length;
      const innerOffset = segOffset + openTagApprox;
      const tokens = tokenizeInline(seg.inner);
      const innerNodes = renderTokens(
        tokens,
        `${keyPrefix}s${si}-`,
        lineOffset + innerOffset,
        onHexEdit,
      );
      const style =
        seg.property === "color"
          ? { color: seg.hex }
          : { backgroundColor: seg.hex };
      nodes.push(
        <span key={`${keyPrefix}cs-${si}`} style={style}>
          {innerNodes}
        </span>,
      );
      segOffset += openTagApprox + seg.inner.length + "</span>".length;
    }
  });

  return { nodes, consumed: segOffset - startOffset };
}

export function renderMarkdownInline(
  text: string,
  keyPrefix = "",
  options?: RenderMarkdownInlineOptions,
): ReactNode {
  if (!text) return text;

  const lineOffset = options?.lineOffset ?? 0;
  const onHexEdit = options?.onHexEdit;

  // Step 1: split out mention spans (atomic — no inner formatting).
  // Step 2: for each remaining plain run, run the color-span pre-pass and
  //         then inline-markdown tokenization (existing pipeline).
  const mentionSegments = extractMentionSpans(text);

  const nodes: ReactNode[] = [];
  let segOffset = 0;

  mentionSegments.forEach((seg, mi) => {
    if (seg.kind === "mention") {
      nodes.push(
        <span key={`${keyPrefix}mn-${mi}`} className="mention-chip">
          {seg.label}
        </span>,
      );
      segOffset += seg.rawLength;
      return;
    }

    const { nodes: inner } = renderPlainOrColorSegments(
      seg.text,
      `${keyPrefix}m${mi}-`,
      segOffset,
      lineOffset,
      onHexEdit,
    );
    nodes.push(<Fragment key={`${keyPrefix}m-${mi}`}>{inner}</Fragment>);
    segOffset += seg.text.length;
  });

  return <>{nodes}</>;
}
