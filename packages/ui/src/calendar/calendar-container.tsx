import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface CalendarContainerProps {
  /** Time sidebar (sticky left) */
  sidebar: ReactNode;
  /** Grid body (events, grid lines, NowIndicator) — position: relative internally */
  body: ReactNode;
  /** Total main axis size in px (height of all time slots) */
  totalMainSize: number;
  className?: string;
}

/**
 * Scroll container for Calendar Day layout.
 * Flex row: sticky TimeSidebar (left) + scrollable body (right).
 * Vertical scroll only — single column, no horizontal scroll needed.
 */
export const CalendarContainer = forwardRef<HTMLDivElement, CalendarContainerProps>(
  function CalendarContainer({ sidebar, body, totalMainSize, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "flex overflow-y-auto overflow-x-hidden border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)]",
          className,
        )}
      >
        {/* Sticky time sidebar */}
        <div className="sticky left-0 z-[var(--cv-z-sticky-sidebar)] shrink-0">
          {sidebar}
        </div>

        {/* Scrollable body — events, grid lines, now indicator */}
        <div className="relative flex-1" style={{ height: totalMainSize }}>
          {body}
        </div>
      </div>
    );
  },
);
