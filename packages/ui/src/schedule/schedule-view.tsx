/**
 * ScheduleView — Top-level compound component for Schedule layout.
 *
 * Composes Toolbar + FilterPanel + ScheduleContainer.
 * Purely presentational — receives all sizing data via props.
 *
 * Reference: docs/design/schedule/schedule-day.md §2
 */

import type { ReactNode } from "react";
import type { ScheduleContainerProps } from "./schedule-container.js";
import { ScheduleContainer } from "./schedule-container.js";
import { cn } from "../utils/cn.js";

export interface ScheduleViewProps {
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
        className,
      )}
    >
      {toolbar}
      {filterPanel}
      <ScheduleContainer
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
