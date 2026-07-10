"use client";

/**
 * <ParticleMorph /> v3 — the reference's "try solutions" particle treatment,
 * matched shape-for-shape:
 *
 *   • "braces": two large curly braces { } flanking the centered copy
 *     (the reference's "For developers" panel).
 *   • "rings": six circles arranged in a ring around the copy
 *     (the reference's "For organizations" panel).
 *
 * Behaviour matched to the reference: at rest the field is a sparse, almost
 * invisible scatter of tiny flecks; hovering the panel condenses them into
 * the glyph — dots brighten into the brand violet, arrive with per-particle
 * stagger, and the assembled shape breathes gently. Leaving exhales the dots
 * outward before they drift back to their scatter.
 *
 * Canvas 2D, DPR-aware, pauses off-screen, reduced-motion renders the
 * assembled glyph statically.
 */

import { useEffect, useRef } from "react";

export type MorphShape = "braces" | "rings" | "spark" | "cube";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  sx: number; // 0..1 in shape space
  sy: number;
  k: number;
  phase: number;
  size: number;
  alpha: number;
  mix: number; // 0..1 → position on the state's core→tip color ramp
  state: number;
};

const COUNT = 520;

type RGB = [number, number, number];
// the SparkField brand states (core → tips), shared visual language
const STATES: Array<{ inner: RGB; outer: RGB }> = [
  { inner: [108, 95, 217], outer: [63, 53, 168] }, // violet → deep violet
  { inner: [253, 92, 150], outer: [217, 0, 79] }, // pink → deep magenta
  { inner: [176, 106, 165], outer: [122, 59, 110] }, // orchid → plum
  { inner: [143, 131, 232], outer: [74, 47, 99] }, // periwinkle → deep plum
];
const FLASH: RGB = [253, 12, 99];

const smooth01 = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

/** Draw the glyph on an offscreen canvas and sample opaque pixels. */
function sampleShape(
  shape: MorphShape,
  n: number,
): { pts: Array<[number, number]>; aspect: number } {
  const W = shape === "braces" ? 680 : 460;
  const H = shape === "braces" ? 380 : 440;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return { pts: [], aspect: W / H };
  g.clearRect(0, 0, W, H);
  g.strokeStyle = "#fff";
  g.fillStyle = "#fff";

  if (shape === "braces") {
    // two curly braces flanking the copy — drawn as real glyphs
    g.font = "300 340px 'Google Sans Flex', 'DM Sans', Arial, sans-serif";
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillText("{", 6, H / 2 + 10);
    g.textAlign = "right";
    g.fillText("}", W - 6, H / 2 + 10);
  } else if (shape === "rings") {
    // six circles in a ring around the centered copy
    const cx = W / 2;
    const cy = H / 2;
    const orbit = 150;
    const r = 72;
    g.lineWidth = 9;
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 2;
      g.beginPath();
      g.arc(cx + Math.cos(ang) * orbit, cy + Math.sin(ang) * orbit, r, 0, Math.PI * 2);
      g.stroke();
    }
  } else if (shape === "spark") {
    g.beginPath();
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.44;
    const r = Math.min(W, H) * 0.13;
    for (let i = 0; i < 8; i++) {
      const ang = (Math.PI / 4) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? R : r;
      const x = cx + Math.cos(ang) * rad;
      const y = cy + Math.sin(ang) * rad;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
  } else {
    // isometric cube
    const cx = W / 2;
    const cy = H / 2 + 8;
    const R = Math.min(W, H) * 0.38;
    const pts = [
      [cx, cy - R],
      [cx + R * 0.87, cy - R * 0.5],
      [cx + R * 0.87, cy + R * 0.5],
      [cx, cy + R],
      [cx - R * 0.87, cy + R * 0.5],
      [cx - R * 0.87, cy - R * 0.5],
    ];
    g.lineWidth = 12;
    g.lineJoin = "round";
    g.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(pts[5][0], pts[5][1]);
    g.lineTo(cx, cy);
    g.lineTo(pts[1][0], pts[1][1]);
    g.moveTo(cx, cy);
    g.lineTo(pts[3][0], pts[3][1]);
    g.stroke();
  }

  const data = g.getImageData(0, 0, W, H).data;
  const pts: Array<[number, number]> = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push([x / W, y / H]);
    }
  }
  const out: Array<[number, number]> = [];
  if (pts.length === 0) return { pts: out, aspect: W / H };
  for (let i = 0; i < n; i++) {
    out.push(pts[Math.floor((i * pts.length) / n) % pts.length]);
  }
  return { pts: out, aspect: W / H };
}

export function ParticleMorph({ shape }: { shape: MorphShape }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!host || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let hover = reduced;
    let hoverT = reduced ? 1 : 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let particles: Particle[] = [];
    let aspect = 1;
    let baseState = 0;
    let nextSpawn = 1;
    let waves: Array<{ r: number; speed: number; width: number; s: number }> =
      [];

    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // the glyph fills most of the panel, centered on the copy
    const shapeBox = () => {
      const w = Math.min(width * 0.9, height * aspect * 1.05);
      const h = w / aspect;
      return { x: (width - w) / 2, y: (height - h) / 2, w, h };
    };

    const build = () => {
      const sampled = sampleShape(shape, COUNT);
      aspect = sampled.aspect;
      particles = Array.from({ length: COUNT }, (_, i) => {
        const t = sampled.pts[i] ?? [0.5, 0.5];
        return {
          x: rand() * width,
          y: rand() * height,
          vx: 0,
          vy: 0,
          hx: rand() * width,
          hy: rand() * height,
          sx: t[0],
          sy: t[1],
          k: 0.04 + rand() * 0.06,
          phase: rand() * Math.PI * 2,
          size: 1.1 + rand() * 1.4,
          alpha: 0.5 + rand() * 0.5,
          mix: rand(),
          state: 0,
        };
      });
      if (reduced) {
        const box = shapeBox();
        particles.forEach((p) => {
          p.x = box.x + p.sx * box.w;
          p.y = box.y + p.sy * box.h;
        });
      }
    };

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
      build();
      if (reduced) draw(0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = now * 0.001;
      hoverT += ((hover ? 1 : 0) - hoverT) * (hover ? 0.07 : 0.045);
      const breathe = 1 + Math.sin(t * 0.7) * 0.01 * hoverT;
      const box = shapeBox();
      const bcx = box.x + box.w / 2;
      const bcy = box.y + box.h / 2;
      const preview = (baseState + waves.length + 1) % STATES.length;

      // advance shockwaves; the oldest commits its color once fully swept
      const maxR = Math.max(width, height) * 1.1;
      for (const w of waves) w.r += w.speed * 0.016;
      while (waves.length > 0 && waves[0].r >= maxR) {
        baseState = waves[0].s;
        waves.shift();
      }

      for (const p of particles) {
        const tx = bcx + (p.sx - 0.5) * box.w * breathe;
        const ty = bcy + (p.sy - 0.5) * box.h * breathe;

        const destX = p.hx + (tx - p.hx) * hoverT;
        const destY = p.hy + (ty - p.hy) * hoverT;
        p.x += (destX - p.x) * p.k;
        p.y += (destY - p.y) * p.k;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.9;
        p.vy *= 0.9;

        const wander = 0.36 * (1 - hoverT * 0.9);
        p.x += Math.cos(t * 0.5 + p.phase) * wander;
        p.y += Math.sin(t * 0.4 + p.phase * 1.3) * wander;

        // shockwaves: recolor behind the ring, flash near it
        const S = Math.hypot(p.x - bcx, p.y - bcy);
        if (waves.length === 0) p.state = baseState;
        let st = p.state;
        let flash = 0;
        for (const w of waves) {
          if (S < w.r) st = w.s;
          const d = Math.abs(S - w.r);
          if (d < w.width) flash = Math.max(flash, 1 - d / w.width);
        }
        p.state = st;

        // cursor lens: repel slightly, flash + preview the next state
        let lens = 0;
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 4200 && md2 > 0.01) {
          const md = Math.sqrt(md2);
          lens = 1 - smooth01(md / 65);
          const f = (1 - md / 65) * 1.1;
          p.x += (mdx / md) * f;
          p.y += (mdy / md) * f;
        }

        // color: core→tip ramp of the dot's state (the spark's language)
        const mix = smooth01(smooth01((p.mix - 0.08) / 0.47));
        const cs = STATES[st];
        let r = cs.inner[0] + (cs.outer[0] - cs.inner[0]) * mix;
        let g = cs.inner[1] + (cs.outer[1] - cs.inner[1]) * mix;
        let b = cs.inner[2] + (cs.outer[2] - cs.inner[2]) * mix;
        if (lens > 0) {
          const ps = STATES[preview];
          r += (ps.inner[0] + (ps.outer[0] - ps.inner[0]) * mix - r) * lens;
          g += (ps.inner[1] + (ps.outer[1] - ps.inner[1]) * mix - g) * lens;
          b += (ps.inner[2] + (ps.outer[2] - ps.inner[2]) * mix - b) * lens;
        }
        const hot = Math.max(flash, lens * 0.7);
        if (hot > 0) {
          r += (FLASH[0] - r) * hot;
          g += (FLASH[1] - g) * hot;
          b += (FLASH[2] - b) * hot;
        }

        // rest: quietly visible drifting flecks (an invitation to interact);
        // hover: full-strength brand dots
        const a = p.alpha * (0.42 + hoverT * 0.52 + flash * 0.4);
        const size = p.size * (0.9 + hoverT * 0.28 + hot * 0.5);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${Math.min(1, a).toFixed(3)})`;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onEnter = () => {
      hover = true;
    };
    const onLeave = () => {
      if (!reduced && hoverT > 0.5) {
        const box = shapeBox();
        const cx = box.x + box.w / 2;
        const cy = box.y + box.h / 2;
        for (const p of particles) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const f = 2.4 * Math.min(1, 150 / d);
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
      hover = reduced;
      mouseX = -9999;
      mouseY = -9999;
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    // click → recolor shockwave through the panel (the spark's interaction)
    const onUp = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      if (reduced) return;
      waves.push({
        r: 0,
        speed: Math.max(width, height) * 1.4,
        width: Math.min(width, height) * 0.16,
        s: nextSpawn,
      });
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
      { rootMargin: "80px" },
    );
    io.observe(host);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
    };
  }, [shape]);

  return <canvas ref={canvasRef} className="nv-morph-canvas" aria-hidden="true" />;
}
