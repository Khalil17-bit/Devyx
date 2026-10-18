"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { useLocale } from "next-intl";

interface LightboxProps {
  images: string[];
  title?: string;
  className?: string;
}

/**
 * Devyx Technical Image Gallery & Lightbox Component
 * Implements high-resolution zoom, RTL-aware thumbnail navigation,
 * and technical coordinate counters for architecture diagrams and case studies.
 */
export function Lightbox({ images, title = "System Architecture", className = "" }: LightboxProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [isZoomed, setIsZoomed] = React.useState<boolean>(false);
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/10] bg-bg-elevated border border-border-grid flex flex-col items-center justify-center font-mono text-xs text-text-muted p-6">
        <span className="w-3 h-3 bg-text-muted/30 mb-2" />
        NO_ARCHITECTURE_DIAGRAMS_ATTACHED
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  function handlePrev() {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }

  function handleNext() {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Image Stage */}
      <div className="relative w-full aspect-[16/10] bg-bg-elevated border border-border-grid overflow-hidden group">
        {/* Technical Coordinate Overlay */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 bg-bg-surface/90 border border-border-grid font-mono text-[10px] text-text-muted select-none">
          <span className="w-1.5 h-1.5 bg-accent-signal" />
          <span>DIAGRAM // {String(selectedIndex + 1).padStart(2, "0")} OF {String(images.length).padStart(2, "0")}</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 bg-bg-surface/90 border border-border-grid text-text-secondary hover:text-text-primary hover:border-accent-primary transition-colors font-mono text-[10px] flex items-center gap-1"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline uppercase text-[9px]">
              {isZoomed ? "RESET" : "INSPECT"}
            </span>
          </button>
        </div>

        {/* Display Image (or High-tech placeholder diagram) */}
        <div
          onClick={() => setIsZoomed(!isZoomed)}
          className={`w-full h-full flex items-center justify-center p-4 cursor-zoom-in transition-transform duration-200 ${
            isZoomed ? "scale-125 cursor-zoom-out" : "scale-100"
          }`}
        >
          {/* Real image if URL starts with http or /images, otherwise schematic canvas */}
          {currentImage.startsWith("http") || currentImage.startsWith("/") ? (
            <img
              src={currentImage}
              alt={`${title} - view ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // If local placeholder image file is missing, fallback to technical SVG diagram
                const target = e.currentTarget;
                target.style.display = "none";
                if (target.parentElement) {
                  const fallback = target.parentElement.querySelector(".schematic-fallback");
                  if (fallback) fallback.classList.remove("hidden");
                }
              }}
            />
          ) : null}

          {/* Schematic Architectural Diagram Fallback */}
          <div className="schematic-fallback w-full h-full border border-dashed border-border-grid bg-bg-surface/40 p-6 flex flex-col justify-between font-mono text-xs select-none">
            <div className="flex items-center justify-between text-text-muted">
              <span>DEVYX // ARCH_DIAGRAM_RENDERER</span>
              <span>NODE_MAP_v2</span>
            </div>
            <div className="space-y-2 text-center py-8">
              <div className="inline-block px-3 py-1 bg-bg-elevated border border-accent-primary text-accent-primary font-bold">
                [ {title.toUpperCase()} ]
              </div>
              <p className="text-[11px] text-text-muted">
                SCHEMATIC_NODE: #{selectedIndex + 1} // PARALLEL_STREAM_ACTIVE
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>LATENCY: 0.72s LCP</span>
              <span>DETERMINISTIC_VERIFIED</span>
            </div>
          </div>
        </div>

        {/* RTL-Aware Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={isRtl ? handleNext : handlePrev}
              className="absolute start-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-bg-surface/90 border border-border-grid text-text-primary hover:border-accent-primary transition-colors focus:outline-none"
              aria-label="Previous image"
            >
              {isRtl ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={isRtl ? handlePrev : handleNext}
              className="absolute end-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-bg-surface/90 border border-border-grid text-text-primary hover:border-accent-primary transition-colors focus:outline-none"
              aria-label="Next image"
            >
              {isRtl ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Selector Track */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          {images.map((img, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={img + idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 border p-1 bg-bg-surface font-mono text-[9px] flex items-center justify-center transition-all ${
                  isActive
                    ? "border-accent-signal bg-bg-elevated font-bold text-accent-signal"
                    : "border-border-grid text-text-muted hover:border-text-secondary"
                }`}
                aria-label={`Select image ${idx + 1}`}
              >
                <span>FIG_{String(idx + 1).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
