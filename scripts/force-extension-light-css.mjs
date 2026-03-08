/**
 * Post-process echly-extension/popup.css after build:extension:css so the
 * extension widget always uses light theme (no dark mode).
 * Reads popup.css, removes dark theme blocks, and forces light-only variables.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const popupCssPath = path.join(__dirname, "..", "echly-extension", "popup.css");

let css = fs.readFileSync(popupCssPath, "utf8");

// Remove #echly-root[data-theme="dark"] { ... } block (brace-balanced)
const darkBlockStart = css.indexOf('#echly-root[data-theme="dark"] {');
if (darkBlockStart !== -1) {
  const open = css.indexOf("{", darkBlockStart);
  let depth = 1;
  let i = open + 1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        css = css.slice(0, darkBlockStart) + css.slice(i + 1);
        break;
      }
    }
  }
}

// Replace #echly-root:not([data-theme]) with light variables and color-scheme: light
const fallbackRegex = /#echly-root:not\(\[data-theme\]\)\s*\{[\s\S]*?color-scheme:\s*dark;\s*\}/;
const lightFallback = `#echly-root:not([data-theme]) {
  --bg-primary: rgba(255, 255, 255, 0.92);
  --bg-surface: rgba(0, 0, 0, 0.04);
  --bg-surface-hover: rgba(0, 0, 0, 0.06);
  --text-primary: #111111;
  --text-secondary: rgba(0, 0, 0, 0.6);
  --border-subtle: rgba(0, 0, 0, 0.06);
  --button-primary-bg: #111111;
  --button-primary-text: #ffffff;
  --button-secondary-bg: rgba(0, 0, 0, 0.06);
  --button-secondary-text: #111111;
  --button-secondary-hover-bg: rgba(0, 0, 0, 0.1);
  --button-secondary-hover-text: #111111;
  --shadow-depth: 0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 12px 24px rgba(0, 0, 0, 0.08),
    0 24px 60px rgba(0, 0, 0, 0.06);
  --shadow-strong: 0 24px 64px rgba(0, 0, 0, 0.12);
  --bg-widget-gradient: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.98) 100%
  );
  --shadow-depth-recording: 0 0 0 1px rgba(0, 0, 0, 0.06),
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 12px 24px rgba(0, 0, 0, 0.08),
    0 20px 50px rgba(0, 0, 0, 0.06);
  --color-accent: #2563EB;
  --color-accent-soft: rgba(37, 99, 235, 0.1);
  --color-alert: #DC2626;
  --color-warning: #EA580C;
  --input-bg: rgba(0, 0, 0, 0.04);
  --input-border: rgba(0, 0, 0, 0.1);
  --input-border-focus: rgba(0, 0, 0, 0.2);
  --icon-color: rgba(0, 0, 0, 0.6);
  --icon-hover: rgba(0, 0, 0, 0.9);
  --bg-gradient-start: rgba(255, 255, 255, 0.98);
  --bg-gradient-end: rgba(248, 248, 249, 0.98);
  --priority-medium: rgba(0, 0, 0, 0.4);
  --priority-low: rgba(0, 0, 0, 0.25);
  --confirm-icon-hover-bg: rgba(0, 0, 0, 0.06);
  --confirm-icon-active-bg: rgba(0, 0, 0, 0.1);
  color-scheme: light;
}`;
css = css.replace(fallbackRegex, lightFallback);

// Remove #echly-root[data-theme="dark"] { color-scheme: dark; }
css = css.replace(/#echly-root\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark;\s*\}/g, "");

// Replace #echly-root[data-theme="light"] { color-scheme: light; } with #echly-root { color-scheme: light; } so root is always light
css = css.replace(
  /#echly-root\[data-theme="light"\]\s*\{\s*color-scheme:\s*light;\s*\}/g,
  "#echly-root { color-scheme: light; }"
);

// Normalize multiple adjacent newlines
css = css.replace(/\n{3,}/g, "\n\n");

fs.writeFileSync(popupCssPath, css, "utf8");
console.log("Extension CSS forced to light theme: echly-extension/popup.css");
