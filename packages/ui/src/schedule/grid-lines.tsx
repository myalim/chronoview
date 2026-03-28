/**
 * GridLines — Vertical grid lines for time slots / date columns.
 *
 * Renders thin lines at each time step boundary.
 * For Week view, date boundaries get a stronger style.
 * Setting topOffset to a negative value extends lines through the header area.
 *
 * Reference: docs/design/schedule/schedule-day.md §5
 */


export interface GridLineConfig {
  /** main axis offset in px */
  offset: number;
  /** Whether this is a date boundary line (00:00 point in Week view) */
  isBoundary?: boolean;
}

export interface GridLinesProps {
  lines: GridLineConfig[];
  /** total cross axis size (height of all rows) */
  crossSize: number;
  /** Starting y position (negative values extend through header) */
  topOffset?: number;
}

export function GridLines({ lines, crossSize, topOffset = 0 }: GridLinesProps) {
  const totalHeight = crossSize + Math.abs(topOffset);

  return (
    <>
      {lines.map((line) => (
        <div
          key={`grid-line-${line.offset}`}
          className="absolute w-px pointer-events-none"
          style={{
            left: line.offset - 1,
            top: topOffset,
            height: totalHeight,
            background: line.isBoundary
              ? "var(--cv-color-border-strong)"
              : "var(--cv-color-border)",
          }}
        />
      ))}
    </>
  );
}
