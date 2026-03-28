import { describe, expect, it } from "vitest";
import { getDefaultAvailableViews } from "../get-default-available-views.js";

describe("getDefaultAvailableViews", () => {
  it("schedule: returns all 3 views", () => {
    expect(getDefaultAvailableViews("schedule")).toEqual(["day", "week", "month"]);
  });

  it("calendar: returns all 3 views", () => {
    expect(getDefaultAvailableViews("calendar")).toEqual(["day", "week", "month"]);
  });

  it("grid: returns only day", () => {
    expect(getDefaultAvailableViews("grid")).toEqual(["day"]);
  });
});
