import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TimelineEvent, Resource } from "@chronoview/core";
import { Schedule } from "./schedule.js";

/**
 * Schedule Interactive — Connected component stories
 *
 * Demonstrates the fully integrated Schedule component with real hooks,
 * dynamic data, view switching, filters, and custom rendering.
 */

const BASE_DATE = new Date(2026, 2, 27);

const meta: Meta<typeof Schedule> = {
  title: "Schedule/Interactive",
  component: Schedule,
  args: {
    startDate: BASE_DATE,
  },
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["day", "week", "month"],
      description: "Current view mode",
    },
    cellDuration: {
      control: "object",
      table: {
        type: { summary: "{ day?: 15|30|60, week?: 3|4|6|8|12 }" },
        defaultValue: { summary: "{ day: 60, week: 6 }" },
      },
    },
    showToolbar: { control: "boolean" },
    showFilter: { control: "boolean" },
    showNowIndicator: { control: "boolean" },
    eventSize: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
      description: "Event card size preset",
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
    onDateChange: { table: { disable: true } },
    onEventClick: { table: { disable: true } },
    onEventHover: { table: { disable: true } },
    eventProps: { table: { disable: true } },
    renderResource: { table: { disable: true } },
    renderTimeHeader: { table: { disable: true } },
    availableViews: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1100 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Schedule>;

// ─── Shared Test Data ───

const RESOURCES: Resource[] = [
  { id: "r1", title: "Alice Johnson", color: "#3b82f6" },
  { id: "r2", title: "Bob Smith", color: "#8b5cf6" },
  { id: "r3", title: "Carol Lee", color: "#06b6d4" },
  { id: "r4", title: "David Kim", color: "#10b981" },
];

/** Generate events around the base date */
function generateEvents(baseDate: Date): TimelineEvent[] {
  const d = (dayOffset: number, hour: number, minute = 0) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  return [
    {
      id: "e1",
      resourceId: "r1",
      start: d(0, 9),
      end: d(0, 11),
      title: "Sprint Planning",
      color: "#3b82f6",
    },
    {
      id: "e2",
      resourceId: "r1",
      start: d(0, 13),
      end: d(0, 15),
      title: "Design Review",
      color: "#3b82f6",
    },
    {
      id: "e3",
      resourceId: "r1",
      start: d(0, 10, 30),
      end: d(0, 12),
      title: "1:1 Meeting",
      color: "#60a5fa",
    },
    {
      id: "e4",
      resourceId: "r2",
      start: d(0, 8),
      end: d(0, 10),
      title: "Morning Standup",
      color: "#8b5cf6",
    },
    {
      id: "e5",
      resourceId: "r2",
      start: d(0, 9),
      end: d(0, 11, 30),
      title: "Code Review",
      color: "#a78bfa",
    },
    {
      id: "e6",
      resourceId: "r2",
      start: d(0, 14),
      end: d(0, 16),
      title: "Deploy",
      color: "#8b5cf6",
    },
    {
      id: "e7",
      resourceId: "r3",
      start: d(0, 11),
      end: d(0, 12, 30),
      title: "Lunch Talk",
      color: "#06b6d4",
    },
    {
      id: "e8",
      resourceId: "r1",
      start: d(1, 10),
      end: d(1, 14),
      title: "Workshop",
      color: "#3b82f6",
    },
    {
      id: "e9",
      resourceId: "r2",
      start: d(2, 9),
      end: d(2, 17),
      title: "Hackathon",
      color: "#8b5cf6",
    },
    {
      id: "e10",
      resourceId: "r3",
      start: d(3, 13),
      end: d(3, 15),
      title: "Team Retro",
      color: "#06b6d4",
    },
    {
      id: "e11",
      resourceId: "r1",
      start: d(-1, 8),
      end: d(-1, 10),
      title: "Planning",
      color: "#3b82f6",
    },
    {
      id: "e12",
      resourceId: "r4",
      start: d(-2, 10),
      end: d(-2, 12),
      title: "Demo Day",
      color: "#10b981",
    },
    {
      id: "e13",
      resourceId: "r1",
      start: d(7, 9),
      end: d(7, 17),
      title: "Conference",
      color: "#3b82f6",
    },
    {
      id: "e14",
      resourceId: "r2",
      start: d(10, 10),
      end: d(10, 16),
      title: "Training",
      color: "#8b5cf6",
    },
    {
      id: "e15",
      resourceId: "r3",
      start: d(14, 9),
      end: d(14, 12),
      title: "Review",
      color: "#06b6d4",
    },
  ];
}

const EVENTS = generateEvents(BASE_DATE);

// ─── Stories ───

/** Default — Day view with toolbar and filter */
export const Default: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    cellDuration: { day: 60, week: 6 },
    showToolbar: true,
    showFilter: true,
    showNowIndicator: true,
  },
};

/** Custom Rendering — eventProps + renderResource */
export const CustomRendering: Story = {
  args: {
    events: EVENTS,
    resources: RESOURCES,
    view: "day",
    cellDuration: { day: 60 },

    eventSize: "lg",

    eventProps: (event: TimelineEvent) => ({
      title: <strong>{event.title}</strong>,
      subtitle: <span style={{ fontStyle: "italic" }}>Custom subtitle</span>,
    }),

    renderResource: (resource: Resource) => (
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: "100%",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: resource.color || "#999",
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 13 }}>{resource.title}</span>
      </div>
    ),
  },
};

/** Dark Mode — toggle via controls panel */
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
    // DarkMode 스토리에서는 darkMode만 노출
    view: { table: { disable: true } },
    cellDuration: { table: { disable: true } },
    showToolbar: { table: { disable: true } },
    showFilter: { table: { disable: true } },
    showNowIndicator: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => (
      <div className={context.args.darkMode ? "dark" : ""} style={{ maxWidth: 1100 }}>
        <Story />
      </div>
    ),
  ],
};

/** Performance — 100 resources x 10,000 events */
export const Performance: Story = {
  render: () => {
    const COLORS = [
      "#3b82f6",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
      "#6b7280",
    ];

    const resources: Resource[] = Array.from({ length: 100 }, (_, i) => ({
      id: `r-${i}`,
      title: `Resource ${i + 1}`,
      color: COLORS[i % COLORS.length],
    }));

    const events: TimelineEvent[] = [];
    for (let r = 0; r < 100; r++) {
      for (let e = 0; e < 100; e++) {
        const startHour = Math.floor(Math.random() * 20);
        const duration = 1 + Math.floor(Math.random() * 3);
        const start = new Date(BASE_DATE);
        start.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + duration);

        events.push({
          id: `e-${r}-${e}`,
          resourceId: `r-${r}`,
          start,
          end,
          title: `Event ${e + 1}`,
          color: COLORS[(r + e) % COLORS.length],
        });
      }
    }

    return <Schedule events={events} resources={resources} view="day" startDate={BASE_DATE} />;
  },
};
