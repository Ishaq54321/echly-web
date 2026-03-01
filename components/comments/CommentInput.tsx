"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
}

export default function CommentInput({ onSend }: Props) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  };

  return (
    <div className="px-6 py-8 bg-[hsl(var(--surface-1))] border-b">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Write a comment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="focus-ring-brand flex-1 w-full rounded-3xl bg-[hsl(var(--surface-2))] border border-transparent px-5 py-3.5 text-sm outline-none
            placeholder:text-[hsl(var(--text-muted))]
            focus:ring-1 focus:ring-brand-accent focus:border-brand-accent
            transition-all duration-150"
        />
        <button
          type="button"
          onClick={handleSend}
          className="flex-shrink-0 p-2 rounded-md text-brand-accent hover:bg-neutral-100 transition-colors duration-120 cursor-pointer"
          aria-label="Send comment"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
