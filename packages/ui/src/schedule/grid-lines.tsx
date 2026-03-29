/**
 * GridLines — Vertical grid lines for time slots / date columns.
 *
 * Internally computes line positions from view + dateRange + cellDuration
 * using getCellConfig and generateTimeSlots from @chronoview/core.
 * For Week view, date boundaries get a stronger style.
 * Setting topOffset to a negative value extends lines through the header area.
 *
 * Reference: docs/design/schedule/schedule-day.md §5
 */

import {
  getCellConfig,
  generateTimeSlots,
  type View,
  type DateRange,
  type CellDurationConfig,
} from "@chronoview/core";

export interface GridLinesProps {
  view: View;
  /** Date range to display (determines number of cells) */
  dateRange: DateRange;
  /** Total cross axis size — height of all rows (from layout result) */
  crossSize: number;
  /** Cell duration — Day: minutes (15|30|60), Week: hours (3|4|6|8|12), Month: ignored */
  cellDuration?: CellDurationConfig;
  /** Starting y position (negative values extend through header) */
  topOffset?: number;
}

export function GridLines({
  view,
  dateRange,
  crossSize,
  cellDuration,
  topOffset = 0,
}: GridLinesProps) {
  const { cellWidthPx, intervalMinutes } = getCellConfig(view, cellDuration);
  const totalHeight = crossSize + Math.abs(topOffset);

  // Month: one line per day boundary (no time slots)
  if (view === "month") {
    const days = Math.round(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return (
      <>
        {Array.from({ length: days - 1 }, (_, i) => {
          const offset = (i + 1) * cellWidthPx;
          return (
            <div
              key={`grid-line-${offset}`}
              className="absolute w-px pointer-events-none"
              style={{
                left: offset - 1,
                top: topOffset,
                height: totalHeight,
                background: "var(--cv-color-border)",
              }}
            />
          );
        })}
      </>
    );
  }

  // Day / Week: one line per time slot boundary
  const timeSlots = generateTimeSlots({
    startTime: dateRange.start,
    endTime: dateRange.end,
    intervalMinutes,
  });

  // For Week view, calculate slotsPerDay to detect date boundaries
  const slotsPerDay = view === "week" ? Math.round(timeSlots.length / 7) : 0;

  return (
    <>
      {/* Skip first slot (offset=0 overlaps with sidebar border) */}
      {timeSlots.slice(1).map((_, i) => {
        const slotIndex = i + 1;
        const offset = slotIndex * cellWidthPx;
        const isBoundary = view === "week" && slotsPerDay > 0 && slotIndex % slotsPerDay === 0;

        return (
          <div
            key={`grid-line-${offset}`}
            className="absolute w-px pointer-events-none"
            style={{
              left: offset - 1,
              top: topOffset,
              height: totalHeight,
              background: isBoundary ? "var(--cv-color-border-strong)" : "var(--cv-color-border)",
            }}
          />
        );
      })}
    </>
  );
}
