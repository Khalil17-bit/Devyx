"use client";

import * as React from "react";
import {
  Pencil,
  Square,
  ArrowUpRight,
  Type,
  Undo2,
  Trash2,
  Check,
  X,
  Palette,
} from "lucide-react";

export type MarkupTool = "pen" | "box" | "arrow" | "text";

interface Point {
  x: number;
  y: number;
}

interface AnnotationItem {
  id: string;
  type: MarkupTool;
  color: string;
  width: number;
  points?: Point[]; // for pen
  startX?: number; // for box & arrow
  startY?: number;
  endX?: number;
  endY?: number;
  text?: string; // for text tool
  textX?: number;
  textY?: number;
}

interface ImageMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string; // data URL or object URL
  imageName: string;
  onApply: (annotatedBase64: string) => void;
  language?: string;
}

const PRESET_COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Cyan", value: "#00F5FF" },
  { name: "Yellow", value: "#FACC15" },
  { name: "Green", value: "#10B981" },
  { name: "White", value: "#FFFFFF" },
];

const STROKE_WIDTHS = [
  { label: "S", value: 3 },
  { label: "M", value: 5 },
  { label: "L", value: 8 },
];

export function ImageMarkupModal({
  isOpen,
  onClose,
  imageSrc,
  imageName,
  onApply,
  language = "en",
}: ImageMarkupModalProps) {
  const [tool, setTool] = React.useState<MarkupTool>("pen");
  const [color, setColor] = React.useState<string>("#EF4444");
  const [strokeWidth, setStrokeWidth] = React.useState<number>(5);
  const [annotations, setAnnotations] = React.useState<AnnotationItem[]>([]);

  // Text input state
  const [activeTextInput, setActiveTextInput] = React.useState<{
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    text: string;
  } | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isDrawingRef = React.useRef<boolean>(false);
  const currentItemRef = React.useRef<AnnotationItem | null>(null);
  const baseImageRef = React.useRef<HTMLImageElement | null>(null);
  const textInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load the base image and setup canvas
  React.useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      baseImageRef.current = img;
      renderAll();
    };
    img.src = imageSrc;
    setAnnotations([]);
    setActiveTextInput(null);
  }, [isOpen, imageSrc]);

  // Adjust canvas size to match image aspect ratio and container bounds
  const updateCanvasDimensions = React.useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = baseImageRef.current;
    if (!canvas || !container || !img) return;

    const containerWidth = container.clientWidth - 32;
    const containerHeight = container.clientHeight - 32;

    const scale = Math.min(
      containerWidth / img.naturalWidth,
      containerHeight / img.naturalHeight,
      1
    );

    const displayWidth = Math.max(280, Math.round(img.naturalWidth * scale));
    const displayHeight = Math.max(180, Math.round(img.naturalHeight * scale));

    // Internal resolution uses natural image size for maximum sharpness
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }, []);

  // Main rendering loop: draws image + all committed annotations + active preview
  const renderAll = React.useCallback(
    (previewItem?: AnnotationItem | null) => {
      const canvas = canvasRef.current;
      const img = baseImageRef.current;
      if (!canvas || !img) return;

      updateCanvasDimensions();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Clear & draw base image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Helper to draw an individual annotation
      const drawItem = (item: AnnotationItem) => {
        ctx.save();
        ctx.strokeStyle = item.color;
        ctx.fillStyle = item.color;
        ctx.lineWidth = item.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (item.type === "pen" && item.points && item.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(item.points[0].x, item.points[0].y);
          for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
          }
          ctx.stroke();
        } else if (item.type === "box" && item.startX !== undefined && item.endX !== undefined) {
          const x = Math.min(item.startX, item.endX);
          const y = Math.min(item.startY!, item.endY!);
          const w = Math.abs(item.endX - item.startX);
          const h = Math.abs(item.endY! - item.startY!);

          // Subtle translucent fill to highlight zone
          ctx.fillStyle = `${item.color}22`;
          ctx.fillRect(x, y, w, h);

          // Solid border
          ctx.lineWidth = Math.max(3, item.width);
          ctx.strokeRect(x, y, w, h);
        } else if (item.type === "arrow" && item.startX !== undefined && item.endX !== undefined) {
          const dx = item.endX - item.startX;
          const dy = item.endY! - item.startY!;
          const angle = Math.atan2(dy, dx);
          const headLength = Math.max(16, item.width * 3.5);

          // Draw main shaft
          ctx.beginPath();
          ctx.moveTo(item.startX, item.startY!);
          ctx.lineTo(item.endX, item.endY!);
          ctx.stroke();

          // Draw arrowhead
          ctx.beginPath();
          ctx.moveTo(item.endX, item.endY!);
          ctx.lineTo(
            item.endX - headLength * Math.cos(angle - Math.PI / 6),
            item.endY! - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            item.endX - headLength * Math.cos(angle + Math.PI / 6),
            item.endY! - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        } else if (item.type === "text" && item.text && item.textX !== undefined && item.textY !== undefined) {
          const fontSize = Math.max(18, item.width * 4);
          ctx.font = `bold ${fontSize}px sans-serif`;
          const metrics = ctx.measureText(item.text);
          const padding = 8;
          const bgW = metrics.width + padding * 2;
          const bgH = fontSize + padding * 2;

          // High contrast black pill with colored border
          ctx.fillStyle = "#0A0D12E6";
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(item.textX - padding, item.textY - fontSize - padding / 2, bgW, bgH, 6);
          ctx.fill();
          ctx.stroke();

          // Text content
          ctx.fillStyle = item.color;
          ctx.fillText(item.text, item.textX, item.textY);
        }

        ctx.restore();
      };

      // 3. Draw all committed annotations
      annotations.forEach(drawItem);

      // 4. Draw active stroke preview if drawing
      if (previewItem) {
        drawItem(previewItem);
      }
    },
    [annotations, updateCanvasDimensions]
  );

  React.useEffect(() => {
    renderAll();
  }, [renderAll]);

  // Convert client mouse/touch event coordinates into internal natural canvas coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Pointer Down
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (tool === "text") {
      // Open text input popup at client position
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const containerRect = containerRef.current?.getBoundingClientRect();

      const relX = clientX - (containerRect?.left || 0);
      const relY = clientY - (containerRect?.top || 0);

      setActiveTextInput({
        x: relX,
        y: relY,
        canvasX: coords.x,
        canvasY: coords.y,
        text: "",
      });

      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    isDrawingRef.current = true;

    if (tool === "pen") {
      currentItemRef.current = {
        id: crypto.randomUUID(),
        type: "pen",
        color,
        width: strokeWidth,
        points: [coords],
      };
    } else if (tool === "box") {
      currentItemRef.current = {
        id: crypto.randomUUID(),
        type: "box",
        color,
        width: strokeWidth,
        startX: coords.x,
        startY: coords.y,
        endX: coords.x,
        endY: coords.y,
      };
    } else if (tool === "arrow") {
      currentItemRef.current = {
        id: crypto.randomUUID(),
        type: "arrow",
        color,
        width: strokeWidth,
        startX: coords.x,
        startY: coords.y,
        endX: coords.x,
        endY: coords.y,
      };
    }

    renderAll(currentItemRef.current);
  };

  // Pointer Move
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentItemRef.current) return;
    const coords = getCanvasCoords(e);

    if (tool === "pen" && currentItemRef.current.points) {
      currentItemRef.current.points.push(coords);
    } else if (tool === "box" || tool === "arrow") {
      currentItemRef.current.endX = coords.x;
      currentItemRef.current.endY = coords.y;
    }

    renderAll(currentItemRef.current);
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (!isDrawingRef.current || !currentItemRef.current) return;
    isDrawingRef.current = false;

    // Validate minimum movement
    const item = currentItemRef.current;
    if (item.type === "pen" && item.points && item.points.length > 1) {
      setAnnotations((prev) => [...prev, item]);
    } else if (
      (item.type === "box" || item.type === "arrow") &&
      item.startX !== undefined &&
      item.endX !== undefined &&
      (Math.abs(item.endX - item.startX) > 4 || Math.abs(item.endY! - item.startY!) > 4)
    ) {
      setAnnotations((prev) => [...prev, item]);
    }

    currentItemRef.current = null;
    renderAll();
  };

  // Commit text callout
  const handleCommitText = () => {
    if (activeTextInput && activeTextInput.text.trim()) {
      const newItem: AnnotationItem = {
        id: crypto.randomUUID(),
        type: "text",
        color,
        width: strokeWidth,
        text: activeTextInput.text.trim(),
        textX: activeTextInput.canvasX,
        textY: activeTextInput.canvasY,
      };
      setAnnotations((prev) => [...prev, newItem]);
    }
    setActiveTextInput(null);
  };

  // Undo last action
  const handleUndo = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  // Clear all annotations
  const handleClear = () => {
    setAnnotations([]);
  };

  // Finalize & export flattened image to base64
  const handleApplyAndSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render cleanly without any preview stroke
    renderAll();

    // Export as high-quality PNG data URL
    const dataUrl = canvas.toDataURL("image/png", 0.95);
    // Strip data URL prefix for raw base64
    const base64Only = dataUrl.split(",")[1] || dataUrl;

    onApply(base64Only);
    onClose();
  };

  // Keyboard shortcut Ctrl+Z for undo, Esc for close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const labels = {
    title:
      language === "fr"
        ? "Studio d'Annotation Visuelle"
        : language === "darija" || language === "ar"
        ? "تعديل ورسم على الصورة ✏️"
        : "Image Markup & Zone Annotations",
    subtitle:
      language === "fr"
        ? "Entourez des zones, tracez des flèches ou écrivez vos remarques pour guider l'IA."
        : language === "darija" || language === "ar"
        ? "رسم دوائر، أسهم، أو كتب ملاحظات فوق الصورة باش توجّه الذكاء الاصطناعي."
        : "Draw zones, point arrows, or type callout text to target specific areas for the AI.",
    pen: language === "fr" ? "Stylet" : language === "darija" || language === "ar" ? "قلم" : "Draw",
    box: language === "fr" ? "Cadre" : language === "darija" || language === "ar" ? "تحديد منطقة" : "Zone Box",
    arrow: language === "fr" ? "Flèche" : language === "darija" || language === "ar" ? "سهم" : "Arrow",
    text: language === "fr" ? "Texte" : language === "darija" || language === "ar" ? "نص" : "Callout",
    undo: language === "fr" ? "Annuler" : language === "darija" || language === "ar" ? "تراجع" : "Undo",
    clear: language === "fr" ? "Effacer" : language === "darija" || language === "ar" ? "مسح" : "Clear",
    apply: language === "fr" ? "Valider & Enregistrer" : language === "darija" || language === "ar" ? "حفظ التعديلات" : "Apply & Save",
    cancel: language === "fr" ? "Annuler" : language === "darija" || language === "ar" ? "إلغاء" : "Cancel",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-bg-surface border border-accent-primary/50 shadow-2xl clip-chamfer flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated border-b border-border-grid">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-accent-primary animate-pulse" />
            <div>
              <h3 className="font-mono text-xs sm:text-sm font-bold text-text-primary tracking-wide">
                // {labels.title}
              </h3>
              <p className="text-[10px] text-text-muted hidden sm:block">
                {imageName} — {labels.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-bg-primary/95 border-b border-border-grid text-xs">
          {/* Tools */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTool("pen")}
              className={`flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] clip-chamfer transition-colors ${
                tool === "pen"
                  ? "bg-accent-primary text-bg-primary font-bold shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-grid"
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>{labels.pen}</span>
            </button>

            <button
              type="button"
              onClick={() => setTool("box")}
              className={`flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] clip-chamfer transition-colors ${
                tool === "box"
                  ? "bg-accent-primary text-bg-primary font-bold shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-grid"
              }`}
            >
              <Square className="w-3 h-3" />
              <span>{labels.box}</span>
            </button>

            <button
              type="button"
              onClick={() => setTool("arrow")}
              className={`flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] clip-chamfer transition-colors ${
                tool === "arrow"
                  ? "bg-accent-primary text-bg-primary font-bold shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-grid"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{labels.arrow}</span>
            </button>

            <button
              type="button"
              onClick={() => setTool("text")}
              className={`flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] clip-chamfer transition-colors ${
                tool === "text"
                  ? "bg-accent-primary text-bg-primary font-bold shadow-sm"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-grid"
              }`}
            >
              <Type className="w-3 h-3" />
              <span>{labels.text}</span>
            </button>
          </div>

          {/* Color & Size Controls */}
          <div className="flex items-center gap-3">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5 p-1 bg-bg-elevated rounded border border-border-grid">
              <Palette className="w-3 h-3 text-text-muted ms-1" />
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    color === c.value
                      ? "ring-2 ring-white scale-125 shadow-md"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  title={c.name}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-1 p-0.5 bg-bg-elevated rounded border border-border-grid">
              {STROKE_WIDTHS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrokeWidth(s.value)}
                  className={`px-1.5 py-0.5 font-mono text-[10px] rounded transition-colors ${
                    strokeWidth === s.value
                      ? "bg-accent-primary text-bg-primary font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Undo / Clear Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={annotations.length === 0}
              className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] bg-bg-elevated text-text-secondary hover:text-text-primary disabled:opacity-40 border border-border-grid clip-chamfer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3 h-3" />
              <span>{labels.undo}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={annotations.length === 0}
              className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] bg-bg-elevated text-red-400 hover:text-red-300 disabled:opacity-40 border border-border-grid clip-chamfer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{labels.clear}</span>
            </button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[320px] max-h-[64vh] overflow-hidden bg-[#0A0D12] flex items-center justify-center p-4 select-none"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="cursor-crosshair shadow-2xl rounded border border-border-grid max-w-full max-h-full object-contain"
          />

          {/* Floating inline text callout input popup */}
          {activeTextInput && (
            <div
              style={{
                position: "absolute",
                left: `${Math.min(activeTextInput.x, (containerRef.current?.clientWidth || 300) - 220)}px`,
                top: `${Math.min(activeTextInput.y, (containerRef.current?.clientHeight || 300) - 60)}px`,
              }}
              className="z-20 bg-bg-surface border-2 border-accent-primary p-2 rounded shadow-2xl flex items-center gap-1.5 min-w-[200px]"
            >
              <input
                ref={textInputRef}
                type="text"
                value={activeTextInput.text}
                onChange={(e) =>
                  setActiveTextInput((prev) => (prev ? { ...prev, text: e.target.value } : null))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCommitText();
                  } else if (e.key === "Escape") {
                    setActiveTextInput(null);
                  }
                }}
                placeholder="Type note (e.g. Fix button)..."
                className="flex-1 bg-bg-elevated border border-border-grid px-2 py-1 text-xs text-text-primary outline-none focus:border-accent-primary rounded"
              />
              <button
                type="button"
                onClick={handleCommitText}
                className="p-1 bg-accent-primary text-bg-primary rounded hover:bg-accent-signal"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTextInput(null)}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated border-t border-border-grid">
          <span className="font-mono text-[10px] text-text-muted">
            {annotations.length} annotation{annotations.length !== 1 ? "s" : ""} applied
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 font-mono text-xs text-text-secondary hover:text-text-primary bg-bg-surface border border-border-grid clip-chamfer transition-colors"
            >
              {labels.cancel}
            </button>

            <button
              type="button"
              onClick={handleApplyAndSave}
              className="flex items-center gap-1.5 px-4 py-1.5 font-mono text-xs font-bold text-bg-primary bg-accent-primary hover:bg-accent-signal clip-chamfer transition-colors shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{labels.apply}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
