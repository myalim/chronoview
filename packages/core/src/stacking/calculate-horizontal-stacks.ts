import type { OverlapGroup, StackedEvent } from "../types/index.js";
import { assignLanes } from "./assign-lanes.js";

/**
 * Assigns horizontal stacking lanes to overlapping events (Calendar Day/Week, Grid Day).
 * Events are split horizontally within their time slot.
 */
export function calculateHorizontalStacks(group: OverlapGroup): StackedEvent[] {
  return assignLanes(group);
}
