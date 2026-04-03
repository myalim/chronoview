// @chronoview/react entry point

// ─── Hooks ───
export {
  useDateNavigation,
  type UseDateNavigationConfig,
  type UseDateNavigationReturn,
} from "./hooks/use-date-navigation.js";
export {
  useTimelineFilter,
  type UseTimelineFilterConfig,
  type UseTimelineFilterReturn,
} from "./hooks/use-timeline-filter.js";
export {
  useNowIndicator,
  type UseNowIndicatorConfig,
  type UseNowIndicatorReturn,
} from "./hooks/use-now-indicator.js";
export {
  useVirtualScroll,
  type UseVirtualScrollConfig,
  type UseVirtualScrollReturn,
} from "./hooks/use-virtual-scroll.js";
export { useScheduleView, type UseScheduleViewReturn } from "./hooks/use-schedule-view.js";
export { useCalendarView, type UseCalendarViewReturn } from "./hooks/use-calendar-view.js";
export {
  useScrollToNow,
  type UseScrollToNowConfig,
  type UseScrollToNowReturn,
} from "./hooks/use-scroll-to-now.js";

// ─── Context ───
export {
  TimelineProvider,
  useTimelineContext,
  type TimelineProviderProps,
  type TimelineContextValue,
} from "./context/timeline-provider.js";
