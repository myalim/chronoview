/**
 * useTimelineFilter — Resource and category filter state management.
 *
 * Manages filter state and computes filtered events/resources
 * using core filter functions with useMemo.
 */

import { useState, useMemo, useCallback } from "react";
import { filterResources, filterEvents } from "@chronoview/core";
import type { TimelineEvent, Resource, FilterState } from "@chronoview/core";

export interface UseTimelineFilterConfig {
  events: TimelineEvent[];
  resources: Resource[];
  initialFilter?: FilterState;
}

export interface UseTimelineFilterReturn {
  filteredEvents: TimelineEvent[];
  filteredResources: Resource[];
  filter: FilterState;
  setFilter: (filter: Partial<FilterState>) => void;
  toggleResource: (resourceId: string) => void;
  toggleCategory: (category: string) => void;
  selectAllResources: () => void;
  deselectAllResources: () => void;
}

export function useTimelineFilter({
  events,
  resources,
  initialFilter = {},
}: UseTimelineFilterConfig): UseTimelineFilterReturn {
  const [filter, setFilterState] = useState<FilterState>(initialFilter);

  const filteredResources = useMemo(() => filterResources(resources, filter), [resources, filter]);

  const visibleResourceIds = useMemo(() => filteredResources.map((r) => r.id), [filteredResources]);

  const filteredEvents = useMemo(
    () => filterEvents(events, filter, visibleResourceIds),
    [events, filter, visibleResourceIds],
  );

  const setFilter = useCallback((partial: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleResource = useCallback(
    (resourceId: string) => {
      setFilterState((prev) => {
        const current = prev.resourceIds;
        if (!current) {
          // No filter set — exclude this resource (select all others)
          const allIds = resources.map((r) => r.id);
          return { ...prev, resourceIds: allIds.filter((id) => id !== resourceId) };
        }
        const has = current.includes(resourceId);
        return {
          ...prev,
          resourceIds: has ? current.filter((id) => id !== resourceId) : [...current, resourceId],
        };
      });
    },
    [resources],
  );

  const toggleCategory = useCallback((category: string) => {
    setFilterState((prev) => {
      const current = prev.categories;
      if (!current) {
        return { ...prev, categories: [category] };
      }
      const has = current.includes(category);
      return {
        ...prev,
        categories: has ? current.filter((c) => c !== category) : [...current, category],
      };
    });
  }, []);

  const selectAllResources = useCallback(() => {
    setFilterState((prev) => ({ ...prev, resourceIds: undefined }));
  }, []);

  const deselectAllResources = useCallback(() => {
    setFilterState((prev) => ({ ...prev, resourceIds: [] }));
  }, []);

  return {
    filteredEvents,
    filteredResources,
    filter,
    setFilter,
    toggleResource,
    toggleCategory,
    selectAllResources,
    deselectAllResources,
  };
}
