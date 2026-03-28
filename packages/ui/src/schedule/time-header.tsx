/**
 * TimeHeader — Time axis header for Schedule views.
 *
 * Adapts to the current view:
 * - Day: single row of time slot labels
 * - Week: 2-tier (date row 32px + time row 48px = 80px)
 * - Month: 2-tier (date row 32px + weekday row 32px = 64px)
 *
 * Reference: docs/design/schedule/schedule-day.md §5,
 *            schedule-week.md §5, schedule-month.md §5
 */

import { cn } from "../utils/cn.js";

type View = "day" | "week" | "month";

export interface TimeSlotLabel {
  label: string;
  offset: number;
  width: number;
}

export interface DateLabel {
  label: string;
  /** Weekday name (Month view only) */
  weekday?: string;
  offset: number;
  width: number;
  isToday?: boolean;
}

export interface TimeHeaderProps {
  view: View;
  /** Time slot labels (Day/Week) */
  timeSlots?: TimeSlotLabel[];
  /** Date labels (Week/Month) */
  dateLabels?: DateLabel[];
  /** Total width (px) */
  totalWidth: number;
}

/** Time slot cell — used in Day/Week time rows */
function TimeSlotCell({
  slot,
  isLast,
}: {
  slot: TimeSlotLabel;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute flex h-full items-center justify-center text-xs text-[--cv-color-text-secondary]",
        !isLast && "border-r border-r-[--cv-color-border]"
      )}
      style={{ left: slot.offset, width: slot.width }}
    >
      {slot.label}
    </div>
  );
}

export function TimeHeader({
  view,
  timeSlots = [],
  dateLabels = [],
  totalWidth,
}: TimeHeaderProps) {
  const headerClassName =
    "sticky top-0 z-[var(--cv-z-sticky-header)] bg-[var(--cv-color-bg)] font-[var(--cv-font-family)]";

  // Day: time slots only (48px)
  if (view === "day") {
    return (
      <div className={headerClassName} style={{ minWidth: totalWidth }}>
        <div className="relative h-[--cv-size-time-header-height]">
          {timeSlots.map((slot, i) => (
            <TimeSlotCell
              key={`ts-${slot.offset}`}
              slot={slot}
              isLast={i === timeSlots.length - 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // Week: date header (32px) + time header (48px)
  if (view === "week") {
    return (
      <div className={headerClassName} style={{ minWidth: totalWidth }}>
        {/* Date row */}
        <div className="relative h-[--cv-size-date-header-height]">
          {dateLabels.map((dl, i) => {
            const isLast = i === dateLabels.length - 1;
            return (
              <div
                key={`dl-${dl.offset}`}
                className={cn(
                  "absolute flex h-full items-center justify-center border-b border-b-[--cv-color-border] text-base",
                  !isLast && "border-r border-r-[--cv-color-border-strong]",
                  dl.isToday
                    ? "font-[--cv-font-weight-bold] text-[--cv-color-today-border]"
                    : "font-[--cv-font-weight-medium] text-[--cv-color-text]"
                )}
                style={{ left: dl.offset, width: dl.width }}
              >
                {dl.label}
              </div>
            );
          })}
        </div>
        {/* Time row */}
        <div className="relative h-[--cv-size-time-header-height]">
          {timeSlots.map((slot, i) => (
            <TimeSlotCell
              key={`ts-${slot.offset}`}
              slot={slot}
              isLast={i === timeSlots.length - 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // Month: date row (32px) + weekday row (32px)
  return (
    <div className={headerClassName} style={{ minWidth: totalWidth }}>
      {/* Date row */}
      <div className="relative h-[--cv-size-date-header-height]">
        {dateLabels.map((dl, i) => {
          const isLast = i === dateLabels.length - 1;
          return (
            <div
              key={`dl-${dl.offset}`}
              className={cn(
                "absolute flex h-full items-center justify-center border-b border-b-[--cv-color-border] text-xs",
                !isLast && "border-r border-r-[--cv-color-border]",
                dl.isToday
                  ? "font-[--cv-font-weight-bold] text-[--cv-color-today-border]"
                  : "font-[--cv-font-weight-normal] text-[--cv-color-text]"
              )}
              style={{ left: dl.offset, width: dl.width }}
            >
              {dl.label}
            </div>
          );
        })}
      </div>
      {/* Weekday row */}
      <div className="relative h-[--cv-size-date-header-height]">
        {dateLabels.map((dl, i) => {
          const isLast = i === dateLabels.length - 1;
          return (
            <div
              key={`wd-${dl.offset}`}
              className={cn(
                "absolute flex h-full items-center justify-center text-[11px] text-[--cv-color-text-muted]",
                !isLast && "border-r border-r-[--cv-color-border]"
              )}
              style={{ left: dl.offset, width: dl.width }}
            >
              {dl.weekday}
            </div>
          );
        })}
      </div>
    </div>
  );
}
