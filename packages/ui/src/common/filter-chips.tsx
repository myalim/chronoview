/**
 * FilterChips — Resource toggle chips with color-coded backgrounds.
 *
 * Reference: docs/design/common/component-specs.md §4
 */

import { cn } from "../utils/cn.js";
import { Button } from "./button.js";

export interface FilterChipResource {
  id: string;
  title: string;
  color?: string;
}

export interface FilterChipsProps {
  resources: FilterChipResource[];
  selectedIds: string[];
  onToggle: (resourceId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  className?: string;
}

/**
 * Convert a color to a 10% alpha background.
 * hex (#3b82f6) -> rgba(59, 130, 246, 0.1)
 */
function colorToAlphaBg(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

/** Shared base classes for all chip buttons */
const chipBaseClasses = cn(
  "shrink-0 cursor-pointer",
  "h-8",
  "px-[var(--cv-spacing-md)] py-[var(--cv-spacing-xs)]",
  "text-[length:var(--cv-font-size-sm)]",
  "font-medium",
  "rounded-[var(--cv-radius-sm)]",
);

export function FilterChips({
  resources,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  className,
}: FilterChipsProps) {
  const allSelected = selectedIds.length === resources.length;

  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto pt-3 font-[var(--cv-font-family)]",
        className,
      )}
    >
      {/* Select all / deselect all button */}
      {(onSelectAll || onDeselectAll) && (
        <Button
          variant="outline"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-[var(--cv-color-text-secondary)]"
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </Button>
      )}

      {resources.map((resource) => {
        const isSelected = selectedIds.includes(resource.id);
        const color = resource.color || "var(--cv-color-event-default)";

        return (
          <button
            key={resource.id}
            type="button"
            onClick={() => onToggle(resource.id)}
            className={cn(
              chipBaseClasses,
              "flex items-center gap-1 border transition-all",
              !isSelected &&
                "bg-[var(--cv-color-surface)] text-[var(--cv-color-text-muted)] border-[var(--cv-color-border)]",
            )}
            style={
              isSelected
                ? {
                    borderColor: color,
                    background: resource.color
                      ? colorToAlphaBg(resource.color)
                      : "var(--cv-color-surface)",
                    color,
                  }
                : undefined
            }
          >
            {isSelected && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {resource.title}
          </button>
        );
      })}
    </div>
  );
}
