/**
 * useEventDetail — State management hook for tooltip/popover.
 *
 * Manages tooltip/popover visibility based on EventCard hover/click events.
 * Escape/click-outside dismissal is delegated to EventPopover's useDismiss.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimelineEvent } from "@chronoview/core";

interface UseEventDetailConfig {
  /** Whether the hover tooltip is enabled */
  tooltipEnabled: boolean;
  /** Whether the click popover is enabled (true when renderEventDetail is provided) */
  popoverEnabled: boolean;
}

interface EventDetailState<TData = unknown> {
  tooltipEvent: TimelineEvent<TData> | null;
  tooltipReference: HTMLElement | null;
  popoverEvent: TimelineEvent<TData> | null;
  popoverReference: HTMLElement | null;
  handleMouseEnter: (event: TimelineEvent<TData>, element: HTMLElement) => void;
  handleMouseLeave: () => void;
  handleClick: (event: TimelineEvent<TData>, element: HTMLElement) => void;
  closePopover: () => void;
}

/** Delay before showing hover tooltip (ms) */
const TOOLTIP_DELAY = 150;

export function useEventDetail<TData = unknown>(
  config: UseEventDetailConfig,
): EventDetailState<TData> {
  const { tooltipEnabled, popoverEnabled } = config;

  const [tooltipEvent, setTooltipEvent] = useState<TimelineEvent<TData> | null>(null);
  const [tooltipReference, setTooltipReference] = useState<HTMLElement | null>(null);
  const [popoverEvent, setPopoverEvent] = useState<TimelineEvent<TData> | null>(null);
  const [popoverReference, setPopoverReference] = useState<HTMLElement | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  // Clear pending timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => clearHoverTimer();
  }, [clearHoverTimer]);

  const handleMouseEnter = useCallback(
    (event: TimelineEvent<TData>, element: HTMLElement) => {
      if (!tooltipEnabled) return;

      // Skip tooltip while any popover is open (popover takes focus priority)
      if (popoverEvent) return;

      clearHoverTimer();
      hoverTimerRef.current = setTimeout(() => {
        setTooltipEvent(event);
        setTooltipReference(element);
      }, TOOLTIP_DELAY);
    },
    [tooltipEnabled, popoverEvent, clearHoverTimer],
  );

  const handleMouseLeave = useCallback(() => {
    clearHoverTimer();
    setTooltipEvent(null);
    setTooltipReference(null);
  }, [clearHoverTimer]);

  const handleClick = useCallback(
    (event: TimelineEvent<TData>, element: HTMLElement) => {
      if (!popoverEnabled) return;

      // Dismiss tooltip
      clearHoverTimer();
      setTooltipEvent(null);
      setTooltipReference(null);

      // Toggle popover off when clicking the same event
      if (popoverEvent?.id === event.id) {
        setPopoverEvent(null);
        setPopoverReference(null);
        return;
      }

      setPopoverEvent(event);
      setPopoverReference(element);
    },
    [popoverEnabled, popoverEvent, clearHoverTimer],
  );

  const closePopover = useCallback(() => {
    setPopoverEvent(null);
    setPopoverReference(null);
  }, []);

  return {
    tooltipEvent,
    tooltipReference,
    popoverEvent,
    popoverReference,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    closePopover,
  };
}
