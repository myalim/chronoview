import type { ReactNode } from "react";
import { isSameDay } from "date-fns";
import { cn } from "../utils/cn.js";
import { WEEKDAY_LABELS } from "../utils/weekdays.js";

/** Cell info passed to the renderCellContent callback */
export interface MonthCellInfo {
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarMonthGridProps {
  /** 2D month grid — result of calculateMonthGrid(date, weekStartsOn) */
  weeks: Date[][];
  /** Current month index for distinguishing in/out-of-month cells (0-11) */
  currentMonth: number;
  /** Today's date for highlight */
  today?: Date;
  /** Weekday labels (default: Korean Sun-Sat) */
  weekdayLabels?: string[];
  /** Cell content below the date number (e.g., list-mode events) */
  renderCellContent?: (date: Date, info: MonthCellInfo) => ReactNode;
  /** Per-week overlay positioned absolutely (e.g., bar-mode event bars) */
  renderWeekOverlay?: (weekDates: Date[], weekIndex: number) => ReactNode;
  /** Show empty-state label in cells without events (default: false) */
  showEmptyLabel?: boolean;
  /** Empty-state label text */
  emptyLabel?: string;
  /** Predicate for whether a cell has events — required when showEmptyLabel is used */
  hasEvents?: (date: Date) => boolean;
  className?: string;
}

/**
 * Calendar month grid layout.
 *
 * Renders a 7-column x 4-6 row date grid with sticky weekday headers
 * and today highlighting. Event rendering is delegated to
 * renderCellContent (in-cell) or renderWeekOverlay (per-week absolute overlay).
 */
export function CalendarMonthGrid({
  weeks,
  currentMonth,
  today,
  weekdayLabels = WEEKDAY_LABELS,
  renderCellContent,
  renderWeekOverlay,
  showEmptyLabel = false,
  emptyLabel,
  hasEvents,
  className,
}: CalendarMonthGridProps) {
  // Column index of today's weekday (assuming weekStartsOn=0)
  const todayColIndex = today?.getDay();

  return (
    <div
      className={cn(
        "border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] overflow-hidden",
        className,
      )}
    >
      {/* ── Weekday header (sticky top) ── */}
      <div className="sticky top-0 z-[var(--cv-z-sticky-header)] grid grid-cols-7 border-b border-[var(--cv-color-border)] bg-[var(--cv-color-surface)]">
        {weekdayLabels.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-center h-[var(--cv-size-date-header-height)] text-[length:var(--cv-font-size-sm)]",
              i < 6 && "border-r border-[var(--cv-color-border)]",
              todayColIndex === i
                ? "font-[var(--cv-font-weight-bold)] text-[var(--cv-color-today-border)]"
                : "font-[var(--cv-font-weight-medium)] text-[var(--cv-color-text-secondary)]",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Week rows ── */}
      {weeks.map((week, weekIndex) => {
        // Use first date of the week as a stable unique key
        const weekKey = `${week[0].getFullYear()}-${week[0].getMonth()}-${week[0].getDate()}`;
        return (
        <div key={weekKey} className="relative">
          <div
            className={cn(
              "grid grid-cols-7",
              weekIndex < weeks.length - 1 &&
                "border-b border-[var(--cv-color-border)]",
            )}
          >
            {week.map((date, colIdx) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = today != null && isSameDay(date, today);
              const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "min-h-[var(--cv-size-month-cell-min-height)] p-[var(--cv-spacing-xs)]",
                    colIdx < 6 && "border-r border-[var(--cv-color-border)]",
                    isToday && "bg-[var(--cv-color-today-bg)]",
                  )}
                >
                  <div className="flex items-center h-6 mb-[var(--cv-spacing-xs)]">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center text-[length:var(--cv-font-size-base)] leading-none",
                        isToday
                          ? "w-6 h-6 rounded-full bg-[var(--cv-color-today-border)] text-white font-[var(--cv-font-weight-bold)]"
                          : isCurrentMonth
                            ? "text-[var(--cv-color-text)]"
                            : "text-[var(--cv-color-text-muted)]",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Cell content (list-mode events, etc.) */}
                  {renderCellContent?.(date, { isCurrentMonth, isToday })}

                  {/* Empty cell label — only rendered when emptyLabel is provided */}
                  {showEmptyLabel && emptyLabel && isCurrentMonth && hasEvents && !hasEvents(date) && (
                    <span className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-empty)]">
                      {emptyLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Per-week overlay (bar-mode events, etc.) */}
          {renderWeekOverlay?.(week, weekIndex)}
        </div>
        );
      })}
    </div>
  );
}
