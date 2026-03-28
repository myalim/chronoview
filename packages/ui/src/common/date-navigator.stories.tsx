import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DateNavigator } from "./date-navigator.js";

const meta: Meta<typeof DateNavigator> = {
  title: "Common/DateNavigator",
  component: DateNavigator,
};
export default meta;

type Story = StoryObj<typeof DateNavigator>;

function DateNavigatorDemo({ view }: { view: "day" | "week" | "month" }) {
  const [date, setDate] = useState(new Date(2026, 2, 27));

  return (
    <DateNavigator
      currentDate={date}
      view={view}
      onPrev={() => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
      onNext={() => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
    />
  );
}

export const Day: Story = {
  render: () => <DateNavigatorDemo view="day" />,
};

export const Week: Story = {
  render: () => <DateNavigatorDemo view="week" />,
};

export const Month: Story = {
  render: () => <DateNavigatorDemo view="month" />,
};
