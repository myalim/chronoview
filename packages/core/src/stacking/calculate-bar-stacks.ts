import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { MonthBarLayout, TimelineEvent } from "../types/index.js";

/**
 * Assigns row positions to event bars in Calendar Month bar mode.
 *
 * Each bar spans one or more day columns within a single week row.
 * Bars are stacked into rows using greedy assignment to minimize total row count.
 * Events extending beyond the week are clamped to week boundaries.
 * For events spanning multiple weeks, call this function once per week with clamped events.
 *
 * @param events - Events that fall within or overlap this week
 * @param weekDates - Array of 7 dates representing the week (e.g., Sun-Sat)
 */
export function calculateBarStacks(events: TimelineEvent[], weekDates: Date[]): MonthBarLayout[] {
  if (events.length === 0 || weekDates.length === 0) return [];

  const weekStart = startOfDay(weekDates[0]);
  const weekEnd = startOfDay(weekDates[weekDates.length - 1]);

  // Sort by start time ascending
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Tracks the last occupied column (endColumn) in each row
  const rowEnds: number[] = [];
  const bars: MonthBarLayout[] = [];

  for (const event of sorted) {
    // Clamp to week boundaries
    const clampedStart = event.start < weekStart ? weekStart : startOfDay(event.start);
    const clampedEnd = startOfDay(event.end) > weekEnd ? weekEnd : startOfDay(event.end);

    const startColumn = differenceInCalendarDays(clampedStart, weekStart);
    const endColumn = differenceInCalendarDays(clampedEnd, weekStart);

    // Greedy row assignment: find the lowest non-overlapping row
    let assignedRow = -1;
    for (let i = 0; i < rowEnds.length; i++) {
      if (rowEnds[i] < startColumn) {
        assignedRow = i;
        break;
      }
    }

    if (assignedRow === -1) {
      assignedRow = rowEnds.length;
      rowEnds.push(-1);
    }

    rowEnds[assignedRow] = endColumn;

    bars.push({
      event,
      startColumn,
      endColumn,
      row: assignedRow,
      color: event.color ?? "",
    });
  }

  return bars;
}
