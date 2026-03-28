import { differenceInMinutes } from "date-fns";
import type { TimelineEvent } from "../types/index.js";

/**
 * Calculates the main-axis position and size for an event within a time range.
 * Uses minute-level precision (independent of timeStep).
 * Events extending beyond the range are clamped to the visible boundaries.
 *
 * @param config.event - The event to position
 * @param config.rangeStart - Start of the visible time range
 * @param config.rangeEnd - End of the visible time range
 * @param config.totalMainSize - Total pixel size of the main axis
 * @returns mainOffset (px from range start) and mainSize (px width/height)
 */
export function calculateEventPosition(config: {
  event: TimelineEvent;
  rangeStart: Date;
  rangeEnd: Date;
  totalMainSize: number;
}): { mainOffset: number; mainSize: number } {
  const { event, rangeStart, rangeEnd, totalMainSize } = config;

  const totalMinutes = differenceInMinutes(rangeEnd, rangeStart);
  if (totalMinutes <= 0) return { mainOffset: 0, mainSize: 0 };

  // Clamp event boundaries to the visible range
  const clampedStart = event.start < rangeStart ? rangeStart : event.start;
  const clampedEnd = event.end > rangeEnd ? rangeEnd : event.end;

  const startMinutes = differenceInMinutes(clampedStart, rangeStart);
  const endMinutes = differenceInMinutes(clampedEnd, rangeStart);

  const mainOffset = (startMinutes / totalMinutes) * totalMainSize;
  const mainSize = ((endMinutes - startMinutes) / totalMinutes) * totalMainSize;

  return { mainOffset, mainSize };
}
