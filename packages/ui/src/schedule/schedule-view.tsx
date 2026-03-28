/**
 * ScheduleView — Top-level compound component for Schedule layout.
 *
 * Composes Toolbar + FilterPanel + ScheduleContainer.
 * In Step 1 (static UI), this accepts pre-computed layout data.
 * In Step 3 (integration), hooks will provide the data.
 *
 * Reference: docs/design/schedule/schedule-day.md §2
 */

import type { ReactNode } from "react";
import type { ScheduleContainerProps } from "./schedule-container.js";
import { ScheduleContainer } from "./schedule-container.js";
import { cn } from "../utils/cn.js";

type View = "day" | "week" | "month";
type Layout = "schedule" | "grid" | "calendar";

export interface ScheduleViewProps {
  // Layout
  view: View;
  layout?: Layout;

  // Container props (pass-through)
  sidebar: ScheduleContainerProps["sidebar"];
  header: ScheduleContainerProps["header"];
  body: ScheduleContainerProps["body"];
  totalMainSize: number;
  totalCrossSize: number;
  headerHeight: number;

  // Toolbar (optional — not rendered if not provided)
  toolbar?: ReactNode;
  // Filter panel (optional)
  filterPanel?: ReactNode;

  className?: string;
}

export function ScheduleView({
  view,
  layout: _layout,
  sidebar,
  header,
  body,
  totalMainSize,
  totalCrossSize,
  headerHeight,
  toolbar,
  filterPanel,
  className,
}: ScheduleViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col font-[var(--cv-font-family)] bg-[var(--cv-color-bg)] text-[var(--cv-color-text)]",
        className
      )}
    >
      {toolbar}
      {filterPanel}
      <ScheduleContainer
        view={view}
        sidebar={sidebar}
        header={header}
        body={body}
        totalMainSize={totalMainSize}
        totalCrossSize={totalCrossSize}
        headerHeight={headerHeight}
      />
    </div>
  );
}
