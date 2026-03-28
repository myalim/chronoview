import type { OverlapGroup, TimelineEvent } from "../types/index.js";

/**
 * Groups overlapping events within the same resource/column into OverlapGroups.
 *
 * Uses a sweep-line algorithm with iterative merge for transitive grouping:
 * if A overlaps B and B overlaps C, all three end up in one group.
 * Adjacent events (end === start) are NOT considered overlapping.
 *
 * @param events - Events from a single resource/column, in any order
 * @returns Groups of overlapping events. Non-overlapping events form singleton groups.
 */
export function detectOverlaps(events: TimelineEvent[]): OverlapGroup[] {
  if (events.length === 0) return [];

  // Sort by start time ascending (ties broken by end time descending: longer events first)
  const sorted = [...events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    return b.end.getTime() - a.end.getTime();
  });

  const groups: OverlapGroup[] = [];
  let currentGroup: TimelineEvent[] = [sorted[0]];
  // Latest end time in the current group
  let groupEnd = sorted[0].end.getTime();

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i];

    // Overlap: event starts before group ends
    if (event.start.getTime() < groupEnd) {
      currentGroup.push(event);
      // Extend group end for transitive grouping
      groupEnd = Math.max(groupEnd, event.end.getTime());
    } else {
      groups.push({ events: currentGroup });
      currentGroup = [event];
      groupEnd = event.end.getTime();
    }
  }

  groups.push({ events: currentGroup });
  return groups;
}
