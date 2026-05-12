"use client";

import { createElement, memo, useMemo, type ReactNode } from "react";
import { renderMarkdownInline } from "@/components/tickets/renderMarkdownInline";
import { ImageBlock } from "./DescriptionEditor/ImageBlock";

type Segment = { text: string; offset: number };

type DescriptionBlock =
  | { kind: "para"; entries: Segment[] }
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string; offset: number }
  | {
      kind: "ul";
      items: Segment[];
    }
  | {
      kind: "ol";
      items: Segment[];
    }
  | {
      kind: "tasks";
      items: Array<Segment & { checked: boolean }>;
    }
  | {
      kind: "image";
      alt: string;
      url: string;
      width?: number;
      aspect?: number;
    }
  | { kind: "code"; content: string };

interface DescriptionMarkdownProps {
  text: string;
  isResolved: boolean;
  isReadOnly: boolean;
  onHexEdit?: (params: {
    hex: string;
    matchIndex: number;
    anchorEl: HTMLElement | null;
  }) => void;
}

const IMAGE_BLOCK_REGEX = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const IMAGE_HTML_REGEX = /^<img\s+([^>]+?)\s*\/?\s*>$/i;
const CODE_FENCE_REGEX = /^```/;

function parseHtmlImgAttrs(inner: string): {
  src?: string;
  alt?: string;
  width?: number;
  aspect?: number;
} {
  const out: { src?: string; alt?: string; width?: number; aspect?: number } = {};
  const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(inner)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2];
    if (name === "src") out.src = value;
    else if (name === "alt") out.alt = value;
    else if (name === "width") {
      const n = parseInt(value, 10);
      if (Number.isFinite(n) && n > 0) out.width = n;
    } else if (name === "data-aspect") {
      const n = parseFloat(value);
      if (Number.isFinite(n) && n > 0) out.aspect = n;
    }
  }
  return out;
}

function isSafeImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export const DescriptionMarkdown = memo(function DescriptionMarkdown({
  text,
  isResolved,
  isReadOnly,
  onHexEdit,
}: DescriptionMarkdownProps) {
  const blocks = useMemo<DescriptionBlock[]>(() => {
    // Defensive: legacy descriptions may contain "\\\n" (markdown hard-break).
    // After HardBreak was disabled, new content won't produce this, but
    // existing tickets in Firestore may have it. Convert to paragraph breaks.
    const normalized = text
      .replace(/\r\n/g, "\n")
      .replace(/\\\n/g, "\n\n")
      .replace(/[ ]{2,}\n/g, "\n\n");
    const lines = normalized.split("\n");

    const lineOffsets: number[] = [];
    {
      let acc = 0;
      for (const line of lines) {
        lineOffsets.push(acc);
        acc += line.length + 1;
      }
    }

    const out: DescriptionBlock[] = [];
    let currentPara: Segment[] = [];

    const flushPara = () => {
      if (currentPara.length > 0) {
        out.push({ kind: "para", entries: currentPara });
        currentPara = [];
      }
    };

    let li = 0;
    while (li < lines.length) {
      const raw = lines[li];
      const lineStart = lineOffsets[li];
      const trimmedRight = raw.trimEnd();

      // Fenced code block: ```...```
      if (CODE_FENCE_REGEX.test(trimmedRight)) {
        flushPara();
        const codeLines: string[] = [];
        li++;
        while (li < lines.length && !CODE_FENCE_REGEX.test(lines[li].trimEnd())) {
          codeLines.push(lines[li]);
          li++;
        }
        // Skip the closing fence if present.
        if (li < lines.length) li++;
        out.push({ kind: "code", content: codeLines.join("\n") });
        continue;
      }

      // Image block: ![alt](url) on its own line
      const imageMatch = trimmedRight.match(IMAGE_BLOCK_REGEX);
      if (imageMatch && isSafeImageUrl(imageMatch[2].trim())) {
        flushPara();
        out.push({
          kind: "image",
          alt: imageMatch[1],
          url: imageMatch[2].trim(),
        });
        li++;
        continue;
      }

      // HTML image: <img src="..." alt="..." width="..." data-aspect="..." />
      const htmlImgMatch = trimmedRight.match(IMAGE_HTML_REGEX);
      if (htmlImgMatch) {
        const attrs = parseHtmlImgAttrs(htmlImgMatch[1]);
        if (attrs.src && isSafeImageUrl(attrs.src)) {
          flushPara();
          out.push({
            kind: "image",
            alt: attrs.alt ?? "",
            url: attrs.src,
            width: attrs.width,
            aspect: attrs.aspect,
          });
          li++;
          continue;
        }
      }

      // Heading: 1-6 leading "#" followed by space.
      const headingMatch = trimmedRight.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushPara();
        const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
        const offsetInLine = headingMatch[1].length + 1; // "#"s + space
        out.push({
          kind: "heading",
          level,
          text: headingMatch[2],
          offset: lineStart + offsetInLine,
        });
        li++;
        continue;
      }

      // Task list: "- [ ] text" or "- [x] text"
      const taskMatch = trimmedRight.match(/^(\s*[-*]\s+)\[( |x|X)\]\s+(.+)$/);
      if (taskMatch) {
        flushPara();
        const prefixLen =
          (raw.indexOf(taskMatch[1]) >= 0 ? raw.indexOf(taskMatch[1]) : 0) +
          taskMatch[1].length +
          4; // "[ ] "
        const offset = lineStart + prefixLen;
        const checked = taskMatch[2].toLowerCase() === "x";
        const last = out[out.length - 1];
        const seg = { text: taskMatch[3], offset, checked };
        if (last && last.kind === "tasks") {
          last.items.push(seg);
        } else {
          out.push({ kind: "tasks", items: [seg] });
        }
        li++;
        continue;
      }

      // Bulleted list: "- text" or "* text"
      const bulletMatch = trimmedRight.match(/^(\s*[-*]\s+)(.+)$/);
      if (bulletMatch) {
        flushPara();
        const prefixIdx = raw.indexOf(bulletMatch[1]);
        const itemOffset =
          lineStart + (prefixIdx >= 0 ? prefixIdx + bulletMatch[1].length : 0);
        const last = out[out.length - 1];
        if (last && last.kind === "ul") {
          last.items.push({ text: bulletMatch[2], offset: itemOffset });
        } else {
          out.push({
            kind: "ul",
            items: [{ text: bulletMatch[2], offset: itemOffset }],
          });
        }
        li++;
        continue;
      }

      // Numbered list: "1. text"
      const olMatch = trimmedRight.match(/^(\s*\d+[.)]\s+)(.+)$/);
      if (olMatch) {
        flushPara();
        const prefixIdx = raw.indexOf(olMatch[1]);
        const itemOffset =
          lineStart + (prefixIdx >= 0 ? prefixIdx + olMatch[1].length : 0);
        const last = out[out.length - 1];
        if (last && last.kind === "ol") {
          last.items.push({ text: olMatch[2], offset: itemOffset });
        } else {
          out.push({
            kind: "ol",
            items: [{ text: olMatch[2], offset: itemOffset }],
          });
        }
        li++;
        continue;
      }

      if (trimmedRight.trim() === "") {
        flushPara();
      } else {
        currentPara.push({ text: trimmedRight, offset: lineStart });
      }
      li++;
    }
    flushPara();
    return out;
  }, [text]);

  if (blocks.length === 0) return null;

  const proseClass = `text-[15px] leading-[1.7] flex-1 ${isReadOnly ? "pr-0" : "pr-6"} ${
    isResolved
      ? "line-through text-[var(--text-tertiary)]"
      : "text-[var(--text-heading)]"
  }`;

  const buildHexEdit = (offset: number) =>
    onHexEdit
      ? (params: {
          hex: string;
          matchIndex: number;
          anchorEl: HTMLElement | null;
        }) => onHexEdit({ ...params, matchIndex: params.matchIndex + offset })
      : undefined;

  const renderInline = (segText: string, key: string, segOffset: number): ReactNode =>
    renderMarkdownInline(segText, key, {
      onHexEdit: buildHexEdit(segOffset),
      lineOffset: 0, // offsets are already absolute via buildHexEdit
    });

  return (
    <div className={proseClass}>
      {blocks.map((block, bi) => {
        if (block.kind === "heading") {
          const sizeCls = {
            1: "text-[24px] font-bold tracking-tight mt-4 mb-2",
            2: "text-[20px] font-bold tracking-tight mt-4 mb-2",
            3: "text-[17px] font-semibold mt-3 mb-1.5",
            4: "text-[15px] font-semibold mt-3 mb-1.5",
            5: "text-[14px] font-semibold mt-2 mb-1",
            6: "text-[13px] font-semibold uppercase tracking-wide mt-2 mb-1 text-[var(--text-secondary)]",
          }[block.level];
          return createElement(
            `h${block.level}`,
            {
              key: bi,
              className: `${sizeCls} ${bi === 0 ? "mt-0" : ""}`,
            },
            renderInline(block.text, `b${bi}-`, block.offset),
          );
        }

        if (block.kind === "ul") {
          return (
            <ul
              key={bi}
              className="list-disc pl-5 my-2 space-y-1 marker:text-[var(--text-tertiary)]"
            >
              {block.items.map((item, ii) => (
                <li key={ii}>
                  {renderInline(item.text, `b${bi}-i${ii}-`, item.offset)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "ol") {
          return (
            <ol
              key={bi}
              className="list-decimal pl-5 my-2 space-y-1 marker:text-[var(--text-tertiary)]"
            >
              {block.items.map((item, ii) => (
                <li key={ii}>
                  {renderInline(item.text, `b${bi}-i${ii}-`, item.offset)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.kind === "tasks") {
          return (
            <ul key={bi} className="list-none pl-0 my-2 space-y-1">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2">
                  <span
                    className={`mt-[6px] inline-flex items-center justify-center w-[14px] h-[14px] rounded-[3px] border ${
                      item.checked
                        ? "bg-[var(--brand)] border-[var(--brand)]"
                        : "bg-[var(--surface-card)] border-[var(--border-strong)]"
                    } flex-shrink-0`}
                    aria-hidden
                  >
                    {item.checked ? (
                      <svg
                        viewBox="0 0 16 16"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 8 6.5 11.5 13 5" />
                      </svg>
                    ) : null}
                  </span>
                  <span
                    className={
                      item.checked
                        ? "line-through text-[var(--text-tertiary)] flex-1"
                        : "flex-1"
                    }
                  >
                    {renderInline(item.text, `b${bi}-t${ii}-`, item.offset)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "image") {
          return (
            <ImageBlock
              key={bi}
              src={block.url}
              alt={block.alt}
              width={block.width}
              aspect={block.aspect}
              editable={false}
            />
          );
        }

        if (block.kind === "code") {
          return (
            <pre key={bi} className="description-editor-code-block">
              <code>{block.content}</code>
            </pre>
          );
        }

        return (
          <p key={bi} className={bi > 0 ? "mt-3" : ""}>
            {block.entries.map((entry, li) => (
              <span key={li}>
                {renderInline(entry.text, `b${bi}-l${li}-`, entry.offset)}
                {li < block.entries.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
});
