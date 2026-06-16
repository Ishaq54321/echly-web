"use client";

/**
 * HeroCaptureStream — the hero's signature "live capture stream" background.
 *
 * Tells the product story ambiently: a continuous, flowing field of real-looking
 * captured-data lines — console logs, network requests, user actions — drifting
 * up/diagonally across the dark hero, as if Annote is silently capturing
 * everything a live web app emits. Most lines are calm/dim (normal activity);
 * occasionally one is an ERROR/anomaly that gets a soft "the system noticed it"
 * pulse. The cursor is a CAPTURE LENS: lines near it brighten, sharpen and glow
 * (come into focus), while the rest stay dim/blurred — moving the mouse feels
 * like scanning across live captured data. Hovering an error coalesces a brief
 * "ticket forming" chip, hinting the bug becomes a ticket.
 *
 * Legibility: behind the centred headline/sub/CTAs the field is dimmed hard so
 * the copy stays the clear focus; it's richer toward the edges + empty space.
 *
 * Hygiene:
 *   • Canvas absolutely positioned, z-index 0 inside `.hcd`, pointer-events none.
 *   • rAF loop pauses off-screen (IntersectionObserver).
 *   • prefers-reduced-motion → one calm static frame, no loop, no focus lens.
 *   • Mobile → fewer lines, gentle flow only (no cursor focus / ticket flourish).
 *   • devicePixelRatio-aware; debounced resize; lines recycled; full teardown.
 */

import { useEffect, useRef } from "react";

// ── Captured-data vocabulary ──────────────────────────────────────────────────
// Calm, normal activity — most of the stream. Mix of network, console, actions,
// navigation. Kept realistic so the field reads as genuine captured telemetry.
const NORMAL_LINES = [
  "GET /api/user 200 · 42ms",
  "console.log('cart updated')",
  "fetch /api/me → 200",
  "click → #submit-btn",
  "navigated /pricing",
  "POST /api/cart 201 · 88ms",
  "GET /api/session 200 · 31ms",
  "input → #email",
  "console.info('hydrated')",
  "GET /api/flags 200 · 12ms",
  "scroll → 1240px",
  "POST /api/track 204",
  "click → .nav-link",
  "GET /assets/app.js 200",
  "console.debug('ws open')",
  "navigated /dashboard",
  "PATCH /api/profile 200",
  "fetch /api/me → 200 · 27ms",
  "click → [data-id='row-3']",
  "GET /api/tickets 200 · 64ms",
  "resize → 1440×900",
  "console.log('render 14ms')",
] as const;

// Errors / anomalies — rarer, red-tinted, get a "noticed" pulse.
const ERROR_LINES = [
  "POST /api/checkout 500",
  "TypeError: undefined is not a function",
  "Failed to fetch /api/cart",
  "GET /api/user 200 · null body",
  "Uncaught (in promise) Error",
  "PUT /api/order 409 Conflict",
  "console.error('payment failed')",
  "GET /api/price 200 · wrong total",
  "fetch /api/me → 401",
  "ReferenceError: cart is not defined",
] as const;

// ── Palette (on the dark hero) ────────────────────────────────────────────────
const NORMAL_RGBS = [
  [148, 163, 184], // slate-400
  [129, 140, 248], // indigo-400
  [167, 139, 250], // violet-400
  [199, 210, 254], // indigo-200 (rare, brighter)
] as const;
const ELECTRIC = [56, 189, 248] as const; // focus accent
const ERROR_RGB = [248, 113, 113] as const; // red-400

// ── Depth tiers (size / dimness / blur / speed) ───────────────────────────────
type Tier = {
  size: number; // font px
  blur: number; // base blur (sharpened by the cursor lens)
  alphaMul: number; // base opacity multiplier
  speed: number; // px/frame upward drift
  weight: number; // spawn share
};
const TIERS: Tier[] = [
  // FAR — clearly small, very dim, noticeably blurred, slow. Deep background.
  { size: 10, blur: 2.4, alphaMul: 0.42, speed: 0.15, weight: 0.46 },
  // MID — medium, light blur.
  { size: 13, blur: 0.9, alphaMul: 0.72, speed: 0.24, weight: 0.36 },
  // NEAR — clearly larger, crisp, a touch faster. Foreground.
  { size: 17, blur: 0, alphaMul: 1, speed: 0.36, weight: 0.18 },
];

// Counts (capped; recycled as they drift off / fade).
const AREA_PER_LINE = 28000;
const MAX_LINES = 44;
const MAX_LINES_MOBILE = 16;
const ERROR_CHANCE = 0.07; // share of spawns that are errors (1-2 visible)

// Hierarchy: most lines are whisper-faint ambient texture; only a few are
// "featured" (clearly legible). Featured baseline is much brighter than the
// faint baseline, so the field reads as "lots of quiet data, a few in focus".
const FEATURED_CHANCE = 0.16; // share of NORMAL lines that are featured
const FAINT_VIS = 0.09; // baseline opacity of ambient (whisper) lines
const FEATURED_VIS = 0.5; // baseline opacity of featured lines

// Cursor lens.
const FOCUS_RADIUS = 200;
const FOCUS_RADIUS_SQ = FOCUS_RADIUS * FOCUS_RADIUS;

const MOBILE_MAX_WIDTH = 768;
const MIN_RENDER_WIDTH = 380;

const MONO_FONT = `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`;

// Tiny white constellation stars behind the stream. By default they drift
// slowly UPWARD (like the code stream) and twinkle; near the cursor they're
// gently gathered toward it with a soft glow + faint links — a restrained,
// premium interactive layer.
const AREA_PER_STAR = 11000;
const MAX_STARS = 90;
const MAX_STARS_MOBILE = 45;

// Star drift + cursor interaction.
const STAR_DRIFT = 0.16; // px/frame upward base drift
const STAR_GATHER = 220; // cursor influence radius (px)
const STAR_GATHER_SQ = STAR_GATHER * STAR_GATHER;
const STAR_PULL = 0.022; // gravity strength toward the cursor
const STAR_RETURN = 0.012; // easing back to home drift when cursor is away

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVy: number; // home upward drift (return target)
  r: number; // radius (very small)
  alpha: number; // base opacity
  tw: number; // twinkle phase
  twAmp: number; // twinkle amplitude
  glow: number; // 0..1 transient brightness near the cursor
};

type Line = {
  text: string;
  x: number;
  y: number;
  vx: number; // slight diagonal
  vy: number; // upward (negative)
  tier: number;
  isError: boolean;
  featured: boolean; // a few legible lines vs the whisper-faint majority
  rgb: readonly [number, number, number];
  baseAlpha: number; // per-line opacity jitter
  life: number; // 0 → 1 → 0 fade envelope progress
  fadeIn: boolean;
  pulse: number; // error "noticed" pulse phase
  flare: number; // error appearance flare, 1 → 0 (extra "caught it" glow)
  width: number; // measured text width (for focus test + offscreen recycle)
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function pickTier(): number {
  const r = Math.random();
  if (r < TIERS[0].weight) return 0;
  if (r < TIERS[0].weight + TIERS[1].weight) return 1;
  return 2;
}

/**
 * Radial mask in [0,1]: ~0.12 in the centre (behind the headline) → 1 toward the
 * edges/top. Dims the stream hard behind the copy so the headline reads cleanly.
 */
function centerMask(x: number, y: number, w: number, h: number): number {
  const cx = w * 0.5;
  const cy = h * 0.42;
  const dx = (x - cx) / (w * 0.48);
  const dy = (y - cy) / (h * 0.42);
  const d = Math.sqrt(dx * dx + dy * dy);
  const t = Math.min(1, Math.max(0, d));
  const eased = t * t * (3 - 2 * t);
  // Near-zero floor behind the copy (headline fully protected) → full at edges.
  return 0.04 + 0.96 * eased;
}

export function HeroCaptureStream() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const host = canvas.parentElement;
    if (!host) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const supportsFilter = (() => {
      try {
        return Boolean(
          Object.getOwnPropertyDescriptor(
            CanvasRenderingContext2D.prototype,
            "filter",
          ),
        );
      } catch {
        return false;
      }
    })();

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;
    let lines: Line[] = [];
    let maxLines = MAX_LINES;
    let stars: Star[] = [];

    const mouse = { x: -1, y: -1, active: false };

    let rafId = 0;
    let running = false;
    let onScreen = true;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    // ── Spawn one line ───────────────────────────────────────────────────────
    // `seed` true → scatter across the field at start; false → enter from below.
    function makeLine(seed: boolean): Line {
      const tier = pickTier();
      const T = TIERS[tier];
      const isError = Math.random() < ERROR_CHANCE;
      // Errors are always "featured" (they're the caught-it moments); a small
      // share of normal lines are featured too. The rest are whisper-faint.
      const featured = isError || Math.random() < FEATURED_CHANCE;
      const text = isError
        ? ERROR_LINES[Math.floor(Math.random() * ERROR_LINES.length)]
        : NORMAL_LINES[Math.floor(Math.random() * NORMAL_LINES.length)];
      const rgb = isError
        ? ERROR_RGB
        : NORMAL_RGBS[Math.floor(Math.random() * NORMAL_RGBS.length)];

      ctx!.font = `${T.size}px ${MONO_FONT}`;
      const w = ctx!.measureText(text).width;

      const speed = T.speed * rand(0.8, 1.25);
      return {
        text,
        x: rand(-w * 0.2, width - w * 0.6),
        y: seed ? rand(0, height) : height + rand(8, 60),
        vx: rand(-0.06, 0.14), // gentle rightward-ish diagonal
        vy: -speed, // upward
        tier,
        isError,
        featured,
        rgb,
        baseAlpha: rand(0.82, 1),
        life: seed ? 1 : 0,
        fadeIn: !seed,
        pulse: rand(0, Math.PI * 2),
        // Errors flare on appearance (a "just caught it" burst); seeded errors
        // start mid-flare so a couple glow immediately.
        flare: isError ? (seed ? rand(0, 0.5) : 1) : 0,
        width: w,
      };
    }

    function buildLines() {
      lines = [];
      if (width < MIN_RENDER_WIDTH) return;
      maxLines = Math.min(
        isMobile ? MAX_LINES_MOBILE : MAX_LINES,
        Math.round((width * height) / AREA_PER_LINE),
      );
      for (let i = 0; i < maxLines; i++) lines.push(makeLine(true));
    }

    function buildStars() {
      stars = [];
      if (width < MIN_RENDER_WIDTH) return;
      const count = Math.min(
        isMobile ? MAX_STARS_MOBILE : MAX_STARS,
        Math.round((width * height) / AREA_PER_STAR),
      );
      for (let i = 0; i < count; i++) {
        const baseVy = -STAR_DRIFT * rand(0.55, 1.25); // upward, varied speed
        stars.push({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.05, 0.05),
          vy: baseVy,
          baseVy,
          r: rand(0.4, 1.1),
          alpha: rand(0.18, 0.55),
          tw: rand(0, Math.PI * 2),
          twAmp: rand(0.15, 0.4),
          glow: 0,
        });
      }
    }

    // ── Size / DPR ───────────────────────────────────────────────────────────
    function resize() {
      const rect = host!.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      isMobile = width <= MOBILE_MAX_WIDTH;

      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildLines();
      buildStars();
    }

    // ── Per-frame draw ───────────────────────────────────────────────────────
    function step() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.textBaseline = "middle";
      const useFocus = mouse.active && !isMobile && !prefersReducedMotion;

      // ── Constellation stars (behind the stream) — drift slowly UPWARD by
      //    default and gather toward the cursor with a soft glow + faint links.
      //    Glow-blended so they read as soft points of light. ──
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      for (const s of stars) {
        if (!prefersReducedMotion) {
          // Cursor gravity (desktop): pull toward the cursor, brighten, then
          // ease velocity back to the home upward drift so it never snaps or
          // runs away — calm, premium, physical.
          if (useFocus) {
            const dx = mouse.x - s.x;
            const dy = mouse.y - s.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < STAR_GATHER_SQ && dSq > 1) {
              const falloff = 1 - dSq / STAR_GATHER_SQ;
              s.vx += dx * STAR_PULL * 0.012 * falloff;
              s.vy += dy * STAR_PULL * 0.012 * falloff;
              s.glow = Math.max(s.glow, falloff);
            }
          }
          s.glow *= 0.93;
          // Ease back to home drift (vx → 0, vy → baseVy upward).
          s.vx += (0 - s.vx) * STAR_RETURN;
          s.vy += (s.baseVy - s.vy) * STAR_RETURN;
          // Clamp so gravity can't fling a star.
          const sp = Math.hypot(s.vx, s.vy);
          const maxSp = STAR_DRIFT * 6;
          if (sp > maxSp) {
            s.vx = (s.vx / sp) * maxSp;
            s.vy = (s.vy / sp) * maxSp;
          }
          s.x += s.vx;
          s.y += s.vy;
          // Wrap: re-enter from the bottom when it drifts off the top (and wrap
          // sideways so cursor-pushed stars never vanish at the edges).
          if (s.y < -8) {
            s.y = height + 8;
            s.x = rand(0, width);
            s.glow = 0;
          } else if (s.y > height + 8) {
            s.y = -8;
          }
          if (s.x < -8) s.x = width + 8;
          else if (s.x > width + 8) s.x = -8;
          s.tw += 0.012;
        }

        const twinkle = prefersReducedMotion ? 1 : 1 + Math.sin(s.tw) * s.twAmp;
        const mask = 0.45 + 0.55 * centerMask(s.x, s.y, width, height);
        const boost = 1 + s.glow * 0.6; // gentler brighten near the cursor
        const a = Math.max(0, Math.min(0.55, s.alpha * twinkle * mask * boost));
        if (a < 0.004) continue;

        const r = s.r * (1 + s.glow * 0.5);
        // Soft bloom on brighter / gathered stars (distant light w/ atmosphere).
        if (s.glow > 0.05 || s.alpha > 0.42) {
          const gR = r * 3.2;
          const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, gR);
          g.addColorStop(0, `rgba(255, 255, 255, ${a * 0.3})`);
          g.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, gR, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();

      for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        const T = TIERS[ln.tier];

        // ── Motion + lifecycle ──
        if (!prefersReducedMotion) {
          ln.x += ln.vx;
          ln.y += ln.vy;
          ln.pulse += ln.isError ? 0.055 : 0.02;
          if (ln.flare > 0) ln.flare = Math.max(0, ln.flare - 0.006); // slow decay
          if (ln.fadeIn) {
            ln.life += 0.02;
            if (ln.life >= 1) {
              ln.life = 1;
              ln.fadeIn = false;
            }
          }
          // Recycle when fully off the top → respawn from below.
          if (ln.y < -20) {
            lines[i] = makeLine(false);
            continue;
          }
        }

        // ── Focus lens: distance from cursor → focus factor in [0,1] ──
        let focus = 0;
        if (useFocus) {
          // Use the line's mid-point for the focus test.
          const mx = ln.x + ln.width * 0.5;
          const dx = mouse.x - mx;
          const dy = mouse.y - ln.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < FOCUS_RADIUS_SQ) {
            const f = 1 - Math.sqrt(dSq) / FOCUS_RADIUS;
            focus = f * f; // ease-in so the lens edge is soft
          }
        }

        const mask = centerMask(ln.x + ln.width * 0.5, ln.y, width, height);

        // Error "noticed" animation: a clear soft pulse, amplified by the
        // appearance flare so a freshly-caught error visibly glows then settles.
        const errorPulse = ln.isError
          ? 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(ln.pulse)) + ln.flare * 0.6
          : 1;

        // STRONG HIERARCHY: ambient lines sit whisper-faint; featured/error
        // lines are clearly legible. The cursor lens lifts ANY line toward full.
        const baseVis = ln.featured ? FEATURED_VIS : FAINT_VIS;
        const vis = baseVis + focus * (1 - baseVis);
        const alpha = Math.max(
          0,
          Math.min(
            0.95,
            ln.baseAlpha * T.alphaMul * mask * ln.life * errorPulse * vis,
          ),
        );
        if (alpha < 0.008) continue;

        // Blur: tier blur, sharpened to ~0 as the line comes into focus (so the
        // cursor lens clearly resolves lines out of the soft-blurred baseline).
        const blur = T.blur * (1 - focus);
        if (supportsFilter) {
          ctx!.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
        }

        ctx!.font = `${T.size}px ${MONO_FONT}`;
        const [r, g, b] = ln.rgb;

        // Soft glow: errors glow on their own (pulse + flare) so they're the
        // occasional bright "caught it" moments; normal lines only glow when the
        // cursor focuses them. Additive for a luminous-capture read.
        const glow = ln.isError
          ? (0.3 + ln.flare * 0.7) * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(ln.pulse))) +
            focus * 0.4
          : focus * 0.55;
        if (glow > 0.05) {
          const gc = ln.isError ? ERROR_RGB : ELECTRIC;
          ctx!.save();
          ctx!.globalCompositeOperation = "lighter";
          // Two stacked passes for errors = a soft bloom around the text.
          ctx!.fillStyle = `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${0.18 * glow})`;
          ctx!.fillText(ln.text, ln.x, ln.y);
          if (ln.isError) {
            ctx!.fillText(ln.text, ln.x, ln.y);
          }
          ctx!.restore();
        }

        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx!.fillText(ln.text, ln.x, ln.y);
      }

      if (supportsFilter) ctx!.filter = "none";

      // Cinematic vignette — gentle edge darkening to frame the field.
      const vig = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.44,
        Math.min(width, height) * 0.34,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72,
      );
      vig.addColorStop(0, "rgba(8, 7, 18, 0)");
      vig.addColorStop(1, "rgba(8, 7, 18, 0.42)");
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, width, height);
    }

    function loop() {
      if (!running) return;
      step();
      rafId = window.requestAnimationFrame(loop);
    }
    function start() {
      if (running || prefersReducedMotion) return;
      if (lines.length === 0) return;
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

    // ── Events ───────────────────────────────────────────────────────────────
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
        if (prefersReducedMotion) step();
        else if (onScreen && lines.length > 0 && !running) start();
      }, 150);
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    resize();

    if (prefersReducedMotion) {
      step(); // single calm static frame
    } else {
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

      host.addEventListener("pointermove", handlePointerMove, { passive: true });
      host.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
      window.addEventListener("resize", handleResize);

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

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="hcd-capture-stream" aria-hidden="true" />
  );
}
