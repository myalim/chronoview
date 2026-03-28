import { describe, expect, it } from "vitest";
import { getAxisConfig } from "../get-axis-config.js";

describe("getAxisConfig", () => {
  it("schedule: mainAxis=horizontal, crossAxis=vertical", () => {
    const config = getAxisConfig("schedule");
    expect(config).toEqual({
      mainAxis: "horizontal",
      crossAxis: "vertical",
    });
  });

  it("grid: mainAxis=vertical, crossAxis=horizontal", () => {
    const config = getAxisConfig("grid");
    expect(config).toEqual({
      mainAxis: "vertical",
      crossAxis: "horizontal",
    });
  });

  it("calendar: mainAxis=vertical, crossAxis=horizontal", () => {
    const config = getAxisConfig("calendar");
    expect(config).toEqual({
      mainAxis: "vertical",
      crossAxis: "horizontal",
    });
  });
});
