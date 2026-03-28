import { addDays, addMonths, startOfDay, subDays, subMonths } from "date-fns";
import type { View } from "../types/index.js";

/**
 * Navigate to the previous period based on view type.
 * - day: -1 day, week: -7 days, month: -1 month
 */
export function navigatePrev(startDate: Date, view: View): Date {
  const base = startOfDay(startDate);
  switch (view) {
    case "day":
      return subDays(base, 1);
    case "week":
      return subDays(base, 7);
    case "month":
      return subMonths(base, 1);
  }
}

/**
 * Navigate to the next period based on view type.
 * - day: +1 day, week: +7 days, month: +1 month
 */
export function navigateNext(startDate: Date, view: View): Date {
  const base = startOfDay(startDate);
  switch (view) {
    case "day":
      return addDays(base, 1);
    case "week":
      return addDays(base, 7);
    case "month":
      return addMonths(base, 1);
  }
}

/**
 * Jump to a specific date, normalized to start of day.
 */
export function goToDate(targetDate: Date): Date {
  return startOfDay(targetDate);
}
