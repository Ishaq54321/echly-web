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
        className="rounded-2xl border border-[#E3E6E5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[#FFFFFF] p-6 max-w-md w-full cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="rename-folder-title"
          className="text-h3 font-semibold text-[#111111] mb-4"
        >
          Rename folder
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2.5 rounded-full border border-[#E3E6E5] text-[#111111] placeholder:text-[#111111] focus:outline-none focus:border-[#D1D5DB] focus:shadow-[0_0_0_3px_rgba(209,213,219,0.4)]"
          aria-label="Folder name"
          aria-invalid={!!error}
        />
        {error && (
          <p className="mt-2 text-meta text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-meta font-medium rounded-full text-[#111111] hover:bg-[#E9ECEB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={value.trim() === ""}
            className="primary-cta px-4 py-2.5 text-meta rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
