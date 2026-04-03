// @chronoview/ui entry point

// ─── Common Components ───
export { Button, type ButtonProps } from "./common/button.js";
export { DateNavigator, type DateNavigatorProps } from "./common/date-navigator.js";
export { ViewToggle, type ViewToggleProps } from "./common/view-toggle.js";
export { Toolbar, type ToolbarProps } from "./common/toolbar.js";
export {
  FilterChips,
  type FilterChipsProps,
  type FilterChipResource,
} from "./common/filter-chips.js";
export { CategoryTabs, type CategoryTabsProps } from "./common/category-tabs.js";

// ─── Schedule Components ───
export { ScheduleView, type ScheduleViewProps } from "./schedule/schedule-view.js";
export { ScheduleContainer, type ScheduleContainerProps } from "./schedule/schedule-container.js";
export { TimeHeader, type TimeHeaderProps } from "./schedule/time-header.js";
export { ResourceSidebar, type ResourceSidebarProps } from "./schedule/resource-sidebar.js";
export {
  EventCard,
  type EventCardProps as EventProps,
  type EventCardSize as EventSize,
} from "./schedule/event-card.js";
export { NowIndicator, type NowIndicatorProps } from "./schedule/now-indicator.js";
export { GridLines, type GridLinesProps } from "./schedule/grid-lines.js";

// ─── Schedule Connected Component ───
export { Schedule, type ScheduleProps } from "./schedule/schedule.js";

// ─── Calendar Components ───
export { CalendarDayHeader, type CalendarDayHeaderProps, type DayHeaderCell } from "./calendar/calendar-day-header.js";
export { CalendarView, type CalendarViewProps } from "./calendar/calendar-view.js";
export { CalendarContainer, type CalendarContainerProps } from "./calendar/calendar-container.js";
export { TimeSidebar, type TimeSidebarProps } from "./calendar/time-sidebar.js";
export { CalendarGridLines, type CalendarGridLinesProps } from "./calendar/calendar-grid-lines.js";
export {
  CalendarNowIndicator,
  type CalendarNowIndicatorProps,
} from "./calendar/calendar-now-indicator.js";
export {
  CalendarMonthGrid,
  type CalendarMonthGridProps,
  type MonthCellInfo,
} from "./calendar/calendar-month-grid.js";
