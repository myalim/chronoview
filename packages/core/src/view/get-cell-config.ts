import type { CellDurationConfig, View } from "../types/index.js";

/**
 * Cell configuration returned by getCellConfig.
 *
 * @property cellWidthPx - Pixel width per cell (auto-calculated from cellDuration)
 * @property intervalMinutes - Cell duration in minutes (for generateTimeSlots)
 */
export interface CellConfig {
  cellWidthPx: number;
  intervalMinutes: number;
}

// Fixed totalMainSize per view.
// Phase 7 "time axis zoom" will scale these via a zoomLevel parameter.
const DAY_TOTAL_WIDTH = 2880; // 24h × 120px baseline
const WEEK_TOTAL_WIDTH = 1680; // 7d × 4cells × 60px baseline
const MONTH_CELL_WIDTH = 40;

/**
 * Returns the cell configuration for a given view and cellDuration config.
 * cellWidthPx is auto-calculated to keep totalMainSize constant per view.
 *
 * Day:   cellDuration.day (min) → cells = 24h × 60 / duration → width = 2880 / cells
 * Week:  cellDuration.week (hours) → cells = 168h / duration → width = 1680 / cells
 * Month: fixed 40px per day, intervalMinutes = 0 (no slots)
 */
export function getCellConfig(view: View, cellDuration?: CellDurationConfig): CellConfig {
  if (view === "day") {
    const duration = cellDuration?.day ?? 60;
    const cells = (24 * 60) / duration;
    return {
      cellWidthPx: DAY_TOTAL_WIDTH / cells,
      intervalMinutes: duration,
    };
  }

  if (view === "week") {
    const durationHours = cellDuration?.week ?? 6;
    const cells = 168 / durationHours; // 7 days × 24 hours = 168
    return {
      cellWidthPx: WEEK_TOTAL_WIDTH / cells,
      intervalMinutes: durationHours * 60,
    };
  }

  // month: fixed values, no time slots
  return {
    cellWidthPx: MONTH_CELL_WIDTH,
    intervalMinutes: 0,
  };
}
