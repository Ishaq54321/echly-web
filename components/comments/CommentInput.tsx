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
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Write a comment..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm 
                   focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
                   transition-all duration-150"
      />

      <button
        onClick={handleSend}
        className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl 
                   transition-all duration-150 shadow-sm"
      >
        <Send size={16} />
      </button>
    </div>
  );
}