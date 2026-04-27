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
    <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-subtle)]/80 px-4 py-3 focus-within:bg-[var(--surface-subtle)] focus-within:ring-2 focus-within:ring-[var(--border)] focus-within:ring-offset-0 transition-all duration-150 ease-out">
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
        className="flex-1 min-w-0 bg-transparent text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] text-sm focus:outline-none py-0.5"
      />
      <button
        type="button"
        disabled={!newMessage.trim()}
        onClick={() => onSend(newMessage)}
        className={`flex-shrink-0 text-sm font-medium transition-colors duration-120 rounded-md px-2 py-1 ${
          newMessage.trim()
            ? "text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-hover)] cursor-pointer"
            : "text-[var(--text-placeholder)] cursor-not-allowed"
        }`}
      >
        Send
      </button>
    </div>
  );
}
