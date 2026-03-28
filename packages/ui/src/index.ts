// @chronoview/ui entry point

// ─── Common Components ───
export { Button, type ButtonProps } from "./common/button.js";
export { DateNavigator, type DateNavigatorProps } from "./common/date-navigator.js";
export { ViewToggle, type ViewToggleProps } from "./common/view-toggle.js";
export { Toolbar, type ToolbarProps } from "./common/toolbar.js";
export { FilterChips, type FilterChipsProps, type FilterChipResource } from "./common/filter-chips.js";
export { CategoryTabs, type CategoryTabsProps } from "./common/category-tabs.js";

// ─── Schedule Components ───
export { ScheduleView, type ScheduleViewProps } from "./schedule/schedule-view.js";
export { ScheduleContainer, type ScheduleContainerProps } from "./schedule/schedule-container.js";
export { TimeHeader, type TimeHeaderProps, type TimeSlotLabel, type DateLabel } from "./schedule/time-header.js";
export { ResourceSidebar, type ResourceSidebarProps, type SidebarResource } from "./schedule/resource-sidebar.js";
export { EventCard, type EventCardProps } from "./schedule/event-card.js";
export { NowIndicator, type NowIndicatorProps } from "./schedule/now-indicator.js";
export { GridLines, type GridLinesProps, type GridLineConfig } from "./schedule/grid-lines.js";
