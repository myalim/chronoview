import type { ReactNode, Ref } from "react";
import { cn } from "../utils/cn.js";
import {
  CalendarContainer,
  type CalendarContainerProps,
} from "./calendar-container.js";

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
 * Top-level layout shell for Calendar views.
 * Composes Toolbar + FilterPanel + CalendarContainer.
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
    <div
      className={cn(
        "flex flex-col text-left font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]",
        theme,
        className
      )}
    >
      {toolbar}
      {filterPanel}
      {/* flex-1 + min-h-0: 컨테이너가 남은 공간을 차지하고 내부 스크롤 활성화 */}
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
    </div>
  );
}
