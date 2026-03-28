import { describe, expect, it } from "vitest";
import { goToDate, navigateNext, navigatePrev } from "../navigate.js";

describe("navigatePrev", () => {
  it("day: moves 1 day back", () => {
    const result = navigatePrev(new Date(2026, 2, 27), "day");
    expect(result).toEqual(new Date(2026, 2, 26, 0, 0, 0, 0));
  });

  it("week: moves 7 days back", () => {
    const result = navigatePrev(new Date(2026, 2, 27), "week");
    expect(result).toEqual(new Date(2026, 2, 20, 0, 0, 0, 0));
  });

  it("month: moves 1 month back", () => {
    const result = navigatePrev(new Date(2026, 2, 27), "month");
    expect(result).toEqual(new Date(2026, 1, 27, 0, 0, 0, 0));
  });

  it("month: handles month boundary (Jan → Dec)", () => {
    const result = navigatePrev(new Date(2026, 0, 15), "month");
    expect(result).toEqual(new Date(2025, 11, 15, 0, 0, 0, 0));
  });

  it("month: handles month-end overflow (Mar 31 → Feb 28)", () => {
    const result = navigatePrev(new Date(2026, 2, 31), "month");
    // date-fns subMonths handles this: 2026-02-28
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(28);
  });
});

describe("navigateNext", () => {
  it("day: moves 1 day forward", () => {
    const result = navigateNext(new Date(2026, 2, 27), "day");
    expect(result).toEqual(new Date(2026, 2, 28, 0, 0, 0, 0));
  });

  it("week: moves 7 days forward", () => {
    const result = navigateNext(new Date(2026, 2, 27), "week");
    expect(result).toEqual(new Date(2026, 3, 3, 0, 0, 0, 0));
  });

  it("month: moves 1 month forward", () => {
    const result = navigateNext(new Date(2026, 2, 27), "month");
    expect(result).toEqual(new Date(2026, 3, 27, 0, 0, 0, 0));
  });

  it("month: handles month boundary (Dec → Jan)", () => {
    const result = navigateNext(new Date(2025, 11, 15), "month");
    expect(result).toEqual(new Date(2026, 0, 15, 0, 0, 0, 0));
  });
});

describe("goToDate", () => {
  it("normalizes to start of day", () => {
    const result = goToDate(new Date(2026, 2, 27, 15, 30, 45));
    expect(result).toEqual(new Date(2026, 2, 27, 0, 0, 0, 0));
  });
});
