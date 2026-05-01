"use client";

import { useState, useRef, useEffect } from "react";
import {
  MousePointer2,
  Pencil,
  Eraser,
  Square,
  Circle,
  Minus,
  Squircle,
  Crop,
  Undo2,
  Redo2,
  X,
  Save,
  Loader2,
  Check,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import type { Tool } from "./ScreenshotEditor";
import { Tooltip } from "@/components/ui/Tooltip";

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const PALETTE_COLORS = [
  "#000000", "#FFFFFF", "#9CA3AF", "#6B7280", "#4B5563", "#374151",
  "#EC4899", "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#1775E0", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#F43F5E", "#FB7185", "#FCA5A5",
  "#FED7AA", "#FEF08A", "#BBF7D0", "#BAE6FD", "#C7D2FE", "#DDD6FE",
];

const SHAPE_TOOLS: Tool[] = ["rect", "ellipse", "line", "arrow"];

function hexWithAlpha(hex: string, alpha: number): string {
  if (!hex || hex === "transparent") return "transparent";
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function OpacitySlider({ color, value, onChange }: { color: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative flex-1 h-6 rounded-full overflow-hidden cursor-pointer"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              color && color !== "transparent"
                ? `linear-gradient(to right, transparent, ${color})`
                : "linear-gradient(to right, transparent, #fff)",
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(value * 100)}
          onChange={e => onChange(Number(e.target.value) / 100)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[var(--brand)] shadow pointer-events-none"
          style={{ left: `clamp(8px, calc(${value * 100}% - 8px), calc(100% - 8px))` }}
        />
      </div>
      <span className="text-white/60 text-[12px] w-8 text-right tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

interface EditorToolbarProps {
  activeTool: Tool;
  setActiveTool: (t: Tool) => void;
  color: string;
  onColorChange: (c: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  fillColor: string;
  onFillColorChange: (c: string) => void;
  outlineColor: string;
  onOutlineColorChange: (c: string) => void;
  fillOpacity: number;
  onFillOpacityChange: (v: number) => void;
  outlineWidth: number;
  onOutlineWidthChange: (v: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  cropPending: boolean;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

interface ToolButtonProps {
  tool: Tool;
  activeTool: Tool;
  setActiveTool: (t: Tool) => void;
  icon: React.ReactNode;
  label: string;
}

function ToolButton({ tool, activeTool, setActiveTool, icon, label }: ToolButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={() => setActiveTool(tool)}
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
          activeTool === tool
            ? "bg-white text-[#1C1C1E]"
            : "text-white/70 hover:text-white hover:bg-white/10"
        )}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

function Divider() {
  return <div className="w-px h-7 bg-white/20 mx-0.5 shrink-0" />;
}

function NoFillSwatch({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "w-5 h-5 rounded-full flex-shrink-0 relative overflow-hidden border border-white/30",
        active && "ring-2 ring-white ring-offset-1 ring-offset-[#2C2C2E]"
      )}
    >
      <span className="absolute inset-0 bg-white" />
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top right, transparent calc(50% - 1px), var(--color-danger) calc(50% - 1px), var(--color-danger) calc(50% + 1px), transparent calc(50% + 1px))",
        }}
      />
    </span>
  );
}

function NoOutlineSwatch({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "w-5 h-5 rounded-full flex-shrink-0 relative overflow-hidden border border-white/30",
        active && "ring-2 ring-white ring-offset-1 ring-offset-[#2C2C2E]"
      )}
    >
      <span className="absolute inset-0 bg-white" />
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top right, transparent calc(50% - 1px), var(--color-danger) calc(50% - 1px), var(--color-danger) calc(50% + 1px), transparent calc(50% + 1px))",
        }}
      />
    </span>
  );
}

export function EditorToolbar({
  activeTool,
  setActiveTool,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fillColor,
  onFillColorChange,
  outlineColor,
  onOutlineColorChange,
  fillOpacity,
  onFillOpacityChange,
  outlineWidth,
  onOutlineWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClose,
  onSave,
  saving,
  cropPending,
  onApplyCrop,
  onCancelCrop,
}: EditorToolbarProps) {
  const [drawPopoverOpen, setDrawPopoverOpen] = useState(false);
  const [shapesMenuOpen, setShapesMenuOpen] = useState(false);
  const [fillPickerOpen, setFillPickerOpen] = useState(false);
  const [outlinePickerOpen, setOutlinePickerOpen] = useState(false);

  const drawPopoverRef = useRef<HTMLDivElement>(null);
  const shapesMenuRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const outlinePreviewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!drawPopoverOpen && !shapesMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        drawPopoverOpen &&
        drawPopoverRef.current &&
        !drawPopoverRef.current.contains(e.target as Node)
      ) {
        setDrawPopoverOpen(false);
      }
      if (
        shapesMenuOpen &&
        shapesMenuRef.current &&
        !shapesMenuRef.current.contains(e.target as Node)
      ) {
        setShapesMenuOpen(false);
        setFillPickerOpen(false);
        setOutlinePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [drawPopoverOpen, shapesMenuOpen]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 360, 64);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = 10; x <= 350; x++) {
      const y = 32 + Math.sin((x / 350) * Math.PI * 2.5) * 20;
      x === 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [color, strokeWidth, drawPopoverOpen]);

  useEffect(() => {
    const canvas = outlinePreviewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 340, 64);
    ctx.strokeStyle = hexWithAlpha(outlineColor, 1);
    ctx.lineWidth = outlineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = 10; x <= 330; x++) {
      const y = 32 + Math.sin((x / 330) * Math.PI * 2.5) * 20;
      x === 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [outlineColor, outlineWidth, outlinePickerOpen]);

  useEffect(() => {
    if (activeTool !== "pen") setDrawPopoverOpen(false);
  }, [activeTool]);

  const iconProps = { className: "h-5 w-5", strokeWidth: 1.75 } as const;
  const isShapeActive = SHAPE_TOOLS.includes(activeTool);

  const activeShapeIcon = (() => {
    if (activeTool === "rect") return <Square {...iconProps} />;
    if (activeTool === "ellipse") return <Circle {...iconProps} />;
    if (activeTool === "line") return <Minus {...iconProps} />;
    if (activeTool === "arrow") return <ArrowUpRight {...iconProps} />;
    return <Squircle {...iconProps} />;
  })();

  if (activeTool === "crop") {
    return (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-[#1C1C1E] rounded-2xl shadow-2xl border border-white/10">
        <button
          type="button"
          onClick={onApplyCrop}
          disabled={!cropPending}
          className="h-12 px-5 bg-[var(--color-success-solid)] hover:bg-[var(--color-success)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[15px] font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <Check className="h-5 w-5" strokeWidth={2} />
          Apply
        </button>
        <button
          type="button"
          onClick={onCancelCrop}
          className="h-12 px-5 bg-white/10 hover:bg-white/20 text-white text-[15px] font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <X className="h-5 w-5" strokeWidth={2} />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Shapes submenu — floats above the main pill */}
      {shapesMenuOpen && (
        <div
          ref={shapesMenuRef}
          className="fixed bottom-[8.5rem] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-3 bg-[#1C1C1E] rounded-2xl shadow-xl border border-white/10 z-50"
        >
          <ToolButton tool="rect" activeTool={activeTool} setActiveTool={setActiveTool} label="Rectangle" icon={<Square {...iconProps} />} />
          <ToolButton tool="ellipse" activeTool={activeTool} setActiveTool={setActiveTool} label="Ellipse" icon={<Circle {...iconProps} />} />
          <ToolButton tool="line" activeTool={activeTool} setActiveTool={setActiveTool} label="Line" icon={<Minus {...iconProps} />} />
          <ToolButton tool="arrow" activeTool={activeTool} setActiveTool={setActiveTool} label="Arrow" icon={<ArrowUpRight {...iconProps} />} />

          <Divider />

          {/* Fill picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setFillPickerOpen(v => !v); setOutlinePickerOpen(false); }}
              className="flex items-center gap-1.5 h-12 px-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-[14px]"
            >
              {fillColor === "transparent" ? (
                <NoFillSwatch active={false} />
              ) : (
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 border border-white/20"
                  style={{ background: fillColor }}
                />
              )}
              Fill
              <ChevronDown className="h-3 w-3" />
            </button>
            {fillPickerOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 bg-[#2C2C2E] border border-white/10 rounded-2xl p-5 shadow-2xl z-[60] w-[360px]">
                <p className="text-white/50 text-[14px] font-semibold tracking-wider uppercase mb-2">Colors</p>
                <button
                  onClick={() => { onFillColorChange("transparent"); setFillPickerOpen(false); }}
                  className="flex items-center gap-2 mb-2 text-white/70 hover:text-white text-[14px]"
                >
                  <NoFillSwatch active={fillColor === "transparent"} />
                  No fill
                </button>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {PALETTE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { onFillColorChange(c); setFillPickerOpen(false); }}
                      className={cn(
                        "w-8 h-8 rounded-full hover:scale-110 transition-transform",
                        fillColor === c && "ring-2 ring-white ring-offset-1 ring-offset-[#2C2C2E]"
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <p className="text-white/50 text-[14px] font-semibold tracking-wider uppercase mb-2">Opacity</p>
                <OpacitySlider color={fillColor} value={fillOpacity} onChange={onFillOpacityChange} />
              </div>
            )}
          </div>

          {/* Outline picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOutlinePickerOpen(v => !v); setFillPickerOpen(false); }}
              className="flex items-center gap-1.5 h-12 px-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-[14px]"
            >
              <span
                className="w-5 h-5 rounded-full flex-shrink-0 border-2"
                style={{
                  borderColor:
                    outlineColor === "transparent"
                      ? "rgba(255,255,255,0.3)"
                      : outlineColor,
                  background: "transparent",
                }}
              />
              Outline
              <ChevronDown className="h-3 w-3" />
            </button>
            {outlinePickerOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 bg-[#2C2C2E] border border-white/10 rounded-2xl p-5 shadow-2xl z-[60] w-[380px]">
                <p className="text-white/50 text-[14px] font-semibold tracking-wider uppercase mb-2">Colors</p>
                <button
                  onClick={() => { onOutlineColorChange("transparent"); setOutlinePickerOpen(false); }}
                  className="flex items-center gap-2 mb-2 text-white/70 hover:text-white text-[14px]"
                >
                  <NoOutlineSwatch active={outlineColor === "transparent"} />
                  No outline
                </button>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {PALETTE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { onOutlineColorChange(c); setOutlinePickerOpen(false); }}
                      className={cn(
                        "w-8 h-8 rounded-full hover:scale-110 transition-transform",
                        outlineColor === c && "ring-2 ring-white ring-offset-1 ring-offset-[#2C2C2E]"
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <p className="text-white/50 text-[14px] font-semibold tracking-wider uppercase mb-2">Size</p>
                <canvas ref={outlinePreviewRef} width={340} height={64} className="w-full rounded-lg bg-black/20 mb-2" />
                <input
                  type="range"
                  min={1}
                  max={16}
                  value={outlineWidth}
                  onChange={e => onOutlineWidthChange(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main toolbar pill */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-4 py-3.5 bg-[#1C1C1E] rounded-2xl shadow-2xl border border-white/10">
        <ToolButton tool="select" activeTool={activeTool} setActiveTool={setActiveTool} label="Select" icon={<MousePointer2 {...iconProps} />} />

        {/* Pen tool with Draw popover on second click */}
        <div className="relative self-stretch flex items-center" ref={drawPopoverRef}>
          <ToolButton
            tool="pen"
            activeTool={activeTool}
            setActiveTool={(t) => {
              if (activeTool === "pen") {
                setDrawPopoverOpen(v => !v);
              } else {
                setActiveTool(t);
                setDrawPopoverOpen(false);
              }
            }}
            label="Pen"
            icon={<Pencil {...iconProps} />}
          />
          {drawPopoverOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 w-[400px] bg-[#2C2C2E] rounded-2xl p-5 shadow-2xl border border-white/10 z-[60]">
              <p className="text-white/50 text-[14px] font-semibold tracking-wider uppercase mb-3">Colors</p>
              <div className="grid grid-cols-6 gap-2.5 mb-4">
                {PALETTE_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { onColorChange(c); setDrawPopoverOpen(false); }}
                    className={cn(
                      "w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform",
                      color === c && "ring-2 ring-white ring-offset-2 ring-offset-[#2C2C2E]"
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="text-white/50 text-[14px] font-semibold tracking-wider uppercase mb-2">Size</p>
              <canvas ref={previewCanvasRef} width={360} height={64} className="w-full rounded-lg bg-black/20 mb-3" />
              <input
                type="range"
                min={1}
                max={24}
                value={strokeWidth}
                onChange={e => onStrokeWidthChange(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}
        </div>

        <ToolButton tool="eraser" activeTool={activeTool} setActiveTool={setActiveTool} label="Eraser" icon={<Eraser {...iconProps} />} />

        {/* Shapes trigger */}
        <Tooltip content="Shapes">
          <button
            type="button"
            onClick={() => setShapesMenuOpen(v => !v)}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              isShapeActive || shapesMenuOpen
                ? "bg-white text-[#1C1C1E]"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            {activeShapeIcon}
          </button>
        </Tooltip>

        {/* Crop */}
        <ToolButton tool="crop" activeTool={activeTool} setActiveTool={setActiveTool} label="Crop" icon={<Crop {...iconProps} />} />

        <Divider />

        {/* Undo / Redo */}
        <Tooltip content="Undo (Ctrl+Z)">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 {...iconProps} />
          </button>
        </Tooltip>
        <Tooltip content="Redo (Ctrl+Shift+Z)">
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 {...iconProps} />
          </button>
        </Tooltip>

        <Divider />

        {/* Crop confirm (shown only when crop rect is pending) */}
        {cropPending && (
          <>
            <button
              type="button"
              onClick={onApplyCrop}
              className="h-[38px] px-4 bg-[var(--color-success-solid)] hover:bg-[var(--color-success)] text-white text-[14px] font-medium rounded-[var(--radius-btn)] transition-colors flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              Apply Crop
            </button>
            <Divider />
          </>
        )}

        {/* Close */}
        <Tooltip content="Close editor">
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X {...iconProps} />
          </button>
        </Tooltip>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.75} />
          )}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );
}
