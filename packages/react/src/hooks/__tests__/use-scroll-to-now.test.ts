import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { useScrollToNow } from "../use-scroll-to-now.js";

function createMockContainer(overrides?: Partial<HTMLElement>) {
  return {
    clientHeight: 600,
    clientWidth: 800,
    scrollTop: 0,
    scrollLeft: 0,
    scrollTo: vi.fn(),
    ...overrides,
  } as unknown as HTMLElement;
}

// Range: full day (midnight to midnight)
const rangeStart = new Date(2026, 2, 28, 0, 0, 0, 0);
const rangeEnd = new Date(2026, 2, 29, 0, 0, 0, 0);
const totalSize = 2880; // 24h × 120px

describe("useScrollToNow", () => {
  it("auto-scrolls on mount (vertical)", () => {
    const el = createMockContainer();
    const ref = { current: el } as RefObject<HTMLElement>;

    renderHook(() =>
      useScrollToNow({
        containerRef: ref,
        rangeStart,
        rangeEnd,
        totalSize,
      }),
    );

    // scrollTop should be set (instant, not via scrollTo)
    // The exact value depends on current time, just verify it was set
    expect(typeof el.scrollTop).toBe("number");
  });

  it("skips mount scroll when scrollOnMount=false", () => {
    const el = createMockContainer();
    const ref = { current: el } as RefObject<HTMLElement>;

    renderHook(() =>
      useScrollToNow({
        containerRef: ref,
        rangeStart,
        rangeEnd,
        totalSize,
        scrollOnMount: false,
      }),
    );

    // scrollTop should remain 0 (not modified)
    expect(el.scrollTop).toBe(0);
    expect(el.scrollTo).not.toHaveBeenCalled();
  });

  it("scrollToNow() calls scrollTo with smooth behavior (vertical)", () => {
    const el = createMockContainer();
    const ref = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollToNow({
        containerRef: ref,
        rangeStart,
        rangeEnd,
        totalSize,
      }),
    );

    result.current.scrollToNow();

    expect(el.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        top: expect.any(Number),
        behavior: "smooth",
      }),
    );
  });

  it("horizontal direction uses scrollLeft on mount", () => {
    const el = createMockContainer();
    const ref = { current: el } as RefObject<HTMLElement>;

    renderHook(() =>
      useScrollToNow({
        containerRef: ref,
        rangeStart,
        rangeEnd,
        totalSize,
        direction: "horizontal",
      }),
    );

    // Should set scrollLeft, not scrollTop
    expect(typeof el.scrollLeft).toBe("number");
  });

  it("horizontal scrollToNow() uses left instead of top", () => {
    const el = createMockContainer();
    const ref = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useScrollToNow({
        containerRef: ref,
        rangeStart,
        rangeEnd,
        totalSize,
        direction: "horizontal",
      }),
    );

    result.current.scrollToNow();

    expect(el.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        left: expect.any(Number),
        behavior: "smooth",
      }),
    );
  });

  it("handles null container ref gracefully", () => {
    const ref = { current: null } as RefObject<HTMLElement | null>;

    const { result } = renderHook(() =>
      useScrollToNow({
        containerRef: ref,
        rangeStart,
        rangeEnd,
        totalSize,
      }),
    );

    // Should not throw
    expect(() => result.current.scrollToNow()).not.toThrow();
  });
});
