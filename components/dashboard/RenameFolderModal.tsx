"use client";

import { useEffect, useRef, useState } from "react";

export interface RenameFolderModalProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

export function RenameFolderModal({
  open,
  onClose,
  currentName,
  onSave,
}: RenameFolderModalProps) {
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(currentName);
    setError(null);
  }, [currentName, open]);

  useEffect(() => {
    if (open) {
      setValue(currentName);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open, currentName]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-folder-title"
    >
      <div
        className="rounded-2xl shadow-lg bg-white p-6 max-w-md w-full cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-folder-title"
          className="text-xl font-semibold text-neutral-900 mb-4"
        >
          Rename folder
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-meta focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-transparent"
          aria-label="Folder name"
          aria-invalid={!!error}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-xl text-secondary hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={value.trim() === ""}
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[#155DFC] text-white hover:bg-[#0F4ED1] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
