import type { VisibleRange } from "../types/index.js";

/**
 * Calculates the visible item range for virtual scrolling.
 * Supports variable-height items via cumulative size calculation.
 *
 * @param config.overscan - Extra items to render outside viewport (default: 0)
 */
export function calculateVisibleRange(config: {
  scrollOffset: number;
  viewportSize: number;
  itemSizes: number[];
  overscan?: number;
}): VisibleRange {
  const { scrollOffset, viewportSize, itemSizes, overscan = 0 } = config;

  if (itemSizes.length === 0) {
    return { startIndex: 0, endIndex: 0, overscan };
  }

  const viewEnd = scrollOffset + viewportSize;
  let cumulative = 0;
  let startIndex = -1;
  let endIndex = itemSizes.length - 1;

  for (let i = 0; i < itemSizes.length; i++) {
    const itemStart = cumulative;
    cumulative += itemSizes[i];

    // First visible item: its cumulative end exceeds scrollOffset
    if (startIndex === -1 && cumulative > scrollOffset) {
      startIndex = i;
    }

    // Last visible item: its start reaches the viewport end
    if (itemStart >= viewEnd) {
      endIndex = i - 1;
      break;
    }
  }

  if (startIndex === -1) startIndex = 0;

  // Apply overscan buffer
  const bufferedStart = Math.max(0, startIndex - overscan);
  const bufferedEnd = Math.min(itemSizes.length - 1, endIndex + overscan);

  return {
    startIndex: bufferedStart,
    endIndex: bufferedEnd,
    overscan,
  };
}
