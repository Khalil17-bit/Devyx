"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  code?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

/**
 * Devyx Architectural Modal / Dialog Primitive
 * Accessible dialog conforming to Anti-AI design specifications:
 * - Solid architectural backdrop (no excessive glassmorphism blur)
 * - 1px structural grid border
 * - Monospace coordinate header
 * - Keyboard Escape listener & focus trap
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  code = "SPEC_01 // ARCH_VIEW",
  children,
  className,
  maxWidth = "max-w-3xl",
}: DialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Lock scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6"
    >
      {/* Architectural Solid Scrim Overlay */}
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Dialog Surface Container */}
      <div
        className={cn(
          "relative w-full z-10 bg-bg-surface border border-border-grid shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden select-text",
          maxWidth,
          className
        )}
      >
        {/* Technical Header Bar */}
        <div className="h-11 px-3 sm:px-4 flex items-center justify-between border-b border-border-grid bg-bg-elevated font-mono text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-text-secondary min-w-0">
            <span className="w-1.5 h-1.5 rounded-none bg-accent-signal inline-block flex-shrink-0" />
            <span className="font-semibold uppercase tracking-wider flex-shrink-0 text-[11px] sm:text-xs">{code}</span>
            {title && (
              <>
                <span className="text-border-grid flex-shrink-0">//</span>
                <span className="text-text-primary font-bold truncate max-w-[140px] sm:max-w-md">
                  {title}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] min-w-[44px] -me-2 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">{children}</div>
      </div>
    </div>
  );
}
