export interface CalendarGridLinesProps {
  /** Number of time slots */
  slotCount: number;
  /** Height of each time slot in px */
  slotHeight: number;
  /** Total width of the grid area */
  crossSize: number | string;
}

/**
 * Horizontal grid lines at time slot boundaries for Calendar layout.
 * Skips the first line (i=0) which overlaps with the container's top border.
 */
export function CalendarGridLines({ slotCount, slotHeight, crossSize }: CalendarGridLinesProps) {
  return (
    <>
      {Array.from({ length: slotCount - 1 }, (_, i) => {
        const top = (i + 1) * slotHeight;
        return (
          <div
            key={`grid-line-${top}`}
            className="absolute left-0 pointer-events-none"
            style={{
              top,
              width: crossSize,
              height: 1,
              background: "var(--cv-color-border)",
            }}
          />
        );
      })}
    </>
  );
}
