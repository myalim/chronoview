import type { OverlapGroup, StackedEvent } from "../types/index.js";
import { assignLanes } from "./assign-lanes.js";

/**
 * Indent-overlap stacking for Calendar Day/Week "auto" mode (Google Calendar style).
 *
 * Events are sorted by start time and assigned incrementing depth (lane) values.
 * Rendering uses indent-based overlap: depth 0 is backmost (full width),
 * higher depth = more indent + higher z-index (frontmost).
 *
 * lane = depth, totalLanes = maxDepth + 1
 *
 * @see docs/design/calendar/calendar-day.md §4
 */
export function calculateAutoStacks(group: OverlapGroup): StackedEvent[] {
  // assignLanes: sorted by start time, greedy lane assignment
  // lane 0 = earliest (backmost), higher lane = later (frontmost)
  return assignLanes(group);
}
