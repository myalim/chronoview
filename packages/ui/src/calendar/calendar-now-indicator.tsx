import type { CSSProperties } from "react";

export interface CalendarNowIndicatorProps {
  /** Main axis offset in px (vertical position — y coordinate) */
  position: number;
  /** Total cross axis size (horizontal width of the line) */
  crossSize: number | string;
}

/**
 * Horizontal now indicator for Calendar layout (mainAxis=vertical).
 * Dot at left edge + horizontal line spanning the column.
 */
export function CalendarNowIndicator({ position, crossSize }: CalendarNowIndicatorProps) {
  // left: -1 so most of the dot is visible at the sidebar boundary (rendered inside body overflow)
  const dotStyle: CSSProperties = {
    position: "absolute",
    top: position - 4,
    left: -1,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--cv-color-now)",
    pointerEvents: "none",
  };

  const lineStyle: CSSProperties = {
    position: "absolute",
    top: position - 0.5,
    left: 0,
    width: crossSize,
    height: 2,
    background: "var(--cv-color-now)",
    pointerEvents: "none",
  };

  return (
    <>
      <div className="z-[var(--cv-z-now)]" style={dotStyle} />
      <div className="z-[var(--cv-z-now)]" style={lineStyle} />
    </>
  );
}
