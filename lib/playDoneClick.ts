/**
 * Play a soft 50ms click sound (Done interaction).
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

export function playDoneClick(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
  osc.type = "sine";
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.start(now);
  osc.stop(now + 0.05);
}
