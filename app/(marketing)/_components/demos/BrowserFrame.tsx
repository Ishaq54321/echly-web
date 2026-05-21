import type { ReactNode } from "react";

// Presentational browser-chrome wrapper for marketing demos. Traffic lights
// + URL bar above the child content. No interactivity — purely visual.

export interface BrowserFrameProps {
  children: ReactNode;
  url?: string;
  theme?: "light" | "dark";
  className?: string;
}

export function BrowserFrame({
  children,
  url = "loomly.com/pricing",
  theme = "light",
  className,
}: BrowserFrameProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "#1A1A1A" : "var(--surface-card)";
  const border = isDark ? "var(--overlay-dark-border)" : "var(--border)";
  const chromeBg = isDark ? "#2A2A2A" : "var(--surface-subtle)";
  const urlBg = isDark ? "rgba(255,255,255,0.06)" : "var(--surface)";
  const urlColor = isDark ? "var(--overlay-dark-text-soft)" : "var(--text-body)";
  const trafficLights = ["#FF5F57", "#FEBC2E", "#28C840"];

  return (
    <div
      className={className}
      style={{
        borderRadius: "14px",
        overflow: "hidden",
        background: bg,
        border: `1px solid ${border}`,
        boxShadow:
          "0 30px 60px rgba(0,0,0,0.10), 0 12px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex h-10 items-center gap-3 px-4"
        style={{
          background: chromeBg,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          {trafficLights.map((color) => (
            <span
              key={color}
              className="block h-3 w-3 rounded-full"
              style={{ background: color }}
            />
          ))}
        </div>
        <div
          className="ml-2 flex-1 truncate rounded-full px-3 py-1 text-center text-xs"
          style={{
            background: urlBg,
            color: urlColor,
            border: `1px solid ${border}`,
            maxWidth: "440px",
            margin: "0 auto",
          }}
        >
          {url}
        </div>
        <div style={{ width: 54 }} aria-hidden />
      </div>
      <div>{children}</div>
    </div>
  );
}
