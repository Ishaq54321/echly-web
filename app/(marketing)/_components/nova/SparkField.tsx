"use client";

/**
 * <SparkField /> — the hero's signature: the ANNOTE LOGO as a living 3D point
 * cloud, in the interaction language of the Gemini about-page spark.
 *
 *   • ~2,400 dots are sampled from the real logo SVG paths (the two
 *     interlocking marks), extruded with depth jitter into a thin 3D slab,
 *     and colored with the logo's own gradients — plum → violet across the
 *     top shape, deep plum → magenta across the bottom — so the cloud reads
 *     unmistakably as the brand mark.
 *   • The mark turns in space on sin³ three-axis rotation (lingers, swings —
 *     the same motion the spark had), with a gentle scale breath.
 *   • CURSOR: dots near the pointer brighten toward the hot accent and
 *     preview the next palette state.
 *   • CLICK: a shockwave sweeps outward from the core, flashing dots as it
 *     passes and re-dressing the mark in the next palette; every fourth wave
 *     returns it to the true logo colors.
 *   • PRESS & HOLD: the slab puffs into deeper 3D and swells, exhaling on
 *     release.
 *
 * Canvas 2D + typed math (no WebGL). DPR-aware, pauses off-screen,
 * reduced-motion renders one settled frame.
 */

import { useEffect, useRef } from "react";

// the real logo geometry (AnnoteLogo.tsx, viewBox 0 0 44 55)
const LOGO_TOP =
  "M43.0959 11.4316C41.0954 11.3859 36.1417 11.0038 31.2531 7.59108C28.4558 5.62764 26.1671 3.02527 24.5772 0H14.9759V9.25937C14.851 9.45229 14.6914 9.62036 14.5051 9.75501C14.4568 9.74508 14.4077 9.73997 14.3584 9.73978H0V24.8306H15.0908V11.9771C15.4507 11.6814 15.891 11.5001 16.3548 11.4565C19.6775 16.0751 23.1761 18.5533 25.4923 19.8908C33.0986 24.2809 43.0627 25.0798 43.0959 24.9455C43.0779 24.8015 43.0752 20.8834 43.0959 11.4316Z";
const LOGO_BOTTOM =
  "M0 43.4318C2.00058 43.4775 6.95421 43.8596 11.8428 47.2723C14.6401 49.2358 16.9288 51.8382 18.5187 54.8634H28.12V45.604C28.2449 45.4112 28.4045 45.2431 28.5908 45.1084C28.6391 45.1184 28.6882 45.1235 28.7375 45.1236H43.0959V30.0328H28.0051V42.8863C27.6452 43.182 27.2049 43.3634 26.7411 43.4069C23.4184 38.7883 19.9198 36.31 17.6036 34.9726C9.99729 30.5825 0.0332261 29.7836 0.0332261 29.9179C0.0179988 30.0619 0.0207666 33.98 0 43.4318Z";
const VIEW_W = 44;
const VIEW_H = 55;

type RGB = [number, number, number];
type Grad = { a: RGB; b: RGB };
// palette states the shockwaves cycle through — index 0 is the TRUE logo
// (top: plum→violet, bottom: deep plum→magenta); the cycle returns to it
const STATES: Array<[Grad, Grad]> = [
  [
    { a: [151, 75, 137], b: [81, 72, 199] }, // #974B89 → #5148C7
    { a: [87, 51, 114], b: [253, 12, 99] }, // #573372 → #FD0C63
  ],
  [
    { a: [108, 95, 217], b: [143, 131, 232] }, // lit violets
    { a: [253, 12, 99], b: [255, 130, 175] }, // lit magentas
  ],
  [
    { a: [63, 53, 168], b: [108, 95, 217] }, // deep violets
    { a: [122, 59, 110], b: [217, 0, 79] }, // deep magentas
  ],
  [
    { a: [151, 75, 137], b: [253, 92, 150] }, // plum → pink
    { a: [74, 47, 99], b: [143, 131, 232] }, // deep plum → periwinkle
  ],
];
// cursor/wave flash blends toward this hot accent (reads on white)
const FLASH: RGB = [253, 12, 99];

const COUNT = 3200;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Sample the two logo paths into normalized points (y half-extent = 1). */
function sampleLogo(): Array<{
  nx: number;
  ny: number;
  mix: number;
  group: number;
}> {
  const SCALE = 10;
  const W = VIEW_W * SCALE;
  const H = VIEW_H * SCALE;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return [];

  const candidates: Array<{ nx: number; ny: number; mix: number; group: number }> =
    [];
  [LOGO_TOP, LOGO_BOTTOM].forEach((d, group) => {
    g.clearRect(0, 0, W, H);
    g.save();
    g.scale(SCALE, SCALE);
    g.fillStyle = "#fff";
    g.fill(new Path2D(d));
    g.restore();
    const data = g.getImageData(0, 0, W, H).data;
    // per-group x-extent for the gradient mix (the logo gradients run
    // roughly left → right across each shape)
    let minX = W;
    let maxX = 0;
    const pts: Array<[number, number]> = [];
    for (let y = 0; y < H; y += 3) {
      for (let x = 0; x < W; x += 3) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          pts.push([x, y]);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    const span = Math.max(maxX - minX, 1);
    for (const [x, y] of pts) {
      candidates.push({
        nx: (x / W - 0.5) * 2 * (W / H), // aspect-correct, y half = 1
        ny: (y / H - 0.5) * 2,
        mix: (x - minX) / span,
        group,
      });
    }
  });

  // decimate deterministically to COUNT
  const out: typeof candidates = [];
  if (candidates.length === 0) return out;
  for (let i = 0; i < COUNT; i++) {
    out.push(candidates[Math.floor((i * candidates.length) / COUNT) % candidates.length]);
  }
  return out;
}

export function SparkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!host || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── geometry: the logo as a point slab ──────────────────────────────
    const pts = sampleLogo();
    const N = pts.length;
    if (N === 0) return;

    let seed = 23;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const depthJit = new Float32Array(N); // -1..1 → z spread
    const radJit = new Float32Array(N); // 0..1 → press swell share
    const baseSize = new Float32Array(N);
    const jx = new Float32Array(N); // tiny in-plane shimmer offsets
    const jphase = new Float32Array(N);
    const state = new Uint8Array(N);
    // springy cursor-repulsion offsets (screen space, decay back to rest)
    const ox = new Float32Array(N);
    const oy = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      depthJit[i] = rand() * 2 - 1;
      radJit[i] = rand();
      baseSize[i] = 0.85 + rand() * 1.6;
      jx[i] = rand() * 2 - 1;
      jphase[i] = rand() * Math.PI * 2;
    }

    // ── runtime state ───────────────────────────────────────────────────
    let width = 0;
    let height = 0;
    let R = 200; // logo half-height in px
    let raf = 0;
    let running = false;
    let last = 0;
    let I = 0; // rotation clock
    let press = 0;
    let pressT = 0;
    let grow = reduced ? 1 : 0;
    let mouseX = -99999;
    let mouseY = -99999;
    let baseState = 0;
    let nextSpawn = 1;
    let waves: Array<{ r: number; speed: number; width: number; s: number }> = [];

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the mark spans most of the hero height
      R = Math.min(height * 0.44, width * 0.5);
      if (reduced) draw(0.016);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      if (!reduced) I += dt;
      press += (pressT - press) * 0.1;
      grow += (1 - grow) * dt * 2.2;

      // sin³ three-axis turn — shallow amplitudes so the mark never turns far
      // enough to stop reading as the logo (it sways rather than spins)
      const rr = I * 0.2;
      const rx = Math.sin(rr * 2) ** 3 * 0.26;
      const ry = Math.sin(rr) ** 3 * 0.55;
      const rz = Math.sin(rr) ** 3 * -0.16;
      const cX = Math.cos(rx);
      const sX = Math.sin(rx);
      const cY = Math.cos(ry);
      const sY = Math.sin(ry);
      const cZ = Math.cos(rz);
      const sZ = Math.sin(rz);
      const breathe = 1 + Math.sin(I * 0.8) * 0.014;
      const t = I;

      for (const w of waves) w.r += dt * w.speed;
      while (waves.length > 0 && waves[0].r >= R * 3.4) {
        baseState = waves[0].s;
        waves.shift();
      }

      const cx = width / 2;
      const cy = height * 0.5;
      // long lens: enough depth to feel 3D, not enough to distort the mark
      const cam = R * 4.4;
      const preview = (baseState + waves.length + 1) % STATES.length;

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const m = (1 + radJit[i] * press * 0.5) * grow * breathe;
        // tiny in-plane shimmer keeps the surface alive
        const sh = reduced ? 0 : Math.sin(t * 0.9 + jphase[i]) * 1.0;
        let x = p.nx * R * m + jx[i] * sh;
        let y = p.ny * R * m + sh * 0.6;
        const z = depthJit[i] * R * (0.09 + 0.85 * press) * grow;

        const S = Math.sqrt(x * x + y * y + z * z) || 0.001;

        // wave sweep: recolor behind the ring, flash near it
        if (waves.length === 0) state[i] = baseState;
        let st = state[i];
        let boost = 1;
        for (const w of waves) {
          if (S < w.r) st = w.s;
          const d = Math.abs(S - w.r);
          if (d < w.width) boost = Math.max(boost, 1 + (1 - d / w.width) * 1.3);
        }
        state[i] = st;

        // rotate (XYZ) + project
        let y1 = y * cX - z * sX;
        let z1 = y * sX + z * cX;
        let x1 = x * cY + z1 * sY;
        z1 = -x * sY + z1 * cY;
        const x2 = x1 * cZ - y1 * sZ;
        y1 = x1 * sZ + y1 * cZ;
        const persp = cam / (cam - z1);
        const px = cx + x2 * persp + ox[i];
        const py = cy + y1 * persp + oy[i];

        // cursor lens: springy repulsion (the solutions-panel feel) +
        // brighten + preview the next palette
        let lens = 0;
        const mdx = px - mouseX;
        const mdy = py - mouseY;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 80 && md > 0.01) {
          lens = 1 - smooth(0, 1, md / 80);
          boost = Math.max(boost, 1 + lens * 0.8);
          const push = (1 - md / 80) * 1.5;
          ox[i] += (mdx / md) * push;
          oy[i] += (mdy / md) * push;
        }
        ox[i] *= 0.88;
        oy[i] *= 0.88;

        // color: the shape's own gradient (per group), state-dressed
        const mix = smooth(0.06, 0.94, p.mix);
        const gset = STATES[st][p.group];
        let r = gset.a[0] + (gset.b[0] - gset.a[0]) * mix;
        let g = gset.a[1] + (gset.b[1] - gset.a[1]) * mix;
        let b = gset.a[2] + (gset.b[2] - gset.a[2]) * mix;
        if (lens > 0) {
          const pv = STATES[preview][p.group];
          r += (pv.a[0] + (pv.b[0] - pv.a[0]) * mix - r) * lens;
          g += (pv.a[1] + (pv.b[1] - pv.a[1]) * mix - g) * lens;
          b += (pv.a[2] + (pv.b[2] - pv.a[2]) * mix - b) * lens;
        }
        if (boost > 1) {
          const f = Math.min(1, boost - 1);
          r += (FLASH[0] - r) * f;
          g += (FLASH[1] - g) * f;
          b += (FLASH[2] - b) * f;
        }

        // size: slight core emphasis + perspective
        const k = 1 - clamp01((S - R * 0.2) / (R * 1.15));
        const size = baseSize[i] * (0.55 + k * 1.15) * persp * grow;
        if (size <= 0.05) continue;

        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},0.96)`;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // ── interaction (on the host so the copy stays clickable) ───────────
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -99999;
      mouseY = -99999;
      pressT = 0;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      pressT = 1;
    };
    const onUp = (e: PointerEvent) => {
      pressT = 0;
      if ((e.target as HTMLElement).closest("a, button")) return;
      waves.push({ r: 0, speed: R * 2.1, width: R * 0.22, s: nextSpawn });
      nextSpawn = (nextSpawn + 1) % STATES.length;
      if (waves.length > 4) waves = waves.slice(-4);
    };

    resize();
    const io = new IntersectionObserver(
      (entries) => {
        const en = entries[0];
        if (!en) return;
        if (en.isIntersecting) start();
        else stop();
      },
      { rootMargin: "60px" },
    );
    io.observe(host);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="nv-spark-canvas" aria-hidden="true" />
  );
}
