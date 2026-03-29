import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventCard } from "./event-card.js";

/**
 * EventCard — Standalone stories
 *
 * Demonstrates: size presets, hover effect, ReactNode title/subtitle,
 * children override, variant differences.
 */

const meta: Meta<typeof EventCard> = {
  title: "Schedule/EventCard",
  component: EventCard,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 400, width: 600, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EventCard>;

const BASE_STYLE = { left: 16, top: 16, width: 240 };
const COLOR = "#3b82f6";

// ─── Size Presets ───

/** All 4 size presets side by side */
export const Sizes: Story = {
  render: () => (
    <div style={{ position: "relative", height: 300, width: 600 }}>
      {(["xs", "sm", "md", "lg"] as const).map((size, i) => (
        <EventCard
          key={size}
          title={`Size: ${size}`}
          subtitle={size !== "xs" ? "09:00 - 10:30" : undefined}
          color={COLOR}
          size={size}
          style={{ left: 16, top: 16 + i * 60, width: 200 }}
        />
      ))}
    </div>
  ),
};

// ─── Hover Effect ───

/** Hover over the card to see shadow + brightness transition */
export const HoverEffect: Story = {
  args: {
    title: "Hover over me",
    subtitle: "09:00 - 10:30",
    color: COLOR,
    style: BASE_STYLE,
    onClick: () => {},
  },
};

// ─── ReactNode Title & Subtitle ───

/** Title and subtitle as ReactNode with rich content */
export const ReactNodeContent: Story = {
  args: {
    title: (
      <span>
        <span style={{ color: "#ef4444", marginRight: 4 }}>●</span>
        High Priority Meeting
      </span>
    ),
    subtitle: (
      <span style={{ fontStyle: "italic" }}>Room 302 · 09:00 - 10:30</span>
    ),
    color: "#ef4444",
    style: BASE_STYLE,
    size: "lg",
  },
};

// ─── Month Variant ───

/** Compact month bar variant */
export const MonthVariant: Story = {
  args: {
    title: "Conference",
    color: "#8b5cf6",
    variant: "month",
    style: { left: 16, top: 16, width: 180 },
  },
};

// ─── Children Override ───

/** Custom children replacing the default card body */
export const WithChildren: Story = {
  args: {
    title: "Ignored when children provided",
    color: "#10b981",
    style: BASE_STYLE,
    size: "lg",
    children: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px",
          background: "rgba(16, 185, 129, 0.1)",
          width: "100%",
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 18 }}>📋</span>
        <div>
          <div style={{ fontWeight: 600 }}>Custom Layout</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Fully custom content</div>
        </div>
      </div>
    ),
  },
};

// ─── Interactive with Click ───

/** Clickable card with keyboard support */
export const Interactive: Story = {
  args: {
    title: "Click me (or press Enter)",
    subtitle: "14:00 - 15:30",
    color: "#f59e0b",
    style: BASE_STYLE,
    onClick: () => alert("Card clicked!"),
  },
};
