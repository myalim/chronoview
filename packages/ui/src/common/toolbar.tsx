/**
 * Toolbar — Top bar composing DateNavigator + Today button + Filter + ViewToggle.
 *
 * Reference: docs/design/common/component-specs.md §3
 */

import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";
import { Button } from "./button.js";
import { DateNavigator, type DateNavigatorProps } from "./date-navigator.js";
import { ViewToggle, type ViewToggleProps } from "./view-toggle.js";

type View = "day" | "week" | "month";
type Layout = "schedule" | "grid" | "calendar";

export interface ToolbarProps {
  // DateNavigator
  currentDate: Date;
  view: View;
  layout: Layout;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  formatDate?: DateNavigatorProps["formatDate"];

  // ViewToggle
  onViewChange: (view: View) => void;
  availableViews?: View[];
  viewLabels?: ViewToggleProps["labels"];

  // Filter
  showFilter?: boolean;
  onFilterClick?: () => void;

  // Custom slots
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

export function Toolbar({
  currentDate,
  view,
  layout: _layout,
  onPrev,
  onNext,
  onToday,
  formatDate,
  onViewChange,
  availableViews,
  viewLabels,
  showFilter = false,
  onFilterClick,
  leftSlot,
  rightSlot,
  className,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between flex-wrap gap-2 h-14 font-[--cv-font-family] border-b border-[--cv-color-border] bg-[--cv-color-bg]",
        className
      )}
    >
      {/* Left: DateNavigator + Today button */}
      <div className="flex items-center gap-2">
        <DateNavigator
          currentDate={currentDate}
          view={view}
          onPrev={onPrev}
          onNext={onNext}
          formatDate={formatDate}
        />
        <Button variant="outline" onClick={onToday}>
          오늘
        </Button>
        {leftSlot}
      </div>

      {/* Right: Filter + ViewToggle */}
      <div className="flex items-center gap-2">
        {showFilter && (
          <Button
            variant="outline"
            onClick={onFilterClick}
            className="text-[--cv-color-text-secondary]"
          >
            필터 ▾
          </Button>
        )}
        {rightSlot}
        <ViewToggle
          currentView={view}
          onViewChange={onViewChange}
          availableViews={availableViews}
          labels={viewLabels}
        />
      </div>
    </div>
  );
}
