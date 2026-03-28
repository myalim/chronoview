import type { FilterState, Resource } from "../types/index.js";

/**
 * Filters resources based on resourceIds and/or resourceGroups.
 * When both are provided, returns the union (resources matching either condition).
 * Returns all resources when neither filter is set.
 */
export function filterResources(resources: Resource[], filter: FilterState): Resource[] {
  const { resourceIds, resourceGroups } = filter;

  const hasIdFilter = resourceIds !== undefined && resourceIds.length > 0;
  const hasGroupFilter = resourceGroups !== undefined && resourceGroups.length > 0;

  if (!hasIdFilter && !hasGroupFilter) {
    return resources;
  }

  const idSet = hasIdFilter ? new Set(resourceIds) : null;
  const groupSet = hasGroupFilter ? new Set(resourceGroups) : null;

  return resources.filter((resource) => {
    if (idSet?.has(resource.id)) return true;
    if (groupSet && resource.group && groupSet.has(resource.group)) return true;
    return false;
  });
}
