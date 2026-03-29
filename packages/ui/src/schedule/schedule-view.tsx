/**
 * ScheduleView — Top-level compound component for Schedule layout.
 *
 * Composes Toolbar + FilterPanel + ScheduleContainer.
 * Passes view + dateRange + cellDuration config to ScheduleContainer,
 * which internally computes totalMainSize and headerHeight.
 *
 * Reference: docs/design/schedule/schedule-day.md §2
 */

import type { ReactNode } from "react";
import type { View, DateRange, CellDurationConfig } from "@chronoview/core";
import type { ScheduleContainerProps } from "./schedule-container.js";
import { ScheduleContainer } from "./schedule-container.js";
import { cn } from "../utils/cn.js";

export interface ScheduleViewProps {
  // Layout
  view: View;

  // Config (passed through to ScheduleContainer)
  dateRange: DateRange;
  cellDuration?: CellDurationConfig;

  // Container props (pass-through)
  sidebar: ScheduleContainerProps["sidebar"];
  header: ScheduleContainerProps["header"];
  body: ScheduleContainerProps["body"];
  totalCrossSize: number;

  // Toolbar (optional — not rendered if not provided)
  toolbar?: ReactNode;
  // Filter panel (optional)
  filterPanel?: ReactNode;

  className?: string;
}

export function ScheduleView({
  view,
  dateRange,
  cellDuration,
  sidebar,
  header,
  body,
  totalCrossSize,
  toolbar,
  filterPanel,
  className,
}: ScheduleViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]",
        className,
      )}
    >
      {toolbar}
      {filterPanel}
      <ScheduleContainer
        view={view}
        dateRange={dateRange}
        cellDuration={cellDuration}
        sidebar={sidebar}
        header={header}
        body={body}
        totalCrossSize={totalCrossSize}
      />
    </div>
  );
}
