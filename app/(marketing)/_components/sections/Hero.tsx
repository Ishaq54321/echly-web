import { HeroCaptureDemo } from "../demos";

export function Hero() {
  // v15: the hero is now ONE unified composition — the marketing copy lives
  // INSIDE the capture demo so the entire hero is the interactive zone (the copy
  // included). HeroCaptureDemo owns the copy, the cursor, and the click handling;
  // the only non-capturing element is the real "Get Annote" CTA.
  return (
    <section id="top" className="hero hero-unified">
      {/* Animated aurora background — deep-blue base with soft drifting
          blue/teal/green/magenta blobs. Purely decorative, sits behind the
          demo, and is frozen by prefers-reduced-motion (see marketing.css). */}
      <div className="hero-aurora" aria-hidden="true">
        <span className="hero-aurora-blob hero-aurora-blob--a" />
        <span className="hero-aurora-blob hero-aurora-blob--b" />
        <span className="hero-aurora-blob hero-aurora-blob--c" />
        <span className="hero-aurora-blob hero-aurora-blob--d" />
      </div>
      <div className="hero-stage hero-stage--demo">
        <HeroCaptureDemo />
      </div>
    </section>
  );
}

