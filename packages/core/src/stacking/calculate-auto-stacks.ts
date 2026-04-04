import type { OverlapGroup, StackedEvent } from "../types/index.js";
import { assignLanes } from "./assign-lanes.js";

/**
 * Column-packing stacking for Calendar Day/Week "auto" mode.
 *
 * 1. Assign events to the leftmost available column (via assignLanes)
 * 2. Expand each event rightward into contiguous empty columns
 *    during the event's entire [start, end) interval
 *
 * @see docs/design/calendar/calendar-day.md §4
 */
export function calculateAutoStacks(group: OverlapGroup): StackedEvent[] {
  const results = assignLanes(group);
  if (results.length === 0) return results;

  const totalLanes = results[0].totalLanes;
  if (totalLanes <= 1) {
    // Single lane — full width, no expansion needed
    for (const r of results) {
      r.spanColumns = 1;
    }
    return results;
  }

  // Build per-lane occupancy: list of [startTime, endTime] intervals
  const laneIntervals: Array<Array<{ start: number; end: number }>> = Array.from(
    { length: totalLanes },
    () => [],
  );

  for (const r of results) {
    laneIntervals[r.lane].push({
      start: r.event.start.getTime(),
      end: r.event.end.getTime(),
    });
  }

  // For each event, try to expand rightward into contiguous empty columns
  for (const r of results) {
    const eventStart = r.event.start.getTime();
    const eventEnd = r.event.end.getTime();
    let span = 1;

    // Check each column to the right of this event's lane
    for (let col = r.lane + 1; col < totalLanes; col++) {
      const isOccupied = laneIntervals[col].some(
        (interval) => interval.start < eventEnd && interval.end > eventStart,
      );

      if (isOccupied) break; // Stop at first occupied column
      span++;
    }

    r.spanColumns = span;
  }

  return results;
}
