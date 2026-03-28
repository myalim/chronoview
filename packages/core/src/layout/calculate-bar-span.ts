import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { BarSpanInfo, TimelineEvent } from "../types/index.js";

/**
 * Calculates the column span of an event bar within a Calendar Month week row.
 * Used for both Calendar Month (bar mode) and Schedule Month multi-day events.
 * Events extending beyond the week are clamped to week boundaries.
 *
 * @param config.event - The event to calculate span for
 * @param config.weekStart - First day of the week row
 * @param config.weekEnd - Last day of the week row
 * @returns Column indices (0-6) and total span in days
 */
export function calculateBarSpan(config: {
  event: TimelineEvent;
  weekStart: Date;
  weekEnd: Date;
}): BarSpanInfo {
  const { event, weekStart, weekEnd } = config;

  const weekStartDay = startOfDay(weekStart);
  const weekEndDay = startOfDay(weekEnd);

  // Clamp event start/end to week boundaries
  const clampedStart = event.start < weekStartDay ? weekStartDay : startOfDay(event.start);
  const clampedEnd = startOfDay(event.end) > weekEndDay ? weekEndDay : startOfDay(event.end);

  const startColumn = differenceInCalendarDays(clampedStart, weekStartDay);
  const endColumn = differenceInCalendarDays(clampedEnd, weekStartDay);
  const spanDays = endColumn - startColumn + 1;

  return { startColumn, endColumn, spanDays };
}
