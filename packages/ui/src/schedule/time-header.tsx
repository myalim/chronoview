/**
 * TimeHeader — Time axis header for Schedule views.
 *
 * Internally computes time slots and date labels from view + dateRange + cellDuration
 * using getCellConfig and generateTimeSlots from @chronoview/core.
 *
 * Adapts to the current view:
 * - Day: single row of time slot labels (48px)
 * - Week: 2-tier — date row (32px) + time row (48px) = 80px
 * - Month: 2-tier — date row (32px) + weekday row (32px) = 64px
 *
 * Reference: docs/design/schedule/schedule-day.md §5,
 *            schedule-week.md §5, schedule-month.md §5
 */

import {
  getCellConfig,
  generateTimeSlots,
  type View,
  type DateRange,
  type CellDurationConfig,
} from "@chronoview/core";
import { cn } from "../utils/cn.js";

// i18n: Phase 7에서 locale 지원 추가 예정
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface TimeHeaderProps {
  view: View;
  /** Date range to display (from useScheduleView dateRange) */
  dateRange: DateRange;
  /** Cell duration — Day: minutes (15|30|60), Week: hours (3|4|6|8|12), Month: ignored */
  cellDuration?: CellDurationConfig;
  /** Week start day for Month grid (0=Sun, 1=Mon) */
  weekStartsOn?: 0 | 1;
}

/** Check if two dates are the same calendar day */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Generate an array of dates from start (inclusive) to end (exclusive) */
function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const d = new Date(start);
  while (d < end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Format date for Week header: "MM/dd (E)" */
function formatWeekDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const wd = WEEKDAYS[d.getDay()];
  return `${mm}/${dd} (${wd})`;
}

export function TimeHeader({ view, dateRange, cellDuration }: TimeHeaderProps) {
  const { cellWidthPx, intervalMinutes } = getCellConfig(view, cellDuration);
  const headerClassName =
    "sticky top-0 z-[var(--cv-z-sticky-header)] bg-[var(--cv-color-bg)] font-[var(--cv-font-family)]";

  const today = new Date();

  // ─── Day: time slots only (48px) ───
  if (view === "day") {
    const timeSlots = generateTimeSlots({
      startTime: dateRange.start,
      endTime: dateRange.end,
      intervalMinutes,
    });
    const totalWidth = timeSlots.length * cellWidthPx;

    return (
      <div className={headerClassName} style={{ minWidth: totalWidth }}>
        <div className="relative h-[var(--cv-size-time-header-height)]">
          {timeSlots.map((slot, i) => (
            <div
              key={`ts-${slot.start.getTime()}`}
              className={cn(
                "absolute flex h-full items-center justify-center text-xs text-[var(--cv-color-text-secondary)]",
                i < timeSlots.length - 1 && "border-r border-r-[var(--cv-color-border)]",
              )}
              style={{ left: i * cellWidthPx, width: cellWidthPx }}
            >
              {slot.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Week: date header (32px) + time header (48px) ───
  if (view === "week") {
    const timeSlots = generateTimeSlots({
      startTime: dateRange.start,
      endTime: dateRange.end,
      intervalMinutes,
    });
    const totalWidth = timeSlots.length * cellWidthPx;
    const dates = getDatesInRange(dateRange.start, dateRange.end);
    const dayWidth = totalWidth / dates.length;

    return (
      <div className={headerClassName} style={{ minWidth: totalWidth }}>
        {/* Date row (32px) */}
        <div className="relative h-[var(--cv-size-date-header-height)]">
          {dates.map((date, i) => {
            const isLast = i === dates.length - 1;
            const isToday = isSameDay(date, today);
            return (
              <div
                key={`dl-${date.getTime()}`}
                className={cn(
                  "absolute flex h-full items-center justify-center border-b border-b-[var(--cv-color-border)] text-base",
                  !isLast && "border-r border-r-[var(--cv-color-border-strong)]",
                  isToday
                    ? "font-[var(--cv-font-weight-bold)] text-[var(--cv-color-today-border)]"
                    : "font-[var(--cv-font-weight-medium)] text-[var(--cv-color-text)]",
                )}
                style={{ left: i * dayWidth, width: dayWidth }}
              >
                {formatWeekDate(date)}
              </div>
            );
          })}
        </div>
        {/* Time row (48px) */}
        <div className="relative h-[var(--cv-size-time-header-height)]">
          {timeSlots.map((slot, i) => (
            <div
              key={`ts-${slot.start.getTime()}`}
              className={cn(
                "absolute flex h-full items-center justify-center text-xs text-[var(--cv-color-text-secondary)]",
                i < timeSlots.length - 1 && "border-r border-r-[var(--cv-color-border)]",
              )}
              style={{ left: i * cellWidthPx, width: cellWidthPx }}
            >
              {slot.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Month: date row (32px) + weekday row (32px) ───
  const dates = getDatesInRange(dateRange.start, dateRange.end);
  const totalWidth = dates.length * cellWidthPx;

  return (
    <div className={headerClassName} style={{ minWidth: totalWidth }}>
      {/* Date row (32px) */}
      <div className="relative h-[var(--cv-size-date-header-height)]">
        {dates.map((date, i) => {
          const isLast = i === dates.length - 1;
          const isToday = isSameDay(date, today);
          return (
            <div
              key={`dl-${date.getTime()}`}
              className={cn(
                "absolute flex h-full items-center justify-center border-b border-b-[var(--cv-color-border)] text-xs",
                !isLast && "border-r border-r-[var(--cv-color-border)]",
                isToday
                  ? "font-[var(--cv-font-weight-bold)] text-[var(--cv-color-today-border)]"
                  : "font-[var(--cv-font-weight-normal)] text-[var(--cv-color-text)]",
              )}
              style={{ left: i * cellWidthPx, width: cellWidthPx }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
      {/* Weekday row (32px) */}
      <div className="relative h-[var(--cv-size-date-header-height)]">
        {dates.map((date, i) => {
          const isLast = i === dates.length - 1;
          return (
            <div
              key={`wd-${date.getTime()}`}
              className={cn(
                "absolute flex h-full items-center justify-center text-[11px] text-[var(--cv-color-text-muted)]",
                !isLast && "border-r border-r-[var(--cv-color-border)]",
              )}
              style={{ left: i * cellWidthPx, width: cellWidthPx }}
            >
              {WEEKDAYS[date.getDay()]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
