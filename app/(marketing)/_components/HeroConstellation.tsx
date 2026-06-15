"use client";

/**
 * HeroConstellation — a subtle, decorative particle field for the LIGHT hero.
 *
 * Drifting indigo/slate dots connect with faint constellation lines and softly
 * react to the cursor. Tuned for a near-WHITE background: the dots are DARK
 * (indigo/slate) at low opacity so they read as quiet texture, never bright
 * white (which would vanish on white). A radial density+opacity mask keeps the
 * field SPARSE and faint behind the centred headline/sub/CTAs and slightly
 * denser toward the empty top/edges, so the copy always reads cleanly.
 *
 * Hygiene (this is the first thing users see):
 *   • Canvas is absolutely positioned, z-index 0 inside `.hcd`, pointer-events
 *     none → never intercepts clicks/scroll; all hero content stays on top.
 *   • rAF loop pauses when the hero scrolls off-screen (IntersectionObserver).
 *   • prefers-reduced-motion → render ONE static sparse frame, no loop.
 *   • Mobile / small viewports → fewer particles, no mouse-attraction, gentle
 *     drift only. Below a hard floor we render nothing at all.
 *   • devicePixelRatio-aware for crispness; debounced resize; full teardown on
 *     unmount (cancel rAF + remove every listener + disconnect observers).
 *   • Particle count is capped so the pairwise proximity check stays cheap.
 */

import { useEffect, useRef } from "react";

// ── Tuning constants (all chosen for a LIGHT background) ──────────────────────

// Dot color: indigo (brand) for most, slate for a few, so the web reads as
// intentional brand texture rather than noise. RGB tuples; alpha applied later.
const DOT_INDIGO = [99, 102, 241] as const; // #6366F1
const DOT_SLATE = [148, 163, 184] as const; // #94A3B8

// Base per-dot opacity envelope — deliberately faint on white.
const DOT_ALPHA_MIN = 0.1;
const DOT_ALPHA_MAX = 0.34;

// Constellation line: indigo, very low alpha, fades to 0 at the link distance.
const LINE_RGB = [99, 102, 241] as const;
const LINE_MAX_ALPHA = 0.14;
const LINK_DIST = 130; // px (CSS px) at which dots stop connecting
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

// Mouse interaction (desktop only): faint lines to the cursor + a soft pull.
const MOUSE_DIST = 160;
const MOUSE_DIST_SQ = MOUSE_DIST * MOUSE_DIST;
const MOUSE_LINE_ALPHA = 0.16;
const MOUSE_PULL = 0.0009; // acceleration scale toward the cursor (very gentle)

// Density: roughly one particle per AREA_PER_DOT px², capped hard.
const AREA_PER_DOT = 15000;
const MAX_DOTS = 90; // hard cap → pairwise check stays ~O(MAX_DOTS²/2)
const MAX_DOTS_MOBILE = 28;

// Below this width we treat the device as "mobile": fewer dots, no mouse.
const MOBILE_MAX_WIDTH = 768;
// Below this width we skip the canvas entirely (perf on the smallest phones).
const MIN_RENDER_WIDTH = 380;

const DRIFT_SPEED = 0.12; // px/frame base drift magnitude
const TWINKLE_SPEED = 0.012; // radians/frame for the opacity pulse

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number; // home drift velocity (pull decays back toward this)
  baseVy: number;
  radius: number;
  rgb: readonly [number, number, number];
  alphaBase: number; // pre-mask per-dot alpha
  twinkle: number; // phase
  twinkleAmp: number;
};

// Deterministic-ish PRNG seeded per-mount so the field differs run to run but
// we avoid Math.random in module scope. (Plain Math.random in the effect is
// fine here — this is client-only decorative code, not a workflow script.)
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Radial mask in [0,1]: 1 toward the edges/top, →~0.18 in the centre where the
 * headline sits. Used BOTH for spawn density (rejection sampling) and for a
 * per-dot opacity multiplier, so the centre column stays clean.
 */
function centerMask(x: number, y: number, w: number, h: number): number {
  // Focus point: slightly ABOVE vertical centre, matching where the headline +
  // sub + CTAs sit (the copy block is translated up ~4%). Normalised distance
  // from that focus, scaled so the "quiet zone" is an ellipse (wider than tall).
  const cx = w * 0.5;
  const cy = h * 0.42;
  const dx = (x - cx) / (w * 0.42);
  const dy = (y - cy) / (h * 0.36);
  const d = Math.sqrt(dx * dx + dy * dy); // 0 at focus, ~1 at the ellipse edge
  // Smoothstep from a faint floor at the centre up to full at the edges.
  const t = Math.min(1, Math.max(0, d));
  const eased = t * t * (3 - 2 * t); // smoothstep
  return 0.18 + 0.82 * eased;
}

export function HeroConstellation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The canvas sizes to its offsetParent (the `.hcd` stage), which is its
    // positioned ancestor.
    const host = canvas.parentElement;
    if (!host) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;
    let particles: Particle[] = [];

    // Mouse state (CSS px relative to the canvas; -1 = no cursor present).
    const mouse = { x: -1, y: -1, active: false };

    let rafId = 0;
    let running = false;
    let onScreen = true;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    // ── Build the particle set for the current size ──────────────────────────
    function buildParticles() {
      particles = [];
      if (width < MIN_RENDER_WIDTH) return; // too small → render nothing

      const cap = isMobile ? MAX_DOTS_MOBILE : MAX_DOTS;
      const target = Math.min(cap, Math.round((width * height) / AREA_PER_DOT));

      let attempts = 0;
      const maxAttempts = target * 12;
      while (particles.length < target && attempts < maxAttempts) {
        attempts++;
        const x = rand(0, width);
        const y = rand(0, height);
        // Rejection-sample against the centre mask so fewer dots spawn behind
        // the copy and more toward the empty edges/top.
        const m = centerMask(x, y, width, height);
        if (Math.random() > m) continue;

        const isSlate = Math.random() < 0.32;
        const angle = rand(0, Math.PI * 2);
        const speed = DRIFT_SPEED * rand(0.4, 1.1);
        const baseVx = Math.cos(angle) * speed;
        const baseVy = Math.sin(angle) * speed;
        particles.push({
          x,
          y,
          vx: baseVx,
          vy: baseVy,
          baseVx,
          baseVy,
          radius: rand(0.9, 1.9),
          rgb: isSlate ? DOT_SLATE : DOT_INDIGO,
          alphaBase: rand(DOT_ALPHA_MIN, DOT_ALPHA_MAX),
          twinkle: rand(0, Math.PI * 2),
          twinkleAmp: rand(0.15, 0.45),
        });
      }
    }

    // ── Size / DPR handling ──────────────────────────────────────────────────
    function resize() {
      const rect = host!.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× for perf
      isMobile = width <= MOBILE_MAX_WIDTH;

      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px

      buildParticles();
    }

    // ── Per-frame draw ───────────────────────────────────────────────────────
    function step() {
      ctx!.clearRect(0, 0, width, height);
      const useMouse = mouse.active && !isMobile && !prefersReducedMotion;

      // Update positions.
      for (const p of particles) {
        if (!prefersReducedMotion) {
          // Gentle pull toward the cursor, decaying back to home drift so it
          // never accelerates indefinitely or feels jittery.
          if (useMouse) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < MOUSE_DIST_SQ && distSq > 1) {
              const falloff = 1 - distSq / MOUSE_DIST_SQ;
              p.vx += dx * MOUSE_PULL * falloff;
              p.vy += dy * MOUSE_PULL * falloff;
            }
          }
          // Ease velocity back toward the home drift (spring-ish damping).
          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;

          p.x += p.vx;
          p.y += p.vy;

          // Wrap softly around the edges so the field never thins out.
          if (p.x < -10) p.x = width + 10;
          else if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          else if (p.y > height + 10) p.y = -10;

          p.twinkle += TWINKLE_SPEED;
        }
      }

      // Constellation lines (pairwise, capped count → cheap).
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > LINK_DIST_SQ) continue;
          const dist = Math.sqrt(distSq);
          const proximity = 1 - dist / LINK_DIST; // 1 (touching) → 0 (at limit)
          // Fade lines out in the central quiet zone too (use the midpoint).
          const mask =
            centerMask((a.x + b.x) / 2, (a.y + b.y) / 2, width, height) * 0.6 +
            0.4;
          const alpha = LINE_MAX_ALPHA * proximity * proximity * mask;
          if (alpha < 0.006) continue;
          ctx!.strokeStyle = `rgba(${LINE_RGB[0]}, ${LINE_RGB[1]}, ${LINE_RGB[2]}, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      // Mouse-to-dot lines (desktop only) — makes the field feel responsive.
      if (useMouse) {
        for (const p of particles) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > MOUSE_DIST_SQ) continue;
          const proximity = 1 - Math.sqrt(distSq) / MOUSE_DIST;
          const alpha = MOUSE_LINE_ALPHA * proximity * proximity;
          if (alpha < 0.006) continue;
          ctx!.strokeStyle = `rgba(${LINE_RGB[0]}, ${LINE_RGB[1]}, ${LINE_RGB[2]}, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(mouse.x, mouse.y);
          ctx!.lineTo(p.x, p.y);
          ctx!.stroke();
        }
      }

      // Dots, on top of the lines.
      for (const p of particles) {
        const twinkleMul = prefersReducedMotion
          ? 1
          : 1 + Math.sin(p.twinkle) * p.twinkleAmp;
        const mask = centerMask(p.x, p.y, width, height);
        const alpha = Math.max(
          0,
          Math.min(0.5, p.alphaBase * twinkleMul * mask),
        );
        if (alpha < 0.004) continue;
        ctx!.fillStyle = `rgba(${p.rgb[0]}, ${p.rgb[1]}, ${p.rgb[2]}, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop() {
      if (!running) return;
      step();
      rafId = window.requestAnimationFrame(loop);
    }

    function start() {
      if (running || prefersReducedMotion) return;
      if (particles.length === 0) return;
      running = true;
      rafId = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    // ── Event handlers ───────────────────────────────────────────────────────
    function handlePointerMove(e: PointerEvent) {
      if (isMobile) return;
      const rect = host!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function handlePointerLeave() {
      mouse.active = false;
      mouse.x = -1;
      mouse.y = -1;
    }
    function handleResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (prefersReducedMotion) {
          step(); // re-render the single static frame at the new size
        } else if (onScreen && particles.length > 0) {
          // Ensure the loop is running again after a resize while visible.
          if (!running) start();
        }
      }, 150);
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    resize();

    if (prefersReducedMotion) {
      // Static sparse field: draw exactly one frame, never loop.
      step();
    } else {
      // Pause the loop whenever the hero is off-screen so we don't burn frames
      // while the user reads the rest of the page.
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          onScreen = entry.isIntersecting;
          if (onScreen) start();
          else stop();
        },
        { threshold: 0 },
      );
      io.observe(host);

      // Mouse listeners are passive (read-only position) and live on the host,
      // which already has pointer-events on its real children; the canvas itself
      // stays pointer-events:none so it never intercepts anything.
      host.addEventListener("pointermove", handlePointerMove, { passive: true });
      host.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
      window.addEventListener("resize", handleResize);

      // Kick off if already visible at mount.
      if (onScreen) start();

      return () => {
        stop();
        io.disconnect();
        host.removeEventListener("pointermove", handlePointerMove);
        host.removeEventListener("pointerleave", handlePointerLeave);
        window.removeEventListener("resize", handleResize);
        if (resizeTimer) clearTimeout(resizeTimer);
      };
    }

    // Reduced-motion teardown: only the debounced resize listener exists.
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hcd-constellation"
      aria-hidden="true"
    />
  );
}
