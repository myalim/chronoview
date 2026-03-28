/**
 * ViewToggle — Segmented control for switching between day/week/month views.
 *
 * Reference: docs/design/common/component-specs.md §2
 */

import { cn } from "../utils/cn.js";

type View = "day" | "week" | "month";

const DEFAULT_LABELS: Record<View, string> = {
  day: "일간",
  week: "주간",
  month: "월간",
};

export interface ViewToggleProps {
  currentView: View;
  onViewChange: (view: View) => void;
  availableViews?: View[];
  labels?: Partial<Record<View, string>>;
  className?: string;
}

export function ViewToggle({
  currentView,
  onViewChange,
  availableViews = ["day", "week", "month"],
  labels,
  className,
}: ViewToggleProps) {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <div
      className={cn(
        "inline-flex items-center h-9 rounded-[var(--cv-radius-sm)] overflow-hidden border border-[var(--cv-color-border)]",
        className
      )}
      role="tablist"
    >
      {availableViews.map((view) => {
        const isActive = view === currentView;
        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(view)}
            className={cn(
              "px-3 py-2 cursor-pointer whitespace-nowrap text-[length:var(--cv-font-size-sm)] font-medium font-[var(--cv-font-family)] border-none transition-colors",
              isActive
                ? "bg-[var(--cv-color-event-default)] text-white"
                : "bg-[var(--cv-color-surface)] text-[var(--cv-color-text-secondary)]"
            )}
          >
            {mergedLabels[view]}
          </button>
        );
      })}
    </div>
  );
}
