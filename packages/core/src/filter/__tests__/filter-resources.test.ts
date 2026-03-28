import { describe, expect, it } from "vitest";
import type { Resource } from "../../types/index.js";
import { filterResources } from "../filter-resources.js";

const resources: Resource[] = [
  { id: "r1", title: "Resource 1", group: "A" },
  { id: "r2", title: "Resource 2", group: "A" },
  { id: "r3", title: "Resource 3", group: "B" },
  { id: "r4", title: "Resource 4" },
];

describe("filterResources", () => {
  it("returns all resources when filter is empty", () => {
    expect(filterResources(resources, {})).toEqual(resources);
  });

  it("filters by resourceIds", () => {
    const result = filterResources(resources, { resourceIds: ["r1", "r3"] });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("filters by resourceGroups", () => {
    const result = filterResources(resources, { resourceGroups: ["A"] });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("combines resourceIds and resourceGroups (union)", () => {
    const result = filterResources(resources, {
      resourceIds: ["r4"],
      resourceGroups: ["B"],
    });
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["r3", "r4"]);
  });

  it("returns empty array when no resources match", () => {
    const result = filterResources(resources, { resourceIds: ["nonexistent"] });
    expect(result).toHaveLength(0);
  });

  it("returns all when both filters are undefined", () => {
    const result = filterResources(resources, {
      resourceIds: undefined,
      resourceGroups: undefined,
    });
    expect(result).toEqual(resources);
  });
});
