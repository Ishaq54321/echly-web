"use client";

/**
 * <TypedText /> v2 — a typed headline that NEVER shifts layout.
 *
 * v1 typed by growing a substring, so line-wrapping changed as words completed
 * and the block "jumped". v2 renders the FULL text up front — every character
 * in its own invisible span, occupying its final position — and reveals them
 * one by one. Wrapping is identical from frame 0, so nothing moves.
 *
 * The caret is an absolutely-positioned element nested inside the next
 * character's span (zero layout impact); it travels through the text as
 * characters reveal and parks after the last one when done.
 *
 * `segments` supports multi-tone headlines with forced line breaks — e.g. the
 * reference's two-line landing headline with a dimmed second line.
 *
 * Accessibility: full text lives in a visually-hidden span; the animated copy
 * is aria-hidden. prefers-reduced-motion reveals everything immediately.
 */

import { useEffect, useMemo, useRef, useState } from "react";

export type TypedSegment = {
  text: string;
  /** extra class on this segment's characters (e.g. "nv-dim") */
  className?: string;
  /** force a line break BEFORE this segment */
  br?: boolean;
};

type Char = { ch: string; cls?: string; brBefore?: boolean };

export function TypedText({
  text,
  segments,
  startDelay = 150,
  speed = 55,
  caret = "persist",
}: {
  /** simple single-tone form; ignored when `segments` is given */
  text?: string;
  segments?: TypedSegment[];
  /** ms after entering the viewport before the first character. */
  startDelay?: number;
  /** ms per character. */
  speed?: number;
  /** "persist" keeps the caret blinking; "hide" fades it out when done. */
  caret?: "persist" | "hide";
}) {
  const segs = useMemo<TypedSegment[]>(
    () => segments ?? [{ text: text ?? "" }],
    [segments, text],
  );

  const chars = useMemo<Char[]>(() => {
    const out: Char[] = [];
    segs.forEach((seg) => {
      Array.from(seg.text).forEach((ch, i) => {
        out.push({
          ch,
          cls: seg.className,
          brBefore: i === 0 && seg.br === true,
        });
      });
    });
    return out;
  }, [segs]);

  const fullText = useMemo(
    () => segs.map((s) => (s.br ? "\n" : "") + s.text).join(""),
    [segs],
  );

  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  // Begin when scrolled into view (or immediately without IO / with RM).
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(chars.length);
      setStarted(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [chars.length]);

  // Reveal characters once started.
  useEffect(() => {
    if (!started || count >= chars.length) return;
    const delay = count === 0 ? startDelay : speed;
    const t = window.setTimeout(() => setCount((c) => c + 1), delay);
    return () => window.clearTimeout(t);
  }, [started, count, chars.length, startDelay, speed]);

  const done = count >= chars.length;
  // While typing the caret sits at the LEFT edge of the next (hidden) char;
  // when done it parks at the RIGHT edge of the last char.
  const caretIndex = done ? chars.length - 1 : count;
  const caretCls = done
    ? caret === "hide"
      ? "nv-caret nv-caret--abs nv-caret--end is-hidden"
      : "nv-caret nv-caret--abs nv-caret--end is-done"
    : "nv-caret nv-caret--abs";

  return (
    <span ref={ref} className="nv-typed">
      <span className="nv-sr">{fullText}</span>
      <span aria-hidden="true" translate="no">
        {chars.map((c, i) => (
          <span key={i} style={{ display: "contents" }}>
            {c.brBefore && <br />}
            <span
              className={`nv-tt-ch${c.cls ? ` ${c.cls}` : ""}${
                i < count ? "" : " is-pending"
              }`}
            >
              {c.ch}
              {caretIndex === i && <span className={caretCls} />}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
