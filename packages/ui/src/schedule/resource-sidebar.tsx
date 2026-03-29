/**
 * ResourceSidebar — Sticky left sidebar showing resource rows.
 *
 * Each row contains an icon + name, aligned with the corresponding
 * resource lane height in the grid body.
 *
 * Reference: docs/design/schedule/schedule-day.md §5
 */

import type { ReactNode } from "react";
import type { Resource } from "@chronoview/core";
import { cn } from "../utils/cn.js";

export interface ResourceSidebarProps {
  resources: Resource[];
  /** Row height for each resource (variable row heights) */
  rowHeights: number[];
  /** Custom rendering */
  renderResource?: (resource: Resource) => ReactNode;
}

export function ResourceSidebar({ resources, rowHeights, renderResource }: ResourceSidebarProps) {
  return (
    <div className="sticky left-0 shrink-0 z-[var(--cv-z-sticky-sidebar)] w-[var(--cv-size-sidebar-width)] bg-[var(--cv-color-bg)] border-r border-[var(--cv-color-border)] font-[var(--cv-font-family)]">
      {resources.map((resource, i) => {
        const height = rowHeights[i] ?? 48;
        const isLast = i === resources.length - 1;

        if (renderResource) {
          return (
            <div
              key={resource.id}
              className={cn(!isLast && "border-b border-[var(--cv-color-border)]")}
              style={{ height }}
            >
              {renderResource(resource)}
            </div>
          );
        }

        return (
          <div
            key={resource.id}
            className={cn(
              "flex items-center gap-2 px-4",
              !isLast && "border-b border-[var(--cv-color-border)]",
            )}
            style={{ height }}
          >
            {/* Icon (decorative, so aria-hidden is applied) */}
            <div
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                background: resource.color || "var(--cv-color-event-default)",
              }}
            >
              {resource.icon ? (
                <img src={resource.icon} alt={resource.title} className="h-6 w-6 rounded-full" />
              ) : (
                <span className="text-[11px] font-semibold text-white">
                  {resource.title.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Name */}
            <span className="truncate text-[length:var(--cv-font-size-base)] text-[var(--cv-color-text)]">
              {resource.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
