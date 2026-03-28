import type { Layout, MonthMode, StackMode, View } from "../types/index.js";

/**
 * Returns the default stacking strategy for a layout × view combination.
 *
 * - schedule (all views): vertical
 * - calendar day/week: horizontal
 * - calendar month: bar or list (based on monthMode)
 * - grid day: horizontal
 */
export function getDefaultStackMode(
  layout: Layout,
  view: View,
  monthMode?: MonthMode,
): StackMode | "bar" | "list" {
  if (layout === "schedule") {
    return "vertical";
  }

  if (layout === "calendar") {
    if (view === "month") {
      return monthMode === "list" ? "list" : "bar";
    }
    return "horizontal";
  }

  // grid
  return "horizontal";
}
