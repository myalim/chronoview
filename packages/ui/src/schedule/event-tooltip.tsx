/**
 * EventTooltip — Lightweight tooltip shown on event hover.
 *
 * Displays title, time range, and resource name.
 * Renders via FloatingPortal outside the scroll container to prevent clipping.
 */

import { useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  FloatingPortal,
} from "@floating-ui/react";
import type { TimelineEvent } from "@chronoview/core";
import { formatTime } from "../utils/format-time.js";

export interface EventTooltipProps {
  event: TimelineEvent;
  /** Resource name (resource.title) */
  resourceName: string;
  /** DOM element the tooltip anchors to (EventCard) */
  reference: HTMLElement;
  /** Theme class for dark mode in the portal */
  themeClass?: string;
  /** Boundary element for flip/shift (ScheduleContainer) */
  boundary?: HTMLElement;
  /** Inner padding to exclude sticky sidebar/header areas */
  boundaryPadding?: { top?: number; right?: number; bottom?: number; left?: number };
}

export function EventTooltip({
  event,
  resourceName,
  reference,
  themeClass,
  boundary,
  boundaryPadding,
}: EventTooltipProps) {
  const { refs, floatingStyles } = useFloating({
    placement: "top",
    strategy: "fixed",
    middleware: [
      offset(8),
      flip({ boundary, padding: boundaryPadding }),
      shift({ boundary, padding: boundaryPadding, crossAxis: true }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Connect the reference element to floating-ui
  useEffect(() => {
    refs.setReference(reference);
  }, [reference, refs]);

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        className={themeClass}
        style={{
          ...floatingStyles,
          zIndex: "var(--cv-z-popup)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "var(--cv-color-surface)",
            border: "1px solid var(--cv-color-border)",
            boxShadow: "var(--cv-shadow-md)",
            borderRadius: "var(--cv-radius-sm)",
            padding: "var(--cv-spacing-xs) var(--cv-spacing-sm)",
            fontFamily: "var(--cv-font-family)",
            fontSize: "var(--cv-font-size-sm)",
            maxWidth: 240,
            animation: "cv-fade-in var(--cv-duration-fast) ease-out",
          }}
        >
          {/* title */}
          <div
            style={{
              fontWeight: "var(--cv-font-weight-medium)" as unknown as number,
              color: "var(--cv-color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.title}
          </div>
          {/* time range */}
          <div
            style={{
              color: "var(--cv-color-text-secondary)",
              fontSize: "var(--cv-font-size-xs)",
              marginTop: 2,
            }}
          >
            {formatTime(event.start)} - {formatTime(event.end)}
          </div>
          {/* resource name */}
          {resourceName && (
            <div
              style={{
                color: "var(--cv-color-text-muted)",
                fontSize: "var(--cv-font-size-xs)",
                marginTop: 1,
              }}
            >
              {resourceName}
            </div>
          )}
        </div>
      </div>
    </FloatingPortal>
  );
}
