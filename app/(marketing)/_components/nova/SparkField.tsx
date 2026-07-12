"use client";

/**
 * <SparkField /> — the hero spark, back in its original form: a 3D point
 * cloud on a breathing SUPERELLIPSE STAR (the Gemini about-page hero,
 * studied from its shipped source), in the Annote brand ramp on white.
 *
 *   • ~3,200 dots on a superellipse whose curvature exponent n oscillates —
 *     the shape breathes between a sharp four-point spark and a rounded
 *     bloom — rotating on all three axes with sin³ easing (lingers, swings).
 *   • CURSOR: springy repulsion (dots scatter under the pointer and flow
 *     back), brighten toward the hot accent, and preview the next color
 *     state.
 *   • CLICK: a shockwave sweeps outward from the core, flashing dots as it
 *     passes and permanently adopting the next brand palette behind it.
 *   • PRESS & HOLD: the flat star puffs into 3D depth and swells, exhaling
 *     on release.
 *
 * Canvas 2D + typed arrays (no WebGL). DPR-aware, pauses off-screen,
 * reduced-motion renders one settled frame.
 */

import { useEffect, useRef } from "react";

type RGB = [number, number, number];
// brand color states the shockwaves cycle through: [core, tips] — tuned for
// the WHITE hero (saturated cores, deep tips)
const STATES: Array<{ inner: RGB; outer: RGB }> = [
  { inner: [108, 95, 217], outer: [63, 53, 168] }, // violet → deep violet
  { inner: [253, 92, 150], outer: [217, 0, 79] }, // pink → deep magenta
  { inner: [176, 106, 165], outer: [122, 59, 110] }, // orchid → plum
  { inner: [143, 131, 232], outer: [74, 47, 99] }, // periwinkle → deep plum
];
// wave/cursor flash blends toward this hot accent
const FLASH: RGB = [253, 12, 99];

const COUNT = 3200;
const CURVE_N0 = 0.5; // spikiest superellipse exponent
const CURVE_MAX = 3.5; // roundest
const ROUNDING = 0.18;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function SparkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!host || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── point cloud (seeded, stable) ────────────────────────────────────
    let seed = 23;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const angle = new Float32Array(COUNT);
    const radJit = new Float32Array(COUNT); // 0..1 → radial spread + color mix
    const depthJit = new Float32Array(COUNT); // -1..1 → z spread
    const baseSize = new Float32Array(COUNT);
    const state = new Uint8Array(COUNT);
    // springy cursor-repulsion offsets (screen space, decay back to rest)
    const ox = new Float32Array(COUNT);
    const oy = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      angle[i] = rand() * Math.PI * 2;
      radJit[i] = rand();
      depthJit[i] = rand() * 2 - 1;
      baseSize[i] = 0.6 + rand() * 1.4;
    }

    // ── runtime state ───────────────────────────────────────────────────
    let width = 0;
    let height = 0;
    let R = 200;
    let isMobile = false;
    let raf = 0;
    let running = false;
    let last = 0;
    let I = 0; // rotation clock
    let ie = 1.4; // morph clock (start mid-breath, pleasing star)
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
      isMobile = width < 640;
      // the spark spans the full hero. On phones the width-driven desktop
      // formula (width * 0.42) makes the spark read as tiny against a much
      // taller viewport — lean harder on height, and cap it more generously,
      // so it fills the section as a real centerpiece instead of a speck.
      R = isMobile
        ? Math.min(height * 0.5, width * 0.62)
        : Math.min(height * 0.47, width * 0.42);
      if (reduced) draw(0.016);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);

      // on phones, calm the whole thing down: slower turn, gentler swing,
      // softer color flashes, and a thinner point cloud (perf + a quieter,
      // more elegant read on a small screen) — while R above keeps it big.
      const calm = isMobile ? 0.55 : 1;
      const stride = isMobile ? 2 : 1;
      // much softer on mobile: the hero text sits closer to the spark's arms
      // on a narrow viewport, so dots need to read as an ambient wash rather
      // than compete with the copy where they cross behind it
      const alpha = isMobile ? 0.4 : 0.96;

      // morph the superellipse exponent (lingers near the spiky pose)
      const n =
        (CURVE_MAX + CURVE_N0) / 2 +
        ((CURVE_MAX - CURVE_N0) / 2) * Math.sin(ie);
      if (!reduced) {
        ie += dt * (0.15 + (n - (CURVE_N0 - 0.1)) ** 2 * 0.15) * 1.2 * calm;
        I += dt * calm;
      }
      press += (pressT - press) * 0.1;
      grow += (1 - grow) * dt * 2.2;

      // sin³ three-axis rotation — eases, lingers, swings (amplitude tamed
      // on mobile so the turn feels calmer, not just slower)
      const rr = I * 0.22;
      const rx = Math.sin(rr * 2) ** 3 * 0.85 * calm;
      const ry = Math.sin(rr) ** 3 * 1.15 * calm;
      const rz = Math.sin(rr) ** 3 * -0.65 * calm;
      const cX = Math.cos(rx);
      const sX = Math.sin(rx);
      const cY = Math.cos(ry);
      const sY = Math.sin(ry);
      const cZ = Math.cos(rz);
      const sZ = Math.sin(rz);

      for (const w of waves) w.r += dt * w.speed;
      while (waves.length > 0 && waves[0].r >= R * 3.2) {
        baseState = waves[0].s;
        waves.shift();
      }

      const cx = width / 2;
      const cy = height * 0.5;
      const cam = R * 2.6;
      const preview = (baseState + waves.length + 1) % STATES.length;
      const exp = 2 / n;
      const waveBoostCap = isMobile ? 1 : 1.5;
      const lensBoostCap = isMobile ? 0.45 : 0.8;

      for (let i = 0; i < COUNT; i += stride) {
        const t = angle[i];
        const ci = Math.cos(t);
        const si = Math.sin(t);
        // superellipse with corner rounding (from the source)
        const o = Math.abs(ci) ** exp * Math.sign(ci);
        const s2 = Math.abs(si) ** exp * Math.sign(si);
        const rc = Math.cos(2 * t) ** 2 * ROUNDING;
        let x = o * (1 - rc) + ci * rc;
        let y = s2 * (1 - rc) + si * rc;

        const m = (1 + radJit[i] * press * 0.9 - 0.04) * grow;
        x *= R * m;
        y *= R * m;
        // flat star at rest; press puffs it into 3D depth
        const z = depthJit[i] * R * (0.12 + 1.1 * press) * grow;

        const S = Math.sqrt(x * x + y * y + z * z) || 0.001;

        // which color state this dot wears + wave flash
        if (waves.length === 0) state[i] = baseState;
        let st = state[i];
        let boost = 1;
        for (const w of waves) {
          if (S < w.r) st = w.s;
          const d = Math.abs(S - w.r);
          if (d < w.width)
            boost = Math.max(boost, 1 + (1 - d / w.width) * waveBoostCap);
        }
        state[i] = st;

        // rotate (XYZ order) + project
        let y1 = y * cX - z * sX;
        let z1 = y * sX + z * cX;
        let x1 = x * cY + z1 * sY;
        z1 = -x * sY + z1 * cY;
        const x2 = x1 * cZ - y1 * sZ;
        y1 = x1 * sZ + y1 * cZ;
        const persp = cam / (cam - z1);
        const px = cx + x2 * persp + ox[i];
        const py = cy + y1 * persp + oy[i];

        // cursor lens: springy repulsion + brighten + preview next state
        let lens = 0;
        const mdx = px - mouseX;
        const mdy = py - mouseY;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 80 && md > 0.01) {
          lens = 1 - smooth(0, 1, md / 80);
          boost = Math.max(boost, 1 + lens * lensBoostCap);
          const push = (1 - md / 80) * 1.5;
          ox[i] += (mdx / md) * push;
          oy[i] += (mdy / md) * push;
        }
        ox[i] *= 0.88;
        oy[i] *= 0.88;

        // color: radial core→tip gradient keyed to the dot's spread
        const mix = smooth(0, 1, smooth(0.08, 0.55, radJit[i]));
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
        if (boost > 1) {
          const f = Math.min(1, boost - 1);
          r += (FLASH[0] - r) * f;
          g += (FLASH[1] - g) * f;
          b += (FLASH[2] - b) * f;
        }

        // size: larger near the core, perspective-scaled
        const k = 1 - clamp01((S - R * 0.18) / (R * 1.05));
        const size = baseSize[i] * (0.25 + k * 1.9) * persp * grow;
        if (size <= 0.05) continue;

        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
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
