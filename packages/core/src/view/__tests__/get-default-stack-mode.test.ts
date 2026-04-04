import { describe, expect, it } from "vitest";
import { getDefaultStackMode } from "../get-default-stack-mode.js";

describe("getDefaultStackMode", () => {
  it("schedule day → vertical", () => {
    expect(getDefaultStackMode("schedule", "day")).toBe("vertical");
  });

  it("schedule week → vertical", () => {
    expect(getDefaultStackMode("schedule", "week")).toBe("vertical");
  });

  it("schedule month → vertical", () => {
    expect(getDefaultStackMode("schedule", "month")).toBe("vertical");
  });

  it("calendar day → auto", () => {
    expect(getDefaultStackMode("calendar", "day")).toBe("auto");
  });

  it("calendar week → auto", () => {
    expect(getDefaultStackMode("calendar", "week")).toBe("auto");
  });

  it("calendar month (bar) → bar", () => {
    expect(getDefaultStackMode("calendar", "month", "bar")).toBe("bar");
  });

  it("calendar month (list) → list", () => {
    expect(getDefaultStackMode("calendar", "month", "list")).toBe("list");
  });

  it("calendar month defaults to bar when monthMode omitted", () => {
    expect(getDefaultStackMode("calendar", "month")).toBe("bar");
  });

  it("grid day → auto", () => {
    expect(getDefaultStackMode("grid", "day")).toBe("auto");
  });
});
