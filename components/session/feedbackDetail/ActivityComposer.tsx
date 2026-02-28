"use client";

interface ActivityComposerProps {
  newMessage: string;
  setNewMessage: (v: string) => void;
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ActivityComposer({
  newMessage,
  setNewMessage,
  onSend,
  placeholder = "Add a comment…",
}: ActivityComposerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3 focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-[hsl(var(--border))] focus-within:ring-offset-0 transition-all duration-150 ease-out">
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend(newMessage);
          }
        }}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none py-0.5"
      />
      <button
        disabled={!newMessage.trim()}
        onClick={() => onSend(newMessage)}
        className={`flex-shrink-0 text-sm font-medium transition-all duration-150 ease-out ${
          newMessage.trim()
            ? "text-slate-700 hover:text-slate-900"
            : "text-slate-300 cursor-not-allowed"
        }`}
      >
        Send
      </button>
    </div>
  );
}
