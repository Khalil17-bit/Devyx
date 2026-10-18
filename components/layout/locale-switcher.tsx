"use client";

import * as React from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing, type Locale } from "@/i18n/routing";
import { useLocale } from "next-intl";

interface LocaleSwitcherProps {
  className?: string;
}

/**
 * Locale Switcher
 * Technical segmented monospace control (AR | FR | EN) that switches
 * the active route language while preserving the current pathname.
 */
export function LocaleSwitcher({ className = "" }: LocaleSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleLocaleChange(newLocale: Locale) {
    if (newLocale === currentLocale) return;
    router.replace(pathname, { locale: newLocale });
  }

  const locales: { code: Locale; label: string }[] = [
    { code: "ar", label: "AR" },
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className={`inline-flex items-center border border-border-grid bg-bg-surface font-mono text-[11px] p-0.5 select-none h-8 ${className}`}
    >
      {locales.map((loc, idx) => {
        const isActive = loc.code === currentLocale;
        return (
          <React.Fragment key={loc.code}>
            {idx > 0 && (
              <span className="text-border-grid px-1 font-bold pointer-events-none">
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => handleLocaleChange(loc.code)}
              aria-pressed={isActive}
              className={`px-2 py-1 font-semibold uppercase tracking-wider transition-all duration-150 ${
                isActive
                  ? "bg-accent-primary text-bg-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {loc.label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
