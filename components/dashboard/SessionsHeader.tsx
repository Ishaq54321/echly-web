"use client";

import { useMemo } from "react";

interface SessionsHeaderProps {
  workspaceName?: string;
  firstName?: string;
}

function getGreeting(firstName?: string): { emoji: string; text: string } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[day];
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );

  const n = (t: string) => firstName ? `${t}, ${firstName}` : t;

  let timeEmoji: string;
  if (hour < 12) {
    timeEmoji = "☀️";
  } else if (hour < 17) {
    timeEmoji = "👋";
  } else {
    timeEmoji = "🌙";
  }
  let timeText: string;
  if (hour < 12) {
    timeText = n("Good morning");
  } else if (hour < 17) {
    timeText = n("Good afternoon");
  } else {
    timeText = n("Good evening");
  }

  const pool: { emoji: string; text: string }[] = [
    { emoji: timeEmoji, text: timeText },
    { emoji: "⚡", text: n(`Happy ${dayName}`) },
    { emoji: "👋", text: n("Welcome back") },
    { emoji: "✨", text: n("Great to see you") },
    { emoji: "✨", text: n("Ready when you are") },
    { emoji: "⚡", text: n("Let's crush this week") },
    { emoji: "⚡", text: n("Let's make progress") },
    { emoji: "💫", text: n("Hope you're doing well") },
    { emoji: "✨", text: n("Time to create") },
    { emoji: "🌟", text: n("Another great day") },
    { emoji: "✨", text: n("Thinking cap on") },
    { emoji: "💫", text: n("Good to have you back") },
    { emoji: "⚡", text: n("Let's make today count") },
    { emoji: "✨", text: n("Nice to see you again") },
    { emoji: "✨", text: n("Rise and shine") },
    { emoji: "⚡", text: n(`Happy ${dayName}`) },
    { emoji: "🌟", text: n("Enjoy your day") },
    { emoji: "⚡", text: n("Midweek momentum") },
    { emoji: "💫", text: n("Almost there") },
    { emoji: "⚡", text: n(`Happy ${dayName}`) },
    { emoji: "💫", text: n("Let's go") },
  ];

  return pool[dayOfYear % pool.length];
}

export function SessionsHeader({ workspaceName, firstName }: SessionsHeaderProps) {
  const greeting = useMemo(() => getGreeting(firstName), [firstName]);

  return (
    <div className="w-full mb-2">
      <div className="text-[14px] font-medium text-[var(--text-secondary)] mb-1 min-h-[20px]">
        {workspaceName || " "}
      </div>
      <h1 className="text-[28px] font-semibold text-[var(--text-heading)] tracking-[-0.02em] flex items-center gap-3">
        <span
          className="inline-block animate-wave origin-[70%_70%]"
          role="img"
          aria-label="wave"
        >
          {greeting.emoji}
        </span>
        {greeting.text}
      </h1>

      <style>{`
        @keyframes wave-hand {
          0%   { transform: rotate(0deg); }
          10%  { transform: rotate(14deg); }
          20%  { transform: rotate(-8deg); }
          30%  { transform: rotate(14deg); }
          40%  { transform: rotate(-4deg); }
          50%  { transform: rotate(10deg); }
          60%  { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave-hand 2.5s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
