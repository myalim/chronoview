import { eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

/**
 * Returns a 2D array (weeks × 7 days) for Calendar Month grid.
 * Each row starts on the weekStartsOn day. Includes prev/next month padding.
 *
 * @param weekStartsOn - 0 = Sunday (default), 1 = Monday
 */
export function calculateMonthGrid(date: Date, weekStartsOn: 0 | 1 = 0): Date[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Chunk into 7-day rows to form a weeks × days 2D array
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return weeks;
}
