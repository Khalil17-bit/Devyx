import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "signal" | "operational" | "warning" | "error";
}

/**
 * Devyx Monospace Technical Badge Component
 * Sharp rectangular geometry with 1px border. No rounded bubbly pills.
 */
export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-bg-elevated text-text-primary border-border-grid",
    outline:
      "bg-transparent text-text-secondary border-border-grid hover:border-text-primary",
    signal:
      "bg-accent-signal/10 text-accent-signal border-accent-signal",
    operational:
      "bg-status-operational/10 text-status-operational border-status-operational/50",
    warning:
      "bg-status-warning/10 text-status-warning border-status-warning/50",
    error:
      "bg-status-error/10 text-status-error border-status-error/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 border font-mono text-[11px] font-semibold uppercase tracking-wider select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
