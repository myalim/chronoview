import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Toolbar } from "./toolbar.js";

const meta: Meta<typeof Toolbar> = {
  title: "Common/Toolbar",
  component: Toolbar,
};
export default meta;

type Story = StoryObj<typeof Toolbar>;

function ToolbarDemo() {
  const [date, setDate] = useState(new Date(2026, 2, 27));
  const [view, setView] = useState<"day" | "week" | "month">("day");

  return (
    <Toolbar
      currentDate={date}
      view={view}
      layout="schedule"
      onPrev={() =>
        setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))
      }
      onNext={() =>
        setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
      }
      onToday={() => setDate(new Date())}
      onViewChange={setView}
      onFilterClick={() => alert("Filter clicked")}
    />
  );
}

export const Default: Story = {
  render: () => <ToolbarDemo />,
};
