import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDateNavigation } from "../use-date-navigation.js";

describe("useDateNavigation", () => {
  const fixedDate = new Date(2026, 2, 28, 0, 0, 0, 0);

  it("returns initialDate when provided", () => {
    const { result } = renderHook(() => useDateNavigation({ initialDate: fixedDate, view: "day" }));

    expect(result.current.currentDate).toEqual(fixedDate);
  });

  it("defaults to now when initialDate is not provided", () => {
    const before = new Date();
    const { result } = renderHook(() => useDateNavigation({ view: "day" }));
    const after = new Date();

    // currentDate should be between before and after (inclusive)
    expect(result.current.currentDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.current.currentDate.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("goToPrev moves date backward by view unit (day: -1 day)", () => {
    const { result } = renderHook(() => useDateNavigation({ initialDate: fixedDate, view: "day" }));

    act(() => {
      result.current.goToPrev();
    });

    expect(result.current.currentDate).toEqual(new Date(2026, 2, 27, 0, 0, 0, 0));
  });

  it("goToPrev moves date backward by view unit (week: -7 days)", () => {
    const { result } = renderHook(() =>
      useDateNavigation({ initialDate: fixedDate, view: "week" }),
    );

    act(() => {
      result.current.goToPrev();
    });

    expect(result.current.currentDate).toEqual(new Date(2026, 2, 21, 0, 0, 0, 0));
  });

  it("goToNext moves date forward by view unit (day: +1 day)", () => {
    const { result } = renderHook(() => useDateNavigation({ initialDate: fixedDate, view: "day" }));

    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentDate).toEqual(new Date(2026, 2, 29, 0, 0, 0, 0));
  });

  it("goToNext moves date forward by view unit (week: +7 days)", () => {
    const { result } = renderHook(() =>
      useDateNavigation({ initialDate: fixedDate, view: "week" }),
    );

    act(() => {
      result.current.goToNext();
    });

    expect(result.current.currentDate).toEqual(new Date(2026, 3, 4, 0, 0, 0, 0));
  });

  it("goToDate sets a specific date (normalized to start of day)", () => {
    const { result } = renderHook(() => useDateNavigation({ initialDate: fixedDate, view: "day" }));

    const targetDate = new Date(2026, 5, 15, 14, 30, 0, 0);

    act(() => {
      result.current.goToDate(targetDate);
    });

    // goToDate normalizes via core goToDate (startOfDay)
    expect(result.current.currentDate).toEqual(new Date(2026, 5, 15, 0, 0, 0, 0));
  });

  it("goToToday sets current date (start of today)", () => {
    const pastDate = new Date(2020, 0, 1);
    const { result } = renderHook(() => useDateNavigation({ initialDate: pastDate, view: "day" }));

    const before = new Date();
    act(() => {
      result.current.goToToday();
    });
    const after = new Date();

    // Should be start of today
    const today = result.current.currentDate;
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
    expect(today.getDate()).toBeGreaterThanOrEqual(before.getDate());
    expect(today.getDate()).toBeLessThanOrEqual(after.getDate());
  });

  // ─── Controlled Mode ───

  describe("controlled mode (date + onDateChange)", () => {
    it("returns the controlled date instead of internal state", () => {
      const controlledDate = new Date(2026, 5, 1);
      const { result } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: vi.fn(), view: "day" }),
      );

      expect(result.current.currentDate).toBe(controlledDate);
    });

    it("ignores initialDate when date is provided", () => {
      const initial = new Date(2026, 0, 1);
      const controlled = new Date(2026, 6, 15);
      const { result } = renderHook(() =>
        useDateNavigation({ initialDate: initial, date: controlled, onDateChange: vi.fn(), view: "day" }),
      );

      expect(result.current.currentDate).toBe(controlled);
    });

    it("goToPrev calls onDateChange with the previous date", () => {
      const controlledDate = new Date(2026, 2, 28);
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: onChange, view: "day" }),
      );

      act(() => {
        result.current.goToPrev();
      });

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0]).toEqual(new Date(2026, 2, 27));
    });

    it("goToNext calls onDateChange with the next date", () => {
      const controlledDate = new Date(2026, 2, 28);
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: onChange, view: "week" }),
      );

      act(() => {
        result.current.goToNext();
      });

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0]).toEqual(new Date(2026, 3, 4));
    });

    it("goToDate calls onDateChange with the normalized date", () => {
      const controlledDate = new Date(2026, 2, 28);
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: onChange, view: "day" }),
      );

      act(() => {
        result.current.goToDate(new Date(2026, 5, 15, 14, 30));
      });

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0]).toEqual(new Date(2026, 5, 15, 0, 0, 0, 0));
    });

    it("goToToday calls onDateChange with start of today", () => {
      const controlledDate = new Date(2026, 2, 28);
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: onChange, view: "day" }),
      );

      const before = new Date();
      act(() => {
        result.current.goToToday();
      });
      const after = new Date();

      expect(onChange).toHaveBeenCalledOnce();
      const called = onChange.mock.calls[0][0] as Date;
      expect(called.getHours()).toBe(0);
      expect(called.getMinutes()).toBe(0);
      expect(called.getDate()).toBeGreaterThanOrEqual(before.getDate());
      expect(called.getDate()).toBeLessThanOrEqual(after.getDate());
    });

    it("does not update internal state in controlled mode", () => {
      const controlledDate = new Date(2026, 2, 28);
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: onChange, view: "day" }),
      );

      act(() => {
        result.current.goToNext();
      });

      // currentDate should still be the controlled value (consumer hasn't updated it)
      expect(result.current.currentDate).toBe(controlledDate);
    });

    it("reflects updated controlled date on re-render", () => {
      const onChange = vi.fn();
      let controlledDate = new Date(2026, 2, 28);

      const { result, rerender } = renderHook(() =>
        useDateNavigation({ date: controlledDate, onDateChange: onChange, view: "day" }),
      );

      expect(result.current.currentDate).toEqual(new Date(2026, 2, 28));

      // Simulate consumer updating state after onDateChange
      controlledDate = new Date(2026, 2, 29);
      rerender();

      expect(result.current.currentDate).toEqual(new Date(2026, 2, 29));
    });
  });
});
