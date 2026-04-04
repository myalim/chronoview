import { cn } from "../utils/cn.js";

export interface DayHeaderCell {
  /** Display label (e.g., "월 3/23") */
  label: string;
  /** Whether this cell represents today */
  isToday?: boolean;
}

export interface CalendarDayHeaderProps {
  /** Array of day cells to render (typically 7 for week view) */
  dates: DayHeaderCell[];
  className?: string;
}

/**
 * Day column header for Calendar Week layout.
 * Renders a row of day labels with today highlighting.
 * Height: var(--cv-size-time-header-height) (48px).
 */
export function CalendarDayHeader({ dates, className }: CalendarDayHeaderProps) {
  return (
    <div
      className={cn("flex h-[var(--cv-size-time-header-height)]", className)}
    >
      {dates.map((cell, i) => (
        <div
          key={cell.label}
          className={cn(
            "flex-1 flex items-center justify-center text-[length:var(--cv-font-size-sm)]",
            // 마지막 셀 제외 우측 border
            i < dates.length - 1 && "border-r border-[var(--cv-color-border)]",
            cell.isToday
              ? "font-[var(--cv-font-weight-bold)] text-[var(--cv-color-today-border)]"
              : "text-[var(--cv-color-text-secondary)]",
          )}
        >
          {cell.label}
        </div>
      ))}
    </div>
  );
}
