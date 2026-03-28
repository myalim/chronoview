import { differenceInMinutes } from "date-fns";

/**
 * Converts a time to a pixel offset along the main axis.
 * Uses minute-level precision (independent of timeStep).
 * Clamps the result to [0, totalSize].
 */
export function timeToOffset(config: {
  time: Date;
  rangeStart: Date;
  rangeEnd: Date;
  totalSize: number;
}): number {
  const { time, rangeStart, rangeEnd, totalSize } = config;

  const totalMinutes = differenceInMinutes(rangeEnd, rangeStart);
  if (totalMinutes <= 0) return 0;

  const elapsedMinutes = differenceInMinutes(time, rangeStart);
  const offset = (elapsedMinutes / totalMinutes) * totalSize;

  return Math.max(0, Math.min(totalSize, offset));
}
