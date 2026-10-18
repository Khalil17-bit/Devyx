import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
  asChild?: boolean;
}

/**
 * Devyx Chamfered Geometry Button Component
 * Strictly adheres to Design.md Section 5A:
 * - 45-degree chamfered bottom corner (clip-path)
 * - Monospace uppercase tracking
 * - Solid 1px wireframe offset hover state
 * - Zero bubbly rounded pills
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wider select-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40";

    const variantStyles = {
      primary:
        "btn-primary clip-chamfer bg-accent-primary text-bg-primary hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[2px_2px_0px_0px_var(--border-grid)] hover:shadow-[4px_4px_0px_0px_var(--border-focus)] border-none",
      secondary:
        "bg-bg-surface border border-border-grid text-text-primary hover:border-accent-primary hover:bg-bg-elevated hover:text-accent-primary active:bg-bg-surface",
      outline:
        "bg-transparent border border-border-grid text-text-primary hover:border-accent-primary hover:text-accent-primary active:bg-bg-elevated",
      ghost:
        "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:bg-bg-surface border border-transparent",
      destructive:
        "bg-status-error text-white hover:bg-status-error/90 border border-status-error",
    };

    const sizeStyles = {
      sm: "h-8 px-3.5 text-xs",
      default: "h-11 px-6 text-xs sm:text-sm",
      lg: "h-13 px-8 text-sm",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
