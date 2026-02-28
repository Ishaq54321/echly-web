"use client";

type Props = {
  isActive: boolean;
};

const BAR_COUNT = 6;
const DELAYS = [0, 0.12, 0.28, 0.18, 0.34, 0.22];
const PEAKS = [18, 22, 20, 24, 19, 21];

export default function AudioWaveform({ isActive }: Props) {
  return (
    <div className="flex items-center justify-center gap-[6px] h-[60px] waveform-root">
      {[...Array(BAR_COUNT)].map((_, i) => (
        <span
          key={i}
          className={`w-[4px] rounded-full bg-gradient-to-b from-rose-500 to-red-600 transition-none waveform-bar ${
            isActive ? "waveform-bar--active" : "h-[6px] opacity-40"
          }`}
          style={
            isActive
              ? {
                  animationDelay: `${DELAYS[i]}s`,
                  animationDuration: `${1.4 + (i % 3) * 0.15}s`,
                  ["--peak" as string]: `${PEAKS[i]}px`,
                }
              : undefined
          }
        />
      ))}

      <style jsx>{`
        @keyframes waveform-organic {
          0%, 100% {
            height: 8px;
            opacity: 0.85;
          }
          45% {
            height: var(--peak, 20px);
            opacity: 1;
          }
          55% {
            height: var(--peak, 20px);
            opacity: 1;
          }
        }

        .waveform-bar--active {
          animation: waveform-organic 1.55s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}