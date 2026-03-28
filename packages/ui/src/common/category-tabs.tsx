/**
 * CategoryTabs — Category filter tabs with underline active state.
 *
 * Reference: docs/design/common/component-specs.md §5
 */

import { cn } from "../utils/cn.js";

export interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  allLabel?: string;
  className?: string;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelect,
  allLabel = "전체",
  className,
}: CategoryTabsProps) {
  const tabs = [
    { label: allLabel, value: null as string | null },
    ...categories.map((c) => ({ label: c, value: c })),
  ];

  return (
    <div
      className={cn(
        "flex items-center overflow-x-auto gap-4 px-4 font-[--cv-font-family] border-b border-[--cv-color-border]",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === selectedCategory;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.value)}
            className={cn(
              "shrink-0 cursor-pointer h-9 py-2 text-[length:--cv-font-size-sm] bg-transparent border-none border-b-2 transition-all",
              isActive
                ? "text-[--cv-color-event-default] font-medium border-b-[--cv-color-event-default]"
                : "text-[--cv-color-text-secondary] border-b-transparent"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
