import { type RefObject, useCallback, useEffect, useRef } from "react";
import { calculateScrollToNow } from "@chronoview/core";

export interface UseScrollToNowConfig {
  /** Scroll container element ref */
  containerRef: RefObject<HTMLElement | null>;
  /** Visible time range start */
  rangeStart: Date;
  /** Visible time range end */
  rangeEnd: Date;
  /** Total scrollable size in px (main axis) */
  totalSize: number;
  /** Scroll direction (default: "vertical") */
  direction?: "vertical" | "horizontal";
  /** Auto-scroll to current time on mount (default: true) */
  scrollOnMount?: boolean;
}

export interface UseScrollToNowReturn {
  /** Manually scroll to current time (smooth animation) */
  scrollToNow: () => void;
}

/**
 * Hook that auto-scrolls to the current time on mount and
 * provides a manual `scrollToNow()` trigger for "Now" button.
 *
 * Wraps core `calculateScrollToNow` with container ref management.
 */
export function useScrollToNow(config: UseScrollToNowConfig): UseScrollToNowReturn {
  const {
    containerRef,
    rangeStart,
    rangeEnd,
    totalSize,
    direction = "vertical",
    scrollOnMount = true,
  } = config;

  // Keep latest config in a ref for mount-only effect
  const configRef = useRef({ containerRef, rangeStart, rangeEnd, totalSize, direction, scrollOnMount });
  configRef.current = { containerRef, rangeStart, rangeEnd, totalSize, direction, scrollOnMount };

  // Manual trigger — smooth scroll
  const scrollToNow = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const viewportSize = direction === "vertical" ? el.clientHeight : el.clientWidth;
    const offset = calculateScrollToNow({
      now: new Date(),
      rangeStart,
      rangeEnd,
      totalSize,
      viewportSize,
    });

    el.scrollTo({
      [direction === "vertical" ? "top" : "left"]: offset,
      behavior: "smooth",
    });
  }, [containerRef, rangeStart, rangeEnd, totalSize, direction]);

  // Auto-scroll on mount — instant (no animation), reads from ref to satisfy exhaustive deps
  useEffect(() => {
    const { containerRef: ref, rangeStart: rs, rangeEnd: re, totalSize: ts, direction: dir, scrollOnMount: scroll } = configRef.current;
    if (!scroll) return;

    const el = ref.current;
    if (!el) return;

    const viewportSize = dir === "vertical" ? el.clientHeight : el.clientWidth;
    const offset = calculateScrollToNow({
      now: new Date(),
      rangeStart: rs,
      rangeEnd: re,
      totalSize: ts,
      viewportSize,
    });

    if (dir === "vertical") {
      el.scrollTop = offset;
    } else {
      el.scrollLeft = offset;
    }
  }, []);

  return { scrollToNow };
}
