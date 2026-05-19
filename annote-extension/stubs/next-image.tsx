/**
 * Stub for next/image so CaptureWidget can be bundled for extension without changing its source.
 * Renders a plain img; in extension context resolves /annote-logo-icon.svg to extension asset URL.
 */
import React from "react";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

function resolveSrc(src: string): string {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime?.getURL &&
    (src === "/annote-logo-icon.svg" || src.endsWith("annote-logo-icon.svg"))
  ) {
    return chrome.runtime.getURL("assets/annote-logo-icon.svg");
  }
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime?.getURL &&
    (src === "/annote-logo-full.svg" || src.endsWith("annote-logo-full.svg"))
  ) {
    return chrome.runtime.getURL("assets/annote-logo-full.svg");
  }
  return src;
}

export default function Image({ src, alt, width, height, className }: Props) {
  return (
    <img
      src={resolveSrc(src)}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
