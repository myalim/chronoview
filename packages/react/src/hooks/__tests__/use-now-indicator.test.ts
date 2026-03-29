import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNowIndicator } from "../use-now-indicator.js";

describe("useNowIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns position within range", () => {
    // Set fake "now" to the midpoint of the range
    const rangeStart = new Date(2026, 2, 28, 0, 0);
    const rangeEnd = new Date(2026, 2, 28, 24, 0);
    const midpoint = new Date(2026, 2, 28, 12, 0);

    vi.setSystemTime(midpoint);

    const { result } = renderHook(() =>
      useNowIndicator({
        rangeStart,
        rangeEnd,
        totalSize: 1440, // 1px per minute
      }),
    );

    // Midpoint of 24h range = 50% of 1440 = 720
    expect(result.current.position).toBe(720);
    expect(result.current.now).toEqual(midpoint);
  });

  it("returns null when now is outside range (before start)", () => {
    const rangeStart = new Date(2026, 2, 28, 9, 0);
    const rangeEnd = new Date(2026, 2, 28, 18, 0);

    // Set now to before the range
    vi.setSystemTime(new Date(2026, 2, 28, 7, 0));

    const { result } = renderHook(() =>
      useNowIndicator({
        rangeStart,
        rangeEnd,
        totalSize: 1000,
      }),
    );

    expect(result.current.position).toBeNull();
  });

  it("returns null when now is outside range (after end)", () => {
    const rangeStart = new Date(2026, 2, 28, 9, 0);
    const rangeEnd = new Date(2026, 2, 28, 18, 0);

    vi.setSystemTime(new Date(2026, 2, 28, 20, 0));

    const { result } = renderHook(() =>
      useNowIndicator({
        rangeStart,
        rangeEnd,
        totalSize: 1000,
      }),
    );

    expect(result.current.position).toBeNull();
  });

  it("returns null when disabled", () => {
    const rangeStart = new Date(2026, 2, 28, 0, 0);
    const rangeEnd = new Date(2026, 2, 28, 24, 0);

    vi.setSystemTime(new Date(2026, 2, 28, 12, 0));

    const { result } = renderHook(() =>
      useNowIndicator({
        rangeStart,
        rangeEnd,
        totalSize: 1440,
        enabled: false,
      }),
    );

    expect(result.current.position).toBeNull();
  });

  it("updates position at interval", () => {
    const rangeStart = new Date(2026, 2, 28, 0, 0);
    const rangeEnd = new Date(2026, 2, 28, 24, 0);

    // Start at 12:00
    vi.setSystemTime(new Date(2026, 2, 28, 12, 0));

    const { result } = renderHook(() =>
      useNowIndicator({
        rangeStart,
        rangeEnd,
        totalSize: 1440,
        interval: 60_000, // 1 minute
      }),
    );

    expect(result.current.position).toBe(720);

    // Advance system time and trigger interval callback
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    // After 1 minute, position should change from the initial value
    // The exact value depends on when new Date() is captured inside setInterval
    expect(result.current.position).not.toBe(720);
  });

  it("does not start timer when disabled", () => {
    const rangeStart = new Date(2026, 2, 28, 0, 0);
    const rangeEnd = new Date(2026, 2, 28, 24, 0);

    vi.setSystemTime(new Date(2026, 2, 28, 12, 0));

    renderHook(() =>
      useNowIndicator({
        rangeStart,
        rangeEnd,
        totalSize: 1440,
        enabled: false,
        interval: 60_000,
      }),
    );

    // Verify no interval was scheduled by checking timer count
    expect(vi.getTimerCount()).toBe(0);
  });
});
