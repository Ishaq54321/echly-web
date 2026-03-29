export default function BrandLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg className="loader" width="48" height="48" viewBox="0 0 48 48">

        {/* Base hexagon */}
        <polygon
          points="24,6 40,15 40,33 24,42 8,33 8,15"
          className="loader-track"
        />

        {/* Animated arc (same shape) */}
        <polygon
          points="24,6 40,15 40,33 24,42 8,33 8,15"
          className="loader-arc"

        />

        <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#3b82f6">
      <animate
        attributeName="offset"
        values="0;1"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </stop>
    <stop offset="100%" stopColor="#38bdf8">
      <animate
        attributeName="offset"
        values="1;2"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </stop>
          </linearGradient>
        </defs>

      </svg>
    </div>
  );
}