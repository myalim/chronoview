// ─── Union Types ───

/** View mode for the timeline */
export type View = "day" | "week" | "month";

/** Layout determines axis mapping and visual structure */
export type Layout = "schedule" | "grid" | "calendar";

/** Stacking strategy for overlapping events */
export type StackMode = "horizontal" | "vertical" | "auto" | "none";

/** Calendar Month display mode */
export type MonthMode = "bar" | "list";

/** Day view cell duration presets (minutes) */
export type DayCellDuration = 15 | 30 | 60;

/** Week view cell duration presets (hours) */
export type WeekCellDuration = 3 | 4 | 6 | 8 | 12;

/**
 * Per-view cell duration configuration.
 * Each view has its own valid duration range.
 * Omitted values use defaults (day: 60, week: 6).
 */
export interface CellDurationConfig {
  /** Day view cell interval in minutes */
  day?: DayCellDuration;
  /** Week view cell interval in hours */
  week?: WeekCellDuration;
}

/** Axis direction for position mapping */
export type AxisDirection = "horizontal" | "vertical";

// ─── Input Types ───

/** Resource represents a row/column entity (channel, person, room, etc.) */
export interface Resource {
  id: string;
  title: string;
  /** Resource-level color (inherited by events without their own color) */
  color?: string;
  /** Icon/logo URL */
  icon?: string;
  /** Badge value (count, etc.) */
  badge?: string | number;
  /** Group identifier for filtering/grouping */
  group?: string;
  /** Child resources for tree structure (Phase 7) */
  children?: Resource[];
  /** Custom user data */
  data?: Record<string, unknown>;
}

/** Event placed on the timeline */
export interface TimelineEvent<TData = unknown> {
  id: string;
  /** Resource this event belongs to */
  resourceId: string;
  start: Date;
  end: Date;
  title: string;
  /** Event-level color override */
  color?: string;
  /** Category for filtering */
  category?: string;
  /** Generic custom data */
  data?: TData;
}

/** Main configuration for the timeline */
export interface TimelineConfig<TData = unknown> {
  events: TimelineEvent<TData>[];
  resources: Resource[];
  view: View;
  layout: Layout;
  /** Per-view cell duration (day: minutes, week: hours). Omitted = defaults. */
  cellDuration?: CellDurationConfig;
  /** Stacking strategy (defaults based on layout × view) */
  stackMode?: StackMode;
  /** Calendar Month display mode (default: "bar") */
  monthMode?: MonthMode;
  startDate?: Date;
  showNowIndicator?: boolean;
  stickyHeader?: boolean;
  darkMode?: boolean;
  /** Show empty label in Calendar Month cells (default: false) */
  showEmptyLabel?: boolean;
  /** Grid Day date picker visible days (default: 7, max: 14) */
  datePickerDays?: number;
  /** Available views for ViewToggle (defaults per layout) */
  availableViews?: View[];
  /** Week start day: 0 = Sunday (default), 1 = Monday */
  weekStartsOn?: 0 | 1;
  /** Event card height in px (default: 36). Used for row height calculation. */
  eventHeight?: number;
}

// ─── Axis Abstraction ───

/** Axis configuration for a layout */
export interface AxisConfig {
  /** Time axis (main axis) direction */
  mainAxis: AxisDirection;
  /** Resource/day axis (cross axis) direction */
  crossAxis: AxisDirection;
}

/** Abstract position in axis-agnostic coordinates */
export interface Position {
  /** Offset along the main (time) axis in px */
  mainOffset: number;
  /** Size along the main (time) axis in px */
  mainSize: number;
  /** Offset along the cross (resource/day) axis in px */
  crossOffset: number;
  /** Size along the cross (resource/day) axis in px */
  crossSize: number;
}

/** Physical screen coordinates converted from abstract Position */
export interface PhysicalPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Time ───

/** A single time slot in the grid */
export interface TimeSlot {
  start: Date;
  end: Date;
  /** Display label (e.g., "09:00", "10:00") */
  label: string;
}

/** Date range with start and end */
export interface DateRange {
  start: Date;
  end: Date;
}

// ─── Filter ───

/** Filter state for resources and events */
export interface FilterState {
  /** Resource IDs to show (undefined = all) */
  resourceIds?: string[];
  /** Resource groups to show */
  resourceGroups?: string[];
  /** Event categories to show (undefined = all) */
  categories?: string[];
}

// ─── Event Layout ───

/** Group of overlapping events within the same resource/column */
export interface OverlapGroup {
  events: TimelineEvent[];
}

/** Event with assigned stacking lane */
export interface StackedEvent {
  event: TimelineEvent;
  /** Assigned lane index (0-based) */
  lane: number;
  /** Total number of lanes in this overlap group */
  totalLanes: number;
  /** Number of columns this event spans (auto mode, default: 1) */
  spanColumns?: number;
}

/** Fully computed event layout with abstract position */
export interface EventLayout {
  event: TimelineEvent;
  /** Axis-agnostic position */
  position: Position;
  /** Stacking lane index (0-based) */
  lane: number;
  /** Total lanes in the overlap group */
  totalLanes: number;
  /** Resolved color (from resolveColor) */
  color: string;
  /** Number of columns this event spans (auto mode, default: 1) */
  spanColumns?: number;
}

// ─── Row / Column Layout ───

/** Resource-based row layout (Schedule) or column layout (Grid) */
export interface RowLayout {
  resource: Resource;
  events: EventLayout[];
  /** Computed row height in px (variable based on stack count) */
  height: number;
  /** Cross-axis start offset in px */
  crossOffset: number;
  /** Cross-axis size in px */
  crossSize: number;
}

/** Day/date-based column layout (Calendar Day/Week) */
export interface DayColumnLayout {
  date: Date;
  /** Day of week: 0 (Sun) ~ 6 (Sat) */
  dayOfWeek: number;
  isToday: boolean;
  events: EventLayout[];
}

/** Calendar Month cell layout */
export interface MonthCellLayout {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  /** Events on this date */
  events: TimelineEvent[];
  /** Number of events visible in the cell */
  visibleCount: number;
  /** Number of hidden events ("N more") */
  hiddenCount: number;
}

/** Calendar Month bar layout (bar mode) */
export interface MonthBarLayout {
  event: TimelineEvent;
  /** Start column index (0-6) */
  startColumn: number;
  /** End column index (0-6) */
  endColumn: number;
  /** Stack row index (0-based) */
  row: number;
  /** Resolved color */
  color: string;
}

// ─── Layout Results ───

/** Schedule view layout output */
export interface ScheduleLayoutResult {
  rows: RowLayout[];
  timeSlots: TimeSlot[];
  /** Total time axis size in px */
  totalMainSize: number;
  /** Total resource axis size in px */
  totalCrossSize: number;
  nowPosition: number | null;
}

/** Calendar Day/Week view layout output */
export interface CalendarLayoutResult {
  columns: DayColumnLayout[];
  timeSlots: TimeSlot[];
  totalMainSize: number;
  totalCrossSize: number;
  nowPosition: number | null;
}

/** Calendar Month view layout output */
export interface CalendarMonthLayoutResult {
  /** Week × day 2D array */
  weeks: MonthCellLayout[][];
  /** Bar layouts (bar mode only) */
  bars?: MonthBarLayout[];
  todayDate: Date | null;
}

/** Grid Day view layout output */
export interface GridLayoutResult {
  /** Resource columns (reuses RowLayout with flipped axis) */
  columns: RowLayout[];
  timeSlots: TimeSlot[];
  totalMainSize: number;
  totalCrossSize: number;
  nowPosition: number | null;
}

// ─── Virtual Scroll ───

/** Visible range for virtual scrolling */
export interface VisibleRange {
  startIndex: number;
  endIndex: number;
  /** Number of extra items rendered outside viewport */
  overscan: number;
}

// ─── Helper Types ───

/** Result of truncateEvents() */
export interface TruncateResult {
  visible: TimelineEvent[];
  hiddenCount: number;
}

/** Result of calculateBarSpan() */
export interface BarSpanInfo {
  /** Start column index (0-6) */
  startColumn: number;
  /** End column index (0-6) */
  endColumn: number;
  /** Number of days the event spans within the week */
  spanDays: number;
}
