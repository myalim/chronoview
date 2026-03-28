import { endOfDay, startOfDay } from "date-fns";
import type { DateRange } from "../types/index.js";

/**
 * Returns the full day range for a given date (start-of-day to end-of-day).
 * Input time is normalized: any time on the same day produces the same range.
 */
export function calculateDayRange(date: Date): DateRange {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}
