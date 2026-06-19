/**
 * Frame + optimize the raw 2x captures into a consistent docs image set.
 *
 * Every raw shot (varying aspect: tall Dev Tools panels, wide-short headers,
 * full pages) is composited onto a uniform 1600x800 (2:1) canvas — matching the
 * docs slot ratio — centered and contained with padding, with rounded corners +
 * a hairline border so it reads as a clean screenshot inside the docs .frame.
 * Output is WebP (retina-sharp, ~60-150KB) at public/docs/assets/<id>.webp.
 *
 * Run:  npx tsx scripts/docsCapture/optimize.ts
 */
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";

const SRC = "public/docs/assets/shots";
const OUT = "public/docs/assets";
const CW = 1600, CH = 800, PAD = 60, RADIUS = 14;
const BG = "#F6F4FA";        // faint brand-tint stage, distinct from the white .frame
const BORDER = "#E7E2EE";    // hairline matching docs --paper-line
// Tall Dev Tools panels are captured full-height; trim their empty bottom/side
// whitespace so the content scales wider on the canvas instead of a thin strip.
const TRIM = new Set(["tic-1", "tic-2", "cap-3"]);

async function frame(id: string) {
  const inPath = `${SRC}/${id}.png`;
  const maxW = CW - 2 * PAD, maxH = CH - 2 * PAD;
  let base = sharp(inPath);
  if (TRIM.has(id)) {
    try { base = sharp(await base.trim({ threshold: 18 }).toBuffer()); }
    catch { base = sharp(inPath); }
  }
  const resized = base.resize(maxW, maxH, { fit: "inside", withoutEnlargement: false });
  const { data, info } = await resized.png().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  const roundMask = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`,
  );
  const rounded = await sharp(data).composite([{ input: roundMask, blend: "dest-in" }]).png().toBuffer();
  const borderOverlay = Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${RADIUS}" ry="${RADIUS}" fill="none" stroke="${BORDER}" stroke-width="1.25"/></svg>`,
  );
  const withBorder = await sharp(rounded).composite([{ input: borderOverlay }]).png().toBuffer();

  const left = Math.round((CW - w) / 2), top = Math.round((CH - h) / 2);
  await sharp({ create: { width: CW, height: CH, channels: 4, background: BG } })
    .composite([{ input: withBorder, left, top }])
    .webp({ quality: 84 })
    .toFile(`${OUT}/${id}.webp`);

  const kb = (statSync(`${OUT}/${id}.webp`).size / 1024).toFixed(0);
  console.log(`[opt] ${id.padEnd(14)} ${w}x${h} -> ${CW}x${CH}  ${kb}KB`);
}

async function main() {
  const ids = readdirSync(SRC)
    .filter((f) => f.endsWith(".png") && !f.startsWith("probe"))
    .map((f) => f.replace(/\.png$/, ""));
  for (const id of ids) await frame(id);
  console.log(`\n[opt] framed ${ids.length} shots -> ${OUT}/*.webp`);
}
main().catch((e) => { console.error("[opt] FAILED:", e); process.exit(1); });
