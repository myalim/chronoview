/**
 * ScheduleContainer — Scroll container with sticky header/sidebar + grid body.
 *
 * Internally computes totalMainSize and headerHeight from view + dateRange + cellDuration
 * using getCellConfig and generateTimeSlots from @chronoview/core.
 *
 * Manages the CSS Grid layout that keeps:
 * - TimeHeader sticky to the top
 * - ResourceSidebar sticky to the left
 * - CornerCell sticky to both axes
 *
 * Reference: docs/design/schedule/schedule-day.md §3, §6
 */

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import {
  getCellConfig,
  generateTimeSlots,
  type View,
  type DateRange,
  type CellDurationConfig,
} from "@chronoview/core";
import { cn } from "../utils/cn.js";

/** View-specific header heights (px) */
function getHeaderHeight(view: View): number {
  if (view === "week") return 80; // 32px date + 48px time
  if (view === "month") return 64; // 32px date + 32px weekday
  return 48; // 48px time
}

/** Compute totalMainSize from view + dateRange + cellDuration */
function computeTotalMainSize(
  view: View,
  dateRange: DateRange,
  cellDuration?: CellDurationConfig
): number {
  const { cellWidthPx, intervalMinutes } = getCellConfig(view, cellDuration);

  if (view === "month") {
    const days = Math.round(
      (dateRange.end.getTime() - dateRange.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days * cellWidthPx;
  }

  const timeSlots = generateTimeSlots({
    startTime: dateRange.start,
    endTime: dateRange.end,
    intervalMinutes,
  });
  return timeSlots.length * cellWidthPx;
}

export interface ScheduleContainerProps {
  view: View;
  /** Date range to display (used to compute totalMainSize internally) */
  dateRange: DateRange;
  /** Sidebar area */
  sidebar: ReactNode;
  /** Header area */
  header: ReactNode;
  /** Grid body (events, grid lines, NowIndicator, etc.) */
  body: ReactNode;
  /** Total cross axis size — height of all rows (from layout result) */
  totalCrossSize: number;
  /** Cell duration — Day: minutes (15|30|60), Week: hours (3|4|6|8|12), Month: ignored */
  cellDuration?: CellDurationConfig;
  /** Empty state message (when no resources/events) */
  emptyMessage?: string;
  className?: string;
}

export const ScheduleContainer = forwardRef<
  HTMLDivElement,
  ScheduleContainerProps
>(function ScheduleContainer(
  {
    view,
    dateRange,
    sidebar,
    header,
    body,
    totalCrossSize,
    cellDuration,
    emptyMessage = "표시할 리소스가 없습니다",
    className,
  },
  ref
) {
  const isEmpty = totalCrossSize === 0;

  if (isEmpty) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center bg-[var(--cv-color-bg)] font-[var(--cv-font-family)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] py-16",
          className
        )}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="mb-3"
        >
          <rect
            x="4"
            y="8"
            width="40"
            height="32"
            rx="4"
            stroke="var(--cv-color-border)"
            strokeWidth="2"
          />
          <line
            x1="4"
            y1="16"
            x2="44"
            y2="16"
            stroke="var(--cv-color-border)"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="16"
            x2="16"
            y2="40"
            stroke="var(--cv-color-border)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1="28"
            y1="16"
            x2="28"
            y2="40"
            stroke="var(--cv-color-border)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
        <span className="text-sm text-[var(--cv-color-text-muted)]">
          {emptyMessage}
        </span>
      </div>
    );
  }

  const headerHeight = getHeaderHeight(view);
  const totalMainSize = computeTotalMainSize(view, dateRange, cellDuration);

  const gridStyle: CSSProperties = {
    gridTemplateColumns: "var(--cv-size-sidebar-width) 1fr",
    gridTemplateRows: `${headerHeight}px 1fr`,
  };

  return (
    <div
      ref={ref}
      className={cn(
        "grid overflow-auto relative overscroll-none mt-3 bg-[var(--cv-color-bg)] font-[var(--cv-font-family)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)]",
        className
      )}
      style={gridStyle}
    >
      {/* Top-left corner cell (sticky top + left) */}
      <div
        className="sticky top-0 left-0 z-[var(--cv-z-sticky-corner)] w-[var(--cv-size-sidebar-width)] bg-[var(--cv-color-bg)] border-r border-[var(--cv-color-border)] border-b border-b-[var(--cv-color-border)]"
        style={{ height: headerHeight }}
      />

      {/* Header (sticky top) */}
      <div
        className="sticky top-0 z-[var(--cv-z-sticky-header)] border-b border-b-[var(--cv-color-border)] overflow-hidden"
        style={{ width: totalMainSize, height: headerHeight }}
      >
        {header}
      </div>

      {/* Sidebar (sticky left) */}
      <div className="sticky left-0 z-[var(--cv-z-sticky-sidebar)]">
        {sidebar}
      </div>

      {/* Grid body */}
      <div
        className="relative overflow-visible"
        style={{ width: totalMainSize, height: totalCrossSize }}
      >
        {body}
      </div>
    </div>
  );
});
