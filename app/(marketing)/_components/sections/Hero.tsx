import { HeroCaptureDemo } from "../demos";

export function Hero() {
  // v15: the hero is now ONE unified composition — the marketing copy lives
  // INSIDE the capture demo so the entire hero is the interactive zone (the copy
  // included). HeroCaptureDemo owns the copy, the cursor, and the click handling;
  // the only non-capturing element is the real "Get Annote" CTA.
  return (
    <section id="top" className="hero hero-unified">
      {/* Background is near-white with a very faint static gradient wash (see
          .hero in marketing.css). The animated aurora blobs were removed. */}
      <div className="hero-stage hero-stage--demo">
        <HeroCaptureDemo />
      </div>
    </section>
  );
}

