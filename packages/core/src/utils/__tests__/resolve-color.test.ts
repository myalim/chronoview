import { describe, expect, it } from "vitest";
import { resolveColor, DEFAULT_EVENT_COLOR } from "../resolve-color.js";

describe("resolveColor", () => {
  it("returns eventColor when provided", () => {
    expect(
      resolveColor({
        eventColor: "#ff0000",
        resourceColor: "#00ff00",
      }),
    ).toBe("#ff0000");
  });

  it("returns resourceColor when eventColor is undefined", () => {
    expect(
      resolveColor({
        resourceColor: "#00ff00",
      }),
    ).toBe("#00ff00");
  });

  it("returns DEFAULT_EVENT_COLOR when both are undefined", () => {
    expect(resolveColor({})).toBe(DEFAULT_EVENT_COLOR);
  });

  it("treats empty string as falsy", () => {
    expect(
      resolveColor({
        eventColor: "",
        resourceColor: "#00ff00",
      }),
    ).toBe("#00ff00");
  });

  it("treats empty resource color as falsy", () => {
    expect(
      resolveColor({
        eventColor: "",
        resourceColor: "",
      }),
    ).toBe(DEFAULT_EVENT_COLOR);
  });
});
