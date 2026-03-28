import type { OverlapGroup, StackedEvent } from "../types/index.js";

/**
 * Greedy lane assignment algorithm shared by vertical and horizontal stacking.
 *
 * Sorts events by start time, then assigns the lowest available lane to each.
 * A lane becomes available when its last event's end time <= the current event's start time.
 * This produces a compact layout with minimal lane count.
 *
 * @returns Events with lane and totalLanes assigned. Order matches the sorted input.
 */
export function assignLanes(group: OverlapGroup): StackedEvent[] {
  if (group.events.length === 0) return [];

  const sorted = [...group.events].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Tracks the end time of the last event in each lane
  const laneEnds: number[] = [];
  const results: StackedEvent[] = [];

  for (const event of sorted) {
    // Find the lowest available lane
    let assignedLane = -1;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= event.start.getTime()) {
        assignedLane = i;
        break;
      }
    }

    if (assignedLane === -1) {
      assignedLane = laneEnds.length;
      laneEnds.push(0);
    }

    laneEnds[assignedLane] = event.end.getTime();
    results.push({ event, lane: assignedLane, totalLanes: 0 });
  }

  // Set totalLanes on all results
  const totalLanes = laneEnds.length;
  for (const result of results) {
    result.totalLanes = totalLanes;
  }

  return results;
}
