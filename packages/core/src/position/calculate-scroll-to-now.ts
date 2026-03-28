import { differenceInMinutes } from "date-fns";

/**
 * Calculates the scroll offset to center the current time in the viewport.
 * Clamps to [0, maxScroll] where maxScroll = totalSize - viewportSize.
 */
export function calculateScrollToNow(config: {
  now: Date;
  rangeStart: Date;
  rangeEnd: Date;
  totalSize: number;
  viewportSize: number;
}): number {
  const { now, rangeStart, rangeEnd, totalSize, viewportSize } = config;

  const totalMinutes = differenceInMinutes(rangeEnd, rangeStart);
  if (totalMinutes <= 0) return 0;

  const elapsedMinutes = differenceInMinutes(now, rangeStart);
  const nowOffset = (elapsedMinutes / totalMinutes) * totalSize;

  // Center now within the viewport
  const scrollOffset = nowOffset - viewportSize / 2;
  const maxScroll = Math.max(0, totalSize - viewportSize);

  return Math.max(0, Math.min(maxScroll, scrollOffset));
}
