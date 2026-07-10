/**
 * <CodeRain /> — ghosted monospace capture-telemetry columns drifting slowly
 * upward on a dark surface, in the mold of the reference's flagship-band log
 * rain. Purely decorative (aria-hidden), deterministic markup (no runtime
 * randomness → no hydration mismatch), CSS-animated (translateY loop over a
 * doubled line set), and masked so content above it stays legible.
 *
 * Styles: .nv-coderain / .nv-coderain-col in nova.css.
 */

const FRAGMENTS = [
  "GET /api/me 200 · 38ms",
  "console.log('cart updated')",
  "click → .cta-primary",
  "POST /api/checkout 500",
  "navigated /pricing",
  "fetch /api/session → 200",
  "input → #email",
  "GET /api/flags 200 · 12ms",
  "TypeError: undefined is not a function",
  "scroll → 1240px",
  "PATCH /api/profile 200",
  "console.error('payment failed')",
  "resize → 1440×900",
  "GET /api/tickets 200 · 64ms",
  "response: userId mismatch",
  "click → [data-id='row-3']",
  "console.info('hydrated')",
  "PUT /api/order 409 Conflict",
  "GET /assets/app.js 200",
  "session.replay attached",
  "ticket #4821 · diagnosed",
  "email: <redacted>",
] as const;

export function CodeRain({ cols = 6, rows = 22 }: { cols?: number; rows?: number }) {
  return (
    <div className="nv-coderain" aria-hidden="true">
      {Array.from({ length: cols }, (_, i) => {
        const cell = (k: number, pass: number) => {
          const idx = (i * 7 + k * 3) % FRAGMENTS.length;
          const tier = (i + k) % 5 === 0 ? "hi" : (i + k) % 3 === 0 ? "lo" : "";
          return (
            <span key={`${pass}-${k}`} className={tier}>
              {FRAGMENTS[idx]}
            </span>
          );
        };
        return (
          <div
            key={i}
            className="nv-coderain-col"
            style={
              {
                left: `${(i * 100) / cols - 1}%`,
                "--dur": `${64 + ((i * 13) % 42)}s`,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: rows }, (_, k) => cell(k, 0))}
            {Array.from({ length: rows }, (_, k) => cell(k, 1))}
          </div>
        );
      })}
    </div>
  );
}
