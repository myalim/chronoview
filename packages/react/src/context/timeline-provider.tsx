/**
 * TimelineProvider — Shared context for timeline state.
 *
 * Composes useDateNavigation + useTimelineFilter + view state
 * into a single context for multi-component composition.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TimelineConfig, TimelineEvent, Resource, FilterState, View } from "@chronoview/core";
import { useDateNavigation } from "../hooks/use-date-navigation.js";
import { useTimelineFilter } from "../hooks/use-timeline-filter.js";

export interface TimelineContextValue {
  config: TimelineConfig;
  currentDate: Date;
  view: View;
  setView: (view: View) => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToDate: (date: Date) => void;
  goToToday: () => void;
  filter: FilterState;
  filteredEvents: TimelineEvent[];
  filteredResources: Resource[];
  setFilter: (filter: Partial<FilterState>) => void;
  toggleResource: (resourceId: string) => void;
  toggleCategory: (category: string) => void;
  selectAllResources: () => void;
  deselectAllResources: () => void;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

export interface TimelineProviderProps {
  config: TimelineConfig;
  children: ReactNode;
}

export function TimelineProvider({ config, children }: TimelineProviderProps) {
  const [view, setViewState] = useState<View>(config.view);

  const { currentDate, goToPrev, goToNext, goToDate, goToToday } = useDateNavigation({
    initialDate: config.startDate,
    view,
  });

  const {
    filteredEvents,
    filteredResources,
    filter,
    setFilter,
    toggleResource,
    toggleCategory,
    selectAllResources,
    deselectAllResources,
  } = useTimelineFilter({
    events: config.events,
    resources: config.resources,
  });

  const setView = useCallback((v: View) => {
    setViewState(v);
  }, []);

  const value: TimelineContextValue = {
    config,
    currentDate,
    view,
    setView,
    goToPrev,
    goToNext,
    goToDate,
    goToToday,
    filter,
    filteredEvents,
    filteredResources,
    setFilter,
    toggleResource,
    toggleCategory,
    selectAllResources,
    deselectAllResources,
  };

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimelineContext(): TimelineContextValue {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimelineContext must be used within a TimelineProvider");
  }
  return context;
}
