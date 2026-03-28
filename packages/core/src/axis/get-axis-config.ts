import type { AxisConfig, Layout } from "../types/index.js";

/**
 * Returns the axis configuration for a given layout.
 *
 * - schedule: time flows horizontally (main), resources stack vertically (cross)
 * - grid/calendar: time flows vertically (main), resources/days spread horizontally (cross)
 */
export function getAxisConfig(layout: Layout): AxisConfig {
  if (layout === "schedule") {
    return { mainAxis: "horizontal", crossAxis: "vertical" };
  }
  // grid, calendar
  return { mainAxis: "vertical", crossAxis: "horizontal" };
}
