/**
 * Toolbar — Top bar composing DateNavigator + Today button + Filter + ViewToggle.
 *
 * Reference: docs/design/common/component-specs.md §3
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn.js";
import { Button } from "./button.js";
import { DateNavigator, type DateNavigatorProps } from "./date-navigator.js";
import { MiniCalendar } from "./mini-calendar.js";
import { ViewToggle, type ViewToggleProps } from "./view-toggle.js";

type View = "day" | "week" | "month";
type Layout = "schedule" | "grid" | "calendar";

export interface ToolbarProps {
  // DateNavigator
  currentDate: Date;
  view: View;
  layout: Layout;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  formatDate?: DateNavigatorProps["formatDate"];

  // Date picker (optional — calendar button only renders when provided)
  onGoToDate?: (date: Date) => void;
  weekStartsOn?: 0 | 1;

  // ViewToggle
  onViewChange: (view: View) => void;
  availableViews?: View[];
  viewLabels?: ViewToggleProps["labels"];

  // Custom slots
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

export function Toolbar({
  currentDate,
  view,
  layout: _layout,
  onPrev,
  onNext,
  onToday,
  formatDate,
  onGoToDate,
  weekStartsOn,
  onViewChange,
  availableViews,
  viewLabels,
  leftSlot,
  rightSlot,
  className,
}: ToolbarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close popup on click-outside or Escape key
  useEffect(() => {
    if (!isCalendarOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCalendarOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCalendarOpen]);

  const handleDateSelect = (date: Date) => {
    onGoToDate?.(date);
    setIsCalendarOpen(false);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between flex-wrap gap-2 h-14 font-[var(--cv-font-family)] border-b border-[var(--cv-color-border)] bg-[var(--cv-color-bg)]",
        className,
      )}
    >
      {/* Left: Calendar picker + DateNavigator + Today button */}
      <div className="flex items-center gap-2">
        {/* Calendar picker + DateNavigator grouped together */}
        <div className="flex items-center">
          {onGoToDate && (
            <div ref={calendarRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                aria-label="달력"
                aria-expanded={isCalendarOpen}
                aria-haspopup="dialog"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 6.5H14" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5.5 1.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M10.5 1.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Button>

              {isCalendarOpen && (
                <div
                  className="absolute top-full left-0 mt-1 z-[var(--cv-z-popup)]"
                  role="dialog"
                  aria-label="날짜 선택"
                >
                  <MiniCalendar
                    currentDate={currentDate}
                    onDateSelect={handleDateSelect}
                    view={view}
                    weekStartsOn={weekStartsOn}
                  />
                </div>
              )}
            </div>
          )}

          <DateNavigator
            currentDate={currentDate}
            view={view}
            onPrev={onPrev}
            onNext={onNext}
            formatDate={formatDate}
          />
        </div>
        <Button variant="outline" onClick={onToday}>
          오늘
        </Button>
        {leftSlot}
      </div>

      {/* Right: Filter + ViewToggle */}
      <div className="flex items-center gap-2">
        {rightSlot}
        <ViewToggle
          currentView={view}
          onViewChange={onViewChange}
          availableViews={availableViews}
          labels={viewLabels}
        />
      </div>
    </div>
  );
}
