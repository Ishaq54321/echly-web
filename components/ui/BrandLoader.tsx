export default function BrandLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg className="loader" width="48" height="48" viewBox="0 0 48 48">

        {/* Base circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          className="loader-track"
        />

        {/* Animated arc */}
        <circle
          cx="24"
          cy="24"
          r="18"
          className="loader-arc"
        />

        <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#1775E0">
      <animate
        attributeName="offset"
        values="0;1"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </stop>
    <stop offset="100%" stopColor="#C3DFFE">
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