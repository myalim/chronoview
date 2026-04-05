/**
 * buildMonthCellLayouts — Generates layout data for each cell in the month grid.
 *
 * Filters events per date and splits them into visible/hidden via truncateEvents.
 * The hook returns this result directly, so the Calendar component can render
 * without additional computation.
 */

import { isSameDay } from "date-fns";
import type { MonthCellLayout, TimelineEvent } from "../types/index.js";
import { truncateEvents } from "./truncate-events.js";

export function buildMonthCellLayouts(
  /** Month grid from calculateMonthGrid (Date[][] — weeks × days) */
  grid: Date[][],
  /** Events pre-filtered to the visible date range */
  visibleEvents: TimelineEvent[],
  /** Currently displayed month (0-11) */
  currentMonth: number,
  /** Max visible events per cell */
  maxVisible: number,
  /** Today's date (used for isToday check) */
  today: Date,
): MonthCellLayout[][] {
  return grid.map((weekDates, weekIndex) =>
    weekDates.map((cellDate) => {
      // Filter events within midnight-to-midnight range for this date
      const dayStart = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate(),
        0, 0, 0, 0,
      );
      const dayEnd = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate() + 1,
        0, 0, 0, 0,
      );

      const cellEvents = visibleEvents.filter(
        (e) => e.end > dayStart && e.start < dayEnd,
      );

      const truncated = truncateEvents({ events: cellEvents, maxVisible });

      return {
        date: cellDate,
        isToday: isSameDay(cellDate, today),
        isCurrentMonth: cellDate.getMonth() === currentMonth,
        events: cellEvents,
        visibleEvents: truncated.visible,
        hiddenCount: truncated.hiddenCount,
        weekIndex,
      };
    }),
  );
}
