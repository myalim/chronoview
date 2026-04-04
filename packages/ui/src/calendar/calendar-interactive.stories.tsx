import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TimelineEvent, Resource } from "@chronoview/core";
import { Calendar } from "./calendar.js";

/**
 * Calendar Interactive — Connected component stories
 *
 * Demonstrates the fully integrated Calendar component with real hooks,
 * dynamic data, view switching, filters, custom rendering, and month modes.
 */

const BASE_DATE = new Date(2026, 2, 27);

const meta: Meta<typeof Calendar> = {
  title: "Calendar/Interactive",
  component: Calendar,
  args: {
    startDate: BASE_DATE,
  },
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["day", "week", "month"],
    },
    monthMode: {
      control: "inline-radio",
      options: ["bar", "list"],
    },
    stackMode: {
      control: "inline-radio",
      options: ["auto", "none"],
    },
    showToolbar: { control: "boolean" },
    showFilter: { control: "boolean" },
    showNowIndicator: { control: "boolean" },
    showEmptyLabel: { control: "boolean" },
    eventSize: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
    },
    weekStartsOn: {
      options: [0, 1],
      control: {
        type: "inline-radio",
        labels: { 0: "0 (일요일)", 1: "1 (월요일)" },
      },
    },
    // Internal props — hide from controls
    startDate: { table: { disable: true } },
    events: { table: { disable: true } },
    resources: { table: { disable: true } },
    onViewChange: { table: { disable: true } },
    onEventClick: { table: { disable: true } },
    onEventHover: { table: { disable: true } },
    eventProps: { table: { disable: true } },
    availableViews: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960, height: "85vh", margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Calendar>;

// ─── Shared Test Data ───

const RESOURCES: Resource[] = [
  { id: "r1", title: "Alice Johnson", color: "#3b82f6" },
  { id: "r2", title: "Bob Smith", color: "#8b5cf6" },
  { id: "r3", title: "Carol Lee", color: "#06b6d4" },
  { id: "r4", title: "David Kim", color: "#10b981" },
];

/** Generate events across day/week/month ranges with edge cases */
function generateEvents(baseDate: Date): TimelineEvent[] {
  const d = (dayOffset: number, hour: number, minute = 0) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  return [
    // ─── Day 0 (base date) events ───
    // 겹침 2개
    { id: "e1", resourceId: "r1", start: d(0, 9), end: d(0, 11), title: "Sprint Planning", color: "#3b82f6" },
    { id: "e2", resourceId: "r2", start: d(0, 10), end: d(0, 12), title: "Code Review", color: "#8b5cf6" },
    // 겹침 3개
    { id: "e3", resourceId: "r3", start: d(0, 14), end: d(0, 16), title: "Design Session", color: "#06b6d4" },
    { id: "e4", resourceId: "r1", start: d(0, 14, 30), end: d(0, 15, 30), title: "API Design", color: "#3b82f6" },
    { id: "e5", resourceId: "r4", start: d(0, 15), end: d(0, 16, 30), title: "1:1 Meeting", color: "#10b981" },
    // 짧은 이벤트 (5분, 15분)
    { id: "e6", resourceId: "r2", start: d(0, 8), end: d(0, 8, 5), title: "Quick Ping", color: "#8b5cf6" },
    { id: "e7", resourceId: "r3", start: d(0, 8, 30), end: d(0, 8, 45), title: "Bio Break", color: "#06b6d4" },
    // 단독 이벤트
    { id: "e8", resourceId: "r1", start: d(0, 17), end: d(0, 18), title: "Wrap Up", color: "#3b82f6" },
    // 인접 이벤트 (end===start, 겹치지 않아야 함)
    { id: "e9", resourceId: "r4", start: d(0, 12), end: d(0, 13), title: "Lunch", color: "#10b981" },
    { id: "e10", resourceId: "r4", start: d(0, 13), end: d(0, 14), title: "Coffee Chat", color: "#10b981" },

    // ─── Week events (other days) ───
    { id: "e11", resourceId: "r2", start: d(1, 10), end: d(1, 14), title: "Workshop", color: "#8b5cf6" },
    { id: "e12", resourceId: "r3", start: d(2, 9), end: d(2, 17), title: "Hackathon", color: "#06b6d4" },
    { id: "e13", resourceId: "r1", start: d(3, 13), end: d(3, 15), title: "Team Retro", color: "#3b82f6" },
    { id: "e14", resourceId: "r4", start: d(-1, 8), end: d(-1, 10), title: "Morning Sync", color: "#10b981" },
    { id: "e15", resourceId: "r2", start: d(-2, 11), end: d(-2, 12), title: "Demo", color: "#8b5cf6" },

    // ─── Month events (multi-day spanning) ───
    { id: "e16", resourceId: "r1", start: d(-25, 9), end: d(-20, 18), title: "Project Alpha", color: "#3b82f6" },
    { id: "e17", resourceId: "r2", start: d(-22, 10), end: d(-20, 17), title: "Sprint Release", color: "#8b5cf6" },
    { id: "e18", resourceId: "r3", start: d(-17, 9), end: d(-13, 18), title: "Marketing Campaign", color: "#06b6d4" },
    { id: "e19", resourceId: "r1", start: d(-14, 9), end: d(-10, 18), title: "Server Migration", color: "#10b981" },
    { id: "e20", resourceId: "r1", start: d(-7, 9), end: d(-2, 18), title: "Code Freeze", color: "#10b981" },
    { id: "e21", resourceId: "r3", start: d(-5, 9), end: d(-3, 18), title: "QA Sprint", color: "#06b6d4" },
    // 주 경계 걸침 이벤트
    { id: "e22", resourceId: "r4", start: d(3, 9), end: d(8, 18), title: "Planning Week", color: "#10b981" },
  ];
}

const EVENTS = generateEvents(BASE_DATE);

// ─── Stories ───

/** Default — Day view with toolbar, filter, view switching */
export const Default: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    showToolbar: true,
    showFilter: true,
    showNowIndicator: true,
    className: "h-full",
  },
};

/** Month — bar/list mode switchable via monthMode control */
export const Month: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "month",
    monthMode: "bar",
    showToolbar: true,
    showFilter: true,
    showEmptyLabel: true,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

/** Custom Rendering — eventProps + renderMonthCell */
export const CustomRendering: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    showToolbar: true,
    showFilter: true,
    eventSize: "lg",
    className: "h-full",
    eventProps: (event: TimelineEvent) => ({
      title: <strong>CUSTOM: {event.title}</strong>,
      subtitle: (
        <span style={{ fontStyle: "italic" }}>
          {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    }),
  },
};

/** Dark Mode — Day view with dark theme */
export const DarkMode: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    showToolbar: true,
    showFilter: true,
    darkMode: true,
  },
  argTypes: {
    darkMode: { control: "boolean", description: "Toggle dark mode" },
    view: { table: { disable: true } },
    monthMode: { table: { disable: true } },
    stackMode: { table: { disable: true } },
    showToolbar: { table: { disable: true } },
    showFilter: { table: { disable: true } },
    showNowIndicator: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => (
      <div
        className={context.args.darkMode ? "dark" : ""}
        style={{ maxWidth: 960, height: "85vh", margin: "0 auto" }}
      >
        <Story />
      </div>
    ),
  ],
};

/** WithTooltip — Hover an event card to see the built-in tooltip */
export const WithTooltip: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    showToolbar: true,
    className: "h-full",
  },
};

/** WithPopover — Click an event to see a custom detail popover */
export const WithPopover: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    showToolbar: true,
    className: "h-full",
    renderEventDetail: (event: TimelineEvent, { close }: { close: () => void }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "var(--cv-color-text-secondary)" }}>
          {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {" - "}
          {event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div style={{ fontSize: 12, color: "var(--cv-color-text-secondary)" }}>
          Resource: {event.resourceId}
        </div>
        <button
          type="button"
          onClick={close}
          style={{
            marginTop: 4,
            padding: "4px 12px",
            fontSize: 12,
            borderRadius: "var(--cv-radius-sm)",
            border: "1px solid var(--cv-color-border)",
            background: "var(--cv-color-surface-hover)",
            color: "var(--cv-color-text)",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    ),
  },
};

/** Controlled Date — external date/view state, layout switching demo */
export const ControlledDate: Story = {
  argTypes: {
    theme: {
      control: "inline-radio",
      options: ["light", "dark"],
    },
  },
  render: (args) => {
    const [date, setDate] = useState(BASE_DATE);
    const [view, setView] = useState<"day" | "week" | "month">("day");

    const formatRange = () => {
      const fmt = (d: Date) => d.toLocaleDateString();
      if (view === "week") {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${fmt(start)} – ${fmt(end)}`;
      }
      if (view === "month") {
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      }
      return fmt(date);
    };

    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = args.theme === "dark" || (args.theme == null && prefersDark);

    return (
      <div style={{
        color: isDark ? "#e5e7eb" : "#1f2937",
        background: isDark ? "#0f172a" : "#fff",
        maxWidth: 960,
        height: "85vh",
      }}>
        <p style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 8 }}>
          External state: <strong>{formatRange()}</strong> | view: <strong>{view}</strong>
        </p>
        <Calendar
          events={EVENTS}
          resources={RESOURCES}
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          theme={args.theme}
          showToolbar
          showFilter
        />
      </div>
    );
  },
};

/** Performance — 500+ events across a month */
export const Performance: Story = {
  render: () => {
    const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6b7280"];

    const resources: Resource[] = Array.from({ length: 10 }, (_, i) => ({
      id: `r-${i}`,
      title: `Resource ${i + 1}`,
      color: COLORS[i % COLORS.length],
    }));

    // Generate 500 events spread across a month
    const events: TimelineEvent[] = [];
    for (let i = 0; i < 500; i++) {
      const dayOffset = Math.floor(Math.random() * 30) - 15;
      const startHour = 7 + Math.floor(Math.random() * 10);
      const duration = 1 + Math.floor(Math.random() * 3);
      const start = new Date(BASE_DATE);
      start.setDate(start.getDate() + dayOffset);
      start.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + duration);

      events.push({
        id: `perf-${i}`,
        resourceId: `r-${i % 10}`,
        start,
        end,
        title: `Event ${i + 1}`,
        color: COLORS[i % COLORS.length],
      });
    }

    return (
      <div style={{ maxWidth: 960, height: "85vh", margin: "0 auto" }}>
        <Calendar
          events={events}
          resources={resources}
          startDate={BASE_DATE}
          view="day"
          showToolbar
          showFilter
        />
      </div>
    );
  },
};
