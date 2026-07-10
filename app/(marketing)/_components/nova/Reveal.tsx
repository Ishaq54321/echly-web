"use client";

/**
 * <Reveal /> — shared fade-up-on-scroll wrapper for the redesigned marketing
 * surface. Mirrors the reference's GSAP `from(..., {opacity: 0, y: "1em"})`
 * entrances with an IntersectionObserver + the .nv-reveal CSS transition
 * (1s expo-out). `delay` staggers siblings via the --nv-delay custom prop.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

export function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  threshold = 0.2,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  /** ms before the transition starts once in view (for sibling staggers). */
  delay?: number;
  threshold?: number;
  children?: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const style: CSSProperties | undefined = delay
    ? ({ "--nv-delay": `${delay}ms` } as CSSProperties)
    : undefined;

  return (
    <Tag
      ref={ref}
      className={`nv-reveal${inView ? " is-in" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
