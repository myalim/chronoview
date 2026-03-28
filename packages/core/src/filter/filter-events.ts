import type { FilterState, TimelineEvent } from "../types/index.js";

/**
 * Filters events by visible resource IDs and optional category filter.
 * Events must belong to a visible resource AND match the category filter (if set).
 */
export function filterEvents(
  events: TimelineEvent[],
  filter: FilterState,
  visibleResourceIds: string[],
): TimelineEvent[] {
  const resourceIdSet = new Set(visibleResourceIds);
  const { categories } = filter;

  const hasCategoryFilter = categories !== undefined && categories.length > 0;
  const categorySet = hasCategoryFilter ? new Set(categories) : null;

  return events.filter((event) => {
    // Only include events belonging to a visible resource
    if (!resourceIdSet.has(event.resourceId)) return false;

    // When category filter is active, event must have a matching category
    if (categorySet) {
      if (!event.category || !categorySet.has(event.category)) return false;
    }

    return true;
  });
}
