import { describe, expect, it } from "vitest";
import type { AxisConfig, Position } from "../../types/index.js";
import { toPhysicalPosition } from "../to-physical-position.js";

describe("toPhysicalPosition", () => {
  const position: Position = {
    mainOffset: 100,
    mainSize: 200,
    crossOffset: 50,
    crossSize: 80,
  };

  it("horizontal main axis: mainOffset→x, mainSize→width, crossOffset→y, crossSize→height", () => {
    const axis: AxisConfig = {
      mainAxis: "horizontal",
      crossAxis: "vertical",
    };

    expect(toPhysicalPosition(position, axis)).toEqual({
      x: 100,
      y: 50,
      width: 200,
      height: 80,
    });
  });

  it("vertical main axis: mainOffset→y, mainSize→height, crossOffset→x, crossSize→width", () => {
    const axis: AxisConfig = {
      mainAxis: "vertical",
      crossAxis: "horizontal",
    };

    expect(toPhysicalPosition(position, axis)).toEqual({
      x: 50,
      y: 100,
      width: 80,
      height: 200,
    });
  });

  it("handles zero values", () => {
    const zeroPos: Position = {
      mainOffset: 0,
      mainSize: 0,
      crossOffset: 0,
      crossSize: 0,
    };
    const axis: AxisConfig = {
      mainAxis: "horizontal",
      crossAxis: "vertical",
    };

    expect(toPhysicalPosition(zeroPos, axis)).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });
});
