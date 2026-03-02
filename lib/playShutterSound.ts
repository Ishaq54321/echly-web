/**
 * Play a subtle shutter sound (low volume) for screenshot confirm.
 * Uses Web Audio API; no external assets.
 */
let cachedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!cachedContext) {
    try {
      cachedContext = new AudioContext();
    } catch {
      return null;
    }
  }
  return cachedContext;
}

export function playShutterSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
  osc.type = "sine";
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.start(now);
  osc.stop(now + 0.06);
}
