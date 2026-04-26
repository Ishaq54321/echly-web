"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Image as KImage,
  Line,
  Rect,
  Ellipse,
  Arrow,
  Text,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import { authFetch } from "@/lib/authFetch";
import { useToast } from "@/components/dashboard/context/ToastContext";
import { EditorToolbar } from "./EditorToolbar";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { MODAL_LAYER_Z_INDEX } from "@/lib/ui/zIndex";
import type Konva from "konva";

export type Tool = "select" | "pen" | "eraser" | "rect" | "ellipse" | "line" | "arrow" | "crop";

const EDITOR_PREFS_KEY = "echly_editor_prefs_v1";

interface EditorPrefs {
  color: string;
  strokeWidth: number;
  activeTool: Tool;
  fillColor: string;
  outlineColor: string;
  fillOpacity: number;
  outlineWidth: number;
}

function loadEditorPrefs(): Partial<EditorPrefs> {
  try {
    const raw = localStorage.getItem(EDITOR_PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveEditorPrefs(prefs: EditorPrefs) {
  try {
    localStorage.setItem(EDITOR_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

type AnnotationBase = { id: string };

type LineAnnotation = AnnotationBase & {
  kind: "line";
  points: number[];
  color: string;
  width: number;
};

type RectAnnotation = AnnotationBase & {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  fill: string;
  stroke: string;
  width: number;
};

type EllipseAnnotation = AnnotationBase & {
  kind: "ellipse";
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  fill: string;
  stroke: string;
  width: number;
};

type LineStraightAnnotation = AnnotationBase & {
  kind: "lineStraight";
  points: number[];
  color: string;
  width: number;
};

type ArrowAnnotation = AnnotationBase & {
  kind: "arrow";
  points: number[];
  color: string;
  width: number;
};

type TextAnnotation = AnnotationBase & {
  kind: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

export type Annotation =
  | LineAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | LineStraightAnnotation
  | ArrowAnnotation
  | TextAnnotation;

export interface ScreenshotEditorProps {
  imageUrl: string;
  sessionId: string;
  screenshotId: string;
  hasPins: boolean;
  onSave: (newScreenshotId: string) => void;
  onClose: () => void;
  embedded?: boolean;
}

function makeId(): string {
  return crypto.randomUUID();
}

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

export function ScreenshotEditor({
  imageUrl,
  sessionId,
  hasPins,
  onSave,
  onClose,
  embedded,
}: ScreenshotEditorProps) {
  const { showToast } = useToast();

  // Image source — may be replaced by crop
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [img] = useImage(imageSrc, "anonymous");

  // Tool state
  const savedPrefs = loadEditorPrefs();
  const rawStoredTool = (savedPrefs as { activeTool?: string }).activeTool;
  const [activeTool, setActiveTool] = useState<Tool>(
    rawStoredTool && rawStoredTool !== "text"
      ? rawStoredTool as Tool
      : "pen"
  );
  const [color, setColor] = useState(savedPrefs.color ?? "#EF4444");
  const [strokeWidth, setStrokeWidth] = useState(savedPrefs.strokeWidth ?? 3);
  const [fillColor, setFillColor] = useState(savedPrefs.fillColor ?? "transparent");
  const [outlineColor, setOutlineColor] = useState(savedPrefs.outlineColor ?? "#EF4444");
  const [fillOpacity, setFillOpacity] = useState<number>(savedPrefs.fillOpacity ?? 1);
  const [outlineWidth, setOutlineWidth] = useState<number>(savedPrefs.outlineWidth ?? 2);

  // Annotations
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const annotationsRef = useRef<Annotation[]>([]);
  annotationsRef.current = annotations;

  // Selection (select tool)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // In-progress shape while drawing
  const [inProgress, setInProgress] = useState<Annotation | null>(null);

  // Crop rect (preview)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Eraser cursor overlay
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null);

  // Persist prefs
  useEffect(() => {
    saveEditorPrefs({ color, strokeWidth, activeTool, fillColor, outlineColor, fillOpacity, outlineWidth });
  }, [color, strokeWidth, activeTool, fillColor, outlineColor, fillOpacity, outlineWidth]);

  // Saving
  const [saving, setSaving] = useState(false);

  // Stage size
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedded && containerRef.current) {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setStageSize({
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          });
        }
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    } else {
      function resize() {
        setStageSize({ width: window.innerWidth, height: window.innerHeight });
      }
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }
  }, [embedded]);

  // Konva refs
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Drawing state refs (avoid stale closures in event handlers)
  const drawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const eraserSnapshotRef = useRef<Annotation[] | null>(null);
  const isDrawingCropRef = useRef(false);

  // Undo / redo
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef(history);
  historyRef.current = history;
  const historyIndexRef = useRef(historyIndex);
  historyIndexRef.current = historyIndex;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  function pushHistory(next: Annotation[]) {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setAnnotations(next);
  }

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    setHistoryIndex(idx - 1);
    setAnnotations(historyRef.current[idx - 1]);
  }, []);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx >= hist.length - 1) return;
    setHistoryIndex(idx + 1);
    setAnnotations(hist[idx + 1]);
  }, []);

  const cancelCrop = useCallback(() => {
    setCropRect(null);
    setActiveTool("pen");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (e.key === "Escape") {
        if (activeTool === "crop") {
          cancelCrop();
        } else if (!embedded) {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo, onClose, activeTool, cancelCrop, embedded]);

  // Clear selection when switching away from select tool
  useEffect(() => {
    if (activeTool !== "select") setSelectedId(null);
    if (activeTool !== "crop") setCropRect(null);
    if (activeTool !== "eraser") setEraserPos(null);
  }, [activeTool]);

  // Attach transformer to selected node
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    if (selectedId && activeTool === "select") {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node as Konva.Node]);
      } else {
        trRef.current.nodes([]);
      }
    } else {
      trRef.current.nodes([]);
    }
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId, activeTool, annotations]);

  // Image display math
  const imgNatW = img?.width ?? 0;
  const imgNatH = img?.height ?? 0;
  const scale =
    imgNatW && imgNatH && stageSize.width && stageSize.height
      ? Math.min(
          (stageSize.width * 0.82) / imgNatW,
          (stageSize.height * 0.75) / imgNatH
        )
      : 1;
  const imgDisplayW = imgNatW * scale;
  const imgDisplayH = imgNatH * scale;
  const imgX = (stageSize.width - imgDisplayW) / 2;
  const imgY = (stageSize.height - imgDisplayH) / 2;

  function getPointerPos() {
    return stageRef.current?.getPointerPosition() ?? { x: 0, y: 0 };
  }

  // ── Mouse handlers ────────────────────────────────────────────────

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const pos = getPointerPos();
    const clampedPos = {
      x: Math.max(0, Math.min(imgDisplayW, pos.x)),
      y: Math.max(0, Math.min(imgDisplayH, pos.y)),
    };

    if (activeTool === "select") {
      if (e.target === stageRef.current) setSelectedId(null);
      return;
    }

    if (activeTool === "eraser") {
      eraserSnapshotRef.current = annotationsRef.current;
      eraseAt(clampedPos.x, clampedPos.y);
      return;
    }

    drawingRef.current = true;
    startPosRef.current = clampedPos;

    if (activeTool === "pen") {
      setInProgress({
        kind: "line",
        id: makeId(),
        points: [clampedPos.x, clampedPos.y],
        color,
        width: strokeWidth,
      });
    } else if (activeTool === "rect") {
      setInProgress({ kind: "rect", id: makeId(), x: clampedPos.x, y: clampedPos.y, w: 0, h: 0, color: hexWithAlpha(outlineColor, 1), stroke: hexWithAlpha(outlineColor, 1), fill: hexWithAlpha(fillColor, fillOpacity), width: outlineWidth });
    } else if (activeTool === "ellipse") {
      setInProgress({ kind: "ellipse", id: makeId(), x: clampedPos.x, y: clampedPos.y, rx: 0, ry: 0, color: hexWithAlpha(outlineColor, 1), stroke: hexWithAlpha(outlineColor, 1), fill: hexWithAlpha(fillColor, fillOpacity), width: outlineWidth });
    } else if (activeTool === "line") {
      setInProgress({ kind: "lineStraight", id: makeId(), points: [clampedPos.x, clampedPos.y, clampedPos.x, clampedPos.y], color: hexWithAlpha(outlineColor, 1), width: outlineWidth });
    } else if (activeTool === "arrow" && !hasPins) {
      setInProgress({
        kind: "arrow",
        id: makeId(),
        points: [clampedPos.x, clampedPos.y, clampedPos.x, clampedPos.y],
        color: hexWithAlpha(outlineColor, 1),
        width: outlineWidth,
      });
    } else if (activeTool === "crop" && !hasPins) {
      const clickedOnStage = e.target === e.target.getStage() || e.target.name() === "bgImage";
      if (clickedOnStage) {
        setCropRect({ x: clampedPos.x, y: clampedPos.y, w: 0, h: 0 });
        isDrawingCropRef.current = true;
      }
    }
  }

  function handleStageMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (activeTool === "eraser") {
      const rawPos = stageRef.current?.getPointerPosition();
      const pos = rawPos ? {
        x: Math.max(0, Math.min(imgDisplayW, rawPos.x)),
        y: Math.max(0, Math.min(imgDisplayH, rawPos.y)),
      } : undefined;
      if (pos) setEraserPos(pos);
      if (e.evt.buttons === 1) {
        eraseAt(pos?.x ?? 0, pos?.y ?? 0);
      }
      return;
    }

    if (!drawingRef.current) return;
    const pos = getPointerPos();
    const clampedPos = {
      x: Math.max(0, Math.min(imgDisplayW, pos.x)),
      y: Math.max(0, Math.min(imgDisplayH, pos.y)),
    };
    const start = startPosRef.current;

    if (activeTool === "pen") {
      setInProgress(prev =>
        prev?.kind === "line" ? { ...prev, points: [...prev.points, clampedPos.x, clampedPos.y] } : prev
      );
    } else if (activeTool === "rect") {
      setInProgress(prev =>
        prev?.kind === "rect"
          ? { ...prev, x: Math.min(start.x, clampedPos.x), y: Math.min(start.y, clampedPos.y), w: Math.abs(clampedPos.x - start.x), h: Math.abs(clampedPos.y - start.y) }
          : prev
      );
    } else if (activeTool === "ellipse") {
      setInProgress(prev =>
        prev?.kind === "ellipse"
          ? { ...prev, x: (start.x + clampedPos.x) / 2, y: (start.y + clampedPos.y) / 2, rx: Math.abs(clampedPos.x - start.x) / 2, ry: Math.abs(clampedPos.y - start.y) / 2 }
          : prev
      );
    } else if (activeTool === "line") {
      setInProgress(prev =>
        prev?.kind === "lineStraight" ? { ...prev, points: [start.x, start.y, clampedPos.x, clampedPos.y] } : prev
      );
    } else if (activeTool === "arrow" && inProgress?.kind === "arrow") {
      setInProgress({
        ...inProgress,
        points: [inProgress.points[0], inProgress.points[1], clampedPos.x, clampedPos.y],
      });
    } else if (activeTool === "crop" && !hasPins && isDrawingCropRef.current) {
      setCropRect({
        x: Math.min(start.x, clampedPos.x),
        y: Math.min(start.y, clampedPos.y),
        w: Math.abs(clampedPos.x - start.x),
        h: Math.abs(clampedPos.y - start.y),
      });
    }
  }

  function handleStageMouseUp() {
    if (activeTool === "eraser") {
      const snapshot = eraserSnapshotRef.current;
      eraserSnapshotRef.current = null;
      if (snapshot !== null && annotationsRef.current !== snapshot) {
        // Record the erased state in history without calling setAnnotations again
        const cur = annotationsRef.current;
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(cur);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
      return;
    }

    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (activeTool === "crop") {
      isDrawingCropRef.current = false;
      return;
    }

    if (inProgress) {
      let valid = true;
      if (inProgress.kind === "rect" && (inProgress.w < 3 || inProgress.h < 3)) valid = false;
      if (inProgress.kind === "ellipse" && (inProgress.rx < 3 || inProgress.ry < 3)) valid = false;
      if (inProgress.kind === "line" && inProgress.points.length < 4) valid = false;
      if (inProgress.kind === "lineStraight") {
        const dx = inProgress.points[2] - inProgress.points[0];
        const dy = inProgress.points[3] - inProgress.points[1];
        if (Math.sqrt(dx * dx + dy * dy) < 3) valid = false;
      }
      if (valid) pushHistory([...annotationsRef.current, inProgress]);
      setInProgress(null);
    }
  }

  function eraseAt(stageX: number, stageY: number) {
    const hitRadius = Math.max(strokeWidth * 6, 20);
    const next = annotationsRef.current.filter(ann => {
      if (ann.kind === "line" || ann.kind === "lineStraight" || ann.kind === "arrow") {
        for (let i = 0; i < ann.points.length - 3; i += 2) {
          const ax = ann.points[i];
          const ay = ann.points[i + 1];
          const bx = ann.points[i + 2];
          const by = ann.points[i + 3];
          const abx = bx - ax;
          const aby = by - ay;
          const abLen = Math.sqrt(abx * abx + aby * aby);
          if (abLen === 0) continue;
          const t = Math.max(0, Math.min(1,
            ((stageX - ax) * abx + (stageY - ay) * aby) / (abLen * abLen)
          ));
          const closestX = ax + t * abx;
          const closestY = ay + t * aby;
          const dx = stageX - closestX;
          const dy = stageY - closestY;
          if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) return false;
        }
        // Also check last point
        const lastIdx = ann.points.length - 2;
        if (lastIdx >= 0) {
          const dx = ann.points[lastIdx] - stageX;
          const dy = ann.points[lastIdx + 1] - stageY;
          if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) return false;
        }
      } else if (ann.kind === "rect") {
        if (stageX >= ann.x && stageX <= ann.x + ann.w && stageY >= ann.y && stageY <= ann.y + ann.h) return false;
      } else if (ann.kind === "ellipse") {
        const dx = (stageX - ann.x) / (ann.rx || 1);
        const dy = (stageY - ann.y) / (ann.ry || 1);
        if (dx * dx + dy * dy <= 1) return false;
      } else if (ann.kind === "text") {
        if (stageX >= ann.x && stageX <= ann.x + 150 && stageY >= ann.y && stageY <= ann.y + ann.fontSize + 4) return false;
      }
      return true;
    });
    annotationsRef.current = next;
    setAnnotations(next);
  }

  function applyCrop() {
    if (!cropRect || !img || cropRect.w < 10 || cropRect.h < 10) {
      setCropRect(null);
      return;
    }
    const cropX = Math.max(0, cropRect.x / scale);
    const cropY = Math.max(0, cropRect.y / scale);
    const cropW = Math.min(cropRect.w / scale, imgNatW - cropX);
    const cropH = Math.min(cropRect.h / scale, imgNatH - cropY);
    if (cropW < 1 || cropH < 1) { setCropRect(null); return; }

    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(cropW);
    offscreen.height = Math.round(cropH);
    const ctx = offscreen.getContext("2d")!;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    setImageSrc(offscreen.toDataURL("image/png"));
    setAnnotations([]);
    annotationsRef.current = [];
    const fresh: Annotation[][] = [[]];
    setHistory(fresh);
    setHistoryIndex(0);
    setCropRect(null);
    setActiveTool("select");
  }

  // ── Save ────────────────────────────────────────────────────────

  async function handleSave() {
    if (!stageRef.current || !img || !imgNatW || !imgNatH) return;
    setSaving(true);
    try {
      // Export stage at 1:1 pixel ratio then crop to the image display area and
      // scale back up to native image resolution so annotations look sharp.
      const stageCanvas = stageRef.current.toCanvas({ pixelRatio: 1 });
      const offscreen = document.createElement("canvas");
      offscreen.width = imgNatW;
      offscreen.height = imgNatH;
      const ctx = offscreen.getContext("2d")!;
      ctx.drawImage(stageCanvas, 0, 0, imgDisplayW, imgDisplayH, 0, 0, imgNatW, imgNatH);
      const dataUrl = offscreen.toDataURL("image/png");

      const newId = crypto.randomUUID();
      const res = await authFetch("/api/upload-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl, sessionId, screenshotId: newId }),
      });

      if (!res?.ok) throw new Error("Upload failed");
      onSave(newId);
    } catch {
      showToast("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Annotation rendering ────────────────────────────────────────

  function renderAnnotation(ann: Annotation, preview = false) {
    const isSelectMode = !preview && activeTool === "select";
    const draggable = isSelectMode;

    function onDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      const node = e.target;
      if (ann.kind === "line" || ann.kind === "arrow") {
        const dx = node.x();
        const dy = node.y();
        node.x(0);
        node.y(0);
        const pts = ann.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy));
        pushHistory(annotationsRef.current.map(a => (a.id === ann.id ? { ...ann, points: pts } : a)));
      } else if ("x" in ann) {
        pushHistory(annotationsRef.current.map(a => (a.id === ann.id ? { ...ann, x: node.x(), y: node.y() } as Annotation : a)));
      }
    }

    function onTransformEnd(e: Konva.KonvaEventObject<Event>) {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      let updated: Annotation | null = null;
      if (ann.kind === "rect") {
        updated = { ...ann, x: node.x(), y: node.y(), w: Math.max(5, ann.w * sx), h: Math.max(5, ann.h * sy) };
      } else if (ann.kind === "ellipse") {
        updated = { ...ann, x: node.x(), y: node.y(), rx: Math.max(5, ann.rx * sx), ry: Math.max(5, ann.ry * sy) };
      } else if (ann.kind === "text") {
        updated = { ...ann, x: node.x(), y: node.y(), fontSize: Math.max(8, Math.round(ann.fontSize * Math.max(sx, sy))) };
      }
      if (updated) pushHistory(annotationsRef.current.map(a => (a.id === ann.id ? updated! : a)));
    }

    const shared = {
      id: ann.id,
      draggable,
      ...(isSelectMode && { onClick: () => setSelectedId(ann.id) }),
      ...(draggable && { onDragEnd }),
      ...(isSelectMode && { onTransformEnd }),
    };

    switch (ann.kind) {
      case "line":
        return <Line key={ann.id} {...shared} points={ann.points} stroke={ann.color} strokeWidth={ann.width} lineCap="round" lineJoin="round" tension={0.5} />;
      case "lineStraight":
        return <Line key={ann.id} {...shared} points={ann.points} stroke={ann.color} strokeWidth={ann.width} lineCap="round" />;
      case "rect":
        return <Rect key={ann.id} {...shared} x={ann.x} y={ann.y} width={ann.w} height={ann.h} stroke={ann.stroke ?? ann.color} strokeWidth={ann.width} fill={ann.fill ?? "transparent"} />;
      case "ellipse":
        return <Ellipse key={ann.id} {...shared} x={ann.x} y={ann.y} radiusX={ann.rx} radiusY={ann.ry} stroke={ann.stroke ?? ann.color} strokeWidth={ann.width} fill={ann.fill ?? "transparent"} />;
      case "arrow":
        return <Arrow key={ann.id} {...shared} points={ann.points} stroke={ann.color} strokeWidth={ann.width} fill={ann.color} pointerLength={10} pointerWidth={10} />;
      case "text":
        return <Text key={ann.id} {...shared} x={ann.x} y={ann.y} text={ann.text} fill={ann.color} fontSize={ann.fontSize} fontFamily="sans-serif" />;
      default:
        return null;
    }
  }

  const cropPending = activeTool === "crop" && cropRect !== null && cropRect.w > 10 && cropRect.h > 10;

  const stageCursor =
    activeTool === "pen" || activeTool === "rect" || activeTool === "ellipse" || activeTool === "line" || activeTool === "arrow" || activeTool === "crop"
      ? "crosshair"
      : activeTool === "eraser"
      ? "none"
      : "default";

  if (stageSize.width === 0) return null;

  const content = (
    <div
      ref={embedded ? containerRef : undefined}
      className={embedded ? "relative w-full h-full" : "fixed inset-0 bg-black/80 backdrop-blur-md"}
      style={embedded ? undefined : { zIndex: MODAL_LAYER_Z_INDEX }}
    >
      <div style={{ position: "absolute", left: imgX, top: imgY }} className="rounded-lg shadow-xl overflow-hidden">
        <Stage
          ref={stageRef}
          width={imgDisplayW}
          height={imgDisplayH}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          style={{ cursor: stageCursor }}
        >
          <Layer>
            {img && (
              <KImage image={img} x={0} y={0} width={imgDisplayW} height={imgDisplayH} name="bgImage" />
            )}
            {annotations.map(ann => renderAnnotation(ann))}
            {inProgress && renderAnnotation(inProgress, true)}
            {cropRect && activeTool === "crop" && (
              <>
                {/* Dim overlay outside crop selection */}
                <Rect x={0} y={0} width={imgDisplayW} height={cropRect.y} fill="rgba(0,0,0,0.5)" listening={false} />
                <Rect x={0} y={cropRect.y + cropRect.h} width={imgDisplayW} height={imgDisplayH - (cropRect.y + cropRect.h)} fill="rgba(0,0,0,0.5)" listening={false} />
                <Rect x={0} y={cropRect.y} width={cropRect.x} height={cropRect.h} fill="rgba(0,0,0,0.5)" listening={false} />
                <Rect x={cropRect.x + cropRect.w} y={cropRect.y} width={imgDisplayW - (cropRect.x + cropRect.w)} height={cropRect.h} fill="rgba(0,0,0,0.5)" listening={false} />
                {/* Crop selection rect — draggable to move */}
                <Rect
                  x={cropRect.x}
                  y={cropRect.y}
                  width={cropRect.w}
                  height={cropRect.h}
                  stroke="#1775E0"
                  strokeWidth={2}
                  dash={[6, 3]}
                  fill="rgba(59,130,246,0.08)"
                  draggable={true}
                  dragBoundFunc={(pos) => ({
                    x: Math.max(0, Math.min(imgDisplayW - (cropRect?.w || 0), pos.x)),
                    y: Math.max(0, Math.min(imgDisplayH - (cropRect?.h || 0), pos.y)),
                  })}
                  onDragEnd={(e) => {
                    const node = e.target;
                    setCropRect(prev => prev ? { ...prev, x: node.x(), y: node.y() } : null);
                  }}
                  onMouseEnter={() => { document.body.style.cursor = "move"; }}
                  onMouseLeave={() => { document.body.style.cursor = "default"; }}
                />
                {/* Resize handles */}
                {[
                  { id: "tl", x: cropRect.x - 5,                    y: cropRect.y - 5,                    cursor: "nwse-resize" },
                  { id: "tc", x: cropRect.x + cropRect.w / 2 - 5,   y: cropRect.y - 5,                    cursor: "ns-resize"   },
                  { id: "tr", x: cropRect.x + cropRect.w - 5,       y: cropRect.y - 5,                    cursor: "nesw-resize" },
                  { id: "ml", x: cropRect.x - 5,                    y: cropRect.y + cropRect.h / 2 - 5,   cursor: "ew-resize"   },
                  { id: "mr", x: cropRect.x + cropRect.w - 5,       y: cropRect.y + cropRect.h / 2 - 5,   cursor: "ew-resize"   },
                  { id: "bl", x: cropRect.x - 5,                    y: cropRect.y + cropRect.h - 5,       cursor: "nesw-resize" },
                  { id: "bc", x: cropRect.x + cropRect.w / 2 - 5,   y: cropRect.y + cropRect.h - 5,       cursor: "ns-resize"   },
                  { id: "br", x: cropRect.x + cropRect.w - 5,       y: cropRect.y + cropRect.h - 5,       cursor: "nwse-resize" },
                ].map((handle) => (
                  <Rect
                    key={handle.id}
                    x={handle.x}
                    y={handle.y}
                    width={10}
                    height={10}
                    fill="white"
                    stroke="#1775E0"
                    strokeWidth={1}
                    draggable={true}
                    dragBoundFunc={(pos) => ({
                      x: Math.max(-5, Math.min(imgDisplayW - 5, pos.x)),
                      y: Math.max(-5, Math.min(imgDisplayH - 5, pos.y)),
                    })}
                    onMouseEnter={() => { document.body.style.cursor = handle.cursor; }}
                    onMouseLeave={() => { document.body.style.cursor = "default"; }}
                    onDragMove={(e) => {
                      if (!cropRect) return;
                      const node = e.target;
                      const hs = 5;
                      const cx = node.x() + hs;
                      const cy = node.y() + hs;
                      const { x, y, w, h } = cropRect;
                      const right = x + w;
                      const bottom = y + h;
                      let newCrop = { x, y, w, h };
                      switch (handle.id) {
                        case "tl": { const nx = Math.min(cx, right - 20); const ny = Math.min(cy, bottom - 20); newCrop = { x: nx, y: ny, w: right - nx, h: bottom - ny }; break; }
                        case "tc": { const ny = Math.min(cy, bottom - 20); newCrop = { x, y: ny, w, h: bottom - ny }; break; }
                        case "tr": { const nw = Math.max(20, cx - x); const ny = Math.min(cy, bottom - 20); newCrop = { x, y: ny, w: nw, h: bottom - ny }; break; }
                        case "ml": { const nx = Math.min(cx, right - 20); newCrop = { x: nx, y, w: right - nx, h }; break; }
                        case "mr": { newCrop = { x, y, w: Math.max(20, cx - x), h }; break; }
                        case "bl": { const nx = Math.min(cx, right - 20); newCrop = { x: nx, y, w: right - nx, h: Math.max(20, cy - y) }; break; }
                        case "bc": { newCrop = { x, y, w, h: Math.max(20, cy - y) }; break; }
                        case "br": { newCrop = { x, y, w: Math.max(20, cx - x), h: Math.max(20, cy - y) }; break; }
                      }
                      setCropRect(newCrop);
                      const nr = newCrop.x + newCrop.w;
                      const nb = newCrop.y + newCrop.h;
                      const positions: Record<string, { x: number; y: number }> = {
                        tl: { x: newCrop.x - hs,              y: newCrop.y - hs              },
                        tc: { x: newCrop.x + newCrop.w/2 - hs, y: newCrop.y - hs              },
                        tr: { x: nr - hs,                     y: newCrop.y - hs              },
                        ml: { x: newCrop.x - hs,              y: newCrop.y + newCrop.h/2 - hs },
                        mr: { x: nr - hs,                     y: newCrop.y + newCrop.h/2 - hs },
                        bl: { x: newCrop.x - hs,              y: nb - hs                     },
                        bc: { x: newCrop.x + newCrop.w/2 - hs, y: nb - hs                     },
                        br: { x: nr - hs,                     y: nb - hs                     },
                      };
                      const p = positions[handle.id];
                      if (p) { node.x(p.x); node.y(p.y); }
                    }}
                  />
                ))}
              </>
            )}
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
            />
          </Layer>
        </Stage>

        {activeTool === "crop" && !cropRect && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none">
            <div className="bg-black/90 text-white text-[14px] font-medium px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-sm whitespace-nowrap">
              Click and drag to select area
            </div>
          </div>
        )}

        {/* Eraser cursor overlay */}
        {activeTool === "eraser" && eraserPos && (
          <div
            className="absolute rounded-full border-2 border-white/70 pointer-events-none"
            style={{
              width: Math.max(strokeWidth * 12, 40),
              height: Math.max(strokeWidth * 12, 40),
              left: eraserPos.x - Math.max(strokeWidth * 6, 20),
              top: eraserPos.y - Math.max(strokeWidth * 6, 20),
            }}
          />
        )}
      </div>

      <EditorToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        fillColor={fillColor}
        onFillColorChange={setFillColor}
        outlineColor={outlineColor}
        onOutlineColorChange={setOutlineColor}
        fillOpacity={fillOpacity}
        onFillOpacityChange={setFillOpacity}
        outlineWidth={outlineWidth}
        onOutlineWidthChange={setOutlineWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        hasPins={hasPins}
        onClose={onClose}
        onSave={handleSave}
        saving={saving}
        cropPending={cropPending}
        onApplyCrop={applyCrop}
        onCancelCrop={cancelCrop}
      />
    </div>
  );

  if (embedded) {
    return content;
  }
  return <ModalPortal>{content}</ModalPortal>;
}
