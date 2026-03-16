#!/usr/bin/env node
/**
 * Converts Echly_logo.svg to PNG sizes for Chrome extension.
 * Usage: node scripts/svg-to-extension-icons.mjs
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'echly-extension', 'assets', 'Echly_logo.svg');
const outDir = join(root, 'echly-extension', 'assets');
const sizes = [16, 32, 48, 128];

const { Resvg } = await import('@resvg/resvg-js');

const svg = await readFile(svgPath);
await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const outPath = join(outDir, `icon${size}.png`);
  await writeFile(outPath, pngBuffer);
  console.log(`Wrote ${outPath}`);
}

console.log('Done.');
