/**
 * Calculates the row height for a resource based on its max stack count.
 *
 * Formula: max(minRowHeight, maxStackCount × eventHeight + (maxStackCount - 1) × eventGap + padding × 2)
 *
 * @param config.padding - Top/bottom padding (default: 4, from --cv-spacing-xs)
 */
export function calculateRowHeight(config: {
  maxStackCount: number;
  eventHeight: number;
  eventGap: number;
  minRowHeight: number;
  padding?: number;
}): number {
  const { maxStackCount, eventHeight, eventGap, minRowHeight, padding = 4 } = config;

  if (maxStackCount <= 0) return minRowHeight;

  const contentHeight = maxStackCount * eventHeight + (maxStackCount - 1) * eventGap + padding * 2;

  return Math.max(minRowHeight, contentHeight);
}
