import * as React from "react";
import { Link } from "@/i18n/routing";

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Devyx Brand Logo Component
 * Implements the flat-vector overlapping ribbon (Deep Cobalt to Electric Cyan)
 * with razor-thin background cutout gaps and sharp architectural wordmark.
 */
export function Logo({ className = "", showSubtitle = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3.5 group select-none ${className}`}
      aria-label="Devyx Home"
    >
      {/* Overlapping Infinity Ribbon Mark */}
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-200 group-hover:scale-105"
        >
          {/* Deep Cobalt Loop (Base) */}
          <path
            d="M8 20C8 13.3726 13.3726 8 20 8C26.6274 8 32 13.3726 32 20C32 26.6274 26.6274 32 20 32C13.3726 32 8 26.6274 8 20Z"
            stroke="var(--accent-secondary)"
            strokeWidth="3.5"
            strokeLinecap="square"
            strokeDasharray="45 15"
          />
          {/* Electric Cyan Loop (Apex) with Razor-thin cutout overlap */}
          <path
            d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10Z"
            stroke="var(--accent-signal)"
            strokeWidth="3"
            strokeLinecap="square"
            strokeDasharray="30 25"
            strokeDashoffset="12"
          />
          {/* Center Intersection Node */}
          <rect
            x="18"
            y="18"
            width="4"
            height="4"
            fill="var(--accent-signal)"
            className="animate-pulse-signal"
          />
        </svg>
      </div>

      {/* Wordmark and Monospace Technical Subtitle */}
      <div className="flex flex-col text-start">
        <span className="font-display text-xl font-bold tracking-tight text-text-primary leading-none group-hover:text-accent-primary transition-colors">
          Devyx
        </span>
        {showSubtitle && (
          <span className="font-mono text-[9px] uppercase tracking-technical text-text-secondary mt-1 leading-none">
            WEB &amp; AUTOMATION
          </span>
        )}
      </div>
    </Link>
  );
}
