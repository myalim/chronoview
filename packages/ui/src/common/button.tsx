/**
 * Button — Shared button component with style variants.
 *
 * Follows shadcn/ui pattern: variant + size props for consistent styling.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn.js";

type ButtonVariant = "outline" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap font-medium rounded-[var(--cv-radius-sm)] transition-colors disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  outline:
    "border border-[var(--cv-color-border)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)] hover:bg-[var(--cv-color-surface-hover)]",
  ghost:
    "border-none bg-transparent text-[var(--cv-color-text)] hover:bg-[var(--cv-color-surface-hover)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3 text-sm",
  icon: "h-8 w-8 p-0",
};

export function Button({
  variant = "outline",
  size = "sm",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
