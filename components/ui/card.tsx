import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string;
  metric?: string;
  showIndicator?: boolean;
}

/**
 * Devyx Technical Card Primitive
 * Strictly adheres to Design.md Section 5B:
 * - Zero drop-shadow (box-shadow: none)
 * - 1px solid structural grid border
 * - 36px top technical header bar with index coordinate and metric badge
 * - 6px square hover indicator that switches to accent-signal
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      code,
      metric,
      showIndicator = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative bg-bg-surface border border-border-grid transition-colors duration-150 hover:border-border-focus flex flex-col justify-between",
          className
        )}
        style={{ boxShadow: "none" }}
        {...props}
      >
        {/* Technical Header Bar */}
        {(code || metric || showIndicator) && (
          <div className="h-9 px-4 flex items-center justify-between border-b border-border-grid bg-bg-elevated/40 font-mono text-[11px] text-text-muted transition-colors group-hover:bg-bg-elevated/80">
            <div className="flex items-center gap-2.5">
              {showIndicator && (
                <span
                  className="w-1.5 h-1.5 rounded-none bg-text-muted/50 group-hover:bg-accent-signal transition-colors duration-150"
                  aria-hidden="true"
                />
              )}
              {code && (
                <span className="font-semibold uppercase tracking-wider text-text-secondary group-hover:text-text-primary">
                  {code}
                </span>
              )}
            </div>

            {metric && (
              <span className="px-2 py-0.5 bg-bg-surface border border-border-grid text-accent-primary font-bold text-[10px] tracking-wider uppercase group-hover:border-accent-primary">
                {metric}
              </span>
            )}
          </div>
        )}

        {/* Card Content Area */}
        <div className="p-6 flex-1 flex flex-col">{children}</div>
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-xl font-bold tracking-tight text-text-primary leading-snug group-hover:text-accent-primary transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-sans text-sm text-text-secondary leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pt-4 mt-auto border-t border-border-grid flex items-center justify-between", className)}
      {...props}
    />
  );
}
