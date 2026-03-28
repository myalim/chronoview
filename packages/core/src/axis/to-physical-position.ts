import type { AxisConfig, PhysicalPosition, Position } from "../types/index.js";

/**
 * Converts an abstract axis-agnostic Position to physical screen coordinates.
 *
 * - horizontal main axis: mainOffset → x, mainSize → width
 * - vertical main axis: mainOffset → y, mainSize → height
 */
export function toPhysicalPosition(position: Position, axis: AxisConfig): PhysicalPosition {
  if (axis.mainAxis === "horizontal") {
    return {
      x: position.mainOffset,
      y: position.crossOffset,
      width: position.mainSize,
      height: position.crossSize,
    };
  }
  // mainAxis === "vertical"
  return {
    x: position.crossOffset,
    y: position.mainOffset,
    width: position.crossSize,
    height: position.mainSize,
  };
}
