// One-off generator for the From-click-to-ticket card placeholder images.
// Produces six labeled JPGs the user can swap-in-place without renaming.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd(), "public", "marketing");

const SLOTS = [
  // Card backdrops (sit behind the whole mockup)
  {
    dir: "backdrops",
    name: "capture-bg.jpg",
    w: 1200, h: 900,
    label: "CAPTURE · CARD BACKDROP",
    sub: "Replace at /public/marketing/backdrops/capture-bg.jpg",
    tone: "violet",
  },
  {
    dir: "backdrops",
    name: "voice-bg.jpg",
    w: 1200, h: 900,
    label: "VOICE · CARD BACKDROP",
    sub: "Replace at /public/marketing/backdrops/voice-bg.jpg",
    tone: "amber",
  },
  {
    dir: "backdrops",
    name: "sessions-bg.jpg",
    w: 1200, h: 900,
    label: "SESSIONS · CARD BACKDROP",
    sub: "Replace at /public/marketing/backdrops/sessions-bg.jpg",
    tone: "teal",
  },
];

const TONES = {
  // top-left + bottom-right stops for the gradient, plus an accent ring color
  violet: { a: "#EFEBF9", b: "#D6CCEC", accent: "#5A49BF" },
  amber:  { a: "#FBF6EE", b: "#F2E2C6", accent: "#C97A2B" },
  teal:   { a: "#F4F1EA", b: "#DDE9E5", accent: "#2F7A6E" },
};

function svgFor({ w, h, label, sub, name, tone }) {
  const { a, b, accent } = TONES[tone];
  // Place the label block 45% from the top, mono font, with a small accent dot.
  // Diagonal "PLACEHOLDER" watermark sits faintly across the middle.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,20,36,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none"
        stroke="${accent}" stroke-width="2" stroke-dasharray="10 8" opacity="0.55" rx="14"/>
  <text x="50%" y="50%" text-anchor="middle"
        font-family="ui-monospace, 'JetBrains Mono', Menlo, monospace"
        font-size="${Math.min(w, h) * 0.16}" font-weight="700"
        fill="rgba(26,20,36,0.08)" transform="rotate(-18 ${w / 2} ${h / 2})">
    PLACEHOLDER
  </text>
  <g transform="translate(${w / 2}, ${h * 0.42})">
    <circle cx="0" cy="-46" r="14" fill="${accent}"/>
    <text x="0" y="0" text-anchor="middle"
          font-family="ui-monospace, 'JetBrains Mono', Menlo, monospace"
          font-size="22" font-weight="700"
          letter-spacing="2" fill="#1A1424">${label}</text>
    <text x="0" y="34" text-anchor="middle"
          font-family="ui-monospace, 'JetBrains Mono', Menlo, monospace"
          font-size="14" fill="#5C5468">${w} × ${h}</text>
    <text x="0" y="64" text-anchor="middle"
          font-family="ui-monospace, 'JetBrains Mono', Menlo, monospace"
          font-size="13" fill="#8A8298">${sub}</text>
    <text x="0" y="94" text-anchor="middle"
          font-family="ui-monospace, 'JetBrains Mono', Menlo, monospace"
          font-size="12" fill="#8A8298" font-style="italic">filename: ${name}</text>
  </g>
</svg>`;
}

for (const slot of SLOTS) {
  const outDir = resolve(ROOT, slot.dir);
  await mkdir(outDir, { recursive: true });
  const outPath = resolve(outDir, slot.name);
  const svg = Buffer.from(svgFor(slot));
  await sharp(svg).jpeg({ quality: 88, mozjpeg: true }).toFile(outPath);
  console.log(`wrote ${outPath}`);
}
