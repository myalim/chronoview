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
  // left: -1 → sidebar 경계에 dot 우측 대부분이 노출 (body overflow 내 렌더링)
  const dotStyle: CSSProperties = {
    position: "absolute",
    top: position - 4,
    left: -1,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--cv-color-now)",
    pointerEvents: "none",
    zIndex: "var(--cv-z-now)" as unknown as number,
  };

  const lineStyle: CSSProperties = {
    position: "absolute",
    top: position - 0.5,
    left: 0,
    width: crossSize,
    height: 2,
    background: "var(--cv-color-now)",
    pointerEvents: "none",
    zIndex: "var(--cv-z-now)" as unknown as number,
  };

  return (
    <>
      <div style={dotStyle} />
      <div style={lineStyle} />
    </>
  );
}
