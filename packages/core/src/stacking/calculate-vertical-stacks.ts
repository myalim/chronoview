import type { OverlapGroup, StackedEvent } from "../types/index.js";
import { assignLanes } from "./assign-lanes.js";

/**
 * Assigns vertical stacking lanes to overlapping events (Schedule layout).
 * Events are stacked vertically within their resource row.
 */
export function calculateVerticalStacks(group: OverlapGroup): StackedEvent[] {
  return assignLanes(group);
}
