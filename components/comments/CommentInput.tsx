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
    <div className="px-6 py-8 bg-[#FFFFFF] border-b border-[#E3E6E5]">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Write a comment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="chat-input-bar flex-1 w-full text-meta text-[#111111] placeholder:text-[#111111] outline-none focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)] transition-all duration-150"
        />
        <button
          type="button"
          onClick={handleSend}
          className="chat-send-btn flex-shrink-0 cursor-pointer"
          aria-label="Send comment"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
