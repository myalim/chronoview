/**
 * MiniCalendar — Compact calendar picker with view-aware selection.
 *
 * - Day view: select a specific date
 * - Week view: highlight and select an entire week row
 * - Month view: 4×3 month grid for month selection
 *
 * Used inside Toolbar as a popup for quick date navigation.
 */

import { type CSSProperties, useEffect, useState } from "react";
import { calculateMonthGrid, isSameDay } from "@chronoview/core";
import { cn } from "../utils/cn.js";
import { Button } from "./button.js";

type View = "day" | "week" | "month";

export interface MiniCalendarProps {
  /** Currently selected date (highlighted in the grid) */
  currentDate: Date;
  /** Called when user clicks a date/week/month cell */
  onDateSelect: (date: Date) => void;
  /** Current schedule view — controls selection granularity */
  view?: View;
  /** Week start day. 0 = Sunday, 1 = Monday. Default: 0 */
  weekStartsOn?: 0 | 1;
  className?: string;
}

/** Weekday labels starting from Sunday */
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** Month labels */
const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

/** Check if a date falls within the same week as the reference date */
function isSameWeek(day: Date, ref: Date, weekStartsOn: 0 | 1): boolean {
  const getWeekStart = (d: Date) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayOfWeek = date.getDay();
    const diff = (dayOfWeek - weekStartsOn + 7) % 7;
    date.setDate(date.getDate() - diff);
    return date;
  };
  return isSameDay(getWeekStart(day), getWeekStart(ref));
}

/** Get weekday labels rotated by weekStartsOn */
function getWeekdayLabels(weekStartsOn: 0 | 1): string[] {
  if (weekStartsOn === 0) return WEEKDAY_LABELS;
  return [...WEEKDAY_LABELS.slice(weekStartsOn), ...WEEKDAY_LABELS.slice(0, weekStartsOn)];
}

/** Chevron left SVG */
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Chevron right SVG */
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const popupStyle: CSSProperties = { fontFamily: "var(--cv-font-family)" };

// ─── Month Picker (for month view) ───

function MonthPicker({
  currentDate,
  onDateSelect,
  className,
}: {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}) {
  const today = new Date();
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    setDisplayYear(currentDate.getFullYear());
  }, [currentDate]);

  return (
    <div
      className={cn(
        "w-[252px] p-3 bg-[var(--cv-color-bg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] shadow-[var(--cv-shadow-lg)]",
        className,
      )}
      style={popupStyle}
    >
      {/* Year header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={() => setDisplayYear((y) => y - 1)} aria-label="이전 년">
          <ChevronLeft />
        </Button>
        <span className="text-sm font-semibold text-[var(--cv-color-text)]">
          {displayYear}년
        </span>
        <Button variant="ghost" size="icon" onClick={() => setDisplayYear((y) => y + 1)} aria-label="다음 년">
          <ChevronRight />
        </Button>
      </div>

      {/* 4×3 month grid */}
      <div className="grid grid-cols-3 gap-1">
        {MONTH_LABELS.map((label, i) => {
          const isSelected =
            currentDate.getFullYear() === displayYear && currentDate.getMonth() === i;
          const isCurrentMonth =
            today.getFullYear() === displayYear && today.getMonth() === i;

          return (
            <button
              key={label}
              type="button"
              aria-current={isCurrentMonth ? "date" : undefined}
              onClick={() => onDateSelect(new Date(displayYear, i, 1))}
              className={cn(
                "h-9 flex items-center justify-center rounded-[var(--cv-radius-sm)] text-[length:var(--cv-font-size-sm)] cursor-pointer transition-colors duration-[var(--cv-duration-fast)]",
                isSelected &&
                  "bg-[var(--cv-color-event-default)] text-white font-medium",
                isCurrentMonth &&
                  !isSelected &&
                  "border border-[var(--cv-color-today-border)] text-[var(--cv-color-text)] font-medium",
                !isSelected &&
                  !isCurrentMonth &&
                  "text-[var(--cv-color-text)] hover:bg-[var(--cv-color-surface-hover)]",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day/Week Grid (for day and week views) ───

function DayWeekGrid({
  currentDate,
  onDateSelect,
  view,
  weekStartsOn,
  className,
}: {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  view: "day" | "week";
  weekStartsOn: 0 | 1;
  className?: string;
}) {
  const today = new Date();
  const isWeekMode = view === "week";

  const [displayMonth, setDisplayMonth] = useState(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );

  useEffect(() => {
    setDisplayMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate]);

  const weeks = calculateMonthGrid(displayMonth, weekStartsOn);
  const weekdayLabels = getWeekdayLabels(weekStartsOn);

  return (
    <div
      className={cn(
        "w-[252px] p-3 bg-[var(--cv-color-bg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] shadow-[var(--cv-shadow-lg)]",
        className,
      )}
      style={popupStyle}
    >
      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDisplayMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          aria-label="이전 월"
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm font-semibold text-[var(--cv-color-text)]">
          {`${displayMonth.getFullYear()}년 ${displayMonth.getMonth() + 1}월`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDisplayMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          aria-label="다음 월"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="h-8 flex items-center justify-center text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid — gap-y-1 prevents selected week row from touching today border */}
      <div className="grid grid-cols-7 gap-y-1">
        {weeks.map((week) =>
          week.map((day, dayIndex) => {
            const isCurrentMonth = day.getMonth() === displayMonth.getMonth();
            const isToday = isSameDay(day, today);

            // Day mode: highlight single day. Week mode: highlight entire week.
            const isSelected = isWeekMode
              ? isSameWeek(day, currentDate, weekStartsOn)
              : isSameDay(day, currentDate);

            // Week mode: rounded corners only on first/last day of the row
            const isFirstInRow = dayIndex === 0;
            const isLastInRow = dayIndex === 6;

            return (
              <button
                key={day.toISOString()}
                type="button"
                aria-current={isToday ? "date" : undefined}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "h-8 flex items-center justify-center text-[length:var(--cv-font-size-sm)] cursor-pointer transition-colors duration-[var(--cv-duration-fast)]",
                  // Day mode: fixed width + rounded
                  !isWeekMode && "w-8 rounded-[var(--cv-radius-sm)]",
                  // Week mode: only round edges of the row
                  isWeekMode && isFirstInRow && "rounded-l-[var(--cv-radius-sm)]",
                  isWeekMode && isLastInRow && "rounded-r-[var(--cv-radius-sm)]",
                  // Selected
                  isSelected &&
                    "bg-[var(--cv-color-event-default)] text-white font-medium",
                  // Today (not selected)
                  isToday &&
                    !isSelected &&
                    "border border-[var(--cv-color-today-border)] text-[var(--cv-color-text)] font-medium rounded-[var(--cv-radius-sm)]",
                  // Current month (not selected, not today)
                  isCurrentMonth &&
                    !isSelected &&
                    !isToday &&
                    "text-[var(--cv-color-text)] hover:bg-[var(--cv-color-surface-hover)]",
                  // Other month
                  !isCurrentMonth &&
                    !isSelected &&
                    "text-[var(--cv-color-text-muted)] hover:bg-[var(--cv-color-surface-hover)]",
                )}
              >
                {day.getDate()}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

// ─── MiniCalendar (entry point) ───

export function MiniCalendar({
  currentDate,
  onDateSelect,
  view = "day",
  weekStartsOn = 0,
  className,
}: MiniCalendarProps) {
  if (view === "month") {
    return (
      <MonthPicker
        currentDate={currentDate}
        onDateSelect={onDateSelect}
        className={className}
      />
    );
  }

  return (
    <DayWeekGrid
      currentDate={currentDate}
      onDateSelect={onDateSelect}
      view={view}
      weekStartsOn={weekStartsOn}
      className={className}
    />
  );
}
