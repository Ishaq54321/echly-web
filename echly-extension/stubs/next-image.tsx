/**
 * Stub for next/image so CaptureWidget can be bundled for extension without changing its source.
 * Renders a plain img; in extension context resolves /Echly_logo.svg to extension asset URL.
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
    (src === "/Echly_logo.svg" || src.endsWith("Echly_logo.svg"))
  ) {
    return chrome.runtime.getURL("assets/Echly_logo.svg");
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
