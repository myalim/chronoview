// @chronoview/core entry point

// ─── Types ───
export type {
  AxisConfig,
  AxisDirection,
  BarSpanInfo,
  CalendarLayoutResult,
  CalendarMonthLayoutResult,
  DateRange,
  DayColumnLayout,
  EventLayout,
  FilterState,
  GridLayoutResult,
  Layout,
  MonthBarLayout,
  MonthCellLayout,
  MonthMode,
  OverlapGroup,
  PhysicalPosition,
  Position,
  Resource,
  RowLayout,
  ScheduleLayoutResult,
  StackMode,
  StackedEvent,
  TimeSlot,
  TimelineConfig,
  TimelineEvent,
  TruncateResult,
  View,
  VisibleRange,
} from "./types/index.js";

// ─── Axis ───
export { getAxisConfig } from "./axis/get-axis-config.js";
export { toPhysicalPosition } from "./axis/to-physical-position.js";

// ─── Time ───
export { calculateDayRange } from "./time/calculate-day-range.js";
export { calculateWeekRange } from "./time/calculate-week-range.js";
export { calculateMonthRange } from "./time/calculate-month-range.js";
export { calculateMonthGrid } from "./time/calculate-month-grid.js";
export { generateTimeSlots } from "./time/generate-time-slots.js";
export { navigatePrev, navigateNext, goToDate } from "./time/navigate.js";

// ─── Position ───
export { timeToOffset } from "./position/time-to-offset.js";
export { calculateNowPosition } from "./position/calculate-now-position.js";
export { calculateScrollToNow } from "./position/calculate-scroll-to-now.js";

// ─── View ───
export { getDefaultAvailableViews } from "./view/get-default-available-views.js";
export { getDefaultStackMode } from "./view/get-default-stack-mode.js";

// ─── Layout ───
export { calculateEventPosition } from "./layout/calculate-event-position.js";
export { detectOverlaps } from "./layout/detect-overlaps.js";
export { calculateBarSpan } from "./layout/calculate-bar-span.js";
export { truncateEvents } from "./layout/truncate-events.js";

// ─── Stacking ───
export { calculateVerticalStacks } from "./stacking/calculate-vertical-stacks.js";
export { calculateHorizontalStacks } from "./stacking/calculate-horizontal-stacks.js";
export { calculateBarStacks } from "./stacking/calculate-bar-stacks.js";

// ─── Utils ───
export { resolveColor } from "./utils/resolve-color.js";
export { calculateRowHeight } from "./utils/calculate-row-height.js";
export { calculateVisibleRange } from "./utils/calculate-visible-range.js";

// ─── Filter ───
export { filterResources } from "./filter/filter-resources.js";
export { filterEvents } from "./filter/filter-events.js";
