/**
 * Extension popup.css is emitted by Tailwind; strip non-token color helpers so the
 * shipped bundle avoids rgb() fallbacks and color-mix() enhancements (fallback
 * declarations in each rule are retained).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const popupPath = path.join(root, "echly-extension", "popup.css");

let css = fs.readFileSync(popupPath, "utf8");

css = css.replace(/rgb\(0 0 0 \/ 0\.1\)/g, "var(--overlay-light)");

css = css.replace(
 /\s*@supports \(color: color-mix\(in lab, red, red\)\) \{\s*[^}]*\}\s*/gs,
 "\n"
);

css = css.replace(/0 0 #0000/g, "0 0 transparent");
css = css.replace(/initial-value: #fff;/g, "initial-value: var(--text-inverse);");
css = css.replace(/--tw-ring-offset-color: #fff;/g, "--tw-ring-offset-color: var(--text-inverse);");

fs.writeFileSync(popupPath, css);
fs.copyFileSync(popupPath, path.join(root, "public", "echly-popup.css"));
