import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVirtualScroll } from "../use-virtual-scroll.js";
import { createRef, type RefObject } from "react";

/**
 * Creates a minimal mock container element for testing.
 * jsdom does not support real scrolling or ResizeObserver,
 * so we focus on initial state and totalSize computation.
 */
function createMockContainerRef(): RefObject<HTMLElement | null> {
  // Use createRef for a stable ref object
  const ref = createRef<HTMLElement | null>();
  return ref;
}

describe("useVirtualScroll", () => {
  it("returns initial visible range with empty container ref", () => {
    const containerRef = createMockContainerRef();

    const { result } = renderHook(() =>
      useVirtualScroll({
        containerRef,
        itemSizes: [50, 50, 50, 50, 50],
        overscan: 2,
      }),
    );

    // With null ref, scrollOffset=0, viewportSize=0
    // calculateVisibleRange should return a valid range starting at 0
    expect(result.current.visibleRange).toBeDefined();
    expect(result.current.visibleRange.startIndex).toBe(0);
    expect(result.current.visibleRange.overscan).toBe(2);
  });

  it("totalSize equals sum of itemSizes", () => {
    const containerRef = createMockContainerRef();

    const { result } = renderHook(() =>
      useVirtualScroll({
        containerRef,
        itemSizes: [100, 200, 150, 80],
      }),
    );

    expect(result.current.totalSize).toBe(530);
  });

  it("totalSize is 0 for empty itemSizes", () => {
    const containerRef = createMockContainerRef();

    const { result } = renderHook(() =>
      useVirtualScroll({
        containerRef,
        itemSizes: [],
      }),
    );

    expect(result.current.totalSize).toBe(0);
  });

  it("recalculates totalSize when itemSizes change", () => {
    const containerRef = createMockContainerRef();

    const { result, rerender } = renderHook(
      ({ sizes }) =>
        useVirtualScroll({
          containerRef,
          itemSizes: sizes,
        }),
      { initialProps: { sizes: [100, 200] } },
    );

    expect(result.current.totalSize).toBe(300);

    rerender({ sizes: [100, 200, 300] });

    expect(result.current.totalSize).toBe(600);
  });

  it("exposes scrollTo and scrollToItem functions", () => {
    const containerRef = createMockContainerRef();

    const { result } = renderHook(() =>
      useVirtualScroll({
        containerRef,
        itemSizes: [50, 50, 50],
      }),
    );

    expect(typeof result.current.scrollTo).toBe("function");
    expect(typeof result.current.scrollToItem).toBe("function");
  });
});
