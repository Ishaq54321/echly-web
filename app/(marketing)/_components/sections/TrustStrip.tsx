const MARKS: ReadonlyArray<string> = [
  "HORIZON",
  "Foreground",
  "NORTHWIND",
  "sixfold",
  "Paleblue",
  "QUARRY",
];

export function TrustStrip() {
  return (
    <section className="trust">
      <div className="trust-inner">
        <p className="trust-eyebrow">
          Trusted by design-led teams shipping fast
        </p>
        <div className="trust-row">
          {MARKS.map((m) => (
            <span key={m} className="trust-mark">
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
