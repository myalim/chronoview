import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import type { DateRange } from "../types/index.js";

/**
 * Returns the full calendar grid range for the given month.
 * Includes padding from prev/next months to fill complete weeks.
 *
 * @param weekStartsOn - 0 = Sunday (default), 1 = Monday
 */
export function calculateMonthRange(date: Date, weekStartsOn: 0 | 1 = 0): DateRange {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  return {
    start: startOfWeek(monthStart, { weekStartsOn }),
    end: endOfWeek(monthEnd, { weekStartsOn }),
  };
}
