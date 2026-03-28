import type { Layout, View } from "../types/index.js";

/**
 * Returns the default available views for a given layout.
 *
 * - schedule/calendar: day, week, month
 * - grid: day only
 */
export function getDefaultAvailableViews(layout: Layout): View[] {
  if (layout === "grid") {
    return ["day"];
  }
  return ["day", "week", "month"];
}
