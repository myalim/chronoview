import type { ReactNode, Ref } from "react";
import {
  CalendarContainer,
  type CalendarContainerProps,
} from "./calendar-container.js";
import { CalendarShell } from "./calendar-shell.js";

export interface CalendarViewProps {
  sidebar: CalendarContainerProps["sidebar"];
  body: CalendarContainerProps["body"];
  totalMainSize: number;
  /** Day header row (sticky top) — Week view */
  header?: ReactNode;
  /** Corner cell content at header×sidebar intersection */
  corner?: ReactNode;
  /** Header row height */
  headerHeight?: number | string;
  toolbar?: ReactNode;
  filterPanel?: ReactNode;
  containerRef?: Ref<HTMLDivElement>;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Day/Week layout: CalendarShell + CalendarContainer.
 * Month view uses CalendarShell directly (see calendar.tsx).
 */
export function CalendarView({
  sidebar,
  body,
  totalMainSize,
  header,
  corner,
  headerHeight,
  toolbar,
  filterPanel,
  containerRef,
  theme,
  className,
}: CalendarViewProps) {
  return (
    <CalendarShell toolbar={toolbar} filterPanel={filterPanel} theme={theme} className={className}>
      {/* flex-1 + min-h-0: fill remaining space and enable inner scrolling */}
      <CalendarContainer
        ref={containerRef}
        sidebar={sidebar}
        body={body}
        totalMainSize={totalMainSize}
        header={header}
        corner={corner}
        headerHeight={headerHeight}
        className="flex-1 min-h-0 mt-3"
      />
    </CalendarShell>
  );
}
