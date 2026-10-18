"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Mechanical Theme Switcher (from Design.md Section 5D)
 * Monospace hardware toggle: [ DARK // LIGHT ]
 * Replaces generic sun/moon icons with a high-contrast segmented control.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Server / Hydration placeholder
    return (
      <div className="inline-flex items-center border border-border-grid bg-bg-surface font-mono text-[11px] p-0.5 select-none h-8">
        <span className="px-2.5 py-1 text-text-muted">DARK</span>
        <span className="text-border-grid px-0.5">//</span>
        <span className="px-2.5 py-1 text-text-muted">LIGHT</span>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      role="group"
      aria-label="Theme Switcher"
      className="inline-flex items-center border border-border-grid bg-bg-surface font-mono text-[11px] p-0.5 select-none h-8 transition-colors"
    >
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={`px-2.5 py-1 font-semibold uppercase tracking-wider transition-all duration-150 ${
          isDark
            ? "bg-accent-primary text-bg-primary"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        DARK
      </button>

      <span className="text-border-grid px-1 font-bold pointer-events-none">
        //
      </span>

      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        className={`px-2.5 py-1 font-semibold uppercase tracking-wider transition-all duration-150 ${
          !isDark
            ? "bg-accent-primary text-bg-primary"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        LIGHT
      </button>
    </div>
  );
}
