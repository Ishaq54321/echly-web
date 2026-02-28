"use client";

type Props = {
  isActive: boolean;
};

export default function AudioWaveform({ isActive }: Props) {
  return (
    <div className="flex items-center justify-center gap-[6px] h-[60px]">
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className={`w-[4px] rounded-full bg-gradient-to-b from-rose-500 to-red-600 transition-all duration-300 ${
            isActive ? "animate-wave" : "h-[6px] opacity-40"
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            height: 8px;
          }
          50% {
            height: 32px;
          }
        }

        .animate-wave {
          animation: wave 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}