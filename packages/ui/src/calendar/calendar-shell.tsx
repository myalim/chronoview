import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface CalendarShellProps {
  /** Toolbar (date navigation + view toggle) */
  toolbar?: ReactNode;
  /** Filter chips panel */
  filterPanel?: ReactNode;
  /** Theme override */
  theme?: "light" | "dark";
  className?: string;
  children: ReactNode;
}

/**
 * Shared outer shell for all Calendar views (Day, Week, Month).
 * Renders toolbar + filterPanel + theme wrapper.
 * Day/Week uses this via CalendarView; Month uses this directly.
 */
export function CalendarShell({
  toolbar,
  filterPanel,
  theme,
  className,
  children,
}: CalendarShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col text-left font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]",
        theme,
        className
      )}
    >
      {toolbar}
      {filterPanel}
      {children}
    </div>
  );
}
