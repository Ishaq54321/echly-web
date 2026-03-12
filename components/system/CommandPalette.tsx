"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface CommandPaletteItem {
  id: string;
  title: string;
  meta?: string;
}

interface CommandPaletteProps {
  items: CommandPaletteItem[];
  onSelect: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CommandPalette({
  items,
  onSelect,
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (!isOpen) {
      const id = requestAnimationFrame(() => setEntered(false));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const setOpen = useCallback(
    (value: boolean) => {
      if (isControlled && onOpenChange) onOpenChange(value);
      else setInternalOpen(value);
      if (!value) {
        setQuery("");
        setActiveIndex(0);
      } else {
        setActiveIndex(0);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [isControlled, onOpenChange]
  );

  const filtered = query.trim()
    ? items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const clampedIndex = Math.min(
    Math.max(0, activeIndex),
    Math.max(0, filtered.length - 1)
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
        return;
      }
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[clampedIndex]) {
        e.preventDefault();
        onSelect(filtered[clampedIndex].id);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen, filtered, clampedIndex, onSelect]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setActiveIndex(0));
    return () => cancelAnimationFrame(id);
  }, [query]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-[15vh] backdrop-blur-sm cursor-pointer"
      onClick={handleOverlayClick}
    >
      <div
        className={`w-full max-w-2xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--layer-1-border)] bg-[var(--layer-1-bg)] shadow-[var(--shadow-level-5)] transition-all duration-[var(--motion-duration)] cursor-default ${
          entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--layer-2-border)]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent px-6 py-5 text-base outline-none placeholder:text-[hsl(var(--text-muted))] placeholder:opacity-80 focus-visible:outline-none"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={
              filtered[clampedIndex] ? `command-result-${filtered[clampedIndex].id}` : undefined
            }
          />
        </div>
        <div
          id="command-palette-results"
          role="listbox"
          className="max-h-[400px] overflow-y-auto"
        >
          <div
            className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--text-muted))] px-6 pt-4 pb-2"
            aria-hidden
          >
            NAVIGATION
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[hsl(var(--text-muted))]">
              <p>No matching results</p>
              <p className="mt-2 text-xs opacity-80">
                Try another keyword or press Enter to create
              </p>
            </div>
          ) : (
            <div className="pb-2">
              {filtered.map((item, index) => (
                <button
                  key={item.id}
                  id={`command-result-${item.id}`}
                  role="option"
                  aria-selected={index === clampedIndex}
                  type="button"
                  className={`w-full cursor-pointer rounded-xl px-6 py-3.5 text-left text-sm transition-colors duration-[var(--motion-duration)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
                    index === clampedIndex
                      ? "bg-[var(--color-primary-soft)]"
                      : "hover:bg-[var(--layer-2-hover-bg)]"
                  }`}
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="font-medium">{item.title}</div>
                  {item.meta && (
                    <div className="text-xs text-[hsl(var(--text-muted))]">
                      {item.meta}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
