/**
 * Unit tests for useEventDetail hook.
 *
 * Tests tooltip/popover state management: hover delay, click toggle,
 * state transitions between tooltip and popover.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { TimelineEvent } from "@chronoview/core";
import { useEventDetail } from "../use-event-detail.js";

// ─── Test Helpers ───

const mockEvent: TimelineEvent = {
  id: "e1",
  resourceId: "r1",
  start: new Date(2026, 2, 27, 9, 0),
  end: new Date(2026, 2, 27, 11, 0),
  title: "Sprint Planning",
};

const mockEvent2: TimelineEvent = {
  id: "e2",
  resourceId: "r2",
  start: new Date(2026, 2, 27, 13, 0),
  end: new Date(2026, 2, 27, 15, 0),
  title: "Design Review",
};

function mockElement(): HTMLElement {
  return document.createElement("div");
}

// ─── Tests ───

describe("useEventDetail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows tooltip after hover delay", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: false }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleMouseEnter(mockEvent, el);
    });

    // Tooltip should not appear yet (before delay)
    expect(result.current.tooltipEvent).toBeNull();

    // Tooltip appears after 150ms
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.tooltipEvent).toBe(mockEvent);
    expect(result.current.tooltipReference).toBe(el);
  });

  it("does not show tooltip before delay completes", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: false }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleMouseEnter(mockEvent, el);
    });

    // Only 100ms elapsed — not yet visible
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.tooltipEvent).toBeNull();
  });

  it("clears tooltip on mouse leave", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: false }),
    );
    const el = mockElement();

    // Hover → show tooltip
    act(() => {
      result.current.handleMouseEnter(mockEvent, el);
      vi.advanceTimersByTime(150);
    });
    expect(result.current.tooltipEvent).toBe(mockEvent);

    // Mouse leave → tooltip dismissed
    act(() => {
      result.current.handleMouseLeave();
    });
    expect(result.current.tooltipEvent).toBeNull();
    expect(result.current.tooltipReference).toBeNull();
  });

  it("cancels tooltip if mouse leaves before delay", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: false }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleMouseEnter(mockEvent, el);
    });

    // Leave before delay
    act(() => {
      result.current.handleMouseLeave();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.tooltipEvent).toBeNull();
  });

  it("opens popover on click", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: true }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleClick(mockEvent, el);
    });

    expect(result.current.popoverEvent).toBe(mockEvent);
    expect(result.current.popoverReference).toBe(el);
  });

  it("clears tooltip when popover opens", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: true }),
    );
    const el = mockElement();

    // Show tooltip
    act(() => {
      result.current.handleMouseEnter(mockEvent, el);
      vi.advanceTimersByTime(150);
    });
    expect(result.current.tooltipEvent).toBe(mockEvent);

    // Click → dismiss tooltip + show popover
    act(() => {
      result.current.handleClick(mockEvent, el);
    });
    expect(result.current.tooltipEvent).toBeNull();
    expect(result.current.popoverEvent).toBe(mockEvent);
  });

  it("toggles popover when clicking the same event", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: true }),
    );
    const el = mockElement();

    // First click → open popover
    act(() => {
      result.current.handleClick(mockEvent, el);
    });
    expect(result.current.popoverEvent).toBe(mockEvent);

    // Click same event again → close popover
    act(() => {
      result.current.handleClick(mockEvent, el);
    });
    expect(result.current.popoverEvent).toBeNull();
  });

  it("switches popover to different event on click", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: true }),
    );
    const el1 = mockElement();
    const el2 = mockElement();

    // Click event 1
    act(() => {
      result.current.handleClick(mockEvent, el1);
    });
    expect(result.current.popoverEvent).toBe(mockEvent);

    // Click event 2 → switch to event 2
    act(() => {
      result.current.handleClick(mockEvent2, el2);
    });
    expect(result.current.popoverEvent).toBe(mockEvent2);
    expect(result.current.popoverReference).toBe(el2);
  });

  it("does not show tooltip when hovering any event with open popover", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: true }),
    );
    const el1 = mockElement();
    const el2 = mockElement();

    // Open popover for event 1
    act(() => {
      result.current.handleClick(mockEvent, el1);
    });

    // Hover same event → tooltip should not appear
    act(() => {
      result.current.handleMouseEnter(mockEvent, el1);
      vi.advanceTimersByTime(200);
    });
    expect(result.current.tooltipEvent).toBeNull();

    // Hover different event → tooltip should still not appear (popover takes focus priority)
    act(() => {
      result.current.handleMouseEnter(mockEvent2, el2);
      vi.advanceTimersByTime(200);
    });
    expect(result.current.tooltipEvent).toBeNull();
  });

  it("closes popover via closePopover", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: true }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleClick(mockEvent, el);
    });
    expect(result.current.popoverEvent).toBe(mockEvent);

    act(() => {
      result.current.closePopover();
    });
    expect(result.current.popoverEvent).toBeNull();
    expect(result.current.popoverReference).toBeNull();
  });

  it("ignores hover when tooltipEnabled is false", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: false, popoverEnabled: false }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleMouseEnter(mockEvent, el);
      vi.advanceTimersByTime(200);
    });

    expect(result.current.tooltipEvent).toBeNull();
  });

  it("ignores click when popoverEnabled is false", () => {
    const { result } = renderHook(() =>
      useEventDetail({ tooltipEnabled: true, popoverEnabled: false }),
    );
    const el = mockElement();

    act(() => {
      result.current.handleClick(mockEvent, el);
    });

    expect(result.current.popoverEvent).toBeNull();
  });
});
