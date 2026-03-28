import { differenceInMinutes } from "date-fns";

/**
 * Calculates the Now Indicator position along the main axis.
 * Returns null if `now` is outside the visible range.
 */
export function calculateNowPosition(config: {
  now: Date;
  rangeStart: Date;
  rangeEnd: Date;
  totalSize: number;
}): number | null {
  const { now, rangeStart, rangeEnd, totalSize } = config;

  if (now < rangeStart || now > rangeEnd) return null;

  const totalMinutes = differenceInMinutes(rangeEnd, rangeStart);
  if (totalMinutes <= 0) return null;

  const elapsedMinutes = differenceInMinutes(now, rangeStart);
  return (elapsedMinutes / totalMinutes) * totalSize;
}
