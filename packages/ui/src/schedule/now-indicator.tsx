/**
 * NowIndicator — Vertical red line + dot indicating current time.
 *
 * For Schedule layout: vertical line spanning all resource rows.
 * Dot at the top of the line, line extends downward.
 * z-index: behind event cards (z-now=10 < z-event=20).
 *
 * Reference: docs/design/schedule/schedule-day.md §7
 */

export interface NowIndicatorProps {
  /** main axis offset in px (horizontal position for schedule) */
  position: number;
  /** total cross axis size (height of all resource rows) */
  crossSize: number;
}

export function NowIndicator({ position, crossSize }: NowIndicatorProps) {
  return (
    <>
      {/* Dot — positioned at top of line, centered */}
      <div
        className="absolute pointer-events-none rounded-full z-11"
        style={{
          left: position - 4,
          top: 0,
          width: 10,
          height: 10,
          background: "var(--cv-color-now)",
        }}
      />
      {/* Vertical line */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: position - 0.5,
          top: 0,
          width: 2,
          height: crossSize,
          background: "var(--cv-color-now)",
        }}
      />
    </>
  );
}
