/**
 * Generate PNG toolbar icons from Echly_logo_launcher.svg.
 * Chrome extensions cannot use SVG for toolbar icons.
 * Run: node echly-extension/scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "assets");
const svgPath = join(assetsDir, "Echly_logo_launcher.svg");
const sizes = [16, 32, 48, 128];

const svgBuffer = readFileSync(svgPath);

await Promise.all(
  sizes.map(async (size) => {
    const outPath = join(assetsDir, `icon${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Written ${outPath}`);
  })
);

console.log("Done.");
