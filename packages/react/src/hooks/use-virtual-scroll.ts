/**
 * useVirtualScroll — Virtual scroll range calculation.
 *
 * Tracks scroll position on a container element and calculates
 * which items are visible using core calculateVisibleRange.
 */

import { useState, useMemo, useCallback, useEffect, type RefObject } from "react";
import { calculateVisibleRange } from "@chronoview/core";
import type { VisibleRange } from "@chronoview/core";

export interface UseVirtualScrollConfig {
  containerRef: RefObject<HTMLElement | null>;
  itemSizes: number[];
  overscan?: number;
  direction?: "vertical" | "horizontal";
}

export interface UseVirtualScrollReturn {
  visibleRange: VisibleRange;
  totalSize: number;
  scrollTo: (offset: number) => void;
  scrollToItem: (index: number) => void;
}

export function useVirtualScroll({
  containerRef,
  itemSizes,
  overscan = 3,
  direction = "vertical",
}: UseVirtualScrollConfig): UseVirtualScrollReturn {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);

  const totalSize = useMemo(() => itemSizes.reduce((sum, s) => sum + s, 0), [itemSizes]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateViewport = () => {
      setViewportSize(direction === "vertical" ? el.clientHeight : el.clientWidth);
    };

    const handleScroll = () => {
      setScrollOffset(direction === "vertical" ? el.scrollTop : el.scrollLeft);
    };

    updateViewport();
    handleScroll();

    el.addEventListener("scroll", handleScroll, { passive: true });
    const observer = new ResizeObserver(updateViewport);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [containerRef, direction]);

  const visibleRange = useMemo(
    () => calculateVisibleRange({ scrollOffset, viewportSize, itemSizes, overscan }),
    [scrollOffset, viewportSize, itemSizes, overscan],
  );

  const scrollTo = useCallback(
    (offset: number) => {
      const el = containerRef.current;
      if (!el) return;
      if (direction === "vertical") {
        el.scrollTop = offset;
      } else {
        el.scrollLeft = offset;
      }
    },
    [containerRef, direction],
  );

  const scrollToItem = useCallback(
    (index: number) => {
      const offset = itemSizes.slice(0, index).reduce((sum, s) => sum + s, 0);
      scrollTo(offset);
    },
    [itemSizes, scrollTo],
  );

  return { visibleRange, totalSize, scrollTo, scrollToItem };
}
