import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const srcPath = resolve("public/annote-logo-full.svg");
const outDir = resolve("public/email");
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(srcPath);

const variants = [
  { name: "annote-logo.png", width: 212, height: 50 },
  { name: "annote-logo@2x.png", width: 212, height: 50 },
];

for (const v of variants) {
  const buf = await sharp(svg, { density: 600 })
    .resize({ width: v.width, height: v.height, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  writeFileSync(resolve(outDir, v.name), buf);
  console.log(`wrote ${v.name}: ${buf.length} bytes (${v.width}x${v.height})`);
}
