"use client";

type Props = {
  isActive: boolean;
};

export default function AudioWaveform({ isActive }: Props) {
  return (
    <div className="flex items-center justify-center gap-[6px] h-[60px] waveform-root">
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className={`w-[4px] rounded-full bg-gradient-to-b from-rose-500 to-red-600 transition-none ${
            isActive ? "waveform-bar waveform-bar--active" : "h-[6px] opacity-40"
          }`}
          style={{
            animationDelay: `${i * 0.14}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes waveform-smooth {
          0%, 100% {
            height: 10px;
          }
          50% {
            height: 28px;
          }
        }

        .waveform-bar--active {
          animation: waveform-smooth 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}