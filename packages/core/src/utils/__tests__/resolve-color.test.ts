import { describe, expect, it } from "vitest";
import { resolveColor } from "../resolve-color.js";

describe("resolveColor", () => {
  it("returns eventColor when provided", () => {
    expect(
      resolveColor({
        eventColor: "#ff0000",
        resourceColor: "#00ff00",
        defaultColor: "#0000ff",
      }),
    ).toBe("#ff0000");
  });

  it("returns resourceColor when eventColor is undefined", () => {
    expect(
      resolveColor({
        resourceColor: "#00ff00",
        defaultColor: "#0000ff",
      }),
    ).toBe("#00ff00");
  });

  it("returns defaultColor when both are undefined", () => {
    expect(
      resolveColor({
        defaultColor: "#0000ff",
      }),
    ).toBe("#0000ff");
  });

  it("treats empty string as falsy", () => {
    expect(
      resolveColor({
        eventColor: "",
        resourceColor: "#00ff00",
        defaultColor: "#0000ff",
      }),
    ).toBe("#00ff00");
  });

  it("treats empty resource color as falsy", () => {
    expect(
      resolveColor({
        eventColor: "",
        resourceColor: "",
        defaultColor: "#0000ff",
      }),
    ).toBe("#0000ff");
  });
});
