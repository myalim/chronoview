import { endOfWeek, startOfWeek } from "date-fns";
import type { DateRange } from "../types/index.js";

/**
 * Returns the 7-day week range containing the given date.
 *
 * @param weekStartsOn - 0 = Sunday (default), 1 = Monday
 */
export function calculateWeekRange(date: Date, weekStartsOn: 0 | 1 = 0): DateRange {
  return {
    start: startOfWeek(date, { weekStartsOn }),
    end: endOfWeek(date, { weekStartsOn }),
  };
}
