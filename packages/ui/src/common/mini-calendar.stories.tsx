import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MiniCalendar } from "./mini-calendar.js";

const meta: Meta<typeof MiniCalendar> = {
  title: "Common/MiniCalendar",
  component: MiniCalendar,
};
export default meta;

type Story = StoryObj<typeof MiniCalendar>;

/** Day view — select a specific date */
export const DayView: Story = {
  render: () => {
    const [date, setDate] = useState(new Date(2026, 2, 29));
    return (
      <div>
        <p style={{ marginBottom: 8, fontFamily: "system-ui", fontSize: 14 }}>
          Selected: {date.toLocaleDateString("ko-KR")}
        </p>
        <MiniCalendar currentDate={date} onDateSelect={setDate} view="day" />
      </div>
    );
  },
};

/** Week view — highlight and select entire week */
export const WeekView: Story = {
  render: () => {
    const [date, setDate] = useState(new Date(2026, 2, 29));
    return (
      <div>
        <p style={{ marginBottom: 8, fontFamily: "system-ui", fontSize: 14 }}>
          Selected: {date.toLocaleDateString("ko-KR")}
        </p>
        <MiniCalendar currentDate={date} onDateSelect={setDate} view="week" />
      </div>
    );
  },
};

/** Month view — 4×3 month grid */
export const MonthView: Story = {
  render: () => {
    const [date, setDate] = useState(new Date(2026, 2, 29));
    return (
      <div>
        <p style={{ marginBottom: 8, fontFamily: "system-ui", fontSize: 14 }}>
          Selected: {date.toLocaleDateString("ko-KR")}
        </p>
        <MiniCalendar currentDate={date} onDateSelect={setDate} view="month" />
      </div>
    );
  },
};

/** Monday start — weekStartsOn=1, week view */
export const MondayStart: Story = {
  render: () => {
    const [date, setDate] = useState(new Date(2026, 2, 29));
    return (
      <div>
        <p style={{ marginBottom: 8, fontFamily: "system-ui", fontSize: 14 }}>
          Selected: {date.toLocaleDateString("ko-KR")}
        </p>
        <MiniCalendar currentDate={date} onDateSelect={setDate} view="week" weekStartsOn={1} />
      </div>
    );
  },
};
