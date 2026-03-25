export function ProgressRing({ value }: { value: number }) {
  const size = 40;
  const stroke = 3.5;
  const center = size / 2;
  const radius = center - stroke / 2;
  const circumference = radius * 2 * Math.PI;
  const safeValue = Math.max(0, Math.min(1, value));
  const offset = circumference - safeValue * circumference;
  const pct = Math.round(safeValue * 100);
  const progressClass =
    pct < 30 ? "text-red-500" : pct < 70 ? "text-amber-500" : "text-green-500";

  return (
    <div className="relative h-10 w-10 shrink-0" aria-hidden>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 transition-all duration-300"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-neutral-200"
          stroke="currentColor"
          fill="none"
          strokeWidth={stroke}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          className={progressClass}
          stroke="currentColor"
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={center}
          cy={center}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-neutral-900">
        {pct}%
      </span>
    </div>
  );
}
